/* global Keyboard, World, canvas, world, isMuted, isPaused, isPortraitBlocked
          setupBackgroundMusic, setupPauseControls, bindKeyboard, bindMobile
          bindCanvasResizeEvents, resizeCanvasToDisplaySize, syncWorldAudioMute
          startBackgroundMusic, stopBackgroundMusic, toggleMute, updateMuteBtn
          setPaused, lastFocusBeforeOverlay */

/**
 * Cached DOM references used by the application.
 * @typedef {Object} DomCache
 * @property {HTMLCanvasElement|null} canvas
 * @property {HTMLElement|null} startBtn
 * @property {HTMLElement|null} fullscreenBtn
 * @property {HTMLElement|null} muteBtn
 * @property {HTMLElement|null} restartBtn
 * @property {HTMLElement|null} fullscreenContainer
 * @property {HTMLElement|null} startScreen
 */

/**
 * Small DOM cache (avoids repeated lookups).
 * @type {DomCache}
 */
const dom = {
  canvas: null,
  startBtn: null,
  fullscreenBtn: null,
  muteBtn: null,
  restartBtn: null,
  fullscreenContainer: null,
  startScreen: null,
};

// Ensure keyboard exists (Keyboard class is loaded via models/keyboard.class.js)
/** @type {Keyboard} */
if (typeof keyboard === "undefined") {
  var keyboard = new Keyboard();
}

/** @type {string} */
if (typeof MUTE_STORAGE_KEY === "undefined") {
  var MUTE_STORAGE_KEY = "game_muted";
}

/** @type {boolean} */
if (typeof gameStarted === "undefined") {
  var gameStarted = false;
}

/**
 * Cache important DOM elements and publish shared globals.
 * @returns {void}
 */
function cacheDom() {
  dom.canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById("canvas"));
  dom.startBtn = document.getElementById("startBtn");
  dom.fullscreenBtn = document.getElementById("fullscreenBtn");
  dom.muteBtn = document.getElementById("muteBtn");
  dom.restartBtn = document.getElementById("restartBtn");
  dom.fullscreenContainer = document.getElementById("fullscreen");
  dom.startScreen = document.getElementById("startScreen");

  canvas = dom.canvas;
}

/**
 * Loads persisted settings (mute).
 * @returns {void}
 */
function loadSettings() {
  isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
}

/**
 * App entry point (called from boot.js after preloading).
 * Wires UI, initializes subsystems, and prepares rendering/input.
 *
 * @returns {void}
 */
function initGame() {
  cacheDom();
  loadSettings();

  bindStartControls();
  bindUiControls();
  bindRestart();
  bindLegal();
  bindStartScreenExtras();

  setupBackgroundMusic?.();
  setupPauseControls?.();

  bindKeyboard?.();
  bindMobile?.();

  bindCanvasResizeEvents?.();
  resizeCanvasToDisplaySize?.();

  updateMobileControlsVisibility();
}

/**
 * Checks if game can start.
 * @returns {boolean}
 */
function canStartGame() {
  if (world) return false;
  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) return false;
  return true;
}

/**
 * Hides the start screen overlay.
 * @returns {void}
 */
function hideStartScreen() {
  if (dom.startScreen) dom.startScreen.style.display = "none";
}

/**
 * Creates the World instance and applies initial view/audio state.
 * @returns {void}
 */
function createWorld() {
  world = new World(canvas, keyboard);
  resizeCanvasToDisplaySize?.();
  syncWorldAudioMute?.();
}

/**
 * Marks the session started and updates mobile controls visibility.
 * @returns {void}
 */
function markGameStarted() {
  gameStarted = true;
  updateMobileControlsVisibility();
}

/**
 * Starts a new game session.
 * @returns {void}
 */
function startGame() {
  if (!canStartGame()) return;

  hideStartScreen();

  if (!isMuted) startBackgroundMusic?.();

  createWorld();
  markGameStarted();
}

/**
 * Restarts the current game session.
 * @returns {void}
 */
function restartGame() {
  if (!world) return;

  if (world.collisionInterval) clearInterval(world.collisionInterval);

  const go = document.getElementById("gameOverOverlay");
  const wo = document.getElementById("winOverlay");
  if (go) go.style.display = "none";
  if (wo) wo.style.display = "none";

  isPaused = false;
  gameStarted = false;

  world = null;
  startGame();
}

/**
 * Stops gameplay and returns to main menu.
 * @returns {void}
 */
function goToMainMenu() {
  if (world?.collisionInterval) clearInterval(world.collisionInterval);

  stopBackgroundMusic?.();

  const go = document.getElementById("gameOverOverlay");
  const wo = document.getElementById("winOverlay");
  if (go) go.style.display = "none";
  if (wo) wo.style.display = "none";

  world = null;
  isPaused = false;
  gameStarted = false;

  if (dom.startScreen) dom.startScreen.style.display = "flex";
  updateMobileControlsVisibility();
}

/**
 * Binds start button + Enter key.
 * @returns {void}
 */
function bindStartControls() {
  dom.startBtn?.addEventListener("click", startGame);
  window.addEventListener("keydown", onStartKeydown);
}

/**
 * Handles Enter key start shortcut.
 * @param {KeyboardEvent} e
 * @returns {void}
 */
function onStartKeydown(e) {
  if (e.code === "Enter") startGame();
}

/**
 * Binds fullscreen + mute controls.
 * @returns {void}
 */
