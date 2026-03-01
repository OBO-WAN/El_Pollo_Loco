/**
 * Handles collision checks and collision-driven gameplay (damage, stomps, collectibles).
 */
class WorldCollisions {
    constructor(world) {
        this.world = world;
    }

    /**
     * Runs all collision and collectible checks for the current tick.
     * @returns {void}
     */
    tickCollisionsAndCollectibles() {
        this.checkCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkBottleEnemyCollisions();
    }

    /**
     * Checks collisions between the character and enemies.
     * @returns {void}
     */
    checkCollisions() {
        this.updateBossFightState();
        this.world.level.enemies.forEach((enemy) => this.handleEnemyCollision(enemy));
    }

    /**
     * Activates boss-fight mode once the character reaches the boss zone.
     * @returns {void}
     */
    updateBossFightState() {
        const world = this.world;
        if (world.character.x > 2000 && !world.isBossFight) {
            world.isBossFight = true;
        }
    }

    /**
     * Resolves collision logic between the character and a single enemy.
     * @param {any} enemy Enemy instance to test.
     * @returns {void}
     */
    handleEnemyCollision(enemy) {
        const world = this.world;
        if (!this.isEnemyCollidable(enemy)) return;
        if (!world.character.isColliding(enemy)) return;
        if (this.tryHandleStomp(enemy)) return;
        this.handleContactDamage(enemy);
    }

    /**
     * Determines whether an enemy can currently be collided with.
     * @param {any} enemy Enemy instance to test.
     * @returns {boolean}
     */
    isEnemyCollidable(enemy) {
        return enemy && !enemy.dead;
    }

    /**
     * Checks whether an enemy is a chicken type.
     * @param {any} enemy Enemy instance to test.
     * @returns {boolean}
     */
    isChicken(enemy) {
        return enemy instanceof Chicken || enemy instanceof Chicken2;
    }

    /**
     * Checks whether an enemy is the endboss.
     * @param {any} enemy Enemy instance to test.
     * @returns {boolean}
     */
    isBoss(enemy) {
        return enemy instanceof Endboss;
    }

    /**
     * Checks whether the character is stomping the enemy from above.
     * @param {any} enemy Enemy instance to test.
     * @returns {boolean}
     */
    isStompFromAbove(enemy) {
        const character = this.world.character;
        const characterBottom = character.y + character.height - (character.offset?.bottom ?? 0);
        const enemyTop = enemy.y + (enemy.offset?.top ?? 0);
        return character.isFalling?.() && characterBottom <= enemyTop + 35;
    }

    /**
     * Attempts to resolve a stomp (jumping on an enemy).
     * @param {any} enemy Enemy instance being stomped.
     * @returns {boolean} True if stomp handling was applied.
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
     * Resolves a stomp on a chicken enemy.
     * @param {any} enemy Chicken enemy instance.
     * @returns {void}
     */
    handleChickenStomp(enemy) {
        const world = this.world;
        const IFRAME_CHICKEN = 300;
        enemy.die();
        world.character.speedY = 15;
        world.character.grantInvincibility?.(IFRAME_CHICKEN);
        this.removeEnemyAfter(enemy, 600);
    }

    /**
     * Resolves a stomp on the endboss.
     * @param {any} enemy Endboss instance.
     * @returns {void}
     */
    handleBossStomp(enemy) {
        const world = this.world;
        const IFRAME_BOSS = 900;
        enemy.hit();
        world.statusBarEndboss?.setPercentage?.(enemy.energy);
        world.character.speedY = 15;
        world.character.grantInvincibility?.(IFRAME_BOSS);
    }

    /**
     * Applies contact damage to the character.
     * @param {any} enemy Enemy instance that caused the hit.
     * @returns {void}
     */
    handleContactDamage(enemy) {
        const world = this.world;
        if (world.character.isInvincible?.()) return;
        const IFRAME_CHICKEN = 300;
        const IFRAME_BOSS = 900;
        world.character.hit(20, 2500);
        const iframe = this.isBoss(enemy) ? IFRAME_BOSS : IFRAME_CHICKEN;
        world.character.grantInvincibility?.(iframe);
        world.statusBarHealth.setPercentage(world.character.energy);
    }

