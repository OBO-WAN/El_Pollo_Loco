/* global canvas, world, gameStarted, isPortraitBlocked, lastFocusBeforeOverlay */

/** Logical game resolution (matches canvas default attributes). @type {number} */
const LOGICAL_W = 720;

/** Logical game resolution (matches canvas default attributes). @type {number} */
const LOGICAL_H = 480;

/**
 * Viewport transformation details.
 * @typedef {Object} View
 * @property {number} dpr Device pixel ratio.
 * @property {number} scale Logical-to-display scale.
 * @property {number} offsetX Horizontal letterbox offset (CSS px).
 * @property {number} offsetY Vertical letterbox offset (CSS px).
 * @property {number} logicalViewportW Visible logical width.
 * @property {number} logicalViewportH Visible logical height.
 */

/** Binds events that trigger viewport recalculation. @returns {void} */
function bindCanvasResizeEvents() {
  window.addEventListener("resize", resizeCanvasToDisplaySize, { passive: true });
  document.addEventListener("fullscreenchange", resizeCanvasToDisplaySize);
  window.addEventListener("orientationchange", () => setTimeout(resizeCanvasToDisplaySize, 50));
}

/** Returns the game canvas element. @returns {HTMLCanvasElement|null} */
function getCanvasElement() {
  return canvas || document.getElementById("canvas");
}

/** Resizes the canvas backing store and updates the world's view transform. @returns {void} */
function resizeCanvasToDisplaySize() {
  const canvasElement = getCanvasElement();
  if (!canvasElement) return;

  const metrics = getCanvasMetrics(canvasElement);
  resizeBackingStore(canvasElement, metrics);

  const worldInstance = world;
  if (!worldInstance?.ctx) return;

  const view = computeView(metrics, LOGICAL_W, LOGICAL_H);
  applyView(worldInstance, view);
}

/**
 * Computes canvas size metrics.
 * @param {HTMLCanvasElement} canvasElement
 * @returns {{ rect: DOMRect, dpr: number, displayWidth: number, displayHeight: number }}
 */
function getCanvasMetrics(canvasElement) {
  const rect = canvasElement.getBoundingClientRect();
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
 * @param {HTMLCanvasElement} canvasElement
 * @param {{ displayWidth: number, displayHeight: number }} metrics
 * @returns {void}
 */
function resizeBackingStore(canvasElement, metrics) {
  if (canvasElement.width !== metrics.displayWidth) canvasElement.width = metrics.displayWidth;
  if (canvasElement.height !== metrics.displayHeight) canvasElement.height = metrics.displayHeight;
}

/**
 * Computes viewport scale and offsets.
 * @param {{ rect: DOMRect, dpr: number }} metrics
 * @param {number} logicalWidth
 * @param {number} logicalHeight
 * @returns {View}
 */
function computeView(metrics, logicalWidth, logicalHeight) {
  const rect = metrics.rect;
  const scale = Math.min(rect.width / logicalWidth, rect.height / logicalHeight);
  const offsetX = (rect.width - logicalWidth * scale) / 2;
  const offsetY = (rect.height - logicalHeight * scale) / 2;
  return {
    dpr: metrics.dpr,
    scale,
    offsetX,
    offsetY,
    logicalViewportW: rect.width / scale,
    logicalViewportH: rect.height / scale,
  };
}

/**
 * Applies viewport transform to the world rendering context.
 * @param {{ ctx: CanvasRenderingContext2D, setHudPositions?: Function, view?: View }} worldInstance
 * @param {View} view
 * @returns {void}
 */
function applyView(worldInstance, view) {
  worldInstance.view = view;
  applyTransform(worldInstance.ctx, view);
  worldInstance.ctx.imageSmoothingEnabled = false;
  worldInstance?.setHudPositions?.();
}

/**
 * Applies the canvas transform for the current view.
 * @param {CanvasRenderingContext2D} ctx
 * @param {View} view
 * @returns {void}
 */
function applyTransform(ctx, view) {
  ctx.setTransform(
    view.dpr * view.scale,
    0,
    0,
    view.dpr * view.scale,
    view.offsetX * view.dpr,
    view.offsetY * view.dpr
  );
}

/** Shows an overlay element using flex layout. @param {HTMLElement|null|undefined} element @returns {void} */
function showOverlay(element) {
  if (!element) return;
  element.style.display = "flex";
}

/** Hides an overlay element. @param {HTMLElement|null|undefined} element @returns {void} */
function hideOverlay(element) {
  if (!element) return;
  element.style.display = "none";
}

/* -------------------------------------------------------------------------- */
/* UI helpers (fullscreen, overlays, responsive controls)                      */
/* -------------------------------------------------------------------------- */

/** Hides the start screen overlay. @returns {void} */
function hideStartScreen() {
  const element = document.getElementById("startScreen");
  if (element) element.style.display = "none";
}

/**
 * Adds a click handler if the element exists.
 * @param {string} id
 * @param {(event: MouseEvent) => void} handler
 * @returns {void}
 */
function onClick(id, handler) {
  document.getElementById(id)?.addEventListener("click", handler);
}

/** Toggles fullscreen for the main game container. @returns {void} */
function toggleFullscreen() {
  const container = document.getElementById("fullscreen");
  if (!container) return;

  if (!document.fullscreenElement) enterFullscreen(container);
  else document.exitFullscreen?.();
}

/**
 * Requests fullscreen on an element (best-effort).
 * @param {HTMLElement} element
 * @returns {void}
 */
function enterFullscreen(element) {
  element.requestFullscreen?.().catch((err) => console.warn("Fullscreen failed:", err));
}

/** Updates the fullscreen button label and title. @returns {void} */
function updateFullscreenBtn() {
  const button = document.getElementById("fullscreenBtn");
  if (!button) return;

  const isFullscreen = !!document.fullscreenElement;
  button.textContent = isFullscreen ? "⤫" : "⤢";
  button.title = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
}

/** Initializes the how-to overlay interactions. @returns {void} */
function setupHowToOverlay() {
  const overlay = document.getElementById("howToOverlay");
  if (!overlay) return;

  initHowToState(overlay);
  bindHowToOpen(overlay);
  bindHowToClose(overlay);
  bindHowToEscape(overlay);
}

/** Sets the initial accessibility state for the how-to overlay. @param {HTMLElement} overlay @returns {void} */
function initHowToState(overlay) {
  overlay.classList.remove("show");
  overlay.inert = true;
  overlay.setAttribute("aria-hidden", "true");
}

/** Binds the "open how-to" button. @param {HTMLElement} overlay @returns {void} */
function bindHowToOpen(overlay) {
  document.getElementById("howToBtn")?.addEventListener("click", () => showHowToOverlay(overlay));
}

/** Binds click-to-close for backdrop and close button. @param {HTMLElement} overlay @returns {void} */
function bindHowToClose(overlay) {
  overlay.addEventListener("click", (event) => {
    const clickedBackdrop = event.target === overlay;
    const clickedClose = !!event.target.closest?.("#closeHowToBtn");
    if (clickedBackdrop || clickedClose) hideHowToOverlay(overlay);
  });
}

/** Closes the how-to overlay on Escape while open. @param {HTMLElement} overlay @returns {void} */
function bindHowToEscape(overlay) {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (overlay.classList.contains("show")) hideHowToOverlay(overlay);
  });
}

