// Gobble Dash — boot, game loop and state machine.
// Owns the shared game state and wires the modules together: input, turkey,
// farmer, hazards, levels, rendering and sound. No code is copied from the kit.

import { createInput } from './input.js';
import { createTurkey, updateTurkey, drawTurkey } from './turkey.js';
import { createFarmer, updateFarmer, drawFarmer } from './farmer.js';
import {
  createHazards, updateHazards, drawHazards, spawnPickup, updatePickups, drawPickups,
} from './hazards.js';
import { stageFor, ESCAPE_DISTANCE, makeHaystacks } from './levels.js';
import {
  drawBackground, drawHud, drawTitleScreen, drawEndScreen, drawBanner,
} from './render.js';
import { GobbleAudio } from './audio.js';
import { applyShot } from './shots.js';

export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 468;

/** A fresh run: turkey, farmer, hazards, score, lives and stage all reset. */
export function createGameState() {
  return {
    mode: 'title', // 'title' | 'playing' | 'caught' | 'escaped'
    time: 0,
    distance: 0,
    score: 0,
    lives: 3,
    bestCombo: 0,
    stage: stageFor(0),
    turkey: createTurkey(),
    farmer: createFarmer(),
    hazards: createHazards(),
    pickups: [],
    haystacks: makeHaystacks(0),
    particles: [],
    banner: '',
    bannerTimer: 0,
    nearMissCount: 0,
    hiddenTimer: 0,
    invulnerableTimer: 0,
    pickupTimer: 2.5,
    mute: false,
    frozen: false,
    shot: null,
  };
}

/** Start a new escape run from the title screen. */
export function startRun(state, audio) {
  const fresh = createGameState();
  Object.assign(state, fresh, { mode: 'playing' });
  audio.gobble();
  state.banner = 'RUN, GOBBLER, RUN!';
  state.bannerTimer = 1.6;
}

/** Lose one life to a hazard or the farmer; a third loss ends the run. */
export function loseLife(state, audio, reason) {
  if (state.invulnerableTimer > 0 || state.mode !== 'playing') return;
  state.lives -= 1;
  state.invulnerableTimer = 1.6;
  state.banner = reason;
  state.bannerTimer = 1.4;
  audio.hit();
  burstParticles(state, state.turkey.x, state.turkey.y - 30, '#e8b04b', 14);
  if (state.lives <= 0) {
    state.mode = 'caught';
    state.banner = '';
    audio.caught();
  }
}

/** Small feather-and-spark burst for hits, pickups and near misses. */
export function burstParticles(state, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 140;
    state.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60,
      life: 0.5 + Math.random() * 0.5, color,
    });
  }
}

function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

/** One fixed update step while a run is in play. */
function updatePlaying(state, input, audio, dt) {
  state.time += dt;
  const speed = 150 + state.distance * 0.045;
  state.distance += speed * dt;
  state.stage = stageFor(state.distance);
  if (state.distance >= ESCAPE_DISTANCE) {
    state.mode = 'escaped';
    state.score += 500;
    audio.fanfare();
    return;
  }

  updateTurkey(state, input, dt);
  updateFarmer(state, dt);
  updateHazards(state, dt);
  updatePickups(state, dt);

  state.pickupTimer -= dt;
  if (state.pickupTimer <= 0) {
    spawnPickup(state);
    state.pickupTimer = 1.8 + Math.random() * 1.6;
  }

  // Fresh haystacks as the run moves into a new stretch of ground.
  if (state.haystacks.length === 0 || state.haystacks[state.haystacks.length - 1].x < 120) {
    state.haystacks.push(...makeHaystacks(state.distance));
  }
  state.haystacks = state.haystacks.filter((h) => h.x > -120);

  if (state.bannerTimer > 0) state.bannerTimer -= dt;
  if (state.invulnerableTimer > 0) state.invulnerableTimer -= dt;
  if (state.hiddenTimer > 0) state.hiddenTimer -= dt;
  updateParticles(state, dt);
}

/** Draw the current screen: title, playfield with HUD, or an end screen. */
function draw(state, ctx) {
  drawBackground(ctx, state);
  if (state.mode === 'title') {
    drawTitleScreen(ctx, state);
    return;
  }
  drawHazards(ctx, state);
  drawPickups(ctx, state);
  drawTurkey(ctx, state);
  drawFarmer(ctx, state);
  drawHud(ctx, state);
  if (state.bannerTimer > 0 && state.banner) drawBanner(ctx, state.banner);
  if (state.mode === 'caught' || state.mode === 'escaped') {
    drawEndScreen(ctx, state);
  }
}

/** Headless self-test (?selftest=1): step the simulation and report into the DOM. */
function runSelfTest(state, input, audio) {
  const box = document.getElementById('selftest');
  try {
    startRun(state, audio);
    for (let i = 0; i < 600; i++) {
      input.keys.add('ArrowRight');
      if (i === 120) input.jumpQueued = true;
      if (i === 300) input.jumpQueued = true;
      updatePlaying(state, input, audio, 1 / 60);
      if (state.mode === 'caught' || state.mode === 'escaped') break;
    }
    const ok = state.distance > 50 && state.score >= 0 && state.lives >= 0;
    box.textContent = ok
      ? `SELFTEST OK distance=${Math.round(state.distance)} score=${state.score} lives=${state.lives} mode=${state.mode}`
      : `SELFTEST FAIL distance=${Math.round(state.distance)} mode=${state.mode}`;
    document.title = box.textContent;
  } catch (err) {
    box.textContent = `SELFTEST ERROR ${err.message}`;
    document.title = box.textContent;
  }
}

/** Boot the canvas, wire input, and start the animation loop. */
export function bootGame() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const state = createGameState();
  const input = createInput(canvas, state);
  const audio = new GobbleAudio();
  // Hooks the modules call through the shared state: the farmer and the
  // hazards report a catch through loseLife; the turkey plays its jump.
  state.audio = audio;
  state.loseLife = (reason) => loseLife(state, audio, reason);
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    state.shot = shot;
    applyShot(state, shot);
    state.frozen = true;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.frozen) {
      if (state.mode === 'playing') {
        updatePlaying(state, input, audio, dt);
      } else {
        state.time += dt;
        updateParticles(state, dt);
        if (state.mode === 'title' && input.consumeStart()) startRun(state, audio);
        if ((state.mode === 'caught' || state.mode === 'escaped') && input.consumeStart()) {
          startRun(state, audio);
        }
      }
      if (input.consumeMute()) {
        state.mute = !state.mute;
        audio.setMuted(state.mute);
      }
    }
    draw(state, ctx);
    requestAnimationFrame(frame);
  }

  canvas.addEventListener('pointerdown', () => audio.unlock());
  window.addEventListener('keydown', () => audio.unlock(), { once: true });
  requestAnimationFrame(frame);

  if (params.get('selftest') === '1') runSelfTest(state, input, audio);
  return { state, input, audio, canvas };
}

bootGame();
