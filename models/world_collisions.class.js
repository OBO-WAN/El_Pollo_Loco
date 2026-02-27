/**
 * Handles collision detection and collision-driven gameplay (collectibles, damage, stomp logic).
 */
class WorldCollisions {

    constructor(world) {
        this.world = world;
    }

    /**
     * Runs all collision and collision-driven checks for the current tick.
     */
    tickCollisionsAndCollectibles() {
        this.checkCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkBottleEnemyCollisions();
    }

    /**
     * Checks collisions between the character and enemies.
     */
    checkCollisions() {
        this.updateBossFightState();
        this.world.level.enemies.forEach((enemy) => this.handleEnemyCollision(enemy));
    }

    /**
     * Enables boss fight logic when the player reaches the boss zone.
     */
    updateBossFightState() {
        const w = this.world;
        if (w.character.x > 2000 && !w.isBossFight) {
            w.isBossFight = true;
        }
    }

    /**
     * @param {any} enemy
     */
    handleEnemyCollision(enemy) {
        const w = this.world;
        if (!this.isEnemyCollidable(enemy)) return;
        if (!w.character.isColliding(enemy)) return;
        if (this.tryHandleStomp(enemy)) return;
        this.handleContactDamage(enemy);
    }

    /**
     * @param {any} enemy
     * @returns {boolean}
     */
    isEnemyCollidable(enemy) {
        return enemy && !enemy.dead;
    }

    /**
     * @param {any} enemy
     * @returns {boolean}
     */
    isChicken(enemy) {
        return enemy instanceof Chicken || enemy instanceof Chicken2;
    }

    /**
     * @param {any} enemy
     * @returns {boolean}
     */
    isBoss(enemy) {
        return enemy instanceof Endboss;
    }

    /**
     * @param {any} enemy
     * @returns {boolean}
     */
    isStompFromAbove(enemy) {
        const c = this.world.character;
        const cBottom = c.y + c.height - (c.offset?.bottom ?? 0);
        const eTop = enemy.y + (enemy.offset?.top ?? 0);

        return c.isFalling?.() && cBottom <= eTop + 35;
    }

    /**
     * Attempts to resolve a stomp (jumping on an enemy).
     * @param {any} enemy
     * @returns {boolean} True if handled as a stomp.
     */
    tryHandleStomp(enemy) {
        if (!this.isStompFromAbove(enemy)) return false;

        if (this.isChicken(enemy)) {
            this.handleChickenStomp(enemy);
            return true;
        }

        if (this.isBoss(enemy)) {
            this.handleBossStomp(enemy);
            return true;
        }

        return false;
    }

    /**
     * @param {any} enemy
     */
    handleChickenStomp(enemy) {
        const w = this.world;
        const IFRAME_CHICKEN = 300;

        enemy.die();
        w.character.speedY = 15;
        w.character.grantInvincibility?.(IFRAME_CHICKEN);

        this.removeEnemyAfter(enemy, 600);
    }

    /**
     * @param {any} enemy
     */
    handleBossStomp(enemy) {
        const w = this.world;
        const IFRAME_BOSS = 900;

        enemy.hit();
        w.statusBarEndboss?.setPercentage?.(enemy.energy);

        w.character.speedY = 15;
        w.character.grantInvincibility?.(IFRAME_BOSS);
    }

    /**
     * Applies contact damage to the player.
     * @param {any} enemy
     */
    handleContactDamage(enemy) {
        const w = this.world;
        if (w.character.isInvincible?.()) return;

        const IFRAME_CHICKEN = 300;
        const IFRAME_BOSS = 900;

        w.character.hit(20, 2500);

        const iframe = this.isBoss(enemy) ? IFRAME_BOSS : IFRAME_CHICKEN;
        w.character.grantInvincibility?.(iframe);
        w.statusBarHealth.setPercentage(w.character.energy);
    }

    /**
     * Removes an enemy after a delay (used for death animation time).
     * @param {any} enemy
     * @param {number} ms
     */
    removeEnemyAfter(enemy, ms = 600) {
        const w = this.world;

        setTimeout(() => {
            const idx = w.level.enemies.indexOf(enemy);
            if (idx > -1) w.level.enemies.splice(idx, 1);
        }, ms);
    }

    /**
     * Checks coin collisions and updates HUD + sound.
     */
    checkCoinCollisions() {
        const w = this.world;

        for (let i = w.level.coins.length - 1; i >= 0; i--) {
            const coin = w.level.coins[i];

            if (w.character.isColliding(coin)) {
                w.level.coins.splice(i, 1);
                w.coins++;

                const coinPercent = Math.min(100, w.coins * 20);
                w.statusBarCoins.setPercentage(coinPercent);

                w.audio.playSound(w.audio.coinSound);
            }
        }
    }

    /**
     * Checks bottle collisions for both level bottles and landed thrown bottles.
     */
    checkBottleCollisions() {
        this.collectLevelBottles();
        this.collectLandedThrownBottles();
    }

    /**
     * Collects bottles placed in the level.
     */
    collectLevelBottles() {
        const w = this.world;

        for (let i = w.level.bottles.length - 1; i >= 0; i--) {
            const bottle = w.level.bottles[i];
            if (!w.character.isColliding(bottle)) continue;

            this.stopBottleAnimationIfAny(bottle);
            w.level.bottles.splice(i, 1);
            this.addBottleToInventory();
        }
    }

