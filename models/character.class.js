class Character extends movableObject {

    offset = { top: 20, right: 35, bottom: 10, left: 35 };
    height = 240;
    width = 140;
    x = 120;
    y = 50;
    groundY = 180;
    speed = 10;
    isJumping = false;
    invincibleUntil = 0;


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

    imagesIdle = [
        'assets/img/2_character_pepe/1_idle/idle/I-1.png',
        'assets/img/2_character_pepe/1_idle/idle/I-2.png',
        'assets/img/2_character_pepe/1_idle/idle/I-3.png',
        'assets/img/2_character_pepe/1_idle/idle/I-4.png',
        'assets/img/2_character_pepe/1_idle/idle/I-5.png',
        'assets/img/2_character_pepe/1_idle/idle/I-6.png',
        'assets/img/2_character_pepe/1_idle/idle/I-7.png',
        'assets/img/2_character_pepe/1_idle/idle/I-8.png',
        'assets/img/2_character_pepe/1_idle/idle/I-9.png',
        'assets/img/2_character_pepe/1_idle/idle/I-10.png',
    ];

    imagesSleep = [

        'assets/img/2_character_pepe/1_idle/long_idle/I-11.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-12.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-13.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-14.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-15.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-16.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-17.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-18.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-19.png',
        'assets/img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    world;

    constructor() {
        super();
        this.energy = 100;
        this.lastHit = 0;
        this.loadImage('assets/img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.animatedCharachter);
        this.loadImages(this.imagesJumping);
        this.loadImages(this.imagesDead);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesIdle);
        this.loadImages(this.imagesSleep);
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

            } else if (this.world?.isCharacterSleeping) {
                this.playAnimation(this.imagesSleep);

            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.animatedCharachter);

            } else {
                this.playAnimation(this.imagesIdle);
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
        return this.speedY < 0 && this.isInAir();
    }

    grantInvincibility(ms = 1500) {
        this.invincibleUntil = Date.now() + ms;
    }

    isInvincible() {
        return Date.now() < this.invincibleUntil;
    }

}
