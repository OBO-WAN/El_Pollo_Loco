/**
 * Main world controller (state, ticking, and orchestration).
 * Delegates rendering, audio, and collision handling.
 */
class World {
    character = new Character();
    level;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    coins = 0;
    bottles = 0;
    statusBarHealth = new StatusBar();
    statusBarCoins = new StatusBar();
    statusBarBottles = new StatusBar();
    statusBarEndboss;
    isPaused = false;
    collisionInterval = null;
    animationFrameId = null;
    winScheduled = false;
    isGameOver = false;
    idleTimeout = null;
    isSnoring = false;
    isCharacterSleeping = false;
    throwableObjects = [];
    renderer;
    audio;
    collisions;

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {any} keyboard
     */
    constructor(canvas, keyboard) {
        this.initCanvas(canvas);
        this.renderer = new WorldRender(this);
        this.audio = new WorldAudio(this);
        this.collisions = new WorldCollisions(this);
        this.initGameState(keyboard);
        this.initLevelAndBoss();
        this.setWorld();
        this.initHud();
        this.setHudPositions();
        this.start();
    }

    /**
     * @param {HTMLCanvasElement} canvas
     */
    initCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * @param {any} keyboard
     */
    initGameState(keyboard) {
        this.keyboard = keyboard;
        this.endbossBarVisible = false;
        this.endbossAttackStarted = false;
        this.isBossFight = false;
    }

    /**
     * Initializes the level and caches the endboss reference (if present).
     */
    initLevelAndBoss() {
        this.level = initLevel1();
        this.endboss = this.level.enemies.find(e => e instanceof Endboss);
    }

    /**
     * Initializes all HUD elements.
     */
    initHud() {
        this.initStatusBars();
        this.initEndbossStatusBar();
    }

    /**
     * Initializes the endboss status bar (hidden until triggered).
     */
    initEndbossStatusBar() {
        this.statusBarEndboss = new StatusBar();
        this.statusBarEndboss.setImages(this.statusBarEndboss.ENDBOSS_BAR_IMAGES);
        this.statusBarEndboss.setPercentage(100);
    }

    /**
     * Starts render and tick loops.
     */
    start() {
        this.draw();
        this.run();
    }

    /**
     * Links entities to this world.
     */
    setWorld() {
        this.character.world = this;
        if (this.endboss) this.endboss.world = this;
    }

    /**
     * Starts the logic tick interval.
     */
    run() {
        this.collisionInterval = setInterval(() => {
            if (this.isPaused) return;
            this.tick();
        }, 40);
    }

    /**
     * Runs one logic tick.
     */
    tick() {
        this.collisions.tickCollisionsAndCollectibles();
        this.tickThrowing();
        this.tickWinLose();
    }

    /**
     * Handles throw input/spawning.
     */
    tickThrowing() {
        this.checkThrowObjects();
    }

    /**
     * Checks win/lose conditions.
     */
    tickWinLose() {
        if (this.character.isDead()) {
            this.audio.gameOver();
            return;
        }
        if (this.isEndbossDefeated()) {
            this.scheduleWinOnce();
        }
    }

    /**
     * @returns {boolean}
     */
    isEndbossDefeated() {
        return !!this.endboss && this.endboss.dead;
    }

    /**
     * Schedules the win sequence only once.
     */
    scheduleWinOnce() {
        if (this.winScheduled) return;
        this.winScheduled = true;
        setTimeout(() => this.audio.win(), 700);
    }

    /**
     * Checks whether the player should throw a bottle this tick.
     */
    checkThrowObjects() {
        if (this.shouldBlockThrowing()) return;
        if (!this.canThrowBottle()) return;
        this.throwBottle();
    }

    /**
     * Blocks throwing while sleeping and clears SPACE once.
     * @returns {boolean}
     */
    shouldBlockThrowing() {
        if (!this.isCharacterSleeping) return false;
        this.keyboard.SPACE = false;
        return true;
    }

    /**
     * @returns {boolean}
     */
    canThrowBottle() {
        return this.keyboard.SPACE && this.bottles > 0;
    }

    /**
     * Spawns and throws a bottle projectile.
     */
    throwBottle() {
        const bottle = this.createThrowableBottle();
        this.throwableObjects.push(bottle);
        this.bottles--;
        this.updateBottleHud();
        this.audio.playSound(this.audio.throwBottleSound);
        this.keyboard.SPACE = false;
    }

