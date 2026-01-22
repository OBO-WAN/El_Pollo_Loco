let canvas;
let world;

let keyboard = new Keyboard();


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    // console.log("My character is: ", world.character);


}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') keyboard.RIGHT = true;
  if (e.key === 'ArrowLeft') keyboard.LEFT = true;
  if (e.key === 'ArrowUp') keyboard.UP = true;

});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') keyboard.RIGHT = false;
  if (e.key === 'ArrowLeft') keyboard.LEFT = false;
  if (e.key === 'ArrowUp') keyboard.UP = false; 
});

