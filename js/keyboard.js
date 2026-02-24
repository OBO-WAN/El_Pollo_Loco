// =====================================================
// KEYBOARD INPUT (gameplay keys + pause hotkeys)
// =====================================================

function onKeydown(e) {
  if (e.code === "Escape" || e.code === "KeyP") {
    e.preventDefault();
    togglePause?.();
    return;
  }

  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) return;
  if (typeof isPaused !== "undefined" && isPaused) return;

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

function onKeyup(e) {
  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) return;
  if (typeof isPaused !== "undefined" && isPaused) return;

  if (["ArrowRight", "ArrowLeft", "ArrowUp", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "ArrowRight") keyboard.RIGHT = false;
  if (e.code === "ArrowLeft") keyboard.LEFT = false;
  if (e.code === "ArrowUp") keyboard.UP = false;
  if (e.code === "Space") keyboard.SPACE = false;
}

function bindKeyboard() {
  window.addEventListener("keydown", onKeydown, { passive: false });
  window.addEventListener("keyup", onKeyup, { passive: false });
}