    /**
     * Removes an enemy after a delay (allows death animation time).
     * @param {any} enemy Enemy instance to remove.
     * @param {number} [ms=600] Delay in milliseconds.
     * @returns {void}
     */
    removeEnemyAfter(enemy, ms = 600) {
        const world = this.world;
        setTimeout(() => {
            const index = world.level.enemies.indexOf(enemy);
            if (index > -1) world.level.enemies.splice(index, 1);
        }, ms);
    }

    /**
     * Checks coin collisions, updates HUD and plays a sound.
     * @returns {void}
     */
    checkCoinCollisions() {
        const world = this.world;
        for (let i = world.level.coins.length - 1; i >= 0; i--) {
            const coin = world.level.coins[i];
            if (world.character.isColliding(coin)) {
                world.level.coins.splice(i, 1);
                world.coins++;
                const coinPercent = Math.min(100, world.coins * 20);
                world.statusBarCoins.setPercentage(coinPercent);
                world.audio.playSound(world.audio.coinSound);
            }
        }
    }

    /**
     * Checks bottle collisions for both level bottles and landed thrown bottles.
     * @returns {void}
     */
    checkBottleCollisions() {
        this.collectLevelBottles();
        this.collectLandedThrownBottles();
    }

    /**
     * Collects bottles placed in the level.
     * @returns {void}
     */
    collectLevelBottles() {
        const world = this.world;
        for (let i = world.level.bottles.length - 1; i >= 0; i--) {
            const bottle = world.level.bottles[i];
            if (!world.character.isColliding(bottle)) continue;
            this.stopBottleAnimationIfAny(bottle);
            world.level.bottles.splice(i, 1);
            this.addBottleToInventory();
        }
    }

    /**
     * Collects thrown bottles that have landed and are colliding with the character.
     * @returns {void}
     */
    collectLandedThrownBottles() {
        const world = this.world;
        for (let i = world.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = world.throwableObjects[i];
            if (!this.isThrowableBottleLanded(bottle)) continue;
            if (!world.character.isColliding(bottle)) continue;
            this.collectThrownBottle(i, bottle);
        }
    }

    /**
     * Checks whether a thrown bottle has landed.
     * @param {any} bottle Thrown bottle instance.
     * @returns {boolean}
     */
    isThrowableBottleLanded(bottle) {
        return bottle.speedY === 0;
    }

    /**
     * Removes a landed thrown bottle and adds it to the inventory.
     * @param {number} index Index in throwableObjects.
     * @param {any} bottle Thrown bottle instance.
     * @returns {void}
     */
    collectThrownBottle(index, bottle) {
        const world = this.world;
        bottle.stop?.();
        world.throwableObjects.splice(index, 1);
        this.addBottleToInventory();
    }

    /**
     * Stops a bottle animation interval if it exists.
     * @param {any} bottle Bottle instance.
     * @returns {void}
     */
    stopBottleAnimationIfAny(bottle) {
        if (bottle.animationInterval) clearInterval(bottle.animationInterval);
    }

    /**
     * Adds a bottle to inventory, updates HUD and plays a sound.
     * @returns {void}
     */
    addBottleToInventory() {
        const world = this.world;
        world.bottles++;
        const bottlePercent = Math.min(100, world.bottles * 20);
        world.statusBarBottles.setPercentage(bottlePercent);
        world.audio.playSound(world.audio.bottleSound);
    }

    /**
     * Checks collisions between thrown bottles and enemies.
     * @returns {void}
     */
    checkBottleEnemyCollisions() {
        const hit = this.findBottleEnemyHit();
        if (!hit) return;
        this.resolveBottleEnemyHit(hit);
    }

