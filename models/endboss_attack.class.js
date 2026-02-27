/**
 * EndbossAttackController
 * Handles attack scheduling and execution (dash + jump-slam) for an Endboss instance.
 *
 */
class EndbossAttackController {
    /**
    * Creates a new attack controller bound to a specific Endboss instance.
    * @param {object} boss The Endboss instance whose attack state/timers will be controlled.
    */
    constructor(boss) {
        this.boss = boss;
    }

    /**
    * Starts the repeating attack cycle after an initial delay.
    * No-ops if the boss is dead or a cycle is already scheduled.
    */
    startAttackCycle() {
        const boss = this.boss;
        if (boss.dead || boss.attackStartTimeout || boss.attackInterval) return;

        boss.attackStartTimeout = setTimeout(() => {
            if (boss.dead) return;
            this.triggerAttack();
            this.scheduleNextAttack();
            boss.attackStartTimeout = null;
        }, 1500);
    }

    /**
    * Schedules the next attack based on the current energy-dependent delay.
    */
    scheduleNextAttack() {
        const boss = this.boss;
        if (boss.dead) return;

        const delay = this.getNextAttackDelay();
        boss.attackInterval = setTimeout(() => {
            if (boss.dead) return;
            this.triggerAttack();
            this.scheduleNextAttack();
        }, delay);
    }

    /**
    * Computes the delay (ms) until the next attack based on remaining energy.
    * @returns {number} Delay in milliseconds.
    */
    getNextAttackDelay() {
        const energy = this.boss.energy;
        if (energy <= 30) return 900 + Math.random() * 350;
        if (energy <= 50) return 1350 + Math.random() * 550;
        return 1900 + Math.random() * 750;
    }

    /**
    * Chooses and begins an attack (dash or jump-slam) based on distance and RNG.
    */
    triggerAttack() {
        const boss = this.boss;
        if (boss.dead || boss.isAttacking) return;

        const { isNear, isFar } = this.getCharacterDistanceInfo();
        const slamChance = this.computeSlamChance(isNear, isFar);

        if (Math.random() < slamChance) this.startJumpSlamAttack();
        else this.startDashAttack();
    }

    /**
    * Computes distance information between boss and character centers and classifies near/far ranges.
    * @returns {{distance:number, isNear:boolean, isFar:boolean}} Distance info object.
    */
    getCharacterDistanceInfo() {
        const boss = this.boss;
        const world = boss.getWorld();
        const character = world?.character;

        const distance = character ? this.distanceCenters(boss, character) : Number.POSITIVE_INFINITY;
        return { distance, isNear: distance < 260, isFar: distance > 520 };
    }

    /**
    * Returns absolute distance between the x-centers of two objects.
    * @param {{x:number, width:number}} first First object.
    * @param {{x:number, width:number}} character Second object.
    * @returns {number} Absolute distance between centers.
    */
    distanceCenters(first, second) {
        const firstCenter = first.x + first.width / 2;
        const secondCenter = second.x + second.width / 2;
        return Math.abs(secondCenter - firstCenter);
    }

    /**
    * Calculates the probability of selecting a jump-slam attack.
    * @param {boolean} isNear Whether the character is within near range.
    * @param {boolean} isFar Whether the character is beyond far range.
    * @returns {number} Slam chance clamped to a sensible range.
    */
    computeSlamChance(isNear, isFar) {
        const boss = this.boss;
        let slamChance = boss.energy <= 30 ? 0.55 : boss.energy <= 50 ? 0.4 : 0.25;
        if (isNear) slamChance += 0.15;
        if (isFar) slamChance -= 0.1;
        return Math.max(0.1, Math.min(0.8, slamChance));
    }

