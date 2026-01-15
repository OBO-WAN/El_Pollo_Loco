class Character extends movableObject {

    height = 240;
    width = 140;
    x = 120;
    y = 200;
    speed = 2;

    animatedCharachter = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'

    ];

    world;

    // currentImage = 0;


    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadMainCharacter(this.animatedCharachter);
        this.animate();
    }

    animate() {
        setInterval(() => {

            let path = this.animatedCharachter[this.currentImage];
            this.img = this.imageCache[path];
            // this.currentImage++; // false (infinite)
            this.currentImage = (this.currentImage + 1) % this.animatedCharachter.length; // let i = 0+1 % 6

        }, 100);
    }

    jump() {

    }
}