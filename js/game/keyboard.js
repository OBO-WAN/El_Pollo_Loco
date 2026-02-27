/* global keyboard, world, isPaused, isPortraitBlocked, togglePause */

const movementKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "Space"];

/**
 * Handles keydown input for movement and pause.
 * @param {KeyboardEvent} event Native keyboard event.
 * @returns {void}
 */
function onKeydown(event) {
  if (event.code === "Escape" || event.code === "KeyP") {
    event.preventDefault();
    togglePause?.();
    return;
  }

  if (isPortraitBlocked) return;
  if (isPaused) return;

  if (movementKeys.includes(event.code)) {
    event.preventDefault();
  }

  // If the character is sleeping, Space wakes them instead of triggering an action.
  if (event.code === "Space" && world?.isCharacterSleeping) {
    world.resetIdleTimer?.();
    keyboard.SPACE = false;
    return;
  }

  if (event.code === "ArrowRight") keyboard.RIGHT = true;
  if (event.code === "ArrowLeft") keyboard.LEFT = true;
  if (event.code === "ArrowUp") keyboard.UP = true;
  if (event.code === "Space") keyboard.SPACE = true;
}

/**
 * Handles keyup input for movement.
 * @param {KeyboardEvent} event Native keyboard event.
 * @returns {void}
 */
function onKeyup(event) {
  if (isPortraitBlocked) return;
  if (isPaused) return;

  if (movementKeys.includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "ArrowRight") keyboard.RIGHT = false;
  if (event.code === "ArrowLeft") keyboard.LEFT = false;
  if (event.code === "ArrowUp") keyboard.UP = false;
  if (event.code === "Space") keyboard.SPACE = false;
}

/**
 * Binds global keyboard listeners.
 * @returns {void}
 */
function bindKeyboard() {
  window.addEventListener("keydown", onKeydown, { passive: false });
  window.addEventListener("keyup", onKeyup, { passive: false });
}
