class Chicken2 extends movableObject {
    dead = false;
    height = 60;
    width = 60;
    y = 360;

    animatedSmallChickens = [
        'assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    IMAGE_DEAD = 'assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    currentImage = 0;
    animationInterval = null;

    constructor(x = null) {
        super();
        this.loadImage(this.animatedSmallChickens[0]);
        this.loadImages(this.animatedSmallChickens);
        this.loadImage(this.IMAGE_DEAD);
        this.x = (x !== null) ? x : (600 + Math.random() * 1200);
        this.speed = 0.2 + Math.random() * 0.6;
        this.animate();
    }

    animate() {
        this.animationInterval = setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.animatedSmallChickens);
            }
        }, 120);
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
}
