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

/** @type {HTMLAudioElement|null} */
if (typeof bgMusic === "undefined") var bgMusic = null;

/** @type {string} */
if (typeof MUTE_STORAGE_KEY === "undefined") var MUTE_STORAGE_KEY = "game_muted";

/**
 * Creates and configures the looping background music audio element.
 *
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
 */
function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = Boolean(isMuted);
  bgMusic.play().catch(() => { });
}

/**
 * Stops (pauses) background music playback.
 *
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
 */
function setMuted(audio, muted) {
  if (!audio) return;
  audio.muted = muted;
}

/**
 * Applies the current mute state to audio resources owned by the world instance.
 *
 */
function syncWorldAudioMute() {
  if (!world) return;
  const w = world;

  if (w.audio) {
    setMuted(w.audio.coinSound, isMuted);
    setMuted(w.audio.bottleSound, isMuted);
    setMuted(w.audio.throwBottleSound, isMuted);
    setMuted(w.audio.snoringSound, isMuted);
    setMuted(w.audio.winSound, isMuted);
    setMuted(w.audio.gameOverSound, isMuted);
  }
}

/**
 * Toggles the global mute state, applies it to known audio sources,
 * persists it, and updates the mute button UI.
 *
 */
function toggleMute() {
  isMuted = !isMuted;

  if (bgMusic) bgMusic.muted = isMuted;

  const w = world ?? null;

  if (w?.audio) {
    w.audio.snoringSound.muted = isMuted;
    w.audio.coinSound.muted = isMuted;
    w.audio.bottleSound.muted = isMuted;
    w.audio.throwBottleSound.muted = isMuted;
    w.audio.winSound.muted = isMuted;
    w.audio.gameOverSound.muted = isMuted;
    if (isMuted) w.audio.stopSnoring();
  }

  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  updateMuteBtn();
}

/**
 * Updates the mute button icon/title to reflect the current mute state.
 *
 */
function updateMuteBtn() {
  const btn =
    (typeof dom !== "undefined" && dom?.muteBtn) ||
    document.getElementById("muteBtn");

  if (!btn) return;

  btn.textContent = isMuted ? "🔇" : "🔊";
  btn.title = isMuted ? "Unmute" : "Mute";
}