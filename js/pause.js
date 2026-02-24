/* global 
  world, isPaused, isMuted, gameStarted,
  isPortraitBlocked,
  stopBackgroundMusic, startBackgroundMusic,
  updateMobileControlsVisibility
*/

/**
 * Indicates whether pause was triggered by orientation change.
 * @type {boolean}
 */
if (typeof pausedByOrientation === "undefined") var pausedByOrientation = false;

/**
 * Stores the last focused element before an overlay was shown.
 * @type {HTMLElement|null}
 */
if (typeof lastFocusBeforeOverlay === "undefined") var lastFocusBeforeOverlay = null;

/**
 * Indicates whether a game session has started.
 * @type {boolean}
 */
if (typeof gameStarted === "undefined") var gameStarted = false;

/**
 * Sets the paused state of the game.
 *
 * Responsibilities:
 *  - Pause/resume world logic
 *  - Show/hide pause overlay
 *  - Manage audio state
 *  - Sync mobile controls visibility
 *
 * @param {boolean} paused
 * @returns {void}
 */
function setPaused(paused) {
  isPaused = paused;

  toggleWorldPause(isPaused);
  togglePauseOverlay(isPaused);
  handlePauseAudio(isPaused);

  if (typeof updateMobileControlsVisibility === "function") {
    updateMobileControlsVisibility();
  }
}

/**
 * Pauses or resumes the world instance.
 *
 * @param {boolean} paused
 * @returns {void}
 */
function toggleWorldPause(paused) {
  if (!world) return;
  (paused ? world.pause : world.resume)?.call(world);
}

/**
 * Shows or hides the pause overlay.
 *
 * Does not show overlay when portrait-blocked.
 *
 * @param {boolean} paused
 * @returns {void}
 */
function togglePauseOverlay(paused) {
  /** @type {HTMLElement|null} */
  const pauseOverlay = document.getElementById("pauseOverlay");
  if (!pauseOverlay) return;

  if (isPortraitBlocked) {
    pauseOverlay.style.display = "none";
    return;
  }

  pauseOverlay.style.display = paused ? "flex" : "none";
}

/**
 * Handles audio state transitions when pausing/resuming.
 *
 * @param {boolean} paused
 * @returns {void}
 */
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

/**
 * Stops all world-related audio and resets playback position.
 *
 * @returns {void}
 */
function stopWorldSounds() {
  if (!world) return;

  world.stopSnoring?.();

  /** @type {Array<HTMLAudioElement|undefined>} */
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
 * Toggles pause state.
 *
 * Guard conditions:
 *  - World must exist
 *  - Not portrait-blocked
 *  - Game must not be over
 *
 * @returns {void}
 */
function togglePause() {
  if (!world) return;
  if (isPortraitBlocked) return;
  if (world.isGameOver) return;

  setPaused(!isPaused);
}

/**
 * Binds pause and resume button controls.
 *
 * Expected DOM:
 *  - #pauseBtn
 *  - #resumeBtn
 *
 * @returns {void}
 */
function setupPauseControls() {
  /** @type {HTMLElement|null} */
  const pauseBtn = document.getElementById("pauseBtn");

  /** @type {HTMLElement|null} */
  const resumeBtn = document.getElementById("resumeBtn");

  pauseBtn?.addEventListener("click", togglePause);
  resumeBtn?.addEventListener("click", () => setPaused(false));
}