// =====================================================
// MAIN APP WIRING (replacement for game1.js)
// =====================================================

// Ensure keyboard exists (Keyboard class is loaded via models/keyboard.class.js)
if (typeof keyboard === "undefined") {
  var keyboard = new Keyboard();
}

// Small DOM cache (optional; avoids lots of getElementById calls)
const dom = {
  canvas: null,
  startBtn: null,
  fullscreenBtn: null,
  muteBtn: null,
  restartBtn: null,
  fullscreenContainer: null,
  startScreen: null,
};

// Keep compatibility with existing storage key used earlier
if (typeof MUTE_STORAGE_KEY === "undefined") {
  var MUTE_STORAGE_KEY = "game_muted";
}

// Global game session flag used by pause/mobile logic
if (typeof gameStarted === "undefined") {
  var gameStarted = false;
}

/**
 * Call once during init to cache important DOM elements.
 */
function cacheDom() {
  dom.canvas = document.getElementById("canvas");
  dom.startBtn = document.getElementById("startBtn");
  dom.fullscreenBtn = document.getElementById("fullscreenBtn"); // may not exist (hidden on mobile)
  dom.muteBtn = document.getElementById("muteBtn");
  dom.restartBtn = document.getElementById("restartBtn");
  dom.fullscreenContainer = document.getElementById("fullscreen");
  dom.startScreen = document.getElementById("startScreen");

  // publish to shared global used by viewport.js etc.
  canvas = dom.canvas;
}

/**
 * Loads persisted settings (mute).
 */
function loadSettings() {
  isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
}

/**
 * Entry point that replaces game1.js initGame().
 */
function initGame() {
  cacheDom();
  loadSettings();

  bindStartControls();
  bindUiControls();
  bindRestart();
  bindLegal();
  bindStartScreenExtras();

  // Init subsystems we already split out
  setupBackgroundMusic?.();
  setupPauseControls?.();

  bindKeyboard?.();
  bindMobile?.();

  bindCanvasResizeEvents?.();
  resizeCanvasToDisplaySize?.();

  updateMobileControlsVisibility();
}

/* -----------------------------------------------------
   START / SESSION
----------------------------------------------------- */

function canStartGame() {
  if (world) return false;
  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) return false;
  return true;
}

function hideStartScreen() {
  if (dom.startScreen) dom.startScreen.style.display = "none";
}

function createWorld() {
  world = new World(canvas, keyboard);
  resizeCanvasToDisplaySize?.();
  syncWorldAudioMute?.();
}

function markGameStarted() {
  gameStarted = true;
  updateMobileControlsVisibility();
}

function startGame() {
  if (!canStartGame()) return;

  hideStartScreen();

  // Start music only if not muted
  if (!isMuted) startBackgroundMusic?.();

  createWorld();
  markGameStarted();
}

function restartGame() {
  if (!world) return;

  if (world.collisionInterval) clearInterval(world.collisionInterval);

  document.getElementById("gameOverOverlay")?.style && (document.getElementById("gameOverOverlay").style.display = "none");
  document.getElementById("winOverlay")?.style && (document.getElementById("winOverlay").style.display = "none");

  isPaused = false;
  gameStarted = false;

  world = null;
  startGame();
}

function goToMainMenu() {
  if (world?.collisionInterval) clearInterval(world.collisionInterval);

  stopBackgroundMusic?.();

  document.getElementById("gameOverOverlay")?.style && (document.getElementById("gameOverOverlay").style.display = "none");
  document.getElementById("winOverlay")?.style && (document.getElementById("winOverlay").style.display = "none");

  world = null;
  isPaused = false;
  gameStarted = false;

  if (dom.startScreen) dom.startScreen.style.display = "flex";
  updateMobileControlsVisibility();
}

/* -----------------------------------------------------
   UI CONTROLS (start/fullscreen/mute/restart/legal)
----------------------------------------------------- */

function bindStartControls() {
  dom.startBtn?.addEventListener("click", startGame);
  window.addEventListener("keydown", onStartKeydown);
}

function onStartKeydown(e) {
  if (e.code === "Enter") startGame();
}

function bindUiControls() {
  // Fullscreen button might not exist (hidden on mobile)
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

function bindRestart() {
  bindTopRestartButton();
  bindOverlayRestartButtons();
  bindOverlayMenuButtons();
}

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

function bindOverlayRestartButtons() {
  onClick("gameOverRestartBtn", restartGame);
  onClick("winRestartBtn", restartGame);
}

function bindOverlayMenuButtons() {
  onClick("gameOverMenuBtn", goToMainMenu);
  onClick("winMenuBtn", goToMainMenu);
}

function onClick(id, handler) {
  document.getElementById(id)?.addEventListener("click", handler);
}

function bindLegal() {
  document.getElementById("impressumBtn")?.addEventListener("click", () => {
    window.location.href = "impressum.html";
  });
}

function bindStartScreenExtras() {
  bindMobileImpressum();
  setupHowToOverlay();
}

function bindMobileImpressum() {
  document.getElementById("impressumBtnMobile")?.addEventListener("click", () => {
    window.location.href = "impressum.html";
  });
}

/* -----------------------------------------------------
   FULLSCREEN
----------------------------------------------------- */

function toggleFullscreen() {
  const container = dom.fullscreenContainer || document.getElementById("fullscreen");

  if (!document.fullscreenElement) {
    container?.requestFullscreen?.().catch((err) => console.warn("Fullscreen failed:", err));
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenBtn() {
  const btn = dom.fullscreenBtn || document.getElementById("fullscreenBtn");
  if (!btn) return;

  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? "⤫" : "⤢";
  btn.title = isFs ? "Exit fullscreen" : "Enter fullscreen";
}

/* -----------------------------------------------------
   HOW-TO OVERLAY (accessible show/hide)
----------------------------------------------------- */

function setupHowToOverlay() {
  const overlayId = "howToOverlay";
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  // initial hidden/inert
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

function showHowToOverlay(overlayEl) {
  // save focus
  if (typeof lastFocusBeforeOverlay !== "undefined") {
    lastFocusBeforeOverlay = document.activeElement;
  }

  overlayEl.classList.add("show");
  overlayEl.inert = false;
  overlayEl.setAttribute("aria-hidden", "false");

  // focus first button
  overlayEl.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
}

function hideHowToOverlay(overlayEl) {
  if (typeof lastFocusBeforeOverlay !== "undefined" && lastFocusBeforeOverlay?.focus) {
    lastFocusBeforeOverlay.focus();
  }

  overlayEl.classList.remove("show");
  overlayEl.inert = true;
  overlayEl.setAttribute("aria-hidden", "true");
}

/* -----------------------------------------------------
   MOBILE CONTROLS VISIBILITY (moved from game2.js)
----------------------------------------------------- */

function isMobileLike() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function updateMobileControlsVisibility() {
  const controls = document.getElementById("mobileControls");
  if (!controls) return;

  const isTouch = isMobileLike();
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTabletOrSmaller = window.innerWidth <= 1366;

  controls.style.display =
    gameStarted && isTouch && isLandscape && isTabletOrSmaller && !(typeof isPortraitBlocked !== "undefined" && isPortraitBlocked)
      ? "block"
      : "none";
}

// keep it updated on resize/orientation
window.addEventListener("resize", () => updateMobileControlsVisibility(), { passive: true });
window.addEventListener("orientationchange", () => setTimeout(updateMobileControlsVisibility, 50));