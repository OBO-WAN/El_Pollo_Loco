let canvas;
let world;
let keyboard = new Keyboard();


function init() {
  canvas = document.getElementById('canvas');
  document.getElementById('startBtn').addEventListener('click', startGame);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') startGame();
  });
}

function startGame() {
  if (world) return; // already started
  document.getElementById('startScreen').style.display = 'none';
  world = new World(canvas, keyboard);
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



