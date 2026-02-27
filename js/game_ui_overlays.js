/**
 * Displays a given overlay element using flex layout.
 *
 * Safe to call with null/undefined.
 *
 * @param {HTMLElement|null|undefined} el - Overlay element to display.
 */
function showOverlay(el) {
  if (!el) return;
  el.style.display = "flex";
}

/**
 * Hides a given overlay element.
 *
 * Safe to call with null/undefined.
 *
 * @param {HTMLElement|null|undefined} el - Overlay element to hide.
 */
function hideOverlay(el) {
  if (!el) return;
  el.style.display = "none";
}