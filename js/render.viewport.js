// =====================================================
// VIEWPORT / CANVAS RESIZING
// =====================================================

// Logical game resolution (matches your canvas default attributes)
const LOGICAL_W = 720;
const LOGICAL_H = 480;

/**
 * Binds window/document events that should trigger a canvas resize recalculation.
 * Requires `canvas` (from state.js or cacheDom later) to be set.
 */
function bindCanvasResizeEvents() {
  window.addEventListener("resize", resizeCanvasToDisplaySize, { passive: true });
  document.addEventListener("fullscreenchange", resizeCanvasToDisplaySize);
  window.addEventListener("orientationchange", () =>
    setTimeout(resizeCanvasToDisplaySize, 50)
  );
}

/**
 * Resizes the canvas backing store to match CSS size * DPR and updates the
 * world's view transform accordingly. Safe to call before `world` exists.
 */
function resizeCanvasToDisplaySize() {
  // Prefer the global `canvas` if already cached; fallback to DOM lookup.
  const canvasEl = canvas || document.getElementById("canvas");
  if (!canvasEl) return;

  const metrics = getCanvasMetrics(canvasEl);
  resizeBackingStore(canvasEl, metrics);

  if (!world?.ctx) return;

  const view = computeView(metrics, LOGICAL_W, LOGICAL_H);
  applyView(world, view);
}

/**
 * Computes size metrics for the given canvas based on its CSS size and DPR.
 */
function getCanvasMetrics(canvasEl) {
  const rect = canvasEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  return {
    rect,
    dpr,
    displayWidth: Math.round(rect.width * dpr),
    displayHeight: Math.round(rect.height * dpr),
  };
}

/**
 * Ensures the canvas backing store matches the provided device-pixel dimensions.
 */
function resizeBackingStore(canvasEl, { displayWidth, displayHeight }) {
  if (canvasEl.width !== displayWidth) canvasEl.width = displayWidth;
  if (canvasEl.height !== displayHeight) canvasEl.height = displayHeight;
}

/**
 * Computes logical viewport scale/offset values for letterboxing a logical
 * game resolution into the available CSS pixels.
 */
function computeView({ rect, dpr }, logicalW, logicalH) {
  const scale = Math.min(rect.width / logicalW, rect.height / logicalH);

  const offsetX = (rect.width - logicalW * scale) / 2;
  const offsetY = (rect.height - logicalH * scale) / 2;

  return {
    dpr,
    scale,
    offsetX,
    offsetY,
    logicalViewportW: rect.width / scale,
    logicalViewportH: rect.height / scale,
  };
}

/**
 * Applies the computed view to the world (stores it and sets the canvas transform).
 */
function applyView(worldInstance, view) {
  // store it (some code may read it)
  worldInstance.view = view;

  worldInstance.ctx.setTransform(
    view.dpr * view.scale,
    0,
    0,
    view.dpr * view.scale,
    view.offsetX * view.dpr,
    view.offsetY * view.dpr
  );

  worldInstance.ctx.imageSmoothingEnabled = false;
  worldInstance?.setHudPositions?.();
}