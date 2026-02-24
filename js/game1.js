/**
 * game1.js
 * Entry-point / UI glue code for the game.
 *
 * This file wires DOM controls, canvas resizing, audio/mute persistence,
 * and game lifecycle (start/restart/menu) to the `World` runtime.
 *
 * @fileoverview
 */

/**
 * @typedef {Object} DomRefs
 * @property {HTMLCanvasElement|null} canvas
 * @property {HTMLButtonElement|null} startBtn
 * @property {HTMLButtonElement|null} fullscreenBtn
 * @property {HTMLButtonElement|null} muteBtn
 * @property {HTMLButtonElement|null} restartBtn
 * @property {HTMLElement|null} fullscreenContainer
 * @property {HTMLElement|null} startScreen
 */

/**
 * @typedef {Object} CanvasMetrics
 * @property {DOMRect} rect - Canvas bounding rect in CSS pixels.
 * @property {number} dpr - Device pixel ratio used for backing store size.
 * @property {number} displayWidth - Backing store width in device pixels.
 * @property {number} displayHeight - Backing store height in device pixels.
 */

/**
 * @typedef {Object} Viewport
 * @property {number} dpr
 * @property {number} scale
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} logicalViewportW
 * @property {number} logicalViewportH
 */

/** @type {HTMLCanvasElement|null} */
let canvas;
/** @type {World|null} */
let world;
/** @type {HTMLAudioElement|null} */
let bgMusic;
let isMuted = false;
let isPaused = false;
const MUTE_STORAGE_KEY = 'game_muted';
let isPortraitBlocked = false;
let gameStarted = false;
let keyboard = new Keyboard();
let lastFocusBeforeOverlay = null;
let pausedByOrientation = false;
/** @type {DomRefs} */
const dom = {
  canvas: null,
  startBtn: null,
  fullscreenBtn: null,
  muteBtn: null,
  restartBtn: null,
  fullscreenContainer: null,
  startScreen: null,
};

/**
 * Initializes the game bootstrap: caches DOM refs, loads persisted settings,
 * binds UI/events, and initializes audio/mobile/keyboard behavior.
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

  initAudio();
  initMobile();
  bindKeyboard();
  bindCanvasResizeEvents();
}

/**
 * Binds window/document events that should trigger a canvas resize recalculation.
 *
 * @returns {void}
 */
function bindCanvasResizeEvents() {
  window.addEventListener('resize', resizeCanvasToDisplaySize, { passive: true });
  document.addEventListener('fullscreenchange', resizeCanvasToDisplaySize);
  window.addEventListener('orientationchange', () =>
    setTimeout(resizeCanvasToDisplaySize, 50)
  );
}

/**
 * Caches frequently used DOM elements into the `dom` object and assigns `canvas`.
 *
 * @returns {void}
 */
function cacheDom() {
  dom.canvas = document.getElementById('canvas');
  dom.startBtn = document.getElementById('startBtn');
  dom.fullscreenBtn = document.getElementById('fullscreenBtn');
  dom.muteBtn = document.getElementById('muteBtn');
  dom.restartBtn = document.getElementById('restartBtn');
  dom.fullscreenContainer = document.getElementById('fullscreen');
  dom.startScreen = document.getElementById('startScreen');

  canvas = dom.canvas;
}

const LOGICAL_W = 720;
const LOGICAL_H = 480;

/**
 * Resizes the canvas backing store to match CSS size * DPR and updates the
 * world's view transform accordingly.
 *
 * Safe to call before the world exists.
 *
 * @returns {void}
 */
function resizeCanvasToDisplaySize() {
  const canvas = dom.canvas;
  if (!canvas) return;

  const metrics = getCanvasMetrics(canvas);
  resizeBackingStore(canvas, metrics);

  if (!world?.ctx) return;

  const view = computeView(metrics, LOGICAL_W, LOGICAL_H);
  applyView(world, view);
}

/**
 * Computes size metrics for the given canvas based on its CSS size and DPR.
 *
 * @param {HTMLCanvasElement} canvasEl
 * @returns {CanvasMetrics}
 */
