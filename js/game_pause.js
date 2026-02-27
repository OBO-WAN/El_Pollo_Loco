/* global 
  world, isPaused, isMuted, gameStarted,
  isPortraitBlocked,
  stopBackgroundMusic, startBackgroundMusic,
  updateMobileControlsVisibility
*/

/**
 * True when pause was triggered by an orientation rule.
 * @type {boolean}
 */
if (typeof pausedByOrientation === "undefined") var pausedByOrientation = false;

/**
 * Last focused element before an overlay was shown.
 * @type {HTMLElement|null}
 */
if (typeof lastFocusBeforeOverlay === "undefined") var lastFocusBeforeOverlay = null;

/**
 * True once a game session has started.
 * @type {boolean}
 */
if (typeof gameStarted === "undefined") var gameStarted = false;

/**
 * Sets the global paused state and syncs world, UI, and audio.
 * @param {boolean} paused Whether the game should be paused.
 * @returns {void}
 */
function setPaused(paused) {
  isPaused = paused;
  toggleWorldPause(isPaused);
  togglePauseOverlay(isPaused);
  handlePauseAudio(isPaused);
  updateMobileControlsVisibility?.();
}

/**
 * Calls world pause/resume if available.
 * @param {boolean} paused Whether the world should be paused.
 * @returns {void}
 */
function toggleWorldPause(paused) {
  if (!world) return;
  (paused ? world.pause : world.resume)?.call(world);
}

/**
 * Returns the pause overlay element if present.
 * @returns {HTMLElement|null}
 */
function getPauseOverlay() {
  return document.getElementById("pauseOverlay");
}

/**
 * Shows/hides the pause overlay (hidden when portrait-blocked).
 * @param {boolean} paused Whether pause overlay should be visible.
 * @returns {void}
 */
function togglePauseOverlay(paused) {
  const pauseOverlay = getPauseOverlay();
  if (!pauseOverlay) return;

  if (isPortraitBlocked) {
    pauseOverlay.style.display = "none";
    return;
  }

  pauseOverlay.style.display = paused ? "flex" : "none";
}

/**
 * Syncs audio when pausing/resuming.
 * @param {boolean} paused Whether the game is paused.
 * @returns {void}
 */
function handlePauseAudio(paused) {
  if (paused) {
    stopBackgroundMusic?.();
    stopWorldSounds();
    return;
  }

  if (shouldResumeBackgroundMusic()) {
    startBackgroundMusic?.();
  }
}

/**
 * Returns true when background music should resume.
 * @returns {boolean}
 */
function shouldResumeBackgroundMusic() {
  if (isMuted) return false;
  if (!gameStarted) return false;
  if (!world) return false;
  return !world.isGameOver;
}

/**
 * Returns the list of world sound effects to stop/reset.
 * @returns {Array<HTMLAudioElement|undefined|null>}
 */
function getWorldSounds() {
  if (!world?.audio) return [];
  return [
    world.audio.coinSound,
    world.audio.bottleSound,
    world.audio.throwBottleSound,
    world.audio.winSound,
    world.audio.gameOverSound,
  ];
}

/**
 * Stops an audio element and resets its playback position.
 * @param {HTMLAudioElement|null|undefined} sound Audio instance to stop.
 * @returns {void}
 */
function stopAndResetSound(sound) {
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
}

/**
 * Stops all world audio and resets playback positions.
 * @returns {void}
 */
function stopWorldSounds() {
  if (!world) return;
  world.audio?.stopSnoring();
  getWorldSounds().forEach(stopAndResetSound);
}

/**
 * Returns true when the user is allowed to toggle pause.
 * @returns {boolean}
 */
function canTogglePause() {
  if (!world) return false;
  if (isPortraitBlocked) return false;
  return !world.isGameOver;
}

/**
 * Toggles pause state if allowed.
 * @returns {void}
 */
function togglePause() {
  if (!canTogglePause()) return;
  setPaused(!isPaused);
}

/**
 * Binds pause/resume button click handlers.
 * @returns {void}
 */
function setupPauseControls() {
  const pauseButton = document.getElementById("pauseBtn");
  const resumeButton = document.getElementById("resumeBtn");

  pauseButton?.addEventListener("click", togglePause);
  resumeButton?.addEventListener("click", () => setPaused(false));
}
