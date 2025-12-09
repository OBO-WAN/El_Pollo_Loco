class movableObjekt {
    x = 150;
    y = 250;
    img ;
    height = 250;
    width = 250;


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