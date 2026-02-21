class Endboss extends movableObject {
    height = 280;
    width = 270;
    energy = 100;
    dead = false;

    animationInterval = null;

    isHurt = false;
    isAttacking = false;

    hurtTimeout = null;
    attackStartTimeout = null;
    attackInterval = null;
    attackTimeout = null;
    windupTimeout = null;

    dashSpeed = 40;
    dashDistance = 180;
    dashProgress = 0;
    isDashing = false;

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
                if (this.isDashing) this.performDash();
                return;
            }

            this.playAnimation(this.IMAGES_WALKING);
        }, 140);
    }

    hit() {
        if (this.dead) return;

        this.energy = Math.max(0, this.energy - 20);
        this.triggerHurtAnimation();

        if (this.energy <= 50 && this.dashSpeed !== 55) {
            this.dashSpeed = 55;
            this.dashDistance = 220;
        }

        if (this.energy === 0) this.die();
    }

    triggerHurtAnimation() {
        this.isHurt = true;
        this.clearTimeoutSafe('hurtTimeout');
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, 600);
    }

    startAttackCycle() {
        if (this.dead || this.attackStartTimeout || this.attackInterval) return;

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
        if (this.energy <= 30) return 1000 + Math.random() * 400;
        if (this.energy <= 50) return 1500 + Math.random() * 600;
        return 2000 + Math.random() * 800;
    }

    triggerAttack() {
        if (this.dead || this.isAttacking) return;

        this.isAttacking = true;
        this.isDashing = false;
        this.dashProgress = 0;

        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('attackTimeout');

        const windup = this.getWindupMs();

        this.windupTimeout = setTimeout(() => {
            if (!this.dead) this.startDash();
        }, windup);

        const totalAttackMs = windup + this.getDashTimeMs() + 200;

        this.attackTimeout = setTimeout(() => this.endAttack(), totalAttackMs);
    }

    getDashTimeMs() {
        const steps = Math.ceil(this.dashDistance / this.dashSpeed);
        return steps * 140;
    }

    endAttack() {
        this.isAttacking = false;
        this.isDashing = false;
        this.dashProgress = 0;
        this.clearTimeoutSafe('windupTimeout');
        this.attackTimeout = null;
    }

    getWindupMs() {
        if (this.energy <= 30) return 250;
        if (this.energy <= 50) return 350;
        return 500;
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
        this.x -= this.dashSpeed;
        this.dashProgress += this.dashSpeed;
    }

    die() {
        this.dead = true;
        this.stopTimers();
        this.resetState();
        this.playDeathFrames();
    }

    stopTimers() {
        this.clearIntervalSafe('animationInterval');
        this.clearTimeoutSafe('attackStartTimeout');
        this.clearTimeoutSafe('attackInterval');
        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('attackTimeout');
        this.clearTimeoutSafe('hurtTimeout');
    }

    resetState() {
        this.isAttacking = false;
        this.isDashing = false;
        this.isHurt = false;
        this.dashProgress = 0;
    }

    playDeathFrames() {
        let i = 0;
        const id = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[i]];
            i++;
            if (i >= this.IMAGES_DEAD.length) clearInterval(id);
        }, 200);
    }

    clearTimeoutSafe(prop) {
        const t = this[prop];
        if (t) clearTimeout(t);
        this[prop] = null;
    }

    clearIntervalSafe(prop) {
        const t = this[prop];
        if (t) clearInterval(t);
        this[prop] = null;
    }
}