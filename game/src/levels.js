// Gobble Dash — stages of the escape: farmyard, barn, then the kitchen.
// Each stage has its own palette, name and difficulty. The turkey must cover
// ESCAPE_DISTANCE metres to slip out of the farm gate and be free.

export const ESCAPE_DISTANCE = 1200;

/** The three stages, in the order the turkey runs through them. */
export const STAGES = [
  {
    index: 0, name: 'THE FARMYARD', from: 0, to: 400,
    sky: ['#f6c453', '#e8a04c'], ground: '#8a6a3b', grass: '#7a9a3d',
    accent: '#c0392b', danger: 'Farmer Bram is on your tail!',
  },
  {
    index: 1, name: 'THE BARN', from: 400, to: 900,
    sky: ['#d98a4a', '#a85a2e'], ground: '#6e4a26', grass: '#8a7a3d',
    accent: '#e07b2a', danger: 'Haystacks to hide in — knives fall faster!',
  },
  {
    index: 2, name: 'THE KITCHEN', from: 900, to: ESCAPE_DISTANCE,
    sky: ['#c96a3d', '#8a3a22'], ground: '#5a3a2e', grass: '#9a6a3d',
    accent: '#ff9d2e', danger: 'The oven is lit! Dodge the knives!',
  },
];

/** Which stage a distance belongs to. */
export function stageFor(distance) {
  for (const stage of STAGES) {
    if (distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

/** How far through the current stage the turkey is, 0 to 1. */
export function stageProgress(state) {
  const s = state.stage;
  return Math.min(1, Math.max(0, (state.distance - s.from) / (s.to - s.from)));
}

/** A golden haystack the turkey can duck into to shake the farmer. */
export function makeHaystack(distance) {
  const base = 1050 + Math.random() * 260;
  return [{ x: base, w: 84, h: 58, sway: Math.random() * Math.PI * 2 }];
}

/** Two haystacks spaced out for the opening stretch of a run. */
export function makeHaystacks(distance) {
  return [
    { x: 700 + Math.random() * 120, w: 84, h: 58, sway: Math.random() * Math.PI * 2 },
    { x: 1180 + Math.random() * 160, w: 92, h: 62, sway: Math.random() * Math.PI * 2 },
  ];
}

/** Draw a haystack: layered golden arcs with a pitchfork stuck in the top. */
export function drawHaystack(ctx, stack, time) {
  const sway = Math.sin(time * 1.5 + stack.sway) * 2;
  ctx.save();
  ctx.translate(stack.x, 468);
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(-stack.w / 2, 0);
  ctx.quadraticCurveTo(-stack.w / 2 + sway, -stack.h, 0, -stack.h - 8);
  ctx.quadraticCurveTo(stack.w / 2 - sway, -stack.h, stack.w / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8842e';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 14, -stack.h + 12);
    ctx.quadraticCurveTo(i * 14 + sway, -stack.h / 2, i * 16, -4);
    ctx.stroke();
  }
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, -stack.h - 6);
  ctx.lineTo(10, -stack.h - 26);
  ctx.moveTo(4, -stack.h - 26);
  ctx.lineTo(16, -stack.h - 26);
  ctx.stroke();
  ctx.restore();
}
