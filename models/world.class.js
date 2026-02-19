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
    isGameOver = false;
    //Idle
    idleTimeout = null;
    isSnoring = false;
    isCharacterSleeping = false;




    throwableObjects = [];

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.level = initLevel1();
        this.endboss = this.level.enemies.find(e => e instanceof Endboss);
        this.endbossBarVisible = false;
        this.endbossAttackStarted = false;
        this.setWorld();
        this.initStatusBars();
        this.statusBarEndboss = new StatusBar();
        this.statusBarEndboss.setImages(this.statusBarEndboss.ENDBOSS_BAR_IMAGES);
        this.statusBarEndboss.x = 480;
        this.statusBarEndboss.y = 10;
        this.statusBarEndboss.setPercentage(100);

        this.draw();
        this.run();
    }


    setWorld() {
        this.character.world = this;
    }

    run() {
        this.collisionInterval = setInterval(() => {
            if (this.isPaused) return;

            this.checkCollisions();
            this.checkThrowObjects();
            this.checkCoinCollisions();
            this.checkBottleCollisions();
            this.checkBottleEnemyCollisions();
            if (this.character.isDead()) {
                this.gameOver();
            }
            if (this.endboss && this.endboss.dead) {
                this.win();
            }
        }, 100);

    }

    checkThrowObjects() {
        if (this.keyboard.SPACE && this.bottles > 0) {
            const direction = this.character.otherDirection ? -1 : 1;
            let bottle = new ThrowableObject(
                this.character.x + (direction === 1 ? 100 : -20),
                this.character.y + 100,
                direction
            );
            this.throwableObjects.push(bottle);
            this.bottles--;
            this.playSound(this.throwBottleSound);//Throw sound
            const bottlePercent = Math.min(100, this.bottles * 20);
            this.statusBarBottles.setPercentage(bottlePercent);
            this.keyboard.SPACE = false;
        }
    }

    checkCollisions() {
        const removeEnemyAfter = (enemy, ms = 600) => {
            setTimeout(() => {
                const idx = this.level.enemies.indexOf(enemy);
                if (idx > -1) this.level.enemies.splice(idx, 1);
            }, ms);
        };

        if (this.character.x > 2000 && !this.isBossFight) {
            this.isBossFight = true;
        }
        const isStompableChicken = (enemy) =>
            enemy instanceof Chicken || enemy instanceof Chicken2;

        this.level.enemies.forEach((enemy) => {
            if (enemy.dead) return;
            if (!this.character.isColliding(enemy)) return;
            if (isStompableChicken(enemy) && this.character.isFalling()) {
                enemy.die();
                this.character.speedY = 15; // bounce
                removeEnemyAfter(enemy, 600);
                return;
            }
            this.character.hit();
            this.statusBarHealth.setPercentage(this.character.energy);
        });
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
        // 1) Collect normal bottles from the level
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottle = this.level.bottles[i];

            if (this.character.isColliding(bottle)) {
                if (bottle.animationInterval) clearInterval(bottle.animationInterval);

                this.level.bottles.splice(i, 1);
                this.addBottleToInventory();
            }
        }
        // 2) Collect thrown bottles AFTER they landed (or stopped)
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            const isLanded = bottle.speedY === 0;

            if (isLanded && this.character.isColliding(bottle)) {
                bottle.stop?.();
                this.throwableObjects.splice(i, 1);
                this.addBottleToInventory();
            }
        }
    }

    addBottleToInventory() {
        this.bottles++;
        const bottlePercent = Math.min(100, this.bottles * 20);
        this.statusBarBottles.setPercentage(bottlePercent);
        this.playSound(this.bottleSound);
    }


    checkBottleEnemyCollisions() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                if (bottle.isColliding(enemy)) {
                    bottle.stop();
                    this.throwableObjects.splice(i, 1);

                    if (enemy instanceof Endboss) {
                        enemy.hit();
                        this.statusBarEndboss.setPercentage(enemy.energy);
                    } else {
                        this.level.enemies.splice(j, 1);
                    }
                    return;
                }
            }
        }
    }

    checkEndbossBarTrigger() {
        if (!this.endboss || this.endbossBarVisible) return;

        const triggerDistance = 600;
        if (this.character.x >= this.endboss.x - triggerDistance) {
            this.endbossBarVisible = true;
        }
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isPaused = true;
        this.stopLoops();
        this.endbossAttackStarted = false;
        if (this.collisionInterval) clearInterval(this.collisionInterval);
        this.stopSnoring();
        if (typeof stopBackgroundMusic === 'function') {
            stopBackgroundMusic();
        }
        this.playSound(this.gameOverSound);
        const overlay = document.getElementById('gameOverOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    win() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.isPaused = true;
        this.endbossAttackStarted = false;
        if (this.collisionInterval) clearInterval(this.collisionInterval);
        this.stopSnoring();
        // Stop background music
        if (typeof stopBackgroundMusic === 'function') {
            stopBackgroundMusic();
        }
        this.playSound(this.winSound);
        const overlay = document.getElementById('winOverlay');
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
        this.checkEndbossBarTrigger();
        if (this.endbossBarVisible && this.endboss && !this.endbossAttackStarted) {
            this.endbossAttackStarted = true;
            this.endboss.startAttackCycle();
        }

        this.handleCharacterMovement(); // input -> move
        this.updateCamera();            // follow player
        this.moveEnemies();             // enemy motion
        this.checkIdleState();          // sound character
    }

    checkIdleState() {
        if (this.isPaused || this.character.isDead()) {
            this.stopSnoring();
            return;
        }

        const isMoving =
            this.keyboard.LEFT ||
            this.keyboard.RIGHT ||
            this.keyboard.UP ||
            this.keyboard.SPACE;

        if (isMoving) {
            this.resetIdleTimer();
            return;
        }

        if (!this.idleTimeout && !this.isSnoring) {
            this.idleTimeout = setTimeout(() => {
                this.startSnoring();
            }, 3000);
        }
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
        this.level.enemies.forEach(enemy => enemy.moveLeft());
    }

    // ----- RENDER (drawing) -----

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        const aboveUi = this.shouldCharacterDrawAboveUi();
        this.drawWorldLayer(aboveUi);
        this.drawUiLayer();
        this.drawOverlayLayer(aboveUi);
    }

    drawWorldLayer(aboveUi) {
        this.withCamera(() => {
            this.drawBackground();
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
        this.drawStatusBar();
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
        this.ctx.translate(this.camera_x, 0);
        fn();
        this.ctx.restore();
    }

    drawBackground() {
        this.addObjectsToMap(this.level.backgroundObjects);
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
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
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

}


