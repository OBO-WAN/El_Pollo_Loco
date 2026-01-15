class World {

    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];

    clouds = [
        new Cloud()
    ]

    backgroundObjects = [
        new BackgroundObject('img/5_background/layers/air.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 0),

    ];

    ctx;
    canvas;
    keyboard;
    camera_x = 0;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d'); // ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
    }

    setWorld() {
        this.character.world = this;

    }


    // Call draw over and over again
    
    draw() {

    // 1. clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. movement + input
    if (this.keyboard.RIGHT) {
        this.character.moveRight();
        this.character.otherDirection = false;
    } else if (this.keyboard.LEFT) {
        this.character.moveLeft();
        this.character.otherDirection = true;
    }

    // 3. update camera AFTER movement
    this.camera_x = -this.character.x + 100;

    this.enemies.forEach(chicken => chicken.moveLeft());

    // 4. apply camera transform safely
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);

    // 5. draw world
    this.addObjectsToMap(this.backgroundObjects);
    this.addToMap(this.character);
    this.addObjectsToMap(this.clouds);
    this.addObjectsToMap(this.enemies);

    // 6. reset transform
    this.ctx.restore();

    requestAnimationFrame(() => this.draw());
}

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        })
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.ctx.save();
            this.ctx.translate(mo.x + mo.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
        }
    }


}

// const t0 = performance.now();
// // ... draw code ...
// const t1 = performance.now();
// if (t1 - t0 > 20) console.log("draw took", (t1 - t0).toFixed(1), "ms");