    /**
     * Creates a ThrowableObject in front of the character, respecting facing throwDirection.
     * @returns {ThrowableObject}
     */
    createThrowableBottle() {
        const throwDirection = this.character.otherDirection ? -1 : 1;
        return new ThrowableObject(
            this.character.x + (throwDirection === 1 ? 100 : -20),
            this.character.y + 100,
            throwDirection
        );
    }

    /**
     * Updates bottle HUD percentage.
     */
    updateBottleHud() {
        const bottlePercentage = Math.min(100, this.bottles * 20);
        this.statusBarBottles.setPercentage(bottlePercentage);
    }

    /**
     * Main render loop (rAF).
     */
    draw() {
        if (this.isPaused) {
            this.animationFrameId = null;
            return;
        }
        this.renderer.clearCanvas();
        this.update();
        this.renderer.render();
        this.animationFrameId = requestAnimationFrame(() => this.draw());
    }

    /**
     * Updates non-collision world logic (movement, camera, AI, ambient).
     */
    update() {
        if (this.isPaused) return;
        this.updateBossPhase();
        this.updateCharacter();
        this.updateWorld();
        this.updateAmbientState();
    }

    /**
     * Updates boss phase triggers.
     */
    updateBossPhase() {
        this.checkEndbossBarTrigger();
        this.startEndbossAttackIfNeeded();
    }

    /**
     * Triggers the endboss attack cycle once the bar is visible.
     */
    startEndbossAttackIfNeeded() {
        if (!this.endbossBarVisible) return;
        if (!this.endboss) return;
        if (this.endbossAttackStarted) return;
        this.endbossAttackStarted = true;
        this.endboss.startAttackCycle();
    }

    /**
     * Updates character and boss wall constraints.
     */
    updateCharacter() {
        this.handleCharacterMovement();
        this.collisions.resolveEndbossWall();
        this.clampCharacterToWorld();
    }

    /**
     * Updates camera and enemies.
     */
    updateWorld() {
        this.updateCamera();
        this.moveEnemies();
    }

    /**
     * Updates ambient idle/sleep state.
     */
    updateAmbientState() {
        this.audio.checkIdleState();
    }

    /**
     * Moves character according to keyboard input.
     */
    handleCharacterMovement() {
        if (this.keyboard.RIGHT && this.character.x < this.level.level_end_x) {
            this.character.moveRight();
            this.character.otherDirection = false;
        } else if (this.keyboard.LEFT && this.character.x > 0) {
            this.character.moveLeft();
            this.character.otherDirection = true;
        }
    }

    /**
     * Updates camera offset based on character position.
     */
    updateCamera() {
        this.camera_x = -this.character.x + 100;
    }

    /**
     * Moves enemies; endboss may follow the character when active.
     */
    moveEnemies() {
        this.level.enemies.forEach(enemy => {
            if (enemy instanceof Endboss) {
                enemy.followCharacter?.(this.character, { active: this.isBossFight || this.endbossBarVisible });
            } else {
                enemy.moveLeft();
            }
        });
    }

    /**
     * Shows endboss bar when the player is close enough.
     */
    checkEndbossBarTrigger() {
        if (!this.endboss || this.endbossBarVisible) return;
        const endbossTriggerDistance = 600;
        if (this.character.x >= this.endboss.x - endbossTriggerDistance) {
            this.endbossBarVisible = true;
        }
    }

    /**
     * Stops ticking and animation loops.
     */
    stopLoops() {
        if (this.collisionInterval) clearInterval(this.collisionInterval);
        this.collisionInterval = null;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    /**
     * Pauses ticking/rendering.
     */
    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Resumes ticking/rendering.
     */
    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        if (!this.animationFrameId) {
            this.draw();
        }
    }

    /**
     * Positions HUD relative to the viewport.
     */
    setHudPositions() {
        const padding = 20;
        const viewportWidth = this.view?.logicalViewportW ?? 720;
        const coinBarY = this.statusBarCoins?.y ?? 60;
        if (this.statusBarEndboss) {
            this.statusBarEndboss.x = viewportWidth - padding - this.statusBarEndboss.width;
            this.statusBarEndboss.y = coinBarY;
        }
    }

    /**
     * Initializes status bars (health/coins/bottles).
     */
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

    /**
     * Clamps character to world bounds.
     */
    clampCharacterToWorld() {
        if (this.character.x < 0) this.character.x = 0;
    }
}
