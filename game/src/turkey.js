// Gobble Dash — the turkey: movement, jumping, hiding and its canvas art.
// The player bird. It runs, jumps and ducks into haystacks; nothing here is
// copied from any other game — the turkey is drawn feather by feather below.

import { VIEW_W, GROUND_Y } from './main.js';

const RUN_SPEED = 300;
const JUMP_SPEED = 560;
const GRAVITY = 1500;

/** A turkey at the left of the farmyard, ready to run. */
export function createTurkey() {
  return {
    x: 170, y: GROUND_Y, vy: 0,
    onGround: true, facing: 1,
    hidden: false, hideTimer: 0,
    flap: 0, squash: 0, gobbleTimer: 0,
  };
}

/** Find the haystack the turkey is standing beside, if any. */
function nearbyHaystack(state) {
  return state.haystacks.find((h) => Math.abs(h.x - state.turkey.x) < 70);
}

/** Move, jump and hide the turkey from keyboard and mouse input. */
export function updateTurkey(state, input, dt) {
  const t = state.turkey;
  t.flap += dt * 12;
  if (t.squash > 0) t.squash -= dt * 4;

  if (t.hideTimer > 0) {
    t.hideTimer -= dt;
    state.hiddenTimer = Math.max(state.hiddenTimer, t.hideTimer);
    if (t.hideTimer <= 0) {
      t.hidden = false;
      state.banner = 'OUT OF THE HAY!';
      state.bannerTimer = 0.9;
    }
    return;
  }

  // Hide: press Down (or S) beside a haystack and the turkey ducks inside it.
  if (input.hidePressed() && t.onGround) {
    const stack = nearbyHaystack(state);
    if (stack) {
      t.hidden = true;
      t.hideTimer = 3.0;
      state.hiddenTimer = 3.0;
      state.score += 15;
      state.banner = 'HIDDEN IN THE HAY!';
      state.bannerTimer = 1.2;
      return;
    }
  }

  let move = 0;
  if (input.leftHeld()) move -= 1;
  if (input.rightHeld()) move += 1;
  if (input.mouseActive()) {
    const target = input.mouseX;
    if (Math.abs(target - t.x) > 12) move = target > t.x ? 1 : -1;
  }
  t.x += move * RUN_SPEED * dt;
  if (move !== 0) t.facing = move;
  t.x = Math.max(36, Math.min(VIEW_W - 36, t.x));

  if ((input.jumpQueued || input.mouseJumpQueued()) && t.onGround) {
    t.vy = -JUMP_SPEED;
    t.onGround = false;
    t.squash = 1;
    if (state.audio) state.audio.jump();
  }
  input.jumpQueued = false;
  input.consumeMouseJump();

  t.vy += GRAVITY * dt;
  t.y += t.vy * dt;
  if (t.y >= GROUND_Y) {
    if (!t.onGround && t.vy > 300) t.squash = 1;
    t.y = GROUND_Y;
    t.vy = 0;
    t.onGround = true;
  }

  t.gobbleTimer -= dt;
}

/** Draw the turkey: brown body, fanned tail, red wattle, orange beak. */
export function drawTurkey(ctx, state) {
  const t = state.turkey;
  if (t.hidden) {
    // Only a tail feather pokes out of the haystack while hidden.
    ctx.save();
    ctx.translate(t.x, GROUND_Y - 6);
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(0, -14, 5, 16, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const blink = state.invulnerableTimer > 0 && Math.floor(state.time * 12) % 2 === 0;
  if (blink) return;

  const squash = 1 - t.squash * 0.12;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.facing, squash);

  // Fanned tail feathers.
  ctx.fillStyle = '#7a4a22';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-26, -26, 7, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c98a3d';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-26, -40, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, -26, 26, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath();
  ctx.ellipse(4, -20, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flapping wing.
  const wing = Math.sin(t.flap) * 6;
  ctx.fillStyle = '#6e3f1d';
  ctx.beginPath();
  ctx.ellipse(-4, -26 + wing * 0.4, 15, 10, -0.4 + wing * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head.
  ctx.fillStyle = '#c98a3d';
  ctx.beginPath();
  ctx.ellipse(20, -46, 8, 14, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8b04b';
  ctx.beginPath();
  ctx.arc(24, -62, 11, 0, Math.PI * 2);
  ctx.fill();

  // Beak, wattle and eye.
  ctx.fillStyle = '#e07b2a';
  ctx.beginPath();
  ctx.moveTo(33, -64);
  ctx.lineTo(44, -60);
  ctx.lineTo(33, -57);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(31, -54, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(27, -65, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Skinny legs, mid-stride.
  ctx.strokeStyle = '#e07b2a';
  ctx.lineWidth = 3;
  const stride = Math.sin(t.flap) * 8;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-6 + stride, 0);
  ctx.moveTo(6, -6);
  ctx.lineTo(6 - stride, 0);
  ctx.stroke();

  ctx.restore();
}
