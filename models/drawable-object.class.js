class DrawableObject {
    x = 120;
    y = 360;
    height = 100;
    width = 50;
    img;
    isBackground = true;
    imageCache = {};
    currentImage = 0;

    loadImage(path) {
        this.img = new Image();
        this.img.onerror = () => console.error('Image failed to load:', path);
        this.img.src = path;
    }

    draw(ctx) {
        if (!this.img) return;
        let width = this.width;
        if (this.isBackground) width += 1;
        ctx.drawImage(this.img, this.x, this.y, width, this.height);
    }

    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

}