class Chicken extends movableObject {
    dead = false;
    height = 80;
    width = 80;
    x = 120;
    y = 340;

    animatedChickens = [
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    IMAGE_DEAD = 'assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    currentImage = 0;
    animationInterval = null;

    constructor(x = null) {
        super();
        this.loadImage(this.animatedChickens[0]);
        this.loadImages(this.animatedChickens);
        this.loadImage(this.IMAGE_DEAD);
        this.x = (x !== null) ? x : (600 + Math.random() * 1200);
        this.speed = 0.15 + Math.random() * 0.5;
        this.animate();
    }

    animate() {
        this.animationInterval = setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.animatedChickens);
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
