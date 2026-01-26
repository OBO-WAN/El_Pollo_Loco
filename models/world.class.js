class World {
    character = new Character();
    level = level1;

    // Loop for Background
    // tileWidth = 720;        // one screen width
    // tilesCount = 6;         // instead -720, 0, 720, *2*3*4
    // jump = this.tileWidth * this.tilesCount;

    canvas;
    ctx;
    keyboard;

    camera_x = 0;

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.setWorld();
        this.draw();
        this.checkCollisions();
    }

    setWorld() {
        this.character.world = this;
    }

    checkCollisions(){
        setInterval(() => {
            this.level.enemies.forEach( (enemy) => {
                this.character.isColliding(enemy);
            });
        }, 1000 / 25);
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
        this.handleCharacterMovement(); // input -> move
        this.updateCamera();            // follow player
        // this.loopBackground();
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

        this.ctx.restore();                 // camera off
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

    //Commented out
    loopBackground() {
        const leftEdge = -this.camera_x;
        const buffer = 200;
        const jump = this.tileWidth * this.tilesCount;

        this.level.backgroundObjects.forEach(bg => {
            if (bg.x + bg.width < leftEdge - buffer) {
                bg.x += jump;
            }

            if (bg.x > leftEdge + this.tileWidth + buffer) {
                bg.x -= jump;
            }
        });
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
    mo.drawFrame(this.ctx);
}

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
        this.ctx.restore();
    }
}


