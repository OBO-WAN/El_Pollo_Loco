// =====================================================
// IMAGE PRELOADING
// =====================================================

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

function createProgressTracker(total, onProgress) {
  let loaded = 0;

  return {
    tick() {
      loaded++;
      if (typeof onProgress === "function") {
        const percent = Math.round((loaded / total) * 100);
        onProgress(percent);
      }
    },
  };
}

function loadImage(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; 
    img.src = path;
  });
}