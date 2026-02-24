// =====================================================
// PAUSE SYSTEM (togglePause, setPaused, pause overlay, audio handling)
// =====================================================

// game2.js uses these globals; keep compatible while old files still exist
if (typeof pausedByOrientation === "undefined") var pausedByOrientation = false;
if (typeof lastFocusBeforeOverlay === "undefined") var lastFocusBeforeOverlay = null;
if (typeof gameStarted === "undefined") var gameStarted = false;

/**
 * Shows/hides pause overlay and pauses/resumes world + audio.
 */
function setPaused(paused) {
  isPaused = paused;

  toggleWorldPause(isPaused);
  togglePauseOverlay(isPaused);
  handlePauseAudio(isPaused);

  // Keep mobile controls in sync if that function exists (we’ll add it later)
  if (typeof updateMobileControlsVisibility === "function") {
    updateMobileControlsVisibility();
  }
}

function toggleWorldPause(paused) {
  if (!world) return;
  (paused ? world.pause : world.resume)?.call(world);
}

function togglePauseOverlay(paused) {
  const pauseOverlay = document.getElementById("pauseOverlay");
  if (!pauseOverlay) return;

  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) {
    pauseOverlay.style.display = "none";
    return;
  }
  pauseOverlay.style.display = paused ? "flex" : "none";
}

function handlePauseAudio(paused) {
  if (paused) {
    stopBackgroundMusic?.();
    stopWorldSounds();
    return;
  }

  if (!isMuted && gameStarted && world && !world.isGameOver) {
    startBackgroundMusic?.();
  }
}

function stopWorldSounds() {
  if (!world) return;

  world.stopSnoring?.();

  const sounds = [
    world.coinSound,
    world.bottleSound,
    world.throwBottleSound,
    world.winSound,
    world.gameOverSound,
  ];

  sounds.forEach((sound) => {
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  });
}

/**
 * Toggle pause (button + Escape/P from keyboard).
 */
function togglePause() {
  if (!world) return;
  if (typeof isPortraitBlocked !== "undefined" && isPortraitBlocked) return;
  if (world.isGameOver) return;

  setPaused(!isPaused);
}

/**
 * Wire pause button + resume button.
 */
function setupPauseControls() {
  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");

  pauseBtn?.addEventListener("click", togglePause);
  resumeBtn?.addEventListener("click", () => setPaused(false));
}