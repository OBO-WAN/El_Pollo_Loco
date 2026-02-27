/* global keyboard, world, isPaused */

/**
 * Indicates whether gameplay input is blocked due to portrait orientation.
 * Used by keyboard and pause modules.
 * @type {boolean}
 */
if (typeof isPortraitBlocked === "undefined") var isPortraitBlocked = false;

/**
 * Detects whether the device likely uses touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

/**
 * Checks if the current orientation is portrait.
 * @returns {boolean}
 */
function isPortraitOrientation() {
  return window.matchMedia?.("(orientation: portrait)")?.matches ?? false;
}

/**
 * Shows/hides portrait overlay and updates the blocked flag.
 * @param {HTMLElement} gameContainer
 * @param {HTMLElement} orientationOverlay
 * @param {boolean} blocked
 * @returns {void}
 */
function applyPortraitBlockedState(gameContainer, orientationOverlay, blocked) {
  isPortraitBlocked = blocked;
  gameContainer.classList.toggle("portrait-blocked", blocked);
  orientationOverlay.style.display = blocked ? "flex" : "none";
}

/**
 * Updates UI for the current device + orientation state.
 * @param {HTMLElement} gameContainer
 * @param {HTMLElement} orientationOverlay
 * @returns {void}
 */
function updateOrientationGuardUi(gameContainer, orientationOverlay) {
  if (!isTouchDevice()) {
    applyPortraitBlockedState(gameContainer, orientationOverlay, false);
    return;
  }
  applyPortraitBlockedState(gameContainer, orientationOverlay, isPortraitOrientation());
}

/**
 * Schedules a short delayed orientation refresh (mobile browsers can lag).
 * @param {HTMLElement} gameContainer
 * @param {HTMLElement} orientationOverlay
 * @returns {void}
 */
function scheduleOrientationRefresh(gameContainer, orientationOverlay) {
  setTimeout(() => updateOrientationGuardUi(gameContainer, orientationOverlay), 50);
}

/**
 * Enables portrait-orientation guarding for touch devices.
 * Requires #gameContainer and #orientationOverlay elements.
 * @returns {void}
 */
function setupOrientationGuard() {
  const gameContainer = document.getElementById("gameContainer");
  const orientationOverlay = document.getElementById("orientationOverlay");
  if (!gameContainer || !orientationOverlay) return;

  updateOrientationGuardUi(gameContainer, orientationOverlay);
  window.addEventListener("resize", () => updateOrientationGuardUi(gameContainer, orientationOverlay), { passive: true });
  window.addEventListener("orientationchange", () => scheduleOrientationRefresh(gameContainer, orientationOverlay));
}

/**
 * Updates keyboard state from a mobile action.
 * @param {"LEFT"|"RIGHT"|"UP"|"SPACE"} action
 * @param {boolean} pressed
 * @returns {void}
 */
function setKey(action, pressed) {
  if (!keyboard) return;

  if (action === "LEFT") keyboard.LEFT = pressed;
  if (action === "RIGHT") keyboard.RIGHT = pressed;
  if (action === "UP") keyboard.UP = pressed;

  if (action !== "SPACE") return;
  if (pressed && world?.isCharacterSleeping) {
    world.resetIdleTimer?.();
    keyboard.SPACE = false;
    return;
  }
  keyboard.SPACE = pressed;
}

/**
 * Gets the configured action from a control button.
 * @param {HTMLElement} button
 * @returns {"LEFT"|"RIGHT"|"UP"|"SPACE"|null}
 */
function getButtonAction(button) {
  const action = button.dataset.action;
  if (action === "LEFT" || action === "RIGHT" || action === "UP" || action === "SPACE") return action;
  return null;
}

/**
 * Applies a press event to the given control.
 * @param {HTMLElement} button
 * @returns {void}
 */
function handleControlPress(button) {
  if (isPortraitBlocked || isPaused) return;
  const action = getButtonAction(button);
  if (!action) return;
  setKey(action, true);
}

/**
 * Applies a release event to the given control.
 * @param {HTMLElement} button
 * @returns {void}
 */
function handleControlRelease(button) {
  const action = getButtonAction(button);
  if (!action) return;
  setKey(action, false);
}

/**
 * Binds pointer events to a single mobile control button.
 * @param {HTMLElement} button
 * @returns {void}
 */

/**
 * Adds a pointer listener with options.
 * @param {HTMLElement} button
 * @param {string} type
 * @param {(event: PointerEvent) => void} handler
 * @param {AddEventListenerOptions|boolean} options
 * @returns {void}
 */
function addControlListener(button, type, handler, options) {
  button.addEventListener(type, handler, options);
}

/**
 * Binds pointer events to a single mobile control button.
 * @param {HTMLElement} button
 * @returns {void}
 */
function bindMobileControlButton(button) {
  addControlListener(button, "pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    handleControlPress(button);
  }, { passive: false });

  addControlListener(button, "pointerup", (event) => { event.preventDefault(); handleControlRelease(button); }, { passive: false });
  addControlListener(button, "pointercancel", (event) => { event.preventDefault(); handleControlRelease(button); }, { passive: false });
  addControlListener(button, "pointerleave", () => handleControlRelease(button), { passive: true });
}

/**
 * Binds mobile control buttons to keyboard state.
 * Expects #mobileControls with buttons using .mc-btn and data-action.
 * @returns {void}
 */
function setupMobileControls() {
  const mobileControlsRoot = document.getElementById("mobileControls");
  if (!mobileControlsRoot) return;

  const controlButtons = mobileControlsRoot.querySelectorAll(".mc-btn");
  if (!controlButtons.length) return;

  controlButtons.forEach((button) => bindMobileControlButton(button));
}

/**
 * Initializes mobile-related systems (orientation guard + controls).
 * @returns {void}
 */
function bindMobile() {
  setupOrientationGuard();
  setupMobileControls();
}
