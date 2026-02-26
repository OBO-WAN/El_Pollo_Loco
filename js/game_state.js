/**
 * Minimal World contract used across modules.
 *
 * This is intentionally partial — it only defines
 * properties accessed by other modules.
 *
 * @typedef {Object} World
 * @property {CanvasRenderingContext2D} ctx
 * @property {boolean=} isGameOver
 * @property {boolean=} isCharacterSleeping
 * @property {Function=} pause
 * @property {Function=} resume
 * @property {Function=} stopSnoring
 * @property {Function=} setHudPositions
 * @property {number=} collisionInterval
 * @property {HTMLAudioElement=} coinSound
 * @property {HTMLAudioElement=} bottleSound
 * @property {HTMLAudioElement=} throwBottleSound
 * @property {HTMLAudioElement=} winSound
 * @property {HTMLAudioElement=} gameOverSound
 */

/**
 * Application settings stored in memory.
 *
 * @typedef {Object} GameSettings
 * @property {boolean} musicMuted
 */

/** @type {World|null} */
let world = null;

/** @type {HTMLCanvasElement|null} */
let canvas = null;

/** @type {HTMLElement|null} */
let loadingOverlay = null;

/** @type {HTMLElement|null} */
let gameOverOverlay = null;

/** @type {HTMLElement|null} */
let winOverlay = null;

/** @type {HTMLElement|null} */
let startScreen = null;

/** @type {HTMLElement|null} */
let orientationOverlay = null;

/** @type {HTMLElement|null} */
let pauseOverlay = null;

/**
 * Current viewport transformation (defined in render layer).
 * @type {import("./render.viewport.js").View|null}
 */
let currentView = null;

/** @type {HTMLAudioElement|null} */
let backgroundMusic = null;

/** @type {boolean} */
let isMuted = false;

/** @type {boolean} */
let isPaused = false;

/** @type {GameSettings} */
let SETTINGS = {
  musicMuted: false,
};