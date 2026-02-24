/* global canvas, world */

/**
 * Logical game resolution (matches canvas default attributes).
 * @type {number}
 */
const LOGICAL_W = 720;

/**
 * @type {number}
 */
const LOGICAL_H = 480;

/**
 * Represents the computed viewport transformation.
 *
 * @typedef {Object} View
 * @property {number} dpr - Device pixel ratio.
 * @property {number} scale - Scaling factor.
 * @property {number} offsetX - Horizontal letterbox offset.
 * @property {number} offsetY - Vertical letterbox offset.
 * @property {number} logicalViewportW - Visible logical width.
 * @property {number} logicalViewportH - Visible logical height.
 */

/**
 * Binds resize-related events that trigger viewport recalculation.
 *
 * @returns {void}
 */
function bindCanvasResizeEvents() {
  window.addEventListener("resize", resizeCanvasToDisplaySize, { passive: true });
  document.addEventListener("fullscreenchange", resizeCanvasToDisplaySize);
  window.addEventListener("orientationchange", () =>
    setTimeout(resizeCanvasToDisplaySize, 50)
  );
}

/**
 * Resizes canvas backing store and applies view transform to world.
 *
 * Safe to call before world exists.
 *
 * @returns {void}
 */
function resizeCanvasToDisplaySize() {
  /** @type {HTMLCanvasElement|null} */
  const canvasEl = canvas || document.getElementById("canvas");
  if (!canvasEl) return;

  const metrics = getCanvasMetrics(canvasEl);
  resizeBackingStore(canvasEl, metrics);

  if (!world?.ctx) return;

  const view = computeView(metrics, LOGICAL_W, LOGICAL_H);
  applyView(world, view);
}

/**
 * Computes canvas size metrics.
 *
 * @param {HTMLCanvasElement} canvasEl
 * @returns {{
 *   rect: DOMRect,
 *   dpr: number,
 *   displayWidth: number,
 *   displayHeight: number
 * }}
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
 * Ensures canvas backing store matches device pixel size.
 *
 * @param {HTMLCanvasElement} canvasEl
 * @param {{ displayWidth: number, displayHeight: number }} metrics
 * @returns {void}
 */
function resizeBackingStore(canvasEl, { displayWidth, displayHeight }) {
  if (canvasEl.width !== displayWidth) canvasEl.width = displayWidth;
  if (canvasEl.height !== displayHeight) canvasEl.height = displayHeight;
}

/**
 * Computes viewport scale and offsets.
 *
 * @param {{ rect: DOMRect, dpr: number }} metrics
 * @param {number} logicalW
 * @param {number} logicalH
 * @returns {View}
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
 * Applies viewport transform to world rendering context.
 *
 * @param {{ ctx: CanvasRenderingContext2D, setHudPositions?: Function, view?: View }} worldInstance
 * @param {View} view
 * @returns {void}
 */
function applyView(worldInstance, view) {
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