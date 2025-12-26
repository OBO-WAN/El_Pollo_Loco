class movableObject {
    x = 120;
    y = 360;
    img;
    height = 100;
    width = 50;
    imageCache = {};
    currentImage = 0;
    speed = 0.15;


    loadImage(path) {
        this.img = new Image(); // im Grunde das gleiche wie document.getElementById("");
        this.img.src = path;
    }

    /**
     * 
     * @param {Array} arr -[images from imageCache] 
     */
    loadMainCharacter(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    moveRight() {
        console.log("move right");
    }
    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);
    }
}