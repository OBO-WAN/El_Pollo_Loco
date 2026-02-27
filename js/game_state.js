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

let world = null;
let canvas = null;
let loadingOverlay = null;
let gameOverOverlay = null;
let winOverlay = null;
let startScreen = null;
let orientationOverlay = null;
let pauseOverlay = null;
let currentView = null;
let backgroundMusic = null;
let isMuted = false;
let isPaused = false;
let SETTINGS = {
  musicMuted: false,
};