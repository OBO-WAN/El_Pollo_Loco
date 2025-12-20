class movableObject {
    x = 120;
    y = 360;
    img ;
    height = 100;
    width = 50;


    loadImage(path){
        this.img = new Image(); // im Grunde das gleiche wie document.getElementById("");
        this.img.src = path;
    }

    moveRight() {
        console.log("move right");
    }
    moveLeft() {

    }
}