function bindUiControls() {
  dom.fullscreenBtn?.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    updateFullscreenBtn();
    resizeCanvasToDisplaySize?.();
  });
  updateFullscreenBtn();

  dom.muteBtn?.addEventListener("click", () => {
    toggleMute?.();
    updateMobileControlsVisibility();
  });
  updateMuteBtn?.();
}

/**
 * Binds all restart/menu controls.
 * @returns {void}
 */
function bindRestart() {
  bindTopRestartButton();
  bindOverlayRestartButtons();
  bindOverlayMenuButtons();
}

/**
 * Restart button: reloads the page.
 * @returns {void}
 */
function bindTopRestartButton() {
  dom.restartBtn?.addEventListener("click", () => {
    if (world) {
      world.isPaused = true;
      world.stopSnoring?.();
    }
    setPaused?.(false);
    window.location.reload();
  });
}

/**
 * Binds restart buttons inside win/lose overlays.
 * @returns {void}
 */
function bindOverlayRestartButtons() {
  onClick("gameOverRestartBtn", restartGame);
  onClick("winRestartBtn", restartGame);
}

/**
 * Binds menu buttons inside win/lose overlays.
 * @returns {void}
 */
function bindOverlayMenuButtons() {
  onClick("gameOverMenuBtn", goToMainMenu);
  onClick("winMenuBtn", goToMainMenu);
}

/**
 * Utility for adding click handler by id.
 * @param {string} id
 * @param {Function} handler
 * @returns {void}
 */
function onClick(id, handler) {
  document.getElementById(id)?.addEventListener("click", handler);
}

/**
 * Binds legal notice button.
 * @returns {void}
 */
function bindLegal() {
  document.getElementById("impressumBtn")?.addEventListener("click", () => {
    window.location.href = "impressum.html";
  });
}

/**
 * Binds additional start screen actions (How-to + mobile legal).
 * @returns {void}
 */
function bindStartScreenExtras() {
  bindMobileImpressum();
  setupHowToOverlay();
}

/**
 * Binds mobile legal notice button.
 * @returns {void}
 */
function bindMobileImpressum() {
  document.getElementById("impressumBtnMobile")?.addEventListener("click", () => {
    window.location.href = "impressum.html";
  });
}

/**
 * Toggles fullscreen for #fullscreen container.
 * @returns {void}
 */
function toggleFullscreen() {
  const container = dom.fullscreenContainer || document.getElementById("fullscreen");

  if (!document.fullscreenElement) {
    container?.requestFullscreen?.().catch((err) => console.warn("Fullscreen failed:", err));
  } else {
    document.exitFullscreen();
  }
}

/**
 * Updates fullscreen button UI text and title.
 * @returns {void}
 */
function updateFullscreenBtn() {
  const btn = dom.fullscreenBtn || document.getElementById("fullscreenBtn");
  if (!btn) return;

  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? "⤫" : "⤢";
  btn.title = isFs ? "Exit fullscreen" : "Enter fullscreen";
}

/**
 * Wires up the How-To overlay open/close logic and focus management.
 * @returns {void}
 */
function setupHowToOverlay() {
  const overlay = document.getElementById("howToOverlay");
  if (!overlay) return;

  overlay.classList.remove("show");
  overlay.inert = true;
  overlay.setAttribute("aria-hidden", "true");

  document.getElementById("howToBtn")?.addEventListener("click", () => {
    showHowToOverlay(overlay);
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("#closeHowToBtn")) {
      hideHowToOverlay(overlay);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      hideHowToOverlay(overlay);
    }
  });
}

/**
 * Opens How-To overlay and moves focus inside.
 * @param {HTMLElement} overlayEl
 * @returns {void}
 */
function showHowToOverlay(overlayEl) {
  if (typeof lastFocusBeforeOverlay !== "undefined") {
    lastFocusBeforeOverlay = document.activeElement;
  }

  overlayEl.classList.add("show");
  overlayEl.inert = false;
  overlayEl.setAttribute("aria-hidden", "false");

  overlayEl
    .querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
    ?.focus();
}

/**
 * Closes How-To overlay and restores previous focus.
 * @param {HTMLElement} overlayEl
 * @returns {void}
 */
function hideHowToOverlay(overlayEl) {
  if (typeof lastFocusBeforeOverlay !== "undefined" && lastFocusBeforeOverlay?.focus) {
    lastFocusBeforeOverlay.focus();
  }

  overlayEl.classList.remove("show");
  overlayEl.inert = true;
  overlayEl.setAttribute("aria-hidden", "true");
}

/**
 * Checks whether environment is touch-like (coarse pointer).
 * @returns {boolean}
 */
function isMobileLike() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

/**
 * Shows/hides mobile controls depending on session + device state.
 * @returns {void}
 */
function updateMobileControlsVisibility() {
  const controls = document.getElementById("mobileControls");
  if (!controls) return;

  const isTouch = isMobileLike();
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTabletOrSmaller = window.innerWidth <= 1366;

  controls.style.display =
    gameStarted &&
    isTouch &&
    isLandscape &&
    isTabletOrSmaller &&
    !(typeof isPortraitBlocked !== "undefined" && isPortraitBlocked)
      ? "block"
      : "none";
}

window.addEventListener("resize", () => updateMobileControlsVisibility(), { passive: true });
window.addEventListener("orientationchange", () => setTimeout(updateMobileControlsVisibility, 50));