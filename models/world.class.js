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
        new BackgroundObject('img/5_background/layers/air.png',0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png',0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png',0),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png',0),

    ];

    ctx;
    canvas;
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d'); // ctx = canvas.getContext('2d');
        this.draw();
    }


    // Call draw over and over again
    draw() {

        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        this.addObjectsToMap(this.backgroundObjects);     
        this.addToMap(this.character);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.enemies);

        //this is being called all the time
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addObjectsToMap(objects){
        objects.forEach(o => {
            this.addToMap(o);
        })
    }

    addToMap(mo){
            this.ctx.drawImage(mo.img,mo.x,mo.y,mo.width,mo.height);
    }

}
