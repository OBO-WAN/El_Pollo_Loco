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
            if (this.isInAir() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            } else {
                this.speedY = 0;
            }
        }, 1000 / 25);
    }

    isInAir() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 180;
        }
    }


    //character.isColliding.chicken
    isColliding(mo) {
        const collide =
            this.x < mo.x + mo.width &&
            this.x + this.width > mo.x &&
            this.y < mo.y + mo.height &&
            this.y + this.height > mo.y;

        if (collide) {
            console.log('COLLISION', this, mo);
        }
        return collide;
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