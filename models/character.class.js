class Character extends movableObject {

    height = 240;
    width = 140;
    x = 120;
    y = 40; // 40-200
    speed = 10;
    isJumping = false;


    animatedCharachter = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'

    ];

    imagesJumping = [

        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png',
    ]

    world;

    // currentImage = 0;


    constructor() {
        super();
        this.loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.animatedCharachter);
        this.loadImages(this.imagesJumping);
        this.applyGravity();
        this.animate();
    }

    animate() {
        setInterval(() => {

            if (this.isInAir()) {
                this.playAnimation(this.imagesJumping);

            } else {
                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.animatedCharachter);
                }
            }

            // console.log("This Speed Y: ", this.speedY);
            if (this.world.keyboard.UP && !this.isInAir()) {
                this.speedY = 20;
            }

        }, 100);

    }

    jump() {
        this.speedY = 20;
        this.currentImage = 0;     // start jump animation at J-31
        this.isJumping = true;
    }

}