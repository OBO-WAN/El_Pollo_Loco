class World {
    character = new Character();
    level;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    coins = 0;
    bottles = 0;
    coinSound = new Audio('audio/coin.mp3');
    statusBarHealth = new StatusBar();
    statusBarCoins = new StatusBar();
    statusBarBottles = new StatusBar();
    isPaused = false;
    collisionInterval = null;



    throwableObjects = [];

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.level = initLevel1();
        this.setWorld();
        this.initStatusBars();
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
        }, 200);
    }


    checkThrowObjects() {
        if (this.keyboard.SPACE && this.bottles > 0) {
            let bottle = new ThrowableObject(
                this.character.x + 100,
                this.character.y + 100
            );
            this.throwableObjects.push(bottle);
            this.bottles--;
            this.bottles = Math.max(0, this.bottles); //guard
            const bottlePercent = Math.min(100, this.bottles * 20);
            this.statusBarBottles.setPercentage(bottlePercent);
            this.keyboard.SPACE = false;
        }
    }

    checkCollisions() {
        this.level.enemies.forEach(enemy => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
                // this.statusBarCoins.setPercentage(this.coins);
                // this.statusBarBottles.setPercentage(this.bottle);
            }
        });
    }
    checkCoinCollisions() { // loop backwards
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];

            if (this.character.isColliding(coin)) {
                this.level.coins.splice(i, 1);
                this.coins++;
                const coinPercent = Math.min(100, this.coins * 20);
                this.statusBarCoins.setPercentage(coinPercent);
                this.coinSound.currentTime = 0;
                this.coinSound.play();
            }
        }
    }

    checkBottleCollisions() {
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottle = this.level.bottles[i];

            if (this.character.isColliding(bottle)) {
                if (bottle.animationInterval) clearInterval(bottle.animationInterval);
                this.level.bottles.splice(i, 1);
                this.bottles++;
                const bottlePercent = Math.min(100, this.bottles * 20);
                this.statusBarBottles.setPercentage(bottlePercent);
            }
        }
    }

    checkBottleEnemyCollisions() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                if (bottle.isColliding(enemy)) {
                    // remove chicken
                    this.level.enemies.splice(j, 1);

                    // remove bottle
                    this.throwableObjects.splice(i, 1);

                    break;
                }
            }
        }
    }


    // Main loop
    draw() {
        this.clearCanvas();
        this.update();
        this.render();
        requestAnimationFrame(() => this.draw());
    }
    // ----- UPDATE (logic) -----
    update() {
        if (this.isPaused) return;

        this.handleCharacterMovement(); // input -> move
        this.updateCamera();            // follow player
        this.moveEnemies();             // enemy motion
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
        this.ctx.save();                    // camera on
        this.ctx.translate(this.camera_x, 0);
        this.drawBackground();
        this.drawCharacter();
        this.drawClouds();
        this.drawEnemies();
        this.drawBottles();
        this.drawCoins();
        this.drawBottlesOnGround();
        this.ctx.restore();                 // camera off
        //Sticky StatusBars
        this.drawStatusBar();


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


