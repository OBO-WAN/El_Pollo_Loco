let canvas;
let ctx;


let world = new World();


function init(){
    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
   
    console.log("My character is: " + world.character);
}