class movableObjekt {
    x = 120;
    y = 250;
    img ;
    height = 150;
    width = 100;


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