class Cloud extends movableObject {

    y = 20;
    height = 250;


    constructor() {
        super().loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 500;
        this.width = 490;
        this.animateClouds();
    }

    animateClouds() {
        this.moveLeft();
    }

    moveLeft(){
           setInterval(() => {
            this.x -= 0.15; // 0.15 px pro Berechnung werden hier abgezogen
        },1000 / 60);
    }

}