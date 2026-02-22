let canvas;
let world;
let bgMusic;
let isMuted = false;
let isPaused = false;
const MUTE_STORAGE_KEY = 'game_muted';
let isPortraitBlocked = false;
let gameStarted = false;
let keyboard = new Keyboard();
let lastFocusBeforeOverlay = null;
let pausedByOrientation = false;


const dom = {
  canvas: null,
  startBtn: null,
  fullscreenBtn: null,
  muteBtn: null,
  restartBtn: null,
  fullscreenContainer: null,
  startScreen: null,
};



function initGame() {
  cacheDom();
  loadSettings();

  bindStartControls();
  bindUiControls();
  bindRestart();
  bindLegal();
  bindStartScreenExtras();

  initAudio();
  initMobile();
  bindKeyboard();
}

function cacheDom() {
  dom.canvas = document.getElementById('canvas');
  dom.startBtn = document.getElementById('startBtn');
  dom.fullscreenBtn = document.getElementById('fullscreenBtn');
  dom.muteBtn = document.getElementById('muteBtn');
  dom.restartBtn = document.getElementById('restartBtn');
  dom.fullscreenContainer = document.getElementById('fullscreen');
  dom.startScreen = document.getElementById('startScreen');

  canvas = dom.canvas;
}

function resizeCanvasToDisplaySize() {
  const canvas = dom.canvas;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const displayWidth = Math.round(rect.width * dpr);
  const displayHeight = Math.round(rect.height * dpr);

  if (canvas.width !== displayWidth) canvas.width = displayWidth;
  if (canvas.height !== displayHeight) canvas.height = displayHeight;

  if (!world?.ctx) return;

  const LOGICAL_W = 720;
  const LOGICAL_H = 480;

  const scale = rect.width / LOGICAL_W;
  const offsetX = 0;
  const offsetY = (rect.height - LOGICAL_H * scale) / 2;

  world.ctx.setTransform(
    dpr * scale, 0,
    0, dpr * scale,
    offsetX * dpr, offsetY * dpr
  );

  world.ctx.imageSmoothingEnabled = false;
}

function loadSettings() {
  isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
}

function bindStartControls() {
  dom.startBtn?.addEventListener('click', startGame);
  window.addEventListener('keydown', onStartKeydown);
}

function bindUiControls() {
  dom.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenBtn);
  updateFullscreenBtn();

  dom.muteBtn?.addEventListener('click', toggleMute);
  updateMuteBtn();
}

function bindRestart() {
  dom.restartBtn?.addEventListener('click', () => {
    if (world) {
      world.isPaused = true;
      world.stopSnoring();
    }
    setPaused(false);
    window.location.reload();
  });

  document
    .getElementById('gameOverRestartBtn')
    ?.addEventListener('click', restartGame);

  document
    .getElementById('winRestartBtn')
    ?.addEventListener('click', restartGame);

  document
    .getElementById('gameOverMenuBtn')
    ?.addEventListener('click', goToMainMenu);

  document
    .getElementById('winMenuBtn')
    ?.addEventListener('click', goToMainMenu);
}


function bindLegal() {
  document
    .getElementById('impressumBtn')
    ?.addEventListener('click', () => {
      window.location.href = 'impressum.html';
    });
}

function bindStartScreenExtras() {
  bindMobileImpressum();
  setupHowToOverlay();
}

function bindMobileImpressum() {
  document.getElementById('impressumBtnMobile')?.addEventListener('click', () => {
    window.location.href = 'impressum.html';
  });
}

function setupHowToOverlay() {
  const overlayId = 'howToOverlay';
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  initOverlayHidden(overlay);
  bindHowToOpen(overlayId);
  bindHowToClose(overlay, overlayId);
  bindEscapeClose(overlay, overlayId);
}

function initOverlayHidden(overlay) {
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
}

