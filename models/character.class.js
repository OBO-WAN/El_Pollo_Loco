class Character extends movableObject {

    height = 240;
    width = 140;
    x = 120;
    y = 50; // 40-200
    speed = 10;
    isJumping = false;


    animatedCharachter = [
        'assets/img/2_character_pepe/2_walk/W-21.png',
        'assets/img/2_character_pepe/2_walk/W-22.png',
        'assets/img/2_character_pepe/2_walk/W-23.png',
        'assets/img/2_character_pepe/2_walk/W-24.png',
        'assets/img/2_character_pepe/2_walk/W-25.png',
        'assets/img/2_character_pepe/2_walk/W-26.png'

    ];

    imagesJumping = [

        'assets/img/2_character_pepe/3_jump/J-31.png',
        'assets/img/2_character_pepe/3_jump/J-32.png',
        'assets/img/2_character_pepe/3_jump/J-33.png',
        'assets/img/2_character_pepe/3_jump/J-34.png',
        'assets/img/2_character_pepe/3_jump/J-35.png',
        'assets/img/2_character_pepe/3_jump/J-36.png',
        'assets/img/2_character_pepe/3_jump/J-37.png',
        'assets/img/2_character_pepe/3_jump/J-38.png',
        'assets/img/2_character_pepe/3_jump/J-39.png',
    ]

    imagesDead = [
        'assets/img/2_character_pepe/5_dead/D-51.png',
        'assets/img/2_character_pepe/5_dead/D-52.png',
        'assets/img/2_character_pepe/5_dead/D-53.png',
        'assets/img/2_character_pepe/5_dead/D-54.png',
        'assets/img/2_character_pepe/5_dead/D-55.png',
        'assets/img/2_character_pepe/5_dead/D-56.png',
        'assets/img/2_character_pepe/5_dead/D-57.png',
    ]

    imagesHurt = [
        'assets/img/2_character_pepe/4_hurt/H-41.png',
        'assets/img/2_character_pepe/4_hurt/H-42.png',
        'assets/img/2_character_pepe/4_hurt/H-43.png',
    ]

    world;

    constructor() {
        super();
        this.loadImage('assets/img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.animatedCharachter);
        this.loadImages(this.imagesJumping);
        this.loadImages(this.imagesDead);
        this.loadImages(this.imagesHurt);
        this.applyGravity();
        this.animate();
    }

    animate() {
        setInterval(() => {

            if (this.isDead()) {
                this.playAnimation(this.imagesDead);
            } else if (this.isHurt()) {
                this.playAnimation(this.imagesHurt);
            } else if (this.isInAir()) {
                this.playAnimation(this.imagesJumping);
            } else {
                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.animatedCharachter);
                }
            }
            if (this.world.keyboard.UP && !this.isInAir()) {
                this.speedY = 28;
            }
        }, 100);

    }

    jump() {
        this.speedY = 20;
        this.currentImage = 0; // start jump animation at J-31
        this.isJumping = true;
    }

    isFalling() {
        return this.speedY < 0;
    }

}
