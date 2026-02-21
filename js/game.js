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

async function init() {
  const loader = document.getElementById('loadingOverlay');
  const startScreen = document.getElementById('startScreen');
  const loadingText = document.getElementById('loadingText');

  if (startScreen) startScreen.style.display = 'none';
  if (loader) loader.style.display = 'flex';

  try {
    await preloadImagesWithProgress(GAME_IMAGES, (percent) => {
      if (loadingText) loadingText.textContent = `Loading game… ${percent}%`;
    });
  } catch (e) {
    console.error('Asset loading failed:', e);
  } finally {
    if (loader) loader.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    initGame();
  }
}

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

// -------------------- Audio --------------------

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

// -------------------- Game start / fullscreen --------------------

function startGame() {
  if (world) return;

  dom.startScreen?.style && (dom.startScreen.style.display = 'none');

  startBackgroundMusic();
  world = new World(canvas, keyboard);
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
    const mobilePortrait = isMobileLike() && portrait;

    if (mobilePortrait) {
      isPortraitBlocked = true;
      overlay.style.display = 'flex';
      gameContainer.classList.add('portrait-blocked');

      hideOverlay('howToOverlay');
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

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTabletOrSmaller = window.innerWidth <= 1366;

  if (
    gameStarted &&
    isTouch &&
    isLandscape &&
    isTabletOrSmaller &&
    !isPortraitBlocked
  ) {
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

  toggleWorldPause(isPaused);
  togglePauseOverlay(isPaused);
  handlePauseAudio(isPaused);

  updateMobileControlsVisibility();
}

function toggleWorldPause(paused) {
  if (!world) return;
  (paused ? world.pause : world.resume)?.call(world);
}

function togglePauseOverlay(paused) {
  const pauseOverlay = document.getElementById('pauseOverlay');
  if (!pauseOverlay) return;

  if (isPortraitBlocked) {
    pauseOverlay.style.display = 'none';
    return;
  }
  pauseOverlay.style.display = paused ? 'flex' : 'none';
}

function handlePauseAudio(paused) {
  if (paused) {
    stopBackgroundMusic();
    stopWorldSounds();
    return;
  }

  if (!isMuted && gameStarted && world && !world.isGameOver) {
    startBackgroundMusic();
  }
}

function stopWorldSounds() {
  if (!world) return;

  world.stopSnoring?.();

  const sounds = [
    world.coinSound,
    world.bottleSound,
    world.throwBottleSound,
    world.winSound,
    world.gameOverSound,
  ];

  sounds.forEach((sound) => {
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  });
}

function togglePause() {
  if (!world) return;
  if (isPortraitBlocked) return;
  if (world.isGameOver) return;
  setPaused(!isPaused);
}

function setupPauseControls() {
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');

  pauseBtn?.addEventListener('click', togglePause);
  resumeBtn?.addEventListener('click', () => setPaused(false));
}

function preloadImagesWithProgress(imagePaths, onProgress) {
  const unique = [...new Set(imagePaths)];
  const total = unique.length;
  let loaded = 0;

  const update = () => {
    const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
    onProgress?.(percent, loaded, total);
  };

  update();

  return Promise.all(
    unique.map(
      (path) =>
        new Promise((resolve) => {
          const img = new Image();

          img.onload = () => {
            loaded++;
            update();
            resolve(path);
          };
          img.onerror = () => {
            console.warn('Missing image:', path);
            loaded++;
            update();
            resolve(path);
          };

          img.src = path;
        })
    )
  );
}

// -------------------- Keyboard --------------------

function onKeydown(e) {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    e.preventDefault();
    togglePause();
    return;
  }
  if (isPortraitBlocked || isPaused) return;
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'ArrowRight') keyboard.RIGHT = true;
  if (e.code === 'ArrowLeft') keyboard.LEFT = true;
  if (e.code === 'ArrowUp') keyboard.UP = true;
  if (e.code === 'Space') keyboard.SPACE = true;
}

function onKeyup(e) {
  if (isPortraitBlocked || isPaused) return;
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === 'ArrowRight') keyboard.RIGHT = false;
  if (e.code === 'ArrowLeft') keyboard.LEFT = false;
  if (e.code === 'ArrowUp') keyboard.UP = false;
  if (e.code === 'Space') keyboard.SPACE = false;
}


// -------------------- Helpers --------------------

function showOverlay(id, { focusSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  lastFocusBeforeOverlay = document.activeElement;

  el.classList.add('show');
  el.inert = false;
  el.setAttribute('aria-hidden', 'false');

  const focusTarget = el.querySelector(focusSelector);
  focusTarget?.focus();
}

function hideOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;

  if (lastFocusBeforeOverlay && typeof lastFocusBeforeOverlay.focus === 'function') {
    lastFocusBeforeOverlay.focus();
  }

  el.classList.remove('show');
  el.inert = true;
  el.setAttribute('aria-hidden', 'true');
}

function stopBackgroundMusic() {
  if (bgMusic) bgMusic.pause();
}
