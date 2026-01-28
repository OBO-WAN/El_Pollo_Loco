class movableObject extends DrawableObject{

    speed = 0.15;
    otherDirection = false;
    //Gravitation
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;


    applyGravity() {
        setInterval(() => {
            if (this.isInAir() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isInAir() {
        return this.y < 180;
    }

    drawFrame(ctx) {
        // Blue rectangle
        if (this instanceof Character || this instanceof Chicken) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.height); //mo.x + mo.width | mo.y + height
            ctx.stroke();
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