class Endboss extends movableObject {
    height = 280;
    width = 270;
    energy = 100;
    dead = false;

    // Main animation loop
    animationInterval = null;

    // State flags
    isHurt = false;
    isAttacking = false;

    // Timers
    hurtTimeout = null;
    attackStartTimeout = null;
    attackInterval = null;
    attackTimeout = null;

    //Attack
    dashSpeed = 40;
    dashDistance = 180;
    dashProgress = 0;
    isDashing = false;


    // --- Animations ---
    IMAGES_WALKING = [
        'assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G12.png',
    ];

    IMAGES_ATTACK = [
        'assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G20.png',
    ];

    IMAGES_HURT = [
        'assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G23.png',
    ];

    IMAGES_DEAD = [
        'assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 3000;
        this.y = 160;

        this.animate();

        // console.log('Endboss loaded. startAttackCycle:', typeof this.startAttackCycle);
    }

    animate() {
        this.animationInterval = setInterval(() => {
            if (this.dead) return;
            if (typeof isPaused !== 'undefined' && isPaused) return;
            if (this.isHurt) {
                this.playAnimation(this.IMAGES_HURT);
                return;
            }
            if (this.isAttacking) {
                this.playAnimation(this.IMAGES_ATTACK);
                if (this.isDashing) {
                    this.performDash();
                }
                return;
            }
            this.playAnimation(this.IMAGES_WALKING);
        }, 140);
    }

    hit() {
        if (this.dead) return;

        this.energy -= 20;
        this.energy = Math.max(0, this.energy);

        this.triggerHurtAnimation();

        if (this.energy <= 50 && this.dashSpeed !== 55) {
            this.dashSpeed = 55;
            this.dashDistance = 220;
        }

        if (this.energy === 0) {
            this.die();
        }
    }

    triggerHurtAnimation() {
        this.isHurt = true;

        if (this.hurtTimeout) clearTimeout(this.hurtTimeout);

        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, 600);
    }

    startAttackCycle() {
        if (this.dead || this.attackStartTimeout) return;
        if (this.attackInterval) return;

        this.attackStartTimeout = setTimeout(() => {
            if (this.dead) return;

            this.triggerAttack();
            this.scheduleNextAttack();

            this.attackStartTimeout = null;
        }, 1500);
    }

    scheduleNextAttack() {
        if (this.dead) return;
        const delay = this.getNextAttackDelay();

        this.attackInterval = setTimeout(() => {
            if (this.dead) return;

            this.triggerAttack();
            this.scheduleNextAttack();
        }, delay);
    }

    getNextAttackDelay() {
        if (this.energy <= 30) {
            return 1000 + Math.random() * 400;
        }
        if (this.energy <= 50) {
            return 1500 + Math.random() * 600;
        }
        return 2000 + Math.random() * 800;
    }

    triggerAttack() {
        if (this.dead || this.isAttacking) return;

        this.isAttacking = true;
        this.startDash();

        if (this.attackTimeout) clearTimeout(this.attackTimeout);

        this.attackTimeout = setTimeout(() => {
            this.isAttacking = false;
            this.isDashing = false;
            this.dashProgress = 0;
        }, this.IMAGES_ATTACK.length * 140);
    }

    startDash() {
        this.isDashing = true;
        this.dashProgress = 0;
    }

    performDash() {
        if (this.dashProgress >= this.dashDistance) {
            this.isDashing = false;
            return;
        }

        this.x -= this.dashSpeed; // boss moves toward player (left)
        this.dashProgress += this.dashSpeed;
    }

    die() {
        this.dead = true;

        if (this.animationInterval) clearInterval(this.animationInterval);
        if (this.attackInterval) clearTimeout(this.attackInterval);
        if (this.attackStartTimeout) clearTimeout(this.attackStartTimeout);
        if (this.attackTimeout) clearTimeout(this.attackTimeout);
        if (this.hurtTimeout) clearTimeout(this.hurtTimeout);

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