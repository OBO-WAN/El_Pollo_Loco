let canvas;
let world;
let bgMusic;

let isMuted = false;
let isPaused = false;
const MUTE_STORAGE_KEY = 'game_muted';

let isPortraitBlocked = false; // for mobile
let gameStarted = false;       // buttons on mobile

let keyboard = new Keyboard();

// Cache DOM refs 
const dom = {
  canvas: null,
  startBtn: null,
  fullscreenBtn: null,
  muteBtn: null,
  restartBtn: null,
  fullscreenContainer: null,
  startScreen: null,
};

function init() {
  cacheDom();
  loadSettings();

  bindStartControls();
  bindUiControls();
  bindRestart();
  bindLegal();
  bindStartScreenExtras();

  initAudio();
  initMobile();
  bindKeyboard(); // keydown/keyup (movement + pause)
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
    setPaused(false);
    window.location.reload();
  });
  document
    .getElementById('gameOverRestartBtn')
    ?.addEventListener('click', () => {
      window.location.reload();
    });
}

function bindLegal() {
  document
    .getElementById('impressumBtn')
    ?.addEventListener('click', () => {
      window.location.href = 'impressum.html';
    });
}

function bindStartScreenExtras() {
  document.getElementById('impressumBtnMobile')?.addEventListener('click', () => {
    window.location.href = 'impressum.html';
  });

  document.getElementById('howToBtn')?.addEventListener('click', () => {
    alert('Move: ◀ ▶\nJump: ⤒\nThrow: ⦿');
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

// -------------------- Audio --------------------

function setupBackgroundMusic() {
  bgMusic = new Audio('audio/background_music.mp3');
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
  localStorage.setItem(MUTE_STORAGE_KEY, isMuted);
  updateMuteBtn();
}

function updateMuteBtn() {
  const btn = dom.muteBtn || document.getElementById('muteBtn');
  if (!btn) return;
  btn.textContent = isMuted ? '🔇' : '🔊';
  btn.title = isMuted ? 'Unmute' : 'Mute';
}

// -------------------- Game start / fullscreen --------------------

function startGame() {
  if (world) return;

  dom.startScreen?.style && (dom.startScreen.style.display = 'none');

  if (window.matchMedia('(pointer: coarse)').matches) {
    dom.fullscreenContainer?.requestFullscreen?.().catch(() => { });
  }

  startBackgroundMusic();
  world = new World(canvas, keyboard);

  gameStarted = true;
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

// -------------------- Orientation / mobile controls --------------------

function setupOrientationGuard() {
  const gameContainer = document.getElementById('gameContainer');
  const overlay = document.getElementById('orientationOverlay');
  if (!gameContainer || !overlay) return;

  function isMobileLike() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  function updateOrientationUI() {
    const portrait = window.innerHeight > window.innerWidth;

    if (isMobileLike() && portrait) {
      isPortraitBlocked = true;
      overlay.style.display = 'flex';
      gameContainer.classList.add('portrait-blocked');
    } else {
      isPortraitBlocked = false;
      overlay.style.display = 'none';
      gameContainer.classList.remove('portrait-blocked');
    }

    updateMobileControlsVisibility();
  }

  window.addEventListener('resize', updateOrientationUI, { passive: true });
  window.addEventListener('orientationchange', updateOrientationUI, { passive: true });
  updateOrientationUI();
}

function updateMobileControlsVisibility() {
  const controls = document.getElementById('mobileControls');
  if (!controls) return;

  const isMobileLike = window.matchMedia('(pointer: coarse)').matches;
  const isLandscape = window.innerWidth > window.innerHeight;

  if (gameStarted && isMobileLike && isLandscape && !isPortraitBlocked) {
    controls.style.display = 'block';
  } else {
    controls.style.display = 'none';
  }
}

function setupMobileControls() {
  const controls = document.getElementById('mobileControls');
  if (!controls) return;

  const setFlag = (action, pressed) => {
    if (action === 'LEFT') keyboard.LEFT = pressed;
    if (action === 'RIGHT') keyboard.RIGHT = pressed;
    if (action === 'UP') keyboard.UP = pressed;
    if (action === 'SPACE') keyboard.SPACE = pressed;
  };

  controls.querySelectorAll('.mc-btn').forEach((btn) => {
    const action = btn.dataset.action;

    const down = (e) => {
      e.preventDefault();
      setFlag(action, true);
    };
    const up = (e) => {
      e.preventDefault();
      setFlag(action, false);
    };

    btn.addEventListener('pointerdown', down, { passive: false });
    btn.addEventListener('pointerup', up, { passive: false });
    btn.addEventListener('pointercancel', up, { passive: false });
    btn.addEventListener('pointerleave', up, { passive: false });
  });
}

// -------------------- Pause --------------------

function setPaused(paused) {
  isPaused = paused;
  if (world) world.isPaused = isPaused;

  const pauseOverlay = document.getElementById('pauseOverlay');
  if (pauseOverlay) pauseOverlay.style.display = isPaused ? 'flex' : 'none';

  updateMobileControlsVisibility();
}

function togglePause() {
  if (!world) return;            // can’t pause before starting
  if (isPortraitBlocked) return; // don’t pause/resume while blocked
  setPaused(!isPaused);
}

function setupPauseControls() {
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');

  pauseBtn?.addEventListener('click', togglePause);
  resumeBtn?.addEventListener('click', () => setPaused(false));
}

// -------------------- Keyboard --------------------

function onKeydown(e) {
  // Pause / resume
  if (e.code === 'Escape' || e.code === 'KeyP') {
    e.preventDefault();
    togglePause();
    return;
  }

  // Block input when portrait-locked or paused
  if (isPortraitBlocked || isPaused) return;

  // Prevent scrolling
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'ArrowRight') keyboard.RIGHT = true;
  if (e.code === 'ArrowLeft') keyboard.LEFT = true;
  if (e.code === 'ArrowUp') keyboard.UP = true;
  if (e.code === 'Space') keyboard.SPACE = true;
}

function onKeyup(e) {
  // Ignore input when portrait-locked or paused
  if (isPortraitBlocked || isPaused) return;

  // Prevent scrolling
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'ArrowRight') keyboard.RIGHT = false;
  if (e.code === 'ArrowLeft') keyboard.LEFT = false;
  if (e.code === 'ArrowUp') keyboard.UP = false;
  if (e.code === 'Space') keyboard.SPACE = false;
}
