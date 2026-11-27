// Gobble Dash — hazards and pickups: the oven, the carving knife, corn and
// pumpkins. Ovens roast the ground they sit on; knives drop from the sky and
// swing on the kitchen wall. Corn and pumpkins are the turkey's score.

import { VIEW_W, GROUND_Y } from './main.js';

/** Empty hazard and pickup trays for a fresh run. */
export function createHazards() {
  return {
    ovens: [],
    knives: [],
    ovenTimer: 3.0,
    knifeTimer: 2.2,
  };
}

/** An oven squatting on the ground, door glowing, waiting for a turkey. */
function makeOven(x, stage) {
  return {
    x, y: GROUND_Y, w: 74 + stage.index * 6, h: 66,
    heat: 0, flame: Math.random() * Math.PI * 2,
  };
}

/** A carving knife that drops from above, then sticks quivering in the ground. */
function makeKnife(x, stage) {
  return {
    x, y: -40, vy: 0,
    speed: 420 + stage.index * 90 + Math.random() * 120,
    state: 'falling', // 'falling' | 'stuck' | 'swinging'
    stuckTimer: 0, swingPhase: Math.random() * Math.PI * 2,
  };
}

/** Spawn ovens and knives on the schedule of the current stage. */
function spawnHazards(state, dt) {
  const h = state.hazards;
  const stage = state.stage;
  h.ovenTimer -= dt;
  h.knifeTimer -= dt;
  if (h.ovenTimer <= 0) {
    const x = VIEW_W + 60 + Math.random() * 160;
    h.ovens.push(makeOven(x, stage));
    h.ovenTimer = Math.max(1.4, 3.4 - stage.index * 0.7) + Math.random() * 1.2;
  }
  if (h.knifeTimer <= 0) {
    const nearTurkey = Math.random() < 0.55;
    const x = nearTurkey
      ? state.turkey.x + (Math.random() * 120 - 60)
      : 120 + Math.random() * (VIEW_W - 240);
    h.knives.push(makeKnife(Math.max(50, Math.min(VIEW_W - 50, x)), stage));
    h.knifeTimer = Math.max(0.9, 2.3 - stage.index * 0.45) + Math.random() * 0.9;
  }
}

/** A knife that only just missed the turkey earns a near-miss bonus. */
function nearMissBonus(state, knife) {
  const gap = Math.abs(knife.x - state.turkey.x);
  if (gap > 34 && gap < 90 && state.turkey.onGround) {
    state.score += 20;
    state.nearMissCount += 1;
    state.banner = 'NEAR MISS! +20';
    state.bannerTimer = 0.9;
  }
}

/** Move hazards, test collisions with the turkey, and clean up the spent ones. */
export function updateHazards(state, dt) {
  const h = state.hazards;
  const t = state.turkey;
  spawnHazards(state, dt);
  const scroll = 150 + state.distance * 0.045;

  for (const oven of h.ovens) {
    oven.x -= scroll * dt;
    oven.heat += dt;
    oven.flame += dt * 9;
    const overlap = Math.abs(oven.x - t.x) < oven.w / 2 + 14
      && t.y > GROUND_Y - oven.h - 6 && !t.hidden;
    if (overlap && state.invulnerableTimer <= 0) {
      state.loseLife('ROASTED BY THE OVEN!');
      t.x = Math.max(40, t.x - 90);
    }
  }
  h.ovens = h.ovens.filter((o) => o.x > -140);

  for (const knife of h.knives) {
    if (knife.state === 'falling') {
      knife.vy = knife.speed;
      knife.y += knife.vy * dt;
      knife.x -= scroll * dt * 0.35;
      if (knife.y >= GROUND_Y - 8) {
        knife.y = GROUND_Y - 8;
        knife.state = 'stuck';
        knife.stuckTimer = 1.4;
        nearMissBonus(state, knife);
      }
      const hitsTurkey = Math.abs(knife.x - t.x) < 22
        && Math.abs(knife.y - (t.y - 30)) < 46 && !t.hidden;
      if (hitsTurkey && state.invulnerableTimer <= 0) {
        state.loseLife('SLICED BY THE CARVING KNIFE!');
        knife.state = 'stuck';
        knife.stuckTimer = 1.0;
      }
    } else if (knife.state === 'stuck') {
      knife.stuckTimer -= dt;
      knife.x -= scroll * dt;
      knife.swingPhase += dt * 3;
      if (knife.stuckTimer <= 0) knife.state = 'gone';
    }
  }
  h.knives = h.knives.filter((k) => k.state !== 'gone' && k.x > -80);
}

