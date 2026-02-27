/* global preloadImagesWithProgress, GAME_IMAGES, initGame */

/**
 * Bootstraps the application.
 *
 * Responsibilities:
 *  - Hide start screen
 *  - Show loading overlay
 *  - Preload all game assets with progress feedback
 *  - Initialize the game after loading completes
 *
 * This function is called via <body onload="init()">.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 */
async function init() {
  const loader = document.getElementById("loadingOverlay");
  const startScreen = document.getElementById("startScreen");
  const loadingText = document.getElementById("loadingText");

  if (startScreen) startScreen.style.display = "none";
  if (loader) loader.style.display = "flex";

  try {
    await preloadImagesWithProgress(
      GAME_IMAGES,
   
      (percent) => {
        if (loadingText) {
          loadingText.textContent = `Loading game… ${percent}%`;
        }
      }
    );
  } catch (error) {
    console.error("Asset loading failed:", error);
  } finally {
    if (loader) loader.style.display = "none";
    if (startScreen) startScreen.style.display = "flex";

    initGame();
  }
}