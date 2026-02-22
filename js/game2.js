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

      if (gameStarted && world && !world.isGameOver && !isPaused) {
        pausedByOrientation = true;
        setPaused(true);
      }
    } else {
      isPortraitBlocked = false;
      overlay.style.display = 'none';
      gameContainer.classList.remove('portrait-blocked');

      if (pausedByOrientation) {
        pausedByOrientation = false;
        setPaused(false);
      }
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
