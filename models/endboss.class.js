class Endboss extends movableObject {

    height = 280;
    width = 270;
    energy = 100;
    dead = false;
    animationInterval = null;

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png',

    ]

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];


    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 3000;
        this.y = 160;
        this.animate();
    }

    animate() {
        this.animationInterval = setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    hit() {
        if (this.dead) return;

        this.energy -= 20;
        this.energy = Math.max(0, this.energy);

        if (this.energy === 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;

        // stop walking animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        // play death animation once
        let i = 0;
        const deathInterval = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[i]];
            i++;

            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(deathInterval);
            }
        }, 200);
    }

}