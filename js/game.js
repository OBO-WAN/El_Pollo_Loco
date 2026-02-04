let canvas;
let world;
let bgMusic;
let isMuted = false;
const MUTE_STORAGE_KEY = 'game_muted';
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
  startBackgroundMusic();
  world = new World(canvas, keyboard);
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

  btn.textContent = isFs ? '⤫' : '⛶';
  btn.title = isFs ? 'Exit fullscreen' : 'Enter fullscreen';
}

function startBackgroundMusic() {
  if (!bgMusic) return;

  bgMusic.muted = isMuted;
  bgMusic.play().catch(() => {});
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


window.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault(); // prevents scrolling

  if (e.code === 'ArrowRight') keyboard.RIGHT = true;
  if (e.code === 'ArrowLeft') keyboard.LEFT = true;
  if (e.code === 'ArrowUp') keyboard.UP = true;
  if (e.code === 'Space') keyboard.SPACE = true;
});

window.addEventListener('keyup', (e) => {

  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault(); // prevents scrolling

  if (e.code === 'ArrowRight') keyboard.RIGHT = false;
  if (e.code === 'ArrowLeft') keyboard.LEFT = false;
  if (e.code === 'ArrowUp') keyboard.UP = false;
  if (e.code === 'Space') keyboard.SPACE = false;
});



