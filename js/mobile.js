// =====================================================
// MOBILE: orientation guard + touch controls
// =====================================================

// State flag used by keyboard + pause logic
if (typeof isPortraitBlocked === "undefined") var isPortraitBlocked = false;

/**
 * Determines if the device is likely touch/mobile.
 */
function isTouchDevice() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

/**
 * Shows/hides the "rotate device" overlay and blocks gameplay input in portrait.
 * Expects #gameContainer and #orientationOverlay to exist in the DOM.
 */
function setupOrientationGuard() {
  const gameContainer = document.getElementById("gameContainer");
  const overlay = document.getElementById("orientationOverlay");

  if (!gameContainer || !overlay) return;

  function evaluate() {
    // Only enforce on touch devices
    if (!isTouchDevice()) {
      isPortraitBlocked = false;
      gameContainer.classList.remove("portrait-blocked");
      overlay.style.display = "none";
      return;
    }

    const portrait = window.matchMedia("(orientation: portrait)").matches;

    isPortraitBlocked = portrait;
    if (portrait) {
      gameContainer.classList.add("portrait-blocked");
      overlay.style.display = "flex";
    } else {
      gameContainer.classList.remove("portrait-blocked");
      overlay.style.display = "none";
    }
  }

  evaluate();
  window.addEventListener("resize", evaluate, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(evaluate, 50));
}

/**
 * Maps a mobile button action to keyboard flags.
 */
function setKey(action, pressed) {
  if (typeof keyboard === "undefined") return;

  if (action === "LEFT") keyboard.LEFT = pressed;
  if (action === "RIGHT") keyboard.RIGHT = pressed;
  if (action === "UP") keyboard.UP = pressed;

  if (action === "SPACE") {
    // Respect your existing "sleeping" behavior
    if (pressed && world?.isCharacterSleeping) {
      world.resetIdleTimer?.();
      keyboard.SPACE = false;
      return;
    }
    keyboard.SPACE = pressed;
  }
}

/**
 * Hooks up the on-screen mobile controls (#mobileControls .mc-btn).
 * Safe to call even on desktop (it will just do nothing).
 */
function setupMobileControls() {
  const root = document.getElementById("mobileControls");
  if (!root) return;

  const buttons = root.querySelectorAll(".mc-btn");
  if (!buttons.length) return;

  const press = (btn) => {
    if (isPortraitBlocked || (typeof isPaused !== "undefined" && isPaused)) return;
    const action = btn.dataset.action;
    setKey(action, true);
  };

  const release = (btn) => {
    const action = btn.dataset.action;
    setKey(action, false);
  };

  buttons.forEach((btn) => {
    // Pointer events cover touch + pen + mouse
    btn.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        btn.setPointerCapture?.(e.pointerId);
        press(btn);
      },
      { passive: false }
    );

    btn.addEventListener(
      "pointerup",
      (e) => {
        e.preventDefault();
        release(btn);
      },
      { passive: false }
    );

    btn.addEventListener(
      "pointercancel",
      (e) => {
        e.preventDefault();
        release(btn);
      },
      { passive: false }
    );

    btn.addEventListener(
      "pointerleave",
      () => {
        // if finger slides off, release to avoid "stuck key"
        release(btn);
      },
      { passive: true }
    );
  });
}

/**
 * Optional helper for later: call this once after DOM is ready.
 */
function bindMobile() {
  setupOrientationGuard();
  setupMobileControls();
}