function getCanvasMetrics(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  return {
    rect,
    dpr,
    displayWidth: Math.round(rect.width * dpr),
    displayHeight: Math.round(rect.height * dpr),
  };
}

/**
 * Ensures the canvas backing store matches the provided device-pixel dimensions.
 *
 * @param {HTMLCanvasElement} canvasEl
 * @param {{displayWidth:number, displayHeight:number}} size
 * @returns {void}
 */
function resizeBackingStore(canvas, { displayWidth, displayHeight }) {
  if (canvas.width !== displayWidth) canvas.width = displayWidth;
  if (canvas.height !== displayHeight) canvas.height = displayHeight;
}

/**
 * Computes logical viewport scale/offset values for letterboxing a logical
 * game resolution into the available CSS pixels.
 *
 * @param {CanvasMetrics} metrics
 * @param {number} logicalW
 * @param {number} logicalH
 * @returns {Viewport}
 */
function computeView({ rect, dpr }, logicalW, logicalH) {
  const scale = Math.min(rect.width / logicalW, rect.height / logicalH);

  const offsetX = (rect.width - logicalW * scale) / 2;
  const offsetY = (rect.height - logicalH * scale) / 2;

  return {
    dpr,
    scale,
    offsetX,
    offsetY,
    logicalViewportW: rect.width / scale,
    logicalViewportH: rect.height / scale,
  };
}

/**
 * Applies the computed view to the world (stores it and sets the canvas transform).
 *
 * @param {World} worldInstance
 * @param {Viewport} view
 * @returns {void}
 */
function applyView(world, view) {
  world.view = view;

  world.ctx.setTransform(
    view.dpr * view.scale, 0,
    0, view.dpr * view.scale,
    view.offsetX * view.dpr, view.offsetY * view.dpr
  );

  world.ctx.imageSmoothingEnabled = false;
  world?.setHudPositions?.();
}

/**
 * Loads persisted settings (currently mute state) from localStorage.
 *
 * @returns {void}
 */
function loadSettings() {
  isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
}

/**
 * Binds controls that can start the game (button + keyboard).
 *
 * @returns {void}
 */
function bindStartControls() {
  dom.startBtn?.addEventListener('click', startGame);
  window.addEventListener('keydown', onStartKeydown);
}

/**
 * Binds UI controls unrelated to gameplay input (fullscreen, mute).
 *
 * @returns {void}
 */
function bindUiControls() {
  dom.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenBtn);
  updateFullscreenBtn();

  dom.muteBtn?.addEventListener('click', toggleMute);
  updateMuteBtn();
}

/**
 * Binds restart/menu controls (top restart button + overlay buttons).
 *
 * @returns {void}
 */
function bindRestart() {
  bindTopRestartButton();
  bindOverlayRestartButtons();
  bindOverlayMenuButtons();
}

/**
 * Binds the main restart button to reset state and reload the page.
 *
 * @returns {void}
 */
function bindTopRestartButton() {
  dom.restartBtn?.addEventListener('click', () => {
    if (world) {
      world.isPaused = true;
      world.stopSnoring();
    }
    setPaused(false);
    window.location.reload();
  });
}

/**
 * Binds overlay restart buttons to restart the game without leaving the page.
 *
 * @returns {void}
 */
function bindOverlayRestartButtons() {
  onClick('gameOverRestartBtn', restartGame);
  onClick('winRestartBtn', restartGame);
}

/**
 * Binds overlay menu buttons to return to the start screen.
 *
 * @returns {void}
 */
function bindOverlayMenuButtons() {
  onClick('gameOverMenuBtn', goToMainMenu);
  onClick('winMenuBtn', goToMainMenu);
}

/**
 * Attaches a click handler to an element by id (no-op if element is missing).
 *
 * @param {string} id
 * @param {(ev: MouseEvent) => void} handler
 * @returns {void}
 */
function onClick(id, handler) {
  document.getElementById(id)?.addEventListener('click', handler);
}

/**
 * Binds legal/imprint navigation buttons.
 *
 * @returns {void}
 */
