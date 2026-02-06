let canvas;
let world;
let bgMusic;
let isMuted = false;
let isPaused = false;
const MUTE_STORAGE_KEY = 'game_muted';
let isPortraitBlocked = false; //for mobile
let gameStarted = false; // buttons on mobile
let keyboard = new Keyboard();


function init() {
  // cache DOM
  canvas = document.getElementById('canvas');

  const startBtn = document.getElementById('startBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const muteBtn = document.getElementById('muteBtn');

  // load mute state from localStorage
  isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';

  // start game
  startBtn.addEventListener('click', startGame);
  window.addEventListener('keydown', onStartKeydown);

  // fullscreen
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenBtn);
  updateFullscreenBtn();

  // music
  setupBackgroundMusic();
  muteBtn.addEventListener('click', toggleMute);
  updateMuteBtn();
  
  restartBtn?.addEventListener('click', () => {
    setPaused(false);
    window.location.reload();
  });

  //MobileView
  setupOrientationGuard();
  setupMobileControls();
  setupPauseControls();
}

function onStartKeydown(e) {
  if (e.code === 'Enter') startGame();
}

function setupBackgroundMusic() {
  bgMusic = new Audio('audio/background_music.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
}

function startGame() {
  if (world) return;
  document.getElementById('startScreen').style.display = 'none';

  if (window.matchMedia('(pointer: coarse)').matches) {
    const container = document.getElementById('fullscreen');
    container.requestFullscreen?.().catch(() => { });
  }

  startBackgroundMusic();
  world = new World(canvas, keyboard);
  gameStarted = true;
  updateMobileControlsVisibility();
}

function toggleFullscreen() {
  const container = document.getElementById('fullscreen');

  // if not in fullscreen -> enter
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.warn('Fullscreen failed:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenBtn() {
  const btn = document.getElementById('fullscreenBtn');
  const isFs = !!document.fullscreenElement;

  btn.textContent = isFs ? '⤫' : '⤢';
  btn.title = isFs ? 'Exit fullscreen' : 'Enter fullscreen';
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
  const btn = document.getElementById('muteBtn');
  btn.textContent = isMuted ? '🔇' : '🔊';
  btn.title = isMuted ? 'Unmute' : 'Mute';
}

function setupOrientationGuard() {
  const gameContainer = document.getElementById('gameContainer');
  const overlay = document.getElementById('orientationOverlay');

  // If you ever load the game without these elements, fail gracefully.
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

  updateOrientationUI();//initial check
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

  // Use Pointer Events so it works for touch + pen + mouse
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

function setPaused(paused) {
  isPaused = paused;
  if (world) world.isPaused = isPaused;
  const pauseOverlay = document.getElementById('pauseOverlay');
  if (pauseOverlay) pauseOverlay.style.display = isPaused ? 'flex' : 'none';
  if (typeof updateMobileControlsVisibility === 'function') {
    updateMobileControlsVisibility();
  }
}

function togglePause() {
  if (!world) return;        // can’t pause before starting
  if (isPortraitBlocked) return; // don’t pause/resume while blocked
  setPaused(!isPaused);
}

function setupPauseControls() {
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', togglePause);
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => setPaused(false));
  }
}

window.addEventListener('keydown', (e) => {
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

  // Movement / actions
  if (e.code === 'ArrowRight') keyboard.RIGHT = true;
  if (e.code === 'ArrowLeft') keyboard.LEFT = true;
  if (e.code === 'ArrowUp') keyboard.UP = true;
  if (e.code === 'Space') keyboard.SPACE = true;
}, { passive: false });


window.addEventListener('keyup', (e) => {
  // Ignore input when portrait-locked or paused
  if (isPortraitBlocked || isPaused) return;

  // Prevent scrolling
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  // Movement / actions
  if (e.code === 'ArrowRight') keyboard.RIGHT = false;
  if (e.code === 'ArrowLeft') keyboard.LEFT = false;
  if (e.code === 'ArrowUp') keyboard.UP = false;
  if (e.code === 'Space') keyboard.SPACE = false;
}, { passive: false });





