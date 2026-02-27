/**
 * Minimal World contract used across modules.
 *
 * This is intentionally partial — it only defines
 * properties accessed by other modules.
 *
 * @typedef {Object} World
 * @property {CanvasRenderingContext2D} ctx
 * @property {boolean=} isGameOver
 * @property {boolean=} isCharacterSleeping
 * @property {Function=} pause
 * @property {Function=} resume
 * @property {Function=} stopSnoring
 * @property {Function=} setHudPositions
 * @property {number=} collisionInterval
 * @property {HTMLAudioElement=} coinSound
 * @property {HTMLAudioElement=} bottleSound
 * @property {HTMLAudioElement=} throwBottleSound
 * @property {HTMLAudioElement=} winSound
 * @property {HTMLAudioElement=} gameOverSound
 */

/**
 * Application settings stored in memory.
 *
 * @typedef {Object} GameSettings
 * @property {boolean} musicMuted
 */

let world = null;
let canvas = null;
let loadingOverlay = null;
let gameOverOverlay = null;
let winOverlay = null;
let startScreen = null;
let orientationOverlay = null;
let pauseOverlay = null;
let currentView = null;
let backgroundMusic = null;
let isMuted = false;
let isPaused = false;
let SETTINGS = {
  musicMuted: false,
};

window.gameUI = window.gameUI || {};

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

  window.gameUI?.updateMobileControlsVisibility?.();
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
  window.gameUI.updateMobileControlsVisibility();
}

/**
 * Starts a new game session.
 * @returns {void}
 */
function startGame() {
  if (!canStartGame()) return;

  window.gameUI?.hideStartScreen?.();

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
  window.gameUI.updateMobileControlsVisibility();
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
  if (window.gameUI?.toggleFullscreen) {
    dom.fullscreenBtn?.addEventListener("click", window.gameUI.toggleFullscreen);
  }

  document.addEventListener("fullscreenchange", () => {
    window.gameUI?.updateFullscreenBtn?.();
    resizeCanvasToDisplaySize?.();
  });

  window.gameUI?.updateFullscreenBtn?.();

  dom.muteBtn?.addEventListener("click", () => {
    toggleMute?.();
    window.gameUI?.updateMobileControlsVisibility?.();
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
      world.audio?.stopSnoring();
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
  window.gameUI?.onClick?.("gameOverRestartBtn", restartGame);
  window.gameUI?.onClick?.("winRestartBtn", restartGame);
}

/**
 * Binds menu buttons inside win/lose overlays.
 * @returns {void}
 */
function bindOverlayMenuButtons() {
  window.gameUI?.onClick?.("gameOverMenuBtn", goToMainMenu);
  window.gameUI?.onClick?.("winMenuBtn", goToMainMenu);
}

/**
 * Utility for adding click handler by id.
 * @param {string} id
 * @param {Function} handler
 * @returns {void}
 */
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
  window.gameUI?.setupHowToOverlay?.();
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
