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
                if (this.isDashing) this.performDash();
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
    startAttackCycle() {
        if (this.dead || this.attackStartTimeout || this.attackInterval) return;

        this.attackStartTimeout = setTimeout(() => {
            if (this.dead) return;
            this.triggerAttack();
            this.scheduleNextAttack();
            this.attackStartTimeout = null;
        }, 1500);
    }

/**
 * Schedules the next attack based on the current health-dependent delay.
 */
    scheduleNextAttack() {
        if (this.dead) return;

        const delay = this.getNextAttackDelay();
        this.attackInterval = setTimeout(() => {
            if (this.dead) return;
            this.triggerAttack();
            this.scheduleNextAttack();
        }, delay);
    }

/**
 * Computes the delay (ms) until the next attack based on remaining energy.
 * @returns {number} Delay in milliseconds.
 */
    getNextAttackDelay() {
        if (this.energy <= 30) return 900 + Math.random() * 350;
        if (this.energy <= 50) return 1350 + Math.random() * 550;
        return 1900 + Math.random() * 750;
    }

/**
 * Chooses and starts an attack (dash or jump-slam) based on distance to the character and RNG.
 */
    triggerAttack() {
        if (this.dead || this.isAttacking) return;

        const w = this.getWorld();
        const c = w?.character;

        let dist = 999999;
        if (c) dist = Math.abs((c.x + c.width / 2) - (this.x + this.width / 2));

        const near = dist < 260;
        const far = dist > 520;

        let slamChance = this.energy <= 30 ? 0.55 : this.energy <= 50 ? 0.4 : 0.25;
        if (near) slamChance += 0.15;
        if (far) slamChance -= 0.1;
        slamChance = Math.max(0.1, Math.min(0.8, slamChance));

        if (Math.random() < slamChance) {
            this.startJumpSlamAttack();
        } else {
            this.startDashAttack();
        }
    }

/**
 * Starts a dash-style attack with a windup followed by dash movement.
 */
    startDashAttack() {
        if (this.dead) return;

        this.isAttacking = true;
        this.isJumpSlamming = false;

        this.isDashing = false;
        this.dashProgress = 0;

        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('attackTimeout');

        const windup = this.getWindupMs();

        this.windupTimeout = setTimeout(() => {
            if (this.dead) return;
            this.startDash();
        }, windup);

        const totalAttackMs = windup + this.getDashTimeMs() + 260;
        this.attackTimeout = setTimeout(() => this.endAttack(), totalAttackMs);
    }

/**
 * Starts a jump-slam attack: lifts up, slams down, applies area damage, then ends the attack.
 */
    startJumpSlamAttack() {
        if (this.dead) return;

        this.isAttacking = true;
        this.isDashing = false;
        this.dashProgress = 0;

        this.isJumpSlamming = true;
        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('attackTimeout');
        this.clearTimeoutSafe('slamTimeout');

        const windup = Math.max(160, this.getWindupMs() - 140);

        this.windupTimeout = setTimeout(() => {
            if (this.dead) return;

            this.y = this.baseY - this.slamLift;

            this.slamTimeout = setTimeout(() => {
                if (this.dead) return;

                this.y = this.baseY;
                this.applySlamDamage();
                this.endAttack();
            }, this.energy <= 30 ? 310 : 400);
        }, windup);

        this.attackTimeout = setTimeout(() => this.endAttack(), windup + 900);
    }

/**
 * Applies slam damage to the character if within slam radius and not invincible.
 * Also updates the world's health status bar if available.
 */
    applySlamDamage() {
        const w = this.getWorld();
        const c = w?.character;
        if (!c) return;

        const bossCenter = this.x + this.width / 2;
        const charCenter = c.x + c.width / 2;
        const dist = Math.abs(charCenter - bossCenter);

        if (dist > this.slamRadius) return;

        if (typeof c.isInvincible === 'function' && c.isInvincible()) return;

        if (typeof c.hit === 'function') c.hit();
        if (typeof c.grantInvincibility === 'function') c.grantInvincibility(1200);

        if (w?.statusBarHealth?.setPercentage) {
            w.statusBarHealth.setPercentage(c.energy);
        }
    }

