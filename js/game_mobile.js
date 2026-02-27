/* global keyboard, world, isPaused */

/**
 * Indicates whether gameplay is currently blocked due to portrait orientation.
 * Used by keyboard and pause modules.
 * @type {boolean}
 */
if (typeof isPortraitBlocked === "undefined") var isPortraitBlocked = false;

/**
 * Determines whether the current device likely uses touch input.
 *
 * @returns {boolean}
 */
function isTouchDevice() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

/**
 * Sets up orientation handling for mobile devices.
 *
 * - Shows rotate overlay in portrait mode
 * - Blocks gameplay input when portrait
 * - Removes restriction on desktop
 *
 * Requires:
 *  - #gameContainer
 *  - #orientationOverlay
 *
 */
function setupOrientationGuard() {
  /** @type {HTMLElement|null} */
  const gameContainer = document.getElementById("gameContainer");

  /** @type {HTMLElement|null} */
  const overlay = document.getElementById("orientationOverlay");

  if (!gameContainer || !overlay) return;

  /**
   * Evaluates current orientation and updates UI state.
   */
  function evaluate() {
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
  window.addEventListener("orientationchange", () =>
    setTimeout(evaluate, 50)
  );
}

/**
 * Updates keyboard state flags based on mobile button input.
 *
 * @param {"LEFT"|"RIGHT"|"UP"|"SPACE"} action
 * @param {boolean} pressed
 */
function setKey(action, pressed) {
  if (!keyboard) return;

  if (action === "LEFT") keyboard.LEFT = pressed;
  if (action === "RIGHT") keyboard.RIGHT = pressed;
  if (action === "UP") keyboard.UP = pressed;

  if (action === "SPACE") {
    if (pressed && world?.isCharacterSleeping) {
      world.resetIdleTimer?.();
      keyboard.SPACE = false;
      return;
    }
    keyboard.SPACE = pressed;
  }
}

/**
 * Binds mobile control buttons to keyboard state.
 *
 * Expects buttons with:
 *  - class ".mc-btn"
 *  - data-action attribute
 *
 * Safe to call on desktop (no-op).
 *
 */
function setupMobileControls() {
  /** @type {HTMLElement|null} */
  const root = document.getElementById("mobileControls");
  if (!root) return;

  /** @type {NodeListOf<HTMLElement>} */
  const buttons = root.querySelectorAll(".mc-btn");
  if (!buttons.length) return;

  /**
   * @param {HTMLElement} btn
   */
  const press = (btn) => {
    if (isPortraitBlocked || isPaused) return;
    const action = /** @type {"LEFT"|"RIGHT"|"UP"|"SPACE"} */ (btn.dataset.action);
    setKey(action, true);
  };

  /**
   * @param {HTMLElement} btn
   */
  const release = (btn) => {
    const action = /** @type {"LEFT"|"RIGHT"|"UP"|"SPACE"} */ (btn.dataset.action);
    setKey(action, false);
  };

  buttons.forEach((btn) => {
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
      () => release(btn),
      { passive: true }
    );
  });
}

/**
 * Initializes mobile-related systems.
 * Should be called once during app initialization.
 *
 */
function bindMobile() {
  setupOrientationGuard();
  setupMobileControls();
}