    /**
     * Finds the first thrown-bottle/enemy collision.
     * @returns {{bottleIndex:number, enemyIndex:number, bottle:any, enemy:any}|null}
     */
    findBottleEnemyHit() {
        const world = this.world;
        for (let i = world.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = world.throwableObjects[i];
            for (let j = world.level.enemies.length - 1; j >= 0; j--) {
                const enemy = world.level.enemies[j];
                if (bottle.isColliding(enemy)) {
                    return { bottleIndex: i, enemyIndex: j, bottle, enemy };
                }
            }
        }
        return null;
    }

    /**
     * Resolves a thrown-bottle/enemy collision.
     * @param {{bottleIndex:number, enemyIndex:number, bottle:any, enemy:any}} hit
     * @returns {void}
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
     * Stops and removes a thrown bottle.
     * @param {number} index Index in throwableObjects.
     * @param {any} bottle Thrown bottle instance.
     * @returns {void}
     */
    stopAndRemoveThrownBottle(index, bottle) {
        const world = this.world;
        bottle.stop?.();
        world.throwableObjects.splice(index, 1);
    }

    /**
     * Damages the endboss and updates its HUD.
     * @param {any} enemy Endboss instance.
     * @returns {void}
     */
    damageBoss(enemy) {
        const world = this.world;
        enemy.hit();
        world.statusBarEndboss?.setPercentage?.(enemy.energy);
    }

    /**
     * Removes an enemy from the level enemy list.
     * @param {number} index Index in enemies array.
     * @returns {void}
     */
    removeEnemy(index) {
        this.world.level.enemies.splice(index, 1);
    }

    /**
     * Resolves the case where the character is stuck inside the endboss body.
     * Applies contact damage if not stomping from above.
     * @returns {void}
     */
    resolveEndbossWall() {
        if (!this.canResolveEndbossWall()) return;
        const collisionInfo = this.getEndbossCollisionInfo();
        if (!collisionInfo) return;
        this.applyEndbossContactDamageIfNeeded(collisionInfo);
        this.pushCharacterOutOfEndboss(collisionInfo);
    }

    /**
     * Checks whether the endboss wall resolution can run.
     * @returns {boolean}
     */
    canResolveEndbossWall() {
        const world = this.world;
        return !!world.endboss && !world.endboss.dead;
    }

    /**
     * Computes collision details between character and endboss.
     * @returns {{character:any,endboss:any,stompFromAbove:boolean}|null}
     */
    getEndbossCollisionInfo() {
        const world = this.world;
        const character = world.character;
        const endboss = world.endboss;
        if (!character.isColliding(endboss)) return null;
        const characterBottom = character.y + character.height - (character.offset?.bottom ?? 0);
        const endbossTop = endboss.y + (endboss.offset?.top ?? 0);
        const stompFromAbove = character.isFalling?.() && characterBottom <= endbossTop + 35;
        return { character, endboss, stompFromAbove };
    }

    /**
     * Applies endboss contact damage if the character is not stomping.
     * @param {{character:any, stompFromAbove:boolean}} info Collision info.
     * @returns {void}
     */
    applyEndbossContactDamageIfNeeded({ character, stompFromAbove }) {
        const world = this.world;
        if (stompFromAbove) return;
        if (character.isInvincible?.()) return;
        character.hit(10);
        character.grantInvincibility?.(400);
        world.statusBarHealth.setPercentage(character.energy);
    }

    /**
     * Pushes the character out of the endboss collision box.
     * @param {{character:any,endboss:any}} info Collision info.
     * @returns {void}
     */
    pushCharacterOutOfEndboss({ character, endboss }) {
        const padding = 6;
        const characterCenter = character.x + character.width / 2;
        const endbossCenter = endboss.x + endboss.width / 2;
        if (characterCenter < endbossCenter) {
            character.x = endboss.x - character.width + padding;
        } else {
            character.x = endboss.x + endboss.width - padding;
        }
    }
}