    /**
    * Starts a dash-style attack with windup, then enables dash movement.
    */
    startDashAttack() {
        const boss = this.boss;
        if (boss.dead) return;

        this.beginDashAttackState();
        this.scheduleWindup(() => this.startDash(), this.getWindupMs());

        const totalAttackMs = this.getWindupMs() + this.getDashTimeMs() + 260;
        boss.clearTimeoutSafe('attackTimeout');
        boss.attackTimeout = setTimeout(() => this.endAttack(), totalAttackMs);
    }

    /**
    * Initializes boss state and clears relevant timers for a dash attack.
    */
    beginDashAttackState() {
        const boss = this.boss;
        boss.isAttacking = true;
        boss.isJumpSlamming = false;
        boss.isDashing = false;
        boss.dashProgress = 0;

        boss.clearTimeoutSafe('windupTimeout');
        boss.clearTimeoutSafe('attackTimeout');
    }

    /**
    * Starts a jump-slam attack: windup, lift, slam, damage application, then end.
    */
    startJumpSlamAttack() {
        const boss = this.boss;
        if (boss.dead) return;

        boss.isAttacking = true;
        boss.isDashing = false;
        boss.dashProgress = 0;

        boss.isJumpSlamming = true;
        boss.clearTimeoutSafe('windupTimeout');
        boss.clearTimeoutSafe('attackTimeout');
        boss.clearTimeoutSafe('slamTimeout');

        const windup = Math.max(160, this.getWindupMs() - 140);
        this.scheduleWindup(() => this.performJumpSlam(), windup);

        boss.attackTimeout = setTimeout(() => this.endAttack(), windup + 900);
    }

    /**
    * Schedules a windup callback, guarded so it won't run if the boss dies first.
    * @param {Function} fn Callback to run after windup.
    * @param {number} ms Windup duration in milliseconds.
    */
    scheduleWindup(fn, ms) {
        const boss = this.boss;
        boss.windupTimeout = setTimeout(() => {
            if (boss.dead) return;
            fn();
        }, ms);
    }

    /**
    * Performs the jump-slam sequence: lift up, then schedule the slam down.
    */
    performJumpSlam() {
        const boss = this.boss;
        this.liftForSlam();

        boss.slamTimeout = setTimeout(() => {
            if (boss.dead) return;
            this.executeSlam();
        }, boss.energy <= 30 ? 310 : 400);
    }

    /**
    * Moves the boss upward to the slam lift position.
    */
    liftForSlam() {
        const boss = this.boss;
        boss.y = boss.baseY - boss.slamLift;
    }

    /**
    * Executes the slam: returns boss to base height, applies damage, and ends the attack.
    */
    executeSlam() {
        const boss = this.boss;
        boss.y = boss.baseY;
        this.applySlamDamage();
        this.endAttack();
    }

    /**
    * Applies slam damage to the character if within radius and not invincible.
    */
    applySlamDamage() {
        const boss = this.boss;
        const world = boss.getWorld();
        const character = world?.character;
        if (!character) return;

        const distance = this.distanceCenters(boss, character);
        if (distance > boss.slamRadius) return;
        if (this.isCharacterInvincible(character)) return;

        this.damageCharacterFromSlam(character);
        this.updateCharacterHealthUI(world, character);
    }

    /**
    * Checks whether the character is currently invincible.
    * @param {object} character The player character instance.
    * @returns {boolean} True if invincible, otherwise false.
    */
    isCharacterInvincible(character) {
        return typeof character.isInvincible === 'function' && character.isInvincible();
    }

    /**
    * Deals slam damage and grants post-hit invincibility if supported by the character.
    * @param {object} character The player character instance.
    */
    damageCharacterFromSlam(character) {
        if (typeof character.hit === 'function') character.hit();
        if (typeof character.grantInvincibility === 'function') character.grantInvincibility(1200);
    }

    /**
    * Updates the world's health status bar if present.
    * @param {object} worldRef The world instance.
    * @param {object} character The player character instance.
    */
    updateCharacterHealthUI(worldRef, character) {
        if (worldRef?.statusBarHealth?.setPercentage) {
            worldRef.statusBarHealth.setPercentage(character.energy);
        }
    }