function bindLegal() {
  document
    .getElementById('impressumBtn')
    ?.addEventListener('click', () => {
      window.location.href = 'impressum.html';
    });
}

/**
 * Binds additional start-screen UI (mobile imprint, how-to overlay).
 *
 * @returns {void}
 */
function bindStartScreenExtras() {
  bindMobileImpressum();
  setupHowToOverlay();
}

/**
 * Binds the mobile imprint button to navigate to the imprint page.
 *
 * @returns {void}
 */
function bindMobileImpressum() {
  document.getElementById('impressumBtnMobile')?.addEventListener('click', () => {
    window.location.href = 'impressum.html';
  });
}

/**
 * Initializes and binds the "How To" overlay open/close behavior.
 *
 * @returns {void}
 */
function setupHowToOverlay() {
  const overlayId = 'howToOverlay';
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  initOverlayHidden(overlay);
  bindHowToOpen(overlayId);
  bindHowToClose(overlay, overlayId);
  bindEscapeClose(overlay, overlayId);
}

/**
 * Sets an overlay to its hidden/inert state for accessibility.
 *
 * @param {HTMLElement} overlay
 * @returns {void}
 */
function initOverlayHidden(overlay) {
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
}

/**
 * Binds the "How To" open button to show the overlay.
 *
 * @param {string} overlayId
 * @returns {void}
 */
function bindHowToOpen(overlayId) {
  document.getElementById('howToBtn')
    ?.addEventListener('click', () => showOverlay(overlayId));
}

/**
 * Binds click behavior to close the overlay when clicking the backdrop or close button.
 *
 * @param {HTMLElement} overlay
 * @param {string} overlayId
 * @returns {void}
 */
function bindHowToClose(overlay, overlayId) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('#closeHowToBtn')) {
      hideOverlay(overlayId);
    }
  });
}

/**
 * Binds Escape key behavior to close the overlay if visible.
 *
 * @param {HTMLElement} overlay
 * @param {string} overlayId
 * @returns {void}
 */
function bindEscapeClose(overlay, overlayId) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) {
      hideOverlay(overlayId);
    }
  });
}

/**
 * Initializes audio resources.
 *
 * @returns {void}
 */
function initAudio() {
  setupBackgroundMusic();
}

/**
 * Initializes mobile-specific behaviors (orientation guard, touch controls, pause).
 *
 * @returns {void}
 */
function initMobile() {
  setupOrientationGuard();
  setupMobileControls();
  setupPauseControls();
}

/**
 * Binds gameplay keyboard listeners.
 *
 * @returns {void}
 */
function bindKeyboard() {
  window.addEventListener('keydown', onKeydown, { passive: false });
  window.addEventListener('keyup', onKeyup, { passive: false });
}

/**
 * Starts the game when pressing Enter on the start screen.
 *
 * @param {KeyboardEvent} e
 * @returns {void}
 */
function onStartKeydown(e) {
  if (e.code === 'Enter') startGame();
}

/**
 * Creates and configures the looping background music audio element.
 *
 * @returns {void}
 */
