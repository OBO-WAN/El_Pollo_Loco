class World {
    character = new Character();
    level;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    coins = 0;
    bottles = 0;
    coinSound = new Audio('assets/audio/coin.mp3');
    bottleSound = new Audio('assets/audio/bottle.mp3');
    throwBottleSound = new Audio('assets/audio/throw_bottle.mp3');
    snoringSound = new Audio('assets/audio/pepe-snoring.mp3');
    winSound = new Audio('assets/audio/win.mp3');
    gameOverSound = new Audio('assets/audio/game_over.mp3');
    statusBarHealth = new StatusBar();
    statusBarCoins = new StatusBar();
    statusBarBottles = new StatusBar();
    isPaused = false;
    collisionInterval = null;
    animationFrameId = null;
    winScheduled = false;
    isGameOver = false;
    idleTimeout = null;
    isSnoring = false;
    isCharacterSleeping = false;
    throwableObjects = [];

    constructor(canvas, keyboard) {
        this.initCanvas(canvas);
        this.initGameState(keyboard);
        this.initLevelAndBoss();
        this.setWorld();

        this.initHud();
        this.setHudPositions();

        this.start();
    }

    initCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }

    initGameState(keyboard) {
        this.keyboard = keyboard;
        this.endbossBarVisible = false;
        this.endbossAttackStarted = false;
    }

    initLevelAndBoss() {
        this.level = initLevel1();
        this.endboss = this.level.enemies.find(e => e instanceof Endboss);
    }

    initHud() {
        this.initStatusBars();
        this.initEndbossStatusBar();
    }

    initEndbossStatusBar() {
        this.statusBarEndboss = new StatusBar();
        this.statusBarEndboss.setImages(this.statusBarEndboss.ENDBOSS_BAR_IMAGES);
        this.statusBarEndboss.setPercentage(100);
    }

    start() {
        this.draw();
        this.run();
    }

    setWorld() {
        this.character.world = this;
        if (this.endboss) this.endboss.world = this;
    }

    run() {
        this.collisionInterval = setInterval(() => {
            if (this.isPaused) return;
            this.tick();
        }, 40);
    }

    tick() {
        this.tickCollisionsAndCollectibles();
        this.tickThrowing();
        this.tickWinLose();
    }

    tickCollisionsAndCollectibles() {
        this.checkCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkBottleEnemyCollisions();
    }

    tickThrowing() {
        this.checkThrowObjects();
    }

    tickWinLose() {
        if (this.character.isDead()) {
            this.gameOver();
            return;
        }

        if (this.isEndbossDefeated()) {
            this.scheduleWinOnce();
        }
    }

    isEndbossDefeated() {
        return !!this.endboss && this.endboss.dead;
    }

    scheduleWinOnce() {
        if (this.winScheduled) return;

        this.winScheduled = true;
        setTimeout(() => this.win(), 700);
    }

    checkThrowObjects() {
        if (this.shouldBlockThrowing()) return;
        if (!this.canThrowBottle()) return;

        this.throwBottle();
    }

    shouldBlockThrowing() {
        if (!this.isCharacterSleeping) return false;

        this.keyboard.SPACE = false;
        return true;
    }

    canThrowBottle() {
        return this.keyboard.SPACE && this.bottles > 0;
    }

    throwBottle() {
        const bottle = this.createThrowableBottle();

        this.throwableObjects.push(bottle);
        this.bottles--;

        this.updateBottleHud();
        this.playSound(this.throwBottleSound);

        this.keyboard.SPACE = false;
    }

    createThrowableBottle() {
        const direction = this.character.otherDirection ? -1 : 1;

        return new ThrowableObject(
            this.character.x + (direction === 1 ? 100 : -20),
            this.character.y + 100,
            direction
        );
    }

    updateBottleHud() {
        const bottlePercent = Math.min(100, this.bottles * 20);
        this.statusBarBottles.setPercentage(bottlePercent);
    }

    checkCollisions() {
        this.updateBossFightState();
        this.level.enemies.forEach((enemy) => this.handleEnemyCollision(enemy));
    }

    updateBossFightState() {
        if (this.character.x > 2000 && !this.isBossFight) {
            this.isBossFight = true;
        }
    }

    handleEnemyCollision(enemy) {
        if (!this.isEnemyCollidable(enemy)) return;
        if (!this.character.isColliding(enemy)) return;

        if (this.tryHandleStomp(enemy)) return;

        this.handleContactDamage(enemy);
    }

    isEnemyCollidable(enemy) {
        return enemy && !enemy.dead;
    }

    isChicken(enemy) {
        return enemy instanceof Chicken || enemy instanceof Chicken2;
    }

    isBoss(enemy) {
        return enemy instanceof Endboss;
    }

    isStompFromAbove(enemy) {
        const c = this.character;
        const cBottom = c.y + c.height - (c.offset?.bottom ?? 0);
        const eTop = enemy.y + (enemy.offset?.top ?? 0);

        return c.isFalling?.() && cBottom <= eTop + 35;
    }

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

    handleChickenStomp(enemy) {
        const IFRAME_CHICKEN = 300;

        enemy.die();
        this.character.speedY = 15;
        this.character.grantInvincibility?.(IFRAME_CHICKEN);

        this.removeEnemyAfter(enemy, 600);
    }

    handleBossStomp(enemy) {
        const IFRAME_BOSS = 900;

        enemy.hit();
        this.statusBarEndboss?.setPercentage?.(enemy.energy);

        this.character.speedY = 15;
        this.character.grantInvincibility?.(IFRAME_BOSS);
    }

    handleContactDamage(enemy) {
        if (this.character.isInvincible?.()) return;

        const IFRAME_CHICKEN = 300;
        const IFRAME_BOSS = 900;

        this.character.hit(20, 2500);

        const iframe = this.isBoss(enemy) ? IFRAME_BOSS : IFRAME_CHICKEN;
        this.character.grantInvincibility?.(iframe);

        this.statusBarHealth.setPercentage(this.character.energy);
    }

    removeEnemyAfter(enemy, ms = 600) {
        setTimeout(() => {
            const idx = this.level.enemies.indexOf(enemy);
            if (idx > -1) this.level.enemies.splice(idx, 1);
        }, ms);
    }

    checkCoinCollisions() {
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];

            if (this.character.isColliding(coin)) {
                this.level.coins.splice(i, 1);
                this.coins++;
                const coinPercent = Math.min(100, this.coins * 20);
                this.statusBarCoins.setPercentage(coinPercent);
                this.playSound(this.coinSound);
            }
        }
    }

    checkBottleCollisions() {
        this.collectLevelBottles();
        this.collectLandedThrownBottles();
    }

    collectLevelBottles() {
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottle = this.level.bottles[i];
            if (!this.character.isColliding(bottle)) continue;

            this.stopBottleAnimationIfAny(bottle);
            this.level.bottles.splice(i, 1);
            this.addBottleToInventory();
        }
    }

    collectLandedThrownBottles() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];
            if (!this.isThrowableBottleLanded(bottle)) continue;
            if (!this.character.isColliding(bottle)) continue;

            this.collectThrownBottle(i, bottle);
        }
    }

    isThrowableBottleLanded(bottle) {
        return bottle.speedY === 0;
    }

    collectThrownBottle(index, bottle) {
        bottle.stop?.();
        this.throwableObjects.splice(index, 1);
        this.addBottleToInventory();
    }

    stopBottleAnimationIfAny(bottle) {
        if (bottle.animationInterval) clearInterval(bottle.animationInterval);
    }

    addBottleToInventory() {
        this.bottles++;
        const bottlePercent = Math.min(100, this.bottles * 20);
        this.statusBarBottles.setPercentage(bottlePercent);
        this.playSound(this.bottleSound);
    }

    checkBottleEnemyCollisions() {
        const hit = this.findBottleEnemyHit();
        if (!hit) return;

        this.resolveBottleEnemyHit(hit);
    }

    findBottleEnemyHit() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                if (bottle.isColliding(enemy)) {
                    return { bottleIndex: i, enemyIndex: j, bottle, enemy };
                }
            }
        }
        return null;
    }

    resolveBottleEnemyHit({ bottleIndex, enemyIndex, bottle, enemy }) {
        this.stopAndRemoveThrownBottle(bottleIndex, bottle);

        if (this.isBoss(enemy)) {
            this.damageBoss(enemy);
        } else {
            this.removeEnemy(enemyIndex);
        }
    }

    stopAndRemoveThrownBottle(index, bottle) {
        bottle.stop?.();
        this.throwableObjects.splice(index, 1);
    }

    damageBoss(enemy) {
        enemy.hit();
        this.statusBarEndboss?.setPercentage?.(enemy.energy);
    }

    removeEnemy(index) {
        this.level.enemies.splice(index, 1);
    }

    checkEndbossBarTrigger() {
        if (!this.endboss || this.endbossBarVisible) return;

        const triggerDistance = 600;
        if (this.character.x >= this.endboss.x - triggerDistance) {
            this.endbossBarVisible = true;
        }
    }

    gameOver() {
        this.finishGame({
            overlayId: 'gameOverOverlay',
            sound: this.gameOverSound,
        });
    }

    win() {
        this.finishGame({
            overlayId: 'winOverlay',
            sound: this.winSound,
        });
    }

    finishGame({ overlayId, sound }) {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.isPaused = true;
        this.endbossAttackStarted = false;

        this.stopLoops();
        this.stopSnoring();

        if (typeof stopBackgroundMusic === 'function') {
            stopBackgroundMusic();
        }

        this.playSound(sound);

        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.style.display = 'flex';
    }

    // Main loop
    draw() {
        if (this.isPaused) {
            this.animationFrameId = null;
            return;
        }
        this.clearCanvas();
        this.update();
        this.render();

        this.animationFrameId = requestAnimationFrame(() => this.draw());
    }

    // ----- UPDATE (logic) -----

    update() {
        if (this.isPaused) return;

        this.updateBossPhase();
        this.updateCharacter();
        this.updateWorld();
        this.updateAmbientState();
    }

    updateBossPhase() {
        this.checkEndbossBarTrigger();
        this.startEndbossAttackIfNeeded();
    }

    startEndbossAttackIfNeeded() {
        if (!this.endbossBarVisible) return;
        if (!this.endboss) return;
        if (this.endbossAttackStarted) return;

        this.endbossAttackStarted = true;
        this.endboss.startAttackCycle();
    }

    updateCharacter() {
        this.handleCharacterMovement();
        this.resolveEndbossWall();
        this.clampCharacterToWorld();
    }

    updateWorld() {
        this.updateCamera();
        this.moveEnemies();
    }

    updateAmbientState() {
        this.checkIdleState();
    }

    checkIdleState() {
        if (this.shouldSkipIdleCheck()) return;

        if (this.isCharacterMoving()) {
            this.resetIdleTimer();
            return;
        }

        this.startIdleCountdownIfNeeded();
    }

    shouldSkipIdleCheck() {
        if (this.isPaused || this.character.isDead()) {
            this.stopSnoring();
            return true;
        }
        return false;
    }

    isCharacterMoving() {
        return (
            this.keyboard.LEFT ||
            this.keyboard.RIGHT ||
            this.keyboard.UP ||
            this.keyboard.SPACE
        );
    }

    startIdleCountdownIfNeeded() {
        if (this.idleTimeout || this.isSnoring) return;

        this.idleTimeout = setTimeout(() => {
            this.startSnoring();
        }, 3000);
    }

    handleCharacterMovement() {
        if (this.keyboard.RIGHT && this.character.x < this.level.level_end_x) {
            this.character.moveRight();
            this.character.otherDirection = false;
        } else if (this.keyboard.LEFT && this.character.x > 0) {
            this.character.moveLeft();
            this.character.otherDirection = true;
        }
    }

    updateCamera() {
        this.camera_x = -this.character.x + 100;
    }

    moveEnemies() {
        this.level.enemies.forEach(enemy => {
            if (enemy instanceof Endboss) {
                enemy.followCharacter?.(this.character, { active: this.isBossFight || this.endbossBarVisible });
            } else {
                enemy.moveLeft();
            }
        });
    }

    // ----- RENDER (drawing) -----

    clearCanvas() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    render() {
        const aboveUi = this.shouldCharacterDrawAboveUi();
        this.drawWorldLayer(aboveUi);
        this.drawUiLayer();
        this.drawOverlayLayer(aboveUi);
    }

    drawWorldLayer(aboveUi) {
        this.drawBackground();

        this.withCamera(() => {
            this.drawClouds();
            this.drawEnemies();
            this.drawBottles();
            this.drawCoins();
            this.drawBottlesOnGround();
            if (!aboveUi) {
                this.drawCharacter();
            }
        });
    }

    drawUiLayer() {
        const v = this.view;
        if (!v) return;
        this.ctx.save();
        this.ctx.setTransform(v.dpr * v.scale, 0, 0, v.dpr * v.scale, 0, 0);
        this.drawStatusBar();
        this.ctx.restore();
    }

    drawOverlayLayer(aboveUi) {
        if (!aboveUi) return;
        this.withCamera(() => this.drawCharacter());
    }

    shouldCharacterDrawAboveUi() {
        return this.character?.isInAir?.() === true;
    }

    withCamera(fn) {
        this.ctx.save();
        this.ctx.translate(Math.floor(this.camera_x), 0);
        fn();
        this.ctx.restore();
    }

    drawBackground() {
        const groups = new Map();

        this.level.backgroundObjects.forEach(obj => {
            const factor = obj.parallaxFactor ?? 1;
            if (!groups.has(factor)) groups.set(factor, []);
            groups.get(factor).push(obj);
        });

        for (const [factor, objects] of groups.entries()) {
            this.ctx.save();
            const tx = Math.floor(this.camera_x * factor);
            this.ctx.translate(tx, 0);
            this.addObjectsToMap(objects);
            this.ctx.restore();
        }
    }

    drawCharacter() {
        this.addToMap(this.character);
    }

    drawClouds() {
        this.addObjectsToMap(this.level.clouds);
    }

    drawEnemies() {
        this.addObjectsToMap(this.level.enemies);
    }
    drawStatusBar() {
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        if (this.endbossBarVisible && this.endboss && !this.endboss.dead) {
            this.addToMap(this.statusBarEndboss);
        }
    }

    drawBottles() {
        this.addObjectsToMap(this.throwableObjects);
    }

    drawCoins() {
        this.addObjectsToMap(this.level.coins);
    }
    drawBottlesOnGround() {
        this.addObjectsToMap(this.level.bottles);
    }

    // ----- helpers -----
    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        } else {
            mo.draw(this.ctx);
        }
        if (mo.drawFrame) mo.drawFrame(this.ctx);
    }

    flipImage(mo) {
        if (!mo.img) return;

        this.ctx.save();
        this.ctx.translate(mo.x + mo.width, 0);
        this.ctx.scale(-1, 1);

        const oldX = mo.x;
        mo.x = 0;
        mo.draw(this.ctx);
        mo.x = oldX;

        this.ctx.restore();
    }

    resetIdleTimer() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
        this.isCharacterSleeping = false;
        this.stopSnoring();
    }

    startSnoring() {
        if (this.isSnoring) return;
        this.isCharacterSleeping = true;
        this.snoringSound.loop = true;
        this.snoringSound.volume = 0.4;
        this.snoringSound.muted = isMuted;
        this.snoringSound.currentTime = 0;
        this.snoringSound.play().catch(() => { });
        this.isSnoring = true;
    }

    stopSnoring() {
        this.snoringSound.pause();
        this.snoringSound.currentTime = 0;

        this.isSnoring = false;
        this.isCharacterSleeping = false;

        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
    }

    stopLoops() {
        if (this.collisionInterval) clearInterval(this.collisionInterval);
        this.collisionInterval = null;

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }


    playSound(audio, { restart = true } = {}) {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (!audio) return;

        if (restart) audio.currentTime = 0;
        audio.play().catch(() => { });
    }

    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;

        if (!this.animationFrameId) {
            this.draw();
        }
    }

    setHudPositions() {
        const PAD = 20;
        const viewportW = this.view?.logicalViewportW ?? 720;
        const coinY = this.statusBarCoins?.y ?? 60;

        if (this.statusBarEndboss) {
            this.statusBarEndboss.x = viewportW - PAD - this.statusBarEndboss.width;
            this.statusBarEndboss.y = coinY;
        }
    }

    initStatusBars() {
        // Health
        this.statusBarHealth.setImages(this.statusBarHealth.HEALTH_BAR_IMAGES);
        this.statusBarHealth.setPercentage(this.character.energy);
        this.statusBarHealth.x = 20;
        this.statusBarHealth.y = 10;

        // Coins
        this.statusBarCoins.setImages(this.statusBarCoins.COIN_BAR_IMAGES);
        this.statusBarCoins.setPercentage(0);
        this.statusBarCoins.x = 20;
        this.statusBarCoins.y = 60;

        // Bottles
        this.statusBarBottles.setImages(this.statusBarBottles.BOTTLE_BAR_IMAGES);
        this.statusBarBottles.setPercentage(0);
        this.statusBarBottles.x = 20;
        this.statusBarBottles.y = 110;
    }

    resolveEndbossWall() {
        if (!this.canResolveEndbossWall()) return;

        const info = this.getEndbossCollisionInfo();
        if (!info) return;

        this.applyEndbossContactDamageIfNeeded(info);
        this.pushCharacterOutOfEndboss(info);
    }

    canResolveEndbossWall() {
        return !!this.endboss && !this.endboss.dead;
    }

    getEndbossCollisionInfo() {
        const c = this.character;
        const b = this.endboss;

        if (!c.isColliding(b)) return null;

        const cBottom = c.y + c.height - (c.offset?.bottom ?? 0);
        const bTop = b.y + (b.offset?.top ?? 0);
        const stompFromAbove = c.isFalling?.() && cBottom <= bTop + 35;

        return { c, b, stompFromAbove };
    }

    applyEndbossContactDamageIfNeeded({ c, stompFromAbove }) {
        if (stompFromAbove) return;
        if (c.isInvincible?.()) return;

        c.hit(10);
        c.grantInvincibility?.(400);
        this.statusBarHealth.setPercentage(c.energy);
    }

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

    clampCharacterToWorld() {
        if (this.character.x < 0) this.character.x = 0;
    }

}


