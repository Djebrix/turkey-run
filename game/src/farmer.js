// Gobble Dash — the farmer: chase, search and corner behaviour, plus his art.
// Farmer Bram stalks the turkey from the left edge. When the turkey hides he
// searches the haystacks; when the turkey dawdles near the right edge he
// corners it. His speed grows with every stage of the escape.

import { GROUND_Y } from './main.js';

/** Farmer Bram, starting just off the left edge of the farmyard. */
export function createFarmer() {
  return {
    x: -70, y: GROUND_Y, vx: 0,
    mode: 'chase', // 'chase' | 'search' | 'corner'
    modeTimer: 0,
    searchTarget: 0,
    stride: 0,
    spottedTimer: 0,
    shoutTimer: 0,
  };
}

/** How fast the farmer runs at this point in the escape. */
function farmerSpeed(state) {
  const stageBoost = state.stage.index * 26;
  const distanceBoost = Math.min(70, state.distance * 0.05);
  let speed = 158 + stageBoost + distanceBoost;
  if (state.turkey.hidden) speed *= 0.55;
  return speed;
}

/** Pick the farmer's behaviour: chase, search the hay, or corner the bird. */
function chooseMode(state) {
  const f = state.farmer;
  const t = state.turkey;
  if (t.hidden && f.mode !== 'search') {
    f.mode = 'search';
    f.modeTimer = 2.6;
    f.searchTarget = t.x + (Math.random() * 160 - 80);
    state.banner = 'BRAM IS SEARCHING THE HAY...';
    state.bannerTimer = 1.4;
    return;
  }
  if (!t.hidden && f.mode === 'search' && f.modeTimer <= 0) {
    f.mode = 'chase';
  }
  if (!t.hidden && t.x > 760 && f.x > t.x - 260 && f.mode !== 'corner') {
    f.mode = 'corner';
    f.modeTimer = 2.2;
    state.banner = 'HE IS CORNERING YOU!';
    state.bannerTimer = 1.2;
  }
  if (f.mode === 'corner' && f.modeTimer <= 0) f.mode = 'chase';
}

/** Move the farmer toward the turkey, or wander while he searches. */
export function updateFarmer(state, dt) {
  const f = state.farmer;
  const t = state.turkey;
  f.modeTimer -= dt;
  f.shoutTimer -= dt;
  chooseMode(state);

  const speed = farmerSpeed(state);
  let target = t.x - 46;
  if (f.mode === 'search') {
    target = f.searchTarget;
    if (Math.abs(f.x - target) < 14) {
      f.searchTarget = 120 + Math.random() * 620;
      f.modeTimer = Math.max(f.modeTimer, 0.8);
    }
  }
  if (f.mode === 'corner') target = t.x - 18;

  const dir = target > f.x ? 1 : -1;
  const step = speed * (f.mode === 'corner' ? 1.35 : 1) * dt;
  f.x += Math.sign(target - f.x) * Math.min(Math.abs(target - f.x), step);
  f.stride += dt * 11;
  f.x = Math.max(-80, Math.min(920, f.x));

  // Caught! The farmer grabs the turkey unless it is hidden or invulnerable.
  const gap = Math.abs(f.x - t.x);
  if (!t.hidden && gap < 34 && t.y > GROUND_Y - 30 && state.invulnerableTimer <= 0) {
    f.spottedTimer = 0.8;
    state.turkey.x = Math.min(880, t.x + 70);
    f.x = t.x - 90;
    if (typeof state.loseLife === 'function') state.loseLife('CAUGHT BY FARMER BRAM!');
  }
  if (gap < 200 && f.shoutTimer <= 0) {
    f.spottedTimer = 0.7;
    f.shoutTimer = 3.5;
  }
  if (f.spottedTimer > 0) f.spottedTimer -= dt;
}

// The farmer reports a catch through the shared state's loseLife hook,
// which main.js wires up at boot (keeps this module free of main.js).

/** Draw Farmer Bram: straw hat, red shirt, blue overalls, angry moustache. */
export function drawFarmer(ctx, state) {
  const f = state.farmer;
  if (f.x < -60) return;
  const bob = Math.sin(f.stride) * 2;
  ctx.save();
  ctx.translate(f.x, f.y + bob);

  // Legs, mid-chase stride.
  const stride = Math.sin(f.stride) * 10;
  ctx.strokeStyle = '#2c4a7c';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(-6 + stride, 0);
  ctx.moveTo(6, -34);
  ctx.lineTo(6 - stride, 0);
  ctx.stroke();

  // Overalls and shirt.
  ctx.fillStyle = '#2c4a7c';
  ctx.fillRect(-14, -58, 28, 26);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-16, -78, 32, 22);
  ctx.fillStyle = '#2c4a7c';
  ctx.fillRect(-14, -78, 5, 20);
  ctx.fillRect(9, -78, 5, 20);

  // Arms pumping as he runs.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-14, -72);
  ctx.lineTo(-24, -58 - stride * 0.5);
  ctx.moveTo(14, -72);
  ctx.lineTo(24, -58 + stride * 0.5);
  ctx.stroke();

  // Head, moustache and straw hat.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(0, -88, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-11, -86, 22, 5);
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(-5, -91, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -91, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c95a';
  ctx.beginPath();
  ctx.ellipse(0, -99, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -102, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -99, 22, 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Spotted! shout bubble when he is close.
  if (f.spottedTimer > 0) {
    ctx.fillStyle = '#fff8e0';
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, -138, 92, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a1f1f';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('THERE YE ARE!', 20, -118);
  }
  ctx.restore();
}
