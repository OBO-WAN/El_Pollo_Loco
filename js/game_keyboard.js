/* global keyboard, world, isPaused, isPortraitBlocked, togglePause */

/**
 * Handles keydown events for gameplay and pause controls.
 *
 * Responsibilities:
 *  - Toggle pause on Escape / P
 *  - Update keyboard state flags (LEFT, RIGHT, UP, SPACE)
 *  - Prevent default browser behavior for movement keys
 *  - Wake sleeping character instead of throwing
 *
 * @param {KeyboardEvent} e - Native keyboard event
 * @returns {void}
 */
function onKeydown(e) {
  if (e.code === "Escape" || e.code === "KeyP") {
    e.preventDefault();
    togglePause?.();
    return;
  }

  if (isPortraitBlocked) return;
  if (isPaused) return;

  if (["ArrowRight", "ArrowLeft", "ArrowUp", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "Space" && world?.isCharacterSleeping) {
    world.resetIdleTimer?.();
    keyboard.SPACE = false;
    return;
  }

  if (e.code === "ArrowRight") keyboard.RIGHT = true;
  if (e.code === "ArrowLeft") keyboard.LEFT = true;
  if (e.code === "ArrowUp") keyboard.UP = true;
  if (e.code === "Space") keyboard.SPACE = true;
}

/**
 * Handles keyup events for gameplay controls.
 *
 * @param {KeyboardEvent} e - Native keyboard event
 * @returns {void}
 */
function onKeyup(e) {
  if (isPortraitBlocked) return;
  if (isPaused) return;

  if (["ArrowRight", "ArrowLeft", "ArrowUp", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "ArrowRight") keyboard.RIGHT = false;
  if (e.code === "ArrowLeft") keyboard.LEFT = false;
  if (e.code === "ArrowUp") keyboard.UP = false;
  if (e.code === "Space") keyboard.SPACE = false;
}

/**
 * Binds global keyboard listeners to the window.
 *
 * Should be called once during application initialization.
 *
 * @returns {void}
 */
function bindKeyboard() {
  window.addEventListener("keydown", onKeydown, { passive: false });
  window.addEventListener("keyup", onKeyup, { passive: false });
}