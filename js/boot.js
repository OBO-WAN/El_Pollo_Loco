// =====================================================
// BOOT / LOADER (replacement for game.js)
// =====================================================

/**
 * Initializes the game loading process.
 *
 * - Hides the start screen
 * - Displays loading overlay
 * - Preloads all game images with progress tracking
 * - Initializes the game once assets are loaded
 */
async function init() {
  const loader = document.getElementById("loadingOverlay");
  const startScreen = document.getElementById("startScreen");
  const loadingText = document.getElementById("loadingText");

  if (startScreen) startScreen.style.display = "none";
  if (loader) loader.style.display = "flex";

  try {
    await preloadImagesWithProgress(GAME_IMAGES, (percent) => {
      if (loadingText) loadingText.textContent = `Loading game… ${percent}%`;
    });
  } catch (e) {
    console.error("Asset loading failed:", e);
  } finally {
    if (loader) loader.style.display = "none";
    if (startScreen) startScreen.style.display = "flex";
    initGame();
  }
}