/** Shows the how-to overlay and focuses the first interactive element. @param {HTMLElement} overlay @returns {void} */
function showHowToOverlay(overlay) {
  rememberLastFocus();
  overlay.classList.add("show");
  overlay.inert = false;
  overlay.setAttribute("aria-hidden", "false");
  focusFirstFocusable(overlay);
}

/** Hides the how-to overlay and restores focus. @param {HTMLElement} overlay @returns {void} */
function hideHowToOverlay(overlay) {
  restoreLastFocus();
  overlay.classList.remove("show");
  overlay.inert = true;
  overlay.setAttribute("aria-hidden", "true");
}

/** Stores the last focused element before opening an overlay. @returns {void} */
function rememberLastFocus() {
  if (typeof lastFocusBeforeOverlay === "undefined") return;
  lastFocusBeforeOverlay = document.activeElement;
}

/** Restores focus to the last focused element, if possible. @returns {void} */
function restoreLastFocus() {
  if (typeof lastFocusBeforeOverlay === "undefined") return;
  if (lastFocusBeforeOverlay?.focus) lastFocusBeforeOverlay.focus();
}

/**
 * Focuses the first focusable element within a container.
 * @param {HTMLElement} container
 * @returns {void}
 */
function focusFirstFocusable(container) {
  const selector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
  container.querySelector(selector)?.focus();
}

/** Returns true if the device likely uses touch input. @returns {boolean} */
function isMobileLike() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

/** Updates the visibility of the mobile controls wrapper. @returns {void} */
function updateMobileControlsVisibility() {
  const controls = document.getElementById("mobileControls");
  if (!controls) return;
  controls.style.display = shouldShowMobileControls() ? "block" : "none";
}

/** Determines whether mobile controls should be visible. @returns {boolean} */
function shouldShowMobileControls() {
  if (!gameStarted) return false;
  if (!isMobileLike()) return false;
  if (!isLandscape()) return false;
  if (!isTabletOrSmaller()) return false;
  return !isPortraitBlockedSafe();
}

/** Returns true if viewport is currently landscape. @returns {boolean} */
function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

/** Returns true if viewport width is within tablet range. @returns {boolean} */
function isTabletOrSmaller() {
  return window.innerWidth <= 1366;
}

/** Returns true when portrait-blocking overlay is active. @returns {boolean} */
function isPortraitBlockedSafe() {
  return typeof isPortraitBlocked !== "undefined" && isPortraitBlocked;
}

/** Keeps mobile controls in sync with viewport changes. @returns {void} */
function bindMobileControlsVisibilityEvents() {
  window.addEventListener("resize", updateMobileControlsVisibility, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(updateMobileControlsVisibility, 50));
}

/* Expose UI helpers (non-module project style). */
window.gameUI = window.gameUI || {};
window.gameUI.hideStartScreen = hideStartScreen;
window.gameUI.onClick = onClick;
window.gameUI.toggleFullscreen = toggleFullscreen;
window.gameUI.updateFullscreenBtn = updateFullscreenBtn;
window.gameUI.setupHowToOverlay = setupHowToOverlay;
window.gameUI.showHowToOverlay = showHowToOverlay;
window.gameUI.hideHowToOverlay = hideHowToOverlay;
window.gameUI.isMobileLike = isMobileLike;
window.gameUI.updateMobileControlsVisibility = updateMobileControlsVisibility;

bindMobileControlsVisibilityEvents();