    /**
    * Estimates how long the dash movement will take based on dash distance and speed.
    * @returns {number} Dash time in milliseconds.
    */
    getDashTimeMs() {
        const boss = this.boss;
        const steps = Math.ceil(boss.dashDistance / boss.dashSpeed);
        return steps * 140;
    }

    /**
    * Returns the pre-attack windup duration (ms) based on remaining energy.
    * @returns {number} Windup duration in milliseconds.
    */
    getWindupMs() {
        const energy = this.boss.energy;
        if (energy <= 30) return 180;
        if (energy <= 50) return 260;
        return 420;
    }

    /**
    * Initializes dash direction, enables dashing, and configures optional dash chaining.
    */
    startDash() {
        const boss = this.boss;
        this.setDashDirection();

        boss.isDashing = true;
        boss.dashProgress = 0;

        this.setDashChaining();
    }

    /**
    * Sets dash direction toward the character if available; otherwise uses a default direction.
    */
    setDashDirection() {
        const boss = this.boss;
        const world = boss.getWorld?.();
        const character = world?.character;

        if (!character) {
            boss.dashDir = -1 * boss.DIR;
            return;
        }

        const bossCenter = boss.x + boss.width / 2;
        const charCenter = character.x + character.width / 2;
        const dx = (charCenter - bossCenter) * boss.DIR;

        boss.dashDir = (dx < 0 ? -1 : 1) * boss.DIR;
        boss.otherDirection = dx < 0;
    }

    /**
    * Determines whether the boss will chain additional dashes (enraged only).
    */
    setDashChaining() {
        const boss = this.boss;
        if (boss.isEnraged && Math.random() < 0.35) {
            boss.dashChainRemaining = 1 + (Math.random() < 0.25 ? 1 : 0);
        } else {
            boss.dashChainRemaining = 0;
        }
    }

    /**
    * Advances dash movement by one tick, handling completion and chained dashes.
    */
    performDash() {
        const boss = this.boss;
        const effectiveDistance = this.getEffectiveDashDistance();

        if (boss.dashProgress >= effectiveDistance) return this.handleDashCompletion();

        boss.x += boss.dashDir * boss.dashSpeed;
        boss.dashProgress += boss.dashSpeed;
    }

    /**
    * Returns the dash distance to use for this dash (shorter when chaining).
    * @returns {number} Effective dash distance.
    */
    getEffectiveDashDistance() {
        const boss = this.boss;
        if (boss.dashChainRemaining > 0) return Math.max(110, Math.floor(boss.dashDistance * 0.55));
        return boss.dashDistance;
    }

    /**
    * Handles dash completion, either queuing a chained dash or stopping dashing.
    */
    handleDashCompletion() {
        const boss = this.boss;
        if (boss.dashChainRemaining > 0) return this.queueNextChainedDash();
        boss.isDashing = false;
    }

    /**
    * Queues the next chained dash after a short windup and pauses dashing in-between.
    */
    queueNextChainedDash() {
        const boss = this.boss;

        boss.dashChainRemaining--;
        boss.dashProgress = 0;

        boss.clearTimeoutSafe('windupTimeout');
        boss.windupTimeout = setTimeout(() => {
            if (!boss.dead && boss.isAttacking) {
                boss.isDashing = true;
                boss.dashProgress = 0;
            }
        }, boss.energy <= 30 ? 130 : 170);

        boss.isDashing = false;
    }

    /**
    * Ends the current attack and resets attack-related state and timers.
    */
    endAttack() {
        const boss = this.boss;
        boss.isAttacking = false;
        boss.isDashing = false;
        boss.isJumpSlamming = false;
        boss.dashProgress = 0;
        boss.dashChainRemaining = 0;
        boss.y = boss.baseY;

        boss.clearTimeoutSafe('windupTimeout');
        boss.clearTimeoutSafe('slamTimeout');
        boss.attackTimeout = null;
    }
}
