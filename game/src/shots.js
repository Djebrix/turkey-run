// Gobble Dash — screenshot-state driver. A ?shot= query param stages one exact
// screen of the real game so the screenshots are deterministic renders of the
// game's own code: title, mid-run play, end screen, or the kitchen stage.
// Every staged state is also genuinely reachable by playing the game.

import { GROUND_Y } from './main.js';
import { stageFor } from './levels.js';

/** Stage one exact screen of the game for a screenshot. */
export function applyShot(state, mode) {
  if (mode === 'title') {
    state.mode = 'title';
    state.time = 1.2;
    return;
  }
  if (mode === 'play') {
    stagePlay(state, 240, 0);
    return;
  }
  if (mode === 'kitchen') {
    stagePlay(state, 980, 2);
    return;
  }
  if (mode === 'end') {
    state.mode = 'caught';
    state.score = 1240;
    state.distance = 612;
    state.lives = 0;
    state.nearMissCount = 3;
    state.stage = stageFor(state.distance);
    state.turkey.x = 620;
    state.turkey.y = GROUND_Y;
    state.farmer.x = 560;
    state.farmer.y = GROUND_Y;
    state.farmer.spottedTimer = 0;
    state.hazards.ovens = [
      { x: 760, y: GROUND_Y, w: 78, h: 66, heat: 2, flame: 1.1 },
    ];
    state.hazards.knives = [
      { x: 830, y: GROUND_Y - 8, vy: 0, speed: 500, state: 'stuck', stuckTimer: 1.2, swingPhase: 0.4 },
    ];
    state.pickups = [{ kind: 'corn', x: 300, y: GROUND_Y - 80, bob: 0.5, value: 10 }];
    state.haystacks = [{ x: 180, w: 84, h: 58, sway: 0.3 }];
    state.time = 2.0;
    return;
  }
  // Unknown shot mode: fall back to the title screen.
  state.mode = 'title';
}

/** A mid-run frame: turkey running, farmer chasing, oven and knife in view. */
function stagePlay(state, distance, stageIndex) {
  state.mode = 'playing';
  state.distance = distance;
  state.score = stageIndex === 2 ? 1870 : 640;
  state.lives = 3;
  state.nearMissCount = stageIndex === 2 ? 5 : 2;
  state.stage = stageFor(distance);
  state.time = 3.4;
  state.turkey.x = 420;
  state.turkey.y = GROUND_Y - 40;
  state.turkey.vy = -120;
  state.turkey.onGround = false;
  state.turkey.flap = 1.2;
  state.farmer.x = 300;
  state.farmer.y = GROUND_Y;
  state.farmer.mode = 'chase';
  state.farmer.spottedTimer = 0.7;
  state.farmer.stride = 2.1;
  state.hazards.ovens = [
    { x: 700, y: GROUND_Y, w: 78, h: 66, heat: 2, flame: 0.8 },
  ];
  state.hazards.knives = [
    { x: 560, y: 300, vy: 480, speed: 480, state: 'falling', stuckTimer: 0, swingPhase: 0.2 },
    { x: 830, y: GROUND_Y - 8, vy: 0, speed: 500, state: 'stuck', stuckTimer: 1.0, swingPhase: 0.5 },
  ];
  state.pickups = [
    { kind: 'corn', x: 500, y: GROUND_Y - 110, bob: 0.4, value: 10 },
    { kind: 'pumpkin', x: 640, y: GROUND_Y - 26, bob: 1.1, value: 25 },
    { kind: 'corn', x: 880, y: GROUND_Y - 90, bob: 2.0, value: 10 },
  ];
  state.haystacks = [
    { x: 150, w: 84, h: 58, sway: 0.2 },
    { x: 900, w: 92, h: 62, sway: 0.9 },
  ];
  state.banner = stageIndex === 2 ? 'THE OVEN IS LIT!' : 'RUN, GOBBLER, RUN!';
  state.bannerTimer = 9;
}
