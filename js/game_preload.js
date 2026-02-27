/**
 * Preloads a list of image paths and reports progress.
 *
 * Resolves when all images have either loaded or errored.
 *
 * @param {string[]} imagePaths - Array of image URLs to preload.
 * @param {(percent: number) => void=} onProgress - Optional progress callback (0–100).
 * @returns {Promise<void>}
 */
function preloadImagesWithProgress(imagePaths, onProgress) {
  return new Promise((resolve) => {
    if (!imagePaths || imagePaths.length === 0) {
      resolve();
      return;
    }

    const tracker = createProgressTracker(imagePaths.length, onProgress);

    const promises = imagePaths.map((path) =>
      loadImage(path).then(tracker.tick)
    );

    Promise.all(promises).then(() => resolve());
  });
}

/**
 * Creates a progress tracker for image loading.
 *
 * @param {number} total - Total number of images to load.
 * @param {(percent: number) => void=} onProgress - Optional callback.
 * @returns {{ tick: () => void }}
 */
function createProgressTracker(total, onProgress) {
  let loaded = 0;

  return {
    /**
     * Increments loaded count and emits progress.
     */
    tick() {
      loaded++;
      if (typeof onProgress === "function") {
        const percent = Math.round((loaded / total) * 100);
        onProgress(percent);
      }
    },
  };
}

/**
 * Loads a single image.
 *
 * Resolves regardless of success or error to avoid blocking preload flow.
 *
 * @param {string} path - Image URL.
 * @returns {Promise<void>}
 */
function loadImage(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = path;
  });
}