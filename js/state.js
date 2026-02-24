// =====================================================
// GLOBAL STATE
// =====================================================

// World / game instance
let world = null;

// DOM references
let canvas = null;
let loadingOverlay = null;
let gameOverOverlay = null;
let winOverlay = null;
let startScreen = null;
let orientationOverlay = null;
let pauseOverlay = null;

// View / rendering
let currentView = null;

// Audio
let backgroundMusic = null;
let isMuted = false;

// Pause state
let isPaused = false;

// Settings
let SETTINGS = {
  musicMuted: false,
};