/**
 * Moves the boss towards the given character while not attacking or hurt.
 * Boss will stop when within a small distance threshold.
 * @param {object} character The player character to follow (expects x/width properties).
 * @param {object} [options] Behavior options.
 * @param {boolean} [options.active=true] Whether following is active this tick.
 */
    followCharacter(character, { active = true } = {}) {
        if (!active) return;
        if (this.dead) return;
        if (typeof isPaused !== 'undefined' && isPaused) return;
        if (!character) return;

        const bossCenter = this.x + this.width / 2;
        const charCenter = character.x + character.width / 2;

        const dx = (charCenter - bossCenter) * this.DIR;

        if (this.isAttacking || this.isHurt) {
            this.otherDirection = dx < 0;
            return;
        }

        this.otherDirection = dx < 0;

        const stopDistance = 90;
        if (Math.abs(dx) <= stopDistance) return;

        this.x += Math.sign(dx) * this.followSpeed * this.DIR;
    }

/**
 * Estimates the time (ms) the dash movement will take based on dash distance and speed.
 * @returns {number} Dash time in milliseconds.
 */
    getDashTimeMs() {
        const steps = Math.ceil(this.dashDistance / this.dashSpeed);
        return steps * 140;
    }

/**
 * Ends the current attack and resets attack-related state and timers.
 */
    endAttack() {
        this.isAttacking = false;
        this.isDashing = false;
        this.isJumpSlamming = false;
        this.dashProgress = 0;
        this.dashChainRemaining = 0;

        this.y = this.baseY;

        this.clearTimeoutSafe('windupTimeout');
        this.clearTimeoutSafe('slamTimeout');

        this.attackTimeout = null;
    }

/**
 * Returns the pre-attack windup duration (ms) based on remaining energy.
 * @returns {number} Windup duration in milliseconds.
 */
    getWindupMs() {
        if (this.energy <= 30) return 180;
        if (this.energy <= 50) return 260;
        return 420;
    }

/**
 * Initializes dash direction towards the character (if present) and enables dashing.
 * May enable chained dashes when enraged.
 */
    startDash() {
        const w = this.getWorld?.();
        const c = w?.character;

        if (c) {
            const bossCenter = this.x + this.width / 2;
            const charCenter = c.x + c.width / 2;

            const dx = (charCenter - bossCenter) * this.DIR;

            this.dashDir = (dx < 0 ? -1 : 1) * this.DIR;
            this.otherDirection = dx < 0;
        } else {
            this.dashDir = -1 * this.DIR;
        }

        this.isDashing = true;
        this.dashProgress = 0;

        if (this.isEnraged && Math.random() < 0.35) {
            this.dashChainRemaining = 1 + (Math.random() < 0.25 ? 1 : 0);
        } else {
            this.dashChainRemaining = 0;
        }
    }

/**
 * Advances the dash movement by one animation tick, handling chained dashes if enabled.
 */
    performDash() {
        const effectiveDistance = this.dashChainRemaining > 0
            ? Math.max(110, Math.floor(this.dashDistance * 0.55))
            : this.dashDistance;

        if (this.dashProgress >= effectiveDistance) {
            if (this.dashChainRemaining > 0) {
                this.dashChainRemaining--;
                this.dashProgress = 0;
                this.clearTimeoutSafe('windupTimeout');
                this.windupTimeout = setTimeout(() => {
                    if (!this.dead && this.isAttacking) {
                        this.isDashing = true;
                        this.dashProgress = 0;
                    }
                }, this.energy <= 30 ? 130 : 170);
                this.isDashing = false;
                return;
            }

            this.isDashing = false;
            return;
        }

        this.x += this.dashDir * this.dashSpeed;
        this.dashProgress += this.dashSpeed;
    }

/**
 * Marks the boss as dead, stops all timers, resets state and plays death animation frames.
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
        let i = 0;
        const id = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[i]];
            i++;
            if (i >= this.IMAGES_DEAD.length) clearInterval(id);
        }, 200);
    }

/**
 * Clears a timeout stored on this instance under the given property name.
 * @param {string} prop The property name holding a timeout id.
 */
    clearTimeoutSafe(prop) {
        const t = this[prop];
        if (t) clearTimeout(t);
        this[prop] = null;
    }

/**
 * Clears an interval stored on this instance under the given property name.
 * @param {string} prop The property name holding an interval id.
 */
    clearIntervalSafe(prop) {
        const t = this[prop];
        if (t) clearInterval(t);
        this[prop] = null;
    }
}