    /**
     * Collects thrown bottles that have landed and are colliding with the character.
     */
    collectLandedThrownBottles() {
        const w = this.world;

        for (let i = w.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = w.throwableObjects[i];
            if (!this.isThrowableBottleLanded(bottle)) continue;
            if (!w.character.isColliding(bottle)) continue;

            this.collectThrownBottle(i, bottle);
        }
    }

    /**
     * @param {any} bottle
     * @returns {boolean}
     */
    isThrowableBottleLanded(bottle) {
        return bottle.speedY === 0;
    }

    /**
     * @param {number} index
     * @param {any} bottle
     */
    collectThrownBottle(index, bottle) {
        const w = this.world;

        bottle.stop?.();
        w.throwableObjects.splice(index, 1);
        this.addBottleToInventory();
    }

    /**
     * @param {any} bottle
     */
    stopBottleAnimationIfAny(bottle) {
        if (bottle.animationInterval) clearInterval(bottle.animationInterval);
    }

    /**
     * Adds a bottle to the player's inventory, updates HUD and plays sound.
     */
    addBottleToInventory() {
        const w = this.world;
        w.bottles++;
        const bottlePercent = Math.min(100, w.bottles * 20);
        w.statusBarBottles.setPercentage(bottlePercent);
        w.audio.playSound(w.audio.bottleSound);
    }

    /**
     * Checks collisions between thrown bottles and enemies.
     */
    checkBottleEnemyCollisions() {
        const hit = this.findBottleEnemyHit();
        if (!hit) return;
        this.resolveBottleEnemyHit(hit);
    }

    /**
     * @returns {{bottleIndex:number, enemyIndex:number, bottle:any, enemy:any}|null}
     */
    findBottleEnemyHit() {
        const w = this.world;

        for (let i = w.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = w.throwableObjects[i];

            for (let j = w.level.enemies.length - 1; j >= 0; j--) {
                const enemy = w.level.enemies[j];

                if (bottle.isColliding(enemy)) {
                    return { bottleIndex: i, enemyIndex: j, bottle, enemy };
                }
            }
        }
        return null;
    }

    /**
     * @param {{bottleIndex:number, enemyIndex:number, bottle:any, enemy:any}} hit
     */
    resolveBottleEnemyHit({ bottleIndex, enemyIndex, bottle, enemy }) {
        this.stopAndRemoveThrownBottle(bottleIndex, bottle);

        if (this.isBoss(enemy)) {
            this.damageBoss(enemy);
        } else {
            this.removeEnemy(enemyIndex);
        }
    }

    /**
     * @param {number} index
     * @param {any} bottle
     */
    stopAndRemoveThrownBottle(index, bottle) {
        const w = this.world;

        bottle.stop?.();
        w.throwableObjects.splice(index, 1);
    }

    /**
     * @param {any} enemy
     */
    damageBoss(enemy) {
        const w = this.world;

        enemy.hit();
        w.statusBarEndboss?.setPercentage?.(enemy.energy);
    }

    /**
     * @param {number} index
     */
    removeEnemy(index) {
        this.world.level.enemies.splice(index, 1);
    }

    /**
     * Resolves the special case where the player gets "stuck" inside the endboss body.
     * Applies contact damage if not stomping from above.
     */
    resolveEndbossWall() {
        if (!this.canResolveEndbossWall()) return;

        const info = this.getEndbossCollisionInfo();
        if (!info) return;

        this.applyEndbossContactDamageIfNeeded(info);
        this.pushCharacterOutOfEndboss(info);
    }

    /**
     * @returns {boolean}
     */
    canResolveEndbossWall() {
        const w = this.world;
        return !!w.endboss && !w.endboss.dead;
    }

    /**
     * @returns {{c:any,b:any,stompFromAbove:boolean}|null}
     */
    getEndbossCollisionInfo() {
        const w = this.world;
        const c = w.character;
        const b = w.endboss;

        if (!c.isColliding(b)) return null;

        const cBottom = c.y + c.height - (c.offset?.bottom ?? 0);
        const bTop = b.y + (b.offset?.top ?? 0);
        const stompFromAbove = c.isFalling?.() && cBottom <= bTop + 35;

        return { c, b, stompFromAbove };
    }

    /**
     * @param {{c:any, stompFromAbove:boolean}} info
     */
    applyEndbossContactDamageIfNeeded({ c, stompFromAbove }) {
        const w = this.world;

        if (stompFromAbove) return;
        if (c.isInvincible?.()) return;

        c.hit(10);
        c.grantInvincibility?.(400);
        w.statusBarHealth.setPercentage(c.energy);
    }

    /**
     * @param {{c:any,b:any}} info
     */
    pushCharacterOutOfEndboss({ c, b }) {
        const padding = 6;

        const cCenter = c.x + c.width / 2;
        const bCenter = b.x + b.width / 2;

        if (cCenter < bCenter) {
            c.x = b.x - c.width + padding;
        } else {
            c.x = b.x + b.width - padding;
        }
    }
}
