// Gobble Dash — all the drawing that is not a character or a hazard: the
// farmyard, barn and kitchen backdrops, the HUD, and the title and end screens.
// Everything is canvas-drawn in an autumn palette; there are no image files.

import { VIEW_W, VIEW_H, GROUND_Y } from './main.js';
import { drawHaystack, stageProgress } from './levels.js';

/** A soft vertical sky gradient for the current stage. */
function drawSky(ctx, state) {
  const [top, bottom] = state.stage.sky;
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
  // Low autumn sun.
  ctx.fillStyle = 'rgba(255, 236, 170, 0.9)';
  ctx.beginPath();
  ctx.arc(820, 84, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 236, 170, 0.35)';
  ctx.beginPath();
  ctx.arc(820, 84, 52, 0, Math.PI * 2);
  ctx.fill();
}

/** Drifting clouds that scroll with the run. */
function drawClouds(ctx, state) {
  ctx.fillStyle = 'rgba(255, 248, 230, 0.85)';
  for (let i = 0; i < 4; i++) {
    const x = ((i * 280 - state.distance * 0.35) % 1100 + 1100) % 1100 - 70;
    const y = 46 + i * 34;
    ctx.beginPath();
    ctx.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 26, y + 4, 30, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Farmyard fence, barn wall or kitchen tiles, by stage. */
function drawBackdrop(ctx, state) {
  const stage = state.stage;
  if (stage.index === 0) {
    // White picket fence and a red barn in the distance.
    ctx.fillStyle = '#a83c2a';
    ctx.fillRect(620, 250, 260, 150);
    ctx.fillStyle = '#7a2a1e';
    ctx.beginPath();
    ctx.moveTo(600, 252);
    ctx.lineTo(750, 170);
    ctx.lineTo(900, 252);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f6e8c8';
    ctx.fillRect(700, 330, 100, 70);
    ctx.strokeStyle = '#f6e8c8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(700, 250);
    ctx.lineTo(700, 400);
    ctx.moveTo(800, 250);
    ctx.lineTo(800, 400);
    ctx.stroke();
    ctx.fillStyle = '#f6e8c8';
    for (let x = 0; x < VIEW_W; x += 46) {
      ctx.fillRect(x, 396, 10, 72);
    }
    ctx.fillRect(0, 410, VIEW_W, 8);
    ctx.fillRect(0, 436, VIEW_W, 6);
  } else if (stage.index === 1) {
    // Barn interior: wooden beams and hanging lanterns.
    ctx.fillStyle = '#5a3a22';
    for (let x = 0; x < VIEW_W; x += 160) {
      ctx.fillRect(x, 0, 26, GROUND_Y);
    }
    ctx.fillStyle = '#7a4a26';
    ctx.fillRect(0, 120, VIEW_W, 18);
    ctx.fillStyle = '#ffd23e';
    for (let x = 140; x < VIEW_W; x += 280) {
      ctx.beginPath();
      ctx.ellipse(x, 168, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 210, 62, 0.25)';
      ctx.beginPath();
      ctx.ellipse(x, 168, 40, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd23e';
    }
  } else {
    // Kitchen: chequered tiles, a window, and a shelf of plates.
    ctx.fillStyle = '#e8dcc8';
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 12; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = '#e8dcc8';
        } else {
          ctx.fillStyle = '#c96a3d';
        }
        ctx.fillRect(x * 80, y * 64, 80, 64);
      }
    }
    ctx.fillStyle = '#7fb2d9';
    ctx.fillRect(80, 60, 150, 120);
    ctx.strokeStyle = '#f6e8c8';
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 60, 150, 120);
    ctx.beginPath();
    ctx.moveTo(155, 60);
    ctx.lineTo(155, 180);
    ctx.moveTo(80, 120);
    ctx.lineTo(230, 120);
    ctx.stroke();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(560, 90, 320, 12);
    ctx.fillStyle = '#f6f0e0';
    for (let x = 580; x < 880; x += 52) {
      ctx.beginPath();
      ctx.arc(x, 78, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Ground strip with grass tufts, straw or kitchen floorboards. */
function drawGround(ctx, state) {
  ctx.fillStyle = state.stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = state.stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  const offset = state.distance % 90;
  for (let x = -offset; x < VIEW_W; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 12);
    ctx.lineTo(x + 8, GROUND_Y + 4);
    ctx.lineTo(x + 16, GROUND_Y + 12);
    ctx.stroke();
  }
}

/** The scrolling world behind the turkey. */
export function drawBackground(ctx, state) {
  drawSky(ctx, state);
  if (state.stage.index !== 2) drawClouds(ctx, state);
  drawBackdrop(ctx, state);
  for (const stack of state.haystacks) drawHaystack(ctx, stack, state.time);
  drawGround(ctx, state);
}

/** Score, distance, lives, stage and the escape progress bar. */
export function drawHud(ctx, state) {
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.82)';
  ctx.beginPath();
  ctx.roundRect(12, 10, VIEW_W - 24, 52, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${state.score}`, 28, 44);
  ctx.fillStyle = '#fff8e0';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`${Math.floor(state.distance)} m`, 240, 42);
  ctx.fillText(state.stage.name, 380, 42);
  // Lives as drumsticks.
  for (let i = 0; i < 3; i++) {
    const x = 700 + i * 34;
    ctx.fillStyle = i < state.lives ? '#e8b04b' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x, 34, 11, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i < state.lives ? '#f6e8c8' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x + 12, 40, 3.4, 0, Math.PI * 2);
    ctx.arc(x + 16, 44, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Escape progress: farmyard to the gate.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(830, 26, 100, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#7a9a3d';
  const progress = Math.min(1, state.distance / 1200);
  ctx.beginPath();
  ctx.roundRect(830, 26, 100 * progress, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#fff8e0';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('ESCAPE', 852, 52);

  // Stage progress ribbon at the bottom.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.7)';
  ctx.fillRect(0, VIEW_H - 26, VIEW_W, 26);
  ctx.fillStyle = '#ffd23e';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(
    `${state.stage.name} — ${Math.round(stageProgress(state) * 100)}%  •  ${state.stage.danger}`,
    16, VIEW_H - 8,
  );
  ctx.restore();
}

/** A big centre-screen banner for events like near misses and hiding. */
export function drawBanner(ctx, text) {
  ctx.save();
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 48;
  ctx.fillStyle = 'rgba(43, 26, 18, 0.85)';
  ctx.beginPath();
  ctx.roundRect(VIEW_W / 2 - w / 2, 84, w, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.fillText(text, VIEW_W / 2, 117);
  ctx.restore();
}

/** The title screen: big turkey, big name, how to play. */
export function drawTitleScreen(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 18, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('GOBBLE DASH', VIEW_W / 2, 130);
  ctx.fillStyle = '#fff8e0';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText("The turkey's great Thanksgiving escape", VIEW_W / 2, 168);
  ctx.fillStyle = '#e8b04b';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('Farmer Bram wants you for dinner. Outrun him, dodge the oven', VIEW_W / 2, 226);
  ctx.fillText('and the carving knife, hide in the hay — and reach the gate!', VIEW_W / 2, 250);
  ctx.fillStyle = '#fff8e0';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('MOVE  ← → or A / D  •  mouse steers too', VIEW_W / 2, 306);
  ctx.fillText('JUMP  Space / W / ↑  •  click to jump', VIEW_W / 2, 332);
  ctx.fillText('HIDE  ↓ or S beside a haystack', VIEW_W / 2, 358);
  ctx.fillText('Grab corn (+10) and pumpkins (+25) — near misses pay +20', VIEW_W / 2, 384);
  const pulse = 0.85 + Math.sin(state.time * 4) * 0.15;
  // A dark pill behind the prompt so it reads over the fence.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.75)';
  ctx.beginPath();
  ctx.roundRect(VIEW_W / 2 - 250, 414, 500, 44, 12);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 210, 62, ${pulse})`;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('PRESS ENTER OR CLICK TO RUN', VIEW_W / 2, 446);
  ctx.fillStyle = '#fff8e0';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Farmyard → Barn → Kitchen  •  3 lives  •  M mutes the sound', VIEW_W / 2, 486);
  ctx.restore();
}

/** Caught or escaped: the score, the distance, and how to run again. */
export function drawEndScreen(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  if (state.mode === 'escaped') {
    ctx.fillStyle = '#7ac74f';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('ESCAPED!', VIEW_W / 2, 160);
    ctx.fillStyle = '#fff8e0';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('Gobbler slipped the gate and is free for Thanksgiving!', VIEW_W / 2, 202);
  } else {
    ctx.fillStyle = '#ff6b4a';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('CAUGHT!', VIEW_W / 2, 160);
    ctx.fillStyle = '#fff8e0';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('Farmer Bram has his dinner. The oven was already warm...', VIEW_W / 2, 202);
  }
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`SCORE ${state.score}`, VIEW_W / 2, 268);
  ctx.fillStyle = '#fff8e0';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Distance: ${Math.floor(state.distance)} m  •  Near misses: ${state.nearMissCount}`, VIEW_W / 2, 306);
  ctx.fillText(`Stage reached: ${state.stage.name}`, VIEW_W / 2, 336);
  const pulse = 0.85 + Math.sin(state.time * 4) * 0.15;
  ctx.fillStyle = `rgba(255, 210, 62, ${pulse})`;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('PRESS ENTER OR CLICK TO RUN AGAIN', VIEW_W / 2, 410);
  ctx.restore();
}
