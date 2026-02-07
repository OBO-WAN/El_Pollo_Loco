class Chicken extends movableObject {

    height = 80;
    width = 80;
    x = 120;
    y = 340;


    animatedChickens = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png',


    ];

    currentImage = 0;


    constructor() {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.animatedChickens); //fill imageChache={}
        this.x = 600 + Math.random() * 1200; // spread spawn position
        this.speed = 0.15 + Math.random() * 0.5;
        this.animate();

    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.animatedChickens);
        }, 1200);
    }

}