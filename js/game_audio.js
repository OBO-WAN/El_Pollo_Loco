/* global world, isMuted, dom */

/**
 * @typedef {object} WorldAudio
 * @property {HTMLAudioElement=} coinSound
 * @property {HTMLAudioElement=} bottleSound
 * @property {HTMLAudioElement=} throwBottleSound
 * @property {HTMLAudioElement=} snoringSound
 * @property {HTMLAudioElement=} winSound
 * @property {HTMLAudioElement=} gameOverSound
 */

// Keep compatibility with legacy globals (old game scripts may also define these).
/** @type {HTMLAudioElement|null} */
if (typeof bgMusic === "undefined") var bgMusic = null;

/** @type {string} */
if (typeof MUTE_STORAGE_KEY === "undefined") var MUTE_STORAGE_KEY = "game_muted";

/**
 * Creates and configures the looping background music audio element.
 *
 * @returns {void}
 */
function setupBackgroundMusic() {
  bgMusic = new Audio("assets/audio/background_music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

/**
 * Starts background music playback.
 * Applies the current mute state before attempting playback.
 *
 * @returns {void}
 */
function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = Boolean(isMuted);
  bgMusic.play().catch(() => {});
}

/**
 * Stops (pauses) background music playback.
 *
 * @returns {void}
 */
function stopBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
}

/**
 * Safely sets the muted state on an audio element.
 *
 * @param {HTMLAudioElement|null|undefined} audio - Audio element to update (optional).
 * @param {boolean} muted - Whether audio should be muted.
 * @returns {void}
 */
function setMuted(audio, muted) {
  if (!audio) return;
  audio.muted = muted;
}

/**
 * Applies the current mute state to audio resources owned by the world instance.
 *
 * @returns {void}
 */
function syncWorldAudioMute() {
  if (!world) return;
  const w = world;

  setMuted(w.coinSound, isMuted);
  setMuted(w.bottleSound, isMuted);
  setMuted(w.throwBottleSound, isMuted);
  setMuted(w.snoringSound, isMuted);
  setMuted(w.winSound, isMuted);
  setMuted(w.gameOverSound, isMuted);
}

/**
 * Toggles the global mute state, applies it to known audio sources,
 * persists it, and updates the mute button UI.
 *
 * @returns {void}
 */
function toggleMute() {
  isMuted = !isMuted;

  if (bgMusic) bgMusic.muted = isMuted;

  const w = world ?? null;

  if (w?.snoringSound) w.snoringSound.muted = isMuted;
  if (w?.coinSound) w.coinSound.muted = isMuted;
  if (w?.bottleSound) w.bottleSound.muted = isMuted;
  if (w?.throwBottleSound) w.throwBottleSound.muted = isMuted;
  if (w?.winSound) w.winSound.muted = isMuted;
  if (w?.gameOverSound) w.gameOverSound.muted = isMuted;

  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  updateMuteBtn();
}

/**
 * Updates the mute button icon/title to reflect the current mute state.
 *
 * @returns {void}
 */
function updateMuteBtn() {
  const btn =
    (typeof dom !== "undefined" && dom?.muteBtn) ||
    document.getElementById("muteBtn");

  if (!btn) return;

  btn.textContent = isMuted ? "🔇" : "🔊";
  btn.title = isMuted ? "Unmute" : "Mute";
}