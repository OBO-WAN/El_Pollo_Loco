class movableObject {
    x = 120;
    y = 360;
    img;
    height = 100;
    width = 50;
    imageCache = {};
    currentImage = 0;
    speed = 0.15;
    otherDirection = false;


    loadImage(path) {
        this.img = new Image(); // im Grunde das gleiche wie document.getElementById("");
        this.img.src = path;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[images[i]];
        this.currentImage++;

    }

   loadImages(arr) {
    arr.forEach(path => {
        const img = new Image();
        img.src = path;
        this.imageCache[path] = img;
    });
}

    moveRight() {
        // console.log("moveRight");
        this.x += this.speed;
    }

    moveLeft() {
        // console.log("moveLeft");
        this.x -= this.speed;
    }

}