/** A corn cob (+10) or a pumpkin (+25), bobbing where the turkey can grab it. */
export function spawnPickup(state) {
  const kind = Math.random() < 0.62 ? 'corn' : 'pumpkin';
  state.pickups.push({
    kind,
    x: VIEW_W + 40,
    y: kind === 'corn' ? GROUND_Y - 70 - Math.random() * 90 : GROUND_Y - 26,
    bob: Math.random() * Math.PI * 2,
    value: kind === 'corn' ? 10 : 25,
  });
}

/** Drift pickups left and collect the ones the turkey touches. */
export function updatePickups(state, dt) {
  const t = state.turkey;
  const scroll = 150 + state.distance * 0.045;
  for (const p of state.pickups) {
    p.x -= scroll * dt;
    p.bob += dt * 4;
    const dy = Math.abs((p.y + Math.sin(p.bob) * 5) - (t.y - 30));
    if (!t.hidden && Math.abs(p.x - t.x) < 34 && dy < 44) {
      state.score += p.value;
      state.banner = p.kind === 'corn' ? `CORN! +${p.value}` : `PUMPKIN! +${p.value}`;
      state.bannerTimer = 0.8;
      if (state.audio) state.audio.pickup();
      p.taken = true;
    }
  }
  state.pickups = state.pickups.filter((p) => !p.taken && p.x > -60);
}

/** Draw the glowing oven with its fire and the roast that waits inside. */
function drawOven(ctx, oven) {
  ctx.save();
  ctx.translate(oven.x, oven.y);
  // Body and door.
  ctx.fillStyle = '#3a3a3f';
  ctx.fillRect(-oven.w / 2, -oven.h, oven.w, oven.h);
  ctx.fillStyle = '#222228';
  ctx.fillRect(-oven.w / 2, -oven.h - 10, oven.w, 10);
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.roundRect(-oven.w / 2 + 8, -oven.h + 14, oven.w - 16, oven.h - 26, 6);
  ctx.fill();
  // Flames licking out of the door.
  for (let i = 0; i < 3; i++) {
    const fx = -oven.w / 4 + i * (oven.w / 4);
    const flick = Math.sin(oven.flame + i * 2) * 4;
    ctx.fillStyle = i === 1 ? '#ffd23e' : '#ff6b1a';
    ctx.beginPath();
    ctx.ellipse(fx, -oven.h + 22 + flick, 8, 12 + flick, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Heat shimmer and warning sign.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', 0, -oven.h - 18);
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.arc(-oven.w / 2 + 10, -oven.h + 8, 3, 0, Math.PI * 2);
  ctx.arc(oven.w / 2 - 10, -oven.h + 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw a falling or stuck carving knife, blade first. */
function drawKnife(ctx, knife) {
  ctx.save();
  ctx.translate(knife.x, knife.y);
  const tilt = knife.state === 'stuck' ? Math.sin(knife.swingPhase) * 0.12 : 0.1;
  ctx.rotate(tilt);
  // Blade.
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(-5, -34);
  ctx.lineTo(5, -34);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5ab';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(0, 4);
  ctx.stroke();
  // Handle.
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(-6, 6, 12, 16);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(-6, 4, 12, 3);
  ctx.restore();
}

export function drawHazards(ctx, state) {
  for (const oven of state.hazards.ovens) drawOven(ctx, oven);
  for (const knife of state.hazards.knives) drawKnife(ctx, knife);
}

/** Draw corn cobs and pumpkins with a soft bob and a glint. */
export function drawPickups(ctx, state) {
  for (const p of state.pickups) {
    const y = p.y + Math.sin(p.bob) * 5;
    ctx.save();
    ctx.translate(p.x, y);
    if (p.kind === 'corn') {
      ctx.fillStyle = '#ffd23e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 16, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f7a2a';
      ctx.beginPath();
      ctx.ellipse(-6, 12, 5, 10, -0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e07b2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b85c14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 13);
      ctx.moveTo(-8, -11);
      ctx.quadraticCurveTo(-11, 0, -8, 11);
      ctx.moveTo(8, -11);
      ctx.quadraticCurveTo(11, 0, 8, 11);
      ctx.stroke();
      ctx.fillStyle = '#3f7a2a';
      ctx.fillRect(-2, -18, 4, 7);
    }
    ctx.restore();
  }
}
