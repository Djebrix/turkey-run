// Gobble Dash — keyboard and mouse input. Arrow keys / WASD to run, Space /
// W / Up to jump, Down / S to hide, Enter to start, M to mute. The mouse
// steers the turkey toward the pointer and a click jumps.

/** The live input state for one run, fed by keyboard and pointer events. */
export function createInput(canvas, state) {
  const input = {
    keys: new Set(),
    mouseX: 480,
    mouseSeen: false,
    mouseJump: false,
    jumpQueued: false,
    startQueued: false,
    muteQueued: false,
  };

  /** Held left: ArrowLeft or A. */
  input.leftHeld = () => input.keys.has('ArrowLeft') || input.keys.has('KeyA');
  /** Held right: ArrowRight or D. */
  input.rightHeld = () => input.keys.has('ArrowRight') || input.keys.has('KeyD');
  /** The hide key is down this frame: ArrowDown or S. */
  input.hidePressed = () => input.keys.has('ArrowDown') || input.keys.has('KeyS');
  /** The pointer has moved and can steer the turkey. */
  input.mouseActive = () => input.mouseSeen;
  /** A click asked for a jump since the last frame. */
  input.mouseJumpQueued = () => input.mouseJump;
  input.consumeMouseJump = () => { input.mouseJump = false; };
  /** Enter or a click asked to start / restart; consumed once. */
  input.consumeStart = () => {
    const v = input.startQueued;
    input.startQueued = false;
    return v;
  };
  /** M was pressed; consumed once. */
  input.consumeMute = () => {
    const v = input.muteQueued;
    input.muteQueued = false;
    return v;
  };

  function canvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 960;
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    input.keys.add(e.code);
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      input.jumpQueued = true;
    }
    if (e.code === 'Enter') input.startQueued = true;
    if (e.code === 'KeyM') input.muteQueued = true;
  });
  window.addEventListener('keyup', (e) => {
    input.keys.delete(e.code);
  });
  window.addEventListener('blur', () => input.keys.clear());

  canvas.addEventListener('pointermove', (e) => {
    input.mouseX = canvasX(e.clientX);
    input.mouseSeen = true;
  });
  canvas.addEventListener('pointerdown', (e) => {
    input.mouseX = canvasX(e.clientX);
    input.mouseSeen = true;
    if (state.mode === 'playing') {
      input.mouseJump = true;
    } else {
      input.startQueued = true;
    }
  });

  return input;
}
