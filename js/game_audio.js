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
 * Creates the looping background music audio element.
 * @returns {void}
 */
function setupBackgroundMusic() {
  bgMusic = new Audio("assets/audio/background_music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

/**
 * Starts background music playback and applies the mute state.
 * @returns {void}
 */
function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = Boolean(isMuted);
  bgMusic.play().catch(() => {});
}

/**
 * Stops background music playback.
 * @returns {void}
 */
function stopBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
}

/**
 * Sets the muted state on an audio element.
 * @param {HTMLAudioElement|null|undefined} audio Audio element to update.
 * @param {boolean} muted Whether audio should be muted.
 * @returns {void}
 */
function setMuted(audio, muted) {
  if (!audio) return;
  audio.muted = muted;
}

/**
 * Applies the current mute state to the world's audio resources.
 * @returns {void}
 */
function syncWorldAudioMute() {
  if (!world) return;
  const worldInstance = world;

  if (worldInstance.audio) {
    setMuted(worldInstance.audio.coinSound, isMuted);
    setMuted(worldInstance.audio.bottleSound, isMuted);
    setMuted(worldInstance.audio.throwBottleSound, isMuted);
    setMuted(worldInstance.audio.snoringSound, isMuted);
    setMuted(worldInstance.audio.winSound, isMuted);
    setMuted(worldInstance.audio.gameOverSound, isMuted);
  }
}

/**
 * Toggles global mute, syncs all known audio sources, persists the state,
 * and updates the mute button.
 * @returns {void}
 */
function toggleMute() {
  isMuted = !isMuted;

  if (bgMusic) bgMusic.muted = isMuted;

  const worldInstance = world ?? null;

  if (worldInstance?.audio) {
    worldInstance.audio.snoringSound.muted = isMuted;
    worldInstance.audio.coinSound.muted = isMuted;
    worldInstance.audio.bottleSound.muted = isMuted;
    worldInstance.audio.throwBottleSound.muted = isMuted;
    worldInstance.audio.winSound.muted = isMuted;
    worldInstance.audio.gameOverSound.muted = isMuted;
    if (isMuted) worldInstance.audio.stopSnoring();
  }

  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  updateMuteBtn();
}

/**
 * Updates the mute button icon and title for the current mute state.
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