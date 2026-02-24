function setupOrientationGuard() {
  const gameContainer = document.getElementById('gameContainer');
  const overlay = document.getElementById('orientationOverlay');
  if (!gameContainer || !overlay) return;

  const update = () => updateOrientationUI({ gameContainer, overlay });

  bindOrientationListeners(update);
  update();
}

function bindOrientationListeners(updateFn) {
  window.addEventListener('resize', updateFn, { passive: true });
  window.addEventListener('orientationchange', updateFn, { passive: true });
}

function updateOrientationUI({ gameContainer, overlay }) {
  const mobilePortrait = isMobilePortrait();

  if (mobilePortrait) {
    applyPortraitBlock({ gameContainer, overlay });
  } else {
    clearPortraitBlock({ gameContainer, overlay });
  }

  updateMobileControlsVisibility();
}

function isMobilePortrait() {
  const portrait = window.innerHeight > window.innerWidth;
  return isMobileLike() && portrait;
}

function isMobileLike() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function applyPortraitBlock({ gameContainer, overlay }) {
  isPortraitBlocked = true;
  overlay.style.display = 'flex';
  gameContainer.classList.add('portrait-blocked');

  hideOverlay('howToOverlay');

  if (shouldPauseForOrientation()) {
    pausedByOrientation = true;
    setPaused(true);
  }
}

function clearPortraitBlock({ gameContainer, overlay }) {
  isPortraitBlocked = false;
  overlay.style.display = 'none';
  gameContainer.classList.remove('portrait-blocked');

  if (pausedByOrientation) {
    pausedByOrientation = false;
    setPaused(false);
  }
}

function shouldPauseForOrientation() {
  return (
    gameStarted &&
    world &&
    !world.isGameOver &&
    !isPaused
  );
}

function updateMobileControlsVisibility() {
  const controls = document.getElementById('mobileControls');
  if (!controls) return;

  const isTouch = isMobileLike();
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTabletOrSmaller = window.innerWidth <= 1366;

  controls.style.display =
    gameStarted && isTouch && isLandscape && isTabletOrSmaller && !isPortraitBlocked
      ? 'block'
      : 'none';
}

function setupMobileControls() {
  const controls = document.getElementById('mobileControls');
  if (!controls) return;

  bindMobileControlButtons(controls);
}

function bindMobileControlButtons(controlsEl) {
  controlsEl.querySelectorAll('.mc-btn').forEach((btn) => bindMobileButton(btn));
}

function bindMobileButton(btn) {
  const action = btn.dataset.action;
  if (!action) return;
  const onDown = makePointerHandler(action, true);
  const onUp = makePointerHandler(action, false);

  btn.addEventListener('pointerdown', onDown, { passive: false });
  btn.addEventListener('pointerup', onUp, { passive: false });
  btn.addEventListener('pointercancel', onUp, { passive: false });
  btn.addEventListener('pointerleave', onUp, { passive: false });
}

function makePointerHandler(action, pressed) {
  return (e) => {
    e.preventDefault();
    setMobileKeyFlag(action, pressed);
  };
}

const MOBILE_KEY_MAP = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
};

function setMobileKeyFlag(action, pressed) {
  if (action === 'SPACE') {
    handleSpaceMobile(pressed);
    return;
  }

  const key = MOBILE_KEY_MAP[action];
  if (!key) return;

  keyboard[key] = pressed;
}

function handleSpaceMobile(pressed) {
  if (pressed && world?.isCharacterSleeping) {
    world.resetIdleTimer?.();
    keyboard.SPACE = false;
    return;
  }

  keyboard.SPACE = pressed;
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
  const tracker = createProgressTracker(unique.length, onProgress);

  tracker.update();

  return Promise.all(unique.map((path) => loadImage(path, tracker)));
}

function createProgressTracker(total, onProgress) {
  let loaded = 0;

  const update = () => {
    const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
    onProgress?.(percent, loaded, total);
  };

  const tick = () => {
    loaded++;
    update();
  };

  return { update, tick };
}

function loadImage(path, tracker) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      tracker.tick();
      resolve(path);
    };

    img.onerror = () => {
      console.warn('Missing image:', path);
      tracker.tick();
      resolve(path);
    };

    img.src = path;
  });
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

  if (e.code === 'Space' && world?.isCharacterSleeping) {
    world.resetIdleTimer?.();
    keyboard.SPACE = false;
    return;
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