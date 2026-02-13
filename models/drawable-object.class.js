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
        this.img.onerror = () => console.error('Image failed to load:', path);
        this.img.src = path;
    }

    draw(ctx) {
        if (!this.img) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof Coin) {
            const o = this.offset || { top: 0, left: 0, right: 0, bottom: 0 };

            const x = this.x + o.left;
            const y = this.y + o.top;
            const w = this.width - o.left - o.right;
            const h = this.height - o.top - o.bottom;

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "blue";
            ctx.rect(x, y, w, h);
            ctx.stroke();
        }
    }


}