function bindHowToOpen(overlayId) {
  document.getElementById('howToBtn')
    ?.addEventListener('click', () => showOverlay(overlayId));
}

function bindHowToClose(overlay, overlayId) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('#closeHowToBtn')) {
      hideOverlay(overlayId);
    }
  });
}

function bindEscapeClose(overlay, overlayId) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) {
      hideOverlay(overlayId);
    }
  });
}

function initAudio() {
  setupBackgroundMusic();
}

function initMobile() {
  setupOrientationGuard();
  setupMobileControls();
  setupPauseControls();
}

function bindKeyboard() {
  window.addEventListener('keydown', onKeydown, { passive: false });
  window.addEventListener('keyup', onKeyup, { passive: false });
}

function onStartKeydown(e) {
  if (e.code === 'Enter') startGame();
}


function setupBackgroundMusic() {
  bgMusic = new Audio('assets/audio/background_music.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

function startBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.muted = isMuted;
  bgMusic.play().catch(() => { });
}

function toggleMute() {
  isMuted = !isMuted;

  if (bgMusic) bgMusic.muted = isMuted;
  if (world?.snoringSound) world.snoringSound.muted = isMuted;
  if (world?.coinSound) world.coinSound.muted = isMuted;
  if (world?.bottleSound) world.bottleSound.muted = isMuted;
  if (world?.throwBottleSound) world.throwBottleSound.muted = isMuted;
  if (world?.winSound) world.winSound.muted = isMuted;
  if (world?.gameOverSound) world.gameOverSound.muted = isMuted;

  localStorage.setItem(MUTE_STORAGE_KEY, isMuted);
  updateMuteBtn();
}


function updateMuteBtn() {
  const btn = dom.muteBtn || document.getElementById('muteBtn');
  if (!btn) return;
  btn.textContent = isMuted ? '🔇' : '🔊';
  btn.title = isMuted ? 'Unmute' : 'Mute';
}


function startGame() {
  if (world) return;

  dom.startScreen?.style && (dom.startScreen.style.display = 'none');
  resizeCanvasToDisplaySize();
  startBackgroundMusic();
  world = new World(canvas, keyboard);
  resizeCanvasToDisplaySize();

  if (world.coinSound) world.coinSound.muted = isMuted;
  if (world.bottleSound) world.bottleSound.muted = isMuted;
  if (world.throwBottleSound) world.throwBottleSound.muted = isMuted;
  if (world.snoringSound) world.snoringSound.muted = isMuted;
  if (world.winSound) world.winSound.muted = isMuted;
  if (world.gameOverSound) world.gameOverSound.muted = isMuted;

  gameStarted = true;
  updateMobileControlsVisibility();
}

function restartGame() {
  if (!world) return;
  if (world.collisionInterval) {
    clearInterval(world.collisionInterval);
  }
  document.getElementById('gameOverOverlay').style.display = 'none';
  document.getElementById('winOverlay').style.display = 'none';
  isPaused = false;
  gameStarted = false;
  world = null;
  startGame();
}

function goToMainMenu() {
  if (world?.collisionInterval) {
    clearInterval(world.collisionInterval);
  }
  stopBackgroundMusic();
  document.getElementById('gameOverOverlay').style.display = 'none';
  document.getElementById('winOverlay').style.display = 'none';
  world = null;
  isPaused = false;
  gameStarted = false;
  dom.startScreen.style.display = 'flex';

  updateMobileControlsVisibility();
}

function toggleFullscreen() {
  const container = dom.fullscreenContainer || document.getElementById('fullscreen');

  if (!document.fullscreenElement) {
    container?.requestFullscreen?.().catch((err) => {
      console.warn('Fullscreen failed:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenBtn() {
  const btn = dom.fullscreenBtn || document.getElementById('fullscreenBtn');
  if (!btn) return;

  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? '⤫' : '⤢';
  btn.title = isFs ? 'Exit fullscreen' : 'Enter fullscreen';
}
