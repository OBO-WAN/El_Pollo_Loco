// =====================================================
// AUDIO (background music + mute)
// =====================================================

// Keep compatibility with existing code (game1.js uses bgMusic + MUTE_STORAGE_KEY)
if (typeof bgMusic === "undefined") var bgMusic = null;
if (typeof MUTE_STORAGE_KEY === "undefined") var MUTE_STORAGE_KEY = "game_muted";

/**
 * Creates and configures the looping background music audio element.
 */
function setupBackgroundMusic() {
  bgMusic = new Audio("assets/audio/background_music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

/**
 * Starts background music playback (muted state is applied first).
 */
function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = !!isMuted;
  bgMusic.play().catch(() => {});
}

/**
 * Stops/pause background music playback.
 */
function stopBackgroundMusic() {
  if (bgMusic) bgMusic.pause();
}

/**
 * Safely sets the `muted` flag on an audio element (no-op if missing).
 */
function setMuted(audio, muted) {
  if (audio) audio.muted = muted;
}

/**
 * Applies current mute state to all audio resources owned by the world.
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
 * Toggles global mute state, applies it to all known audio sources, persists it,
 * and updates the mute button UI.
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

  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  updateMuteBtn();
}

/**
 * Updates the mute button icon/title to reflect the current mute state.
 */
function updateMuteBtn() {
  // Compatible with both "dom.muteBtn" approach and direct lookup
  const btn =
    (typeof dom !== "undefined" && dom?.muteBtn) ||
    document.getElementById("muteBtn");

  if (!btn) return;

  btn.textContent = isMuted ? "🔇" : "🔊";
  btn.title = isMuted ? "Unmute" : "Mute";
}