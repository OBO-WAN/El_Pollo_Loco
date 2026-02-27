/**
 * Endboss enemy AI and animation controller.
 * Handles following behavior, dash and jump-slam attacks, damage/enrage logic and death sequence.
 */
class Endboss extends movableObject {
    offset = { top: 70, right: 55, bottom: 25, left: 55 };
    followSpeed = 2.2;
    dashDir = -1;
    DIR = -1;
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
    isJumpSlamming = false;
    slamTimeout = null;
    baseY = 160;
    slamLift = 120;
    slamRadius = 170;
    isEnraged = false;
    dashChainRemaining = 0;

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

/**
 * Creates an Endboss enemy, preloads animation frames and starts the animation loop.
 */
    constructor() {
        super();
        this.attack = new EndbossAttackController(this);
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 3000;
        this.y = this.baseY;
        this.animate();
    }

/**
 * Runs the boss animation loop and drives attack/dash frame progression.
 * Skips updates while dead or when the global pause flag is set.
 */
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
                if (this.isDashing) this.attack.performDash();
                return;
            }

            this.playAnimation(this.IMAGES_WALKING);
        }, 140);
    }

/**
 * Resolves the current game world reference.
 * Prefers an instance property (`this.world`) and falls back to a global `world` if present.
 * @returns {object|null} The world instance or null if unavailable.
 */
    getWorld() {
        if (this.world) return this.world;
        if (typeof world !== 'undefined' && world) return world;
        return null;
    }

/**
 * Applies damage to the boss, triggers hurt feedback and enrages the boss at low health.
 * When health reaches 0, the boss dies.
 */
    hit() {
        if (this.dead) return;

        this.energy = Math.max(0, this.energy - 20);
        this.triggerHurtAnimation();

        if (this.energy <= 50 && !this.isEnraged) {
            this.isEnraged = true;
            this.dashSpeed = 65;
            this.dashDistance = 260;
            this.slamRadius = 200;
        } else if (this.energy <= 50 && this.dashSpeed < 55) {
            this.dashSpeed = 55;
            this.dashDistance = 220;
        }

        if (this.energy === 0) this.die();
    }

/**
 * Starts the repeating attack cycle (delegated to EndbossAttackController).
 */
    startAttackCycle() {
        this.attack.startAttackCycle();
    }

/**
 * Delegated: ends the current attack and resets attack-related state.
 */
    endAttack() {
        this.attack.endAttack();
    }


/**
 * Temporarily marks the boss as hurt, playing the hurt animation for a short duration.
 */
    triggerHurtAnimation() {
        this.isHurt = true;
        this.clearTimeoutSafe('hurtTimeout');
        this.hurtTimeout = setTimeout(() => {
            this.isHurt = false;
        }, 600);
    }

/**
 * Starts the repeating attack cycle with an initial delay.
 * No-ops if an attack cycle is already scheduled or the boss is dead.
 */

followCharacter(character, { active = true } = {}) {
            if (!this.shouldFollowCharacter(active, character)) return;

            const dx = this.getDirectionDeltaTo(character);
            this.updateFacingFromDelta(dx);

            if (this.isAttacking || this.isHurt) return;
            if (this.isWithinFollowStopDistance(dx)) return;

            this.moveTowardsDelta(dx);
        }

    shouldFollowCharacter(active, character) {
            if (!active) return false;
            if (this.dead) return false;
            if (typeof isPaused !== 'undefined' && isPaused) return false;
            return !!character;
        }

        getDirectionDeltaTo(character) {
            const bossCenter = this.x + this.width / 2;
            const charCenter = character.x + character.width / 2;
            return (charCenter - bossCenter) * this.DIR;
        }

        updateFacingFromDelta(dx) {
            this.otherDirection = dx < 0;
        }

        isWithinFollowStopDistance(dx) {
            const stopDistance = 90;
            return Math.abs(dx) <= stopDistance;
        }

        moveTowardsDelta(dx) {
            this.x += Math.sign(dx) * this.followSpeed * this.DIR;
        }

/**
 * Estimates the time (ms) the dash movement will take based on dash distance and speed.
 * @returns {number} Dash time in milliseconds.
 */

    die() {
        this.dead = true;
        this.stopTimers();
        this.resetState();
        this.playDeathFrames();
    }

/**
 * Stops all active intervals/timeouts used by the boss AI and animations.
 */
    stopTimers() {
        this.clearIntervalSafe('animationInterval');
        this.clearTimeoutSafe('attackStartTimeout');
        this.clearTimeoutSafe('attackInterval');
        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('attackTimeout');
        this.clearTimeoutSafe('hurtTimeout');
        this.clearTimeoutSafe('slamTimeout');
    }

/**
 * Resets transient combat/animation state back to neutral values.
 */
    resetState() {
        this.isAttacking = false;
        this.isDashing = false;
        this.isJumpSlamming = false;
        this.isHurt = false;
        this.dashProgress = 0;
        this.dashChainRemaining = 0;
        this.y = this.baseY;
    }

/**
 * Plays the death animation frames once and then stops.
 */
    playDeathFrames() {
        let frameIndex = 0;
        const intervalId = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[frameIndex]];
            frameIndex++;
            if (frameIndex >= this.IMAGES_DEAD.length) clearInterval(intervalId);
        }, 200);
    }

/**
 * Clears a timeout stored on this instance under the given property name.
 * @param {string} prop The property name holding a timeout id.
 */
    clearTimeoutSafe(prop) {
        const timeoutId = this[prop];
        if (timeoutId) clearTimeout(timeoutId);
        this[prop] = null;
    }

/**
 * Clears an interval stored on this instance under the given property name.
 * @param {string} prop The property name holding an interval id.
 */
    clearIntervalSafe(prop) {
        const intervalId = this[prop];
        if (intervalId) clearInterval(intervalId);
        this[prop] = null;
    }
}
