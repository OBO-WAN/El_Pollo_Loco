class movableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    //Gravitation
    speedY = 0;
    acceleration = 2.0;
    energy = 100;
    lastHit = 0;

    applyGravity() {
        setInterval(() => {
            const groundY = (typeof this.groundY === 'number') ? this.groundY : 180;

            if (this.isInAir() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;

                if (this.y > groundY) {
                    this.y = groundY;
                    this.speedY = 0;
                }
            } else {
                this.speedY = 0;
                this.y = groundY;
            }
        }, 1000 / 25);
    }

    isInAir() {
        if (this instanceof ThrowableObject) return true;
        const groundY = (typeof this.groundY === 'number') ? this.groundY : 180;
        return this.y < groundY;
    }


    isColliding(mo) {
        const a = this.offset || { top: 0, right: 0, bottom: 0, left: 0 };
        const b = mo.offset || { top: 0, right: 0, bottom: 0, left: 0 };

        return (
            this.x + a.left < mo.x + mo.width - b.right &&
            this.x + this.width - a.right > mo.x + b.left &&
            this.y + a.top < mo.y + mo.height - b.bottom &&
            this.y + this.height - a.bottom > mo.y + b.top
        );
    }

    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = Date.now();
        }
    }

    isDead() {
        return this.energy == 0;
    }

    isHurt() {
        const timePassed = (Date.now() - this.lastHit) / 1000; //seconds
        return timePassed < 1;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[images[i]];
        this.currentImage++;

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