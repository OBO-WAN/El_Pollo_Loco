class DrawableObject {
    x = 120;
    y = 360;
    height = 100;
    width = 50;
    img;
    imageCache = {};
    currentImage = 0;

    loadImage(path) {
        this.img = new Image(); 
        this.img.src = path;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

     loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }


}