function setupBackgroundMusic() {
  bgMusic = new Audio('assets/audio/background_music.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

/**
 * Starts background music playback (muted state is applied first).
 *
 * @returns {void}
 */
function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = isMuted;
  bgMusic.play().catch(() => { });
}

/**
 * Toggles global mute state, applies it to all known audio sources, persists it,
 * and updates the mute button UI.
 *
 * @returns {void}
 */
function toggleMute() {
  isMuted = !isMuted;

  if (bgMusic) bgMusic.muted = isMuted;
  if (world?.snoringSound) world.snoringSound.muted = isMuted;
  if (world?.coinSound) world.coinSound.muted = isMuted;
  if (world?.bottleSound) world.bottleSound.muted = isMuted;
  if (world?.throwBottleSound) world.throwBottleSound.muted = isMuted;
  if (world?.winSound) world.winSound.muted = isMuted;
  if (world?.gameOverSound) world.gameOverSound.muted = isMuted;

  localStorage.setItem(MUTE_STORAGE_KEY, isMuted);
  updateMuteBtn();
}

/**
 * Updates the mute button icon/title to reflect the current mute state.
 *
 * @returns {void}
 */
function updateMuteBtn() {
  const btn = dom.muteBtn || document.getElementById('muteBtn');
  if (!btn) return;
  btn.textContent = isMuted ? '🔇' : '🔊';
  btn.title = isMuted ? 'Unmute' : 'Mute';
}

/**
 * Starts a new game session: validates conditions, hides start UI, starts audio,
 * creates the world, syncs mute state, and marks the game as started.
 *
 * @returns {void}
 */
function startGame() {
  if (!canStartGame()) return;
  hideStartScreen();
  startBackgroundMusic();
  createWorld();
  syncWorldAudioMute();
  markGameStarted();
}

/**
 * Determines whether the game can be started (e.g., not already running and not blocked by orientation).
 *
 * @returns {boolean}
 */
function canStartGame() {
  if (world) return false;
  if (isPortraitBlocked) return false;
  return true;
}

/**
 * Hides the start screen container.
 *
 * @returns {void}
 */
function hideStartScreen() {
  dom.startScreen?.style && (dom.startScreen.style.display = 'none');
}

/**
 * Creates a new World instance and ensures the canvas/view is correctly sized.
 *
 * @returns {void}
 */
function createWorld() {
  world = new World(canvas, keyboard);
  resizeCanvasToDisplaySize();
}

/**
 * Applies current mute state to all audio resources owned by the world.
 *
 * @returns {void}
 */
function syncWorldAudioMute() {
  if (!world) return;

  setMuted(world.coinSound, isMuted);
  setMuted(world.bottleSound, isMuted);
  setMuted(world.throwBottleSound, isMuted);
  setMuted(world.snoringSound, isMuted);
  setMuted(world.winSound, isMuted);
  setMuted(world.gameOverSound, isMuted);
}

/**
 * Safely sets the `muted` flag on an audio element (no-op if missing).
 *
 * @param {HTMLMediaElement|null|undefined} audio
 * @param {boolean} muted
 * @returns {void}
 */
function setMuted(audio, muted) {
  if (audio) audio.muted = muted;
}

/**
 * Updates flags/UI to reflect that gameplay has started.
 *
 * @returns {void}
 */
function markGameStarted() {
  gameStarted = true;
  updateMobileControlsVisibility();
}

/**
 * Restarts the current game session (clears intervals, hides overlays, rebuilds world).
 *
 * @returns {void}
 */
function restartGame() {
  if (!world) return;
  if (world.collisionInterval) {
    clearInterval(world.collisionInterval);
  }
  document.getElementById('gameOverOverlay').style.display = 'none';
  document.getElementById('winOverlay').style.display = 'none';
  isPaused = false;
  gameStarted = false;
  world = null;
  startGame();
}

/**
 * Stops gameplay and returns to the main menu/start screen.
 *
 * @returns {void}
 */
function goToMainMenu() {
  if (world?.collisionInterval) {
    clearInterval(world.collisionInterval);
  }
  stopBackgroundMusic();
  document.getElementById('gameOverOverlay').style.display = 'none';
  document.getElementById('winOverlay').style.display = 'none';
  world = null;
  isPaused = false;
  gameStarted = false;
  dom.startScreen.style.display = 'flex';

  updateMobileControlsVisibility();
}

/**
 * Toggles fullscreen mode for the game's fullscreen container.
 *
 * @returns {void}
 */
function toggleFullscreen() {
  const container = dom.fullscreenContainer || document.getElementById('fullscreen');

  if (!document.fullscreenElement) {
    container?.requestFullscreen?.().catch((err) => {
      console.warn('Fullscreen failed:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

/**
 * Updates fullscreen button icon/title based on fullscreen state.
 *
 * @returns {void}
 */
function updateFullscreenBtn() {
  const btn = dom.fullscreenBtn || document.getElementById('fullscreenBtn');
  if (!btn) return;

  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? '⤫' : '⤢';
  btn.title = isFs ? 'Exit fullscreen' : 'Enter fullscreen';
}
