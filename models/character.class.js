/**
 * Represents the main playable character.
 * 
 * Extends the movableObject class and adds character-specific
 * animations, physics behavior, combat logic, and state handling.
 * 
 * @class Character
 * @extends movableObject
 */
class Character extends movableObject {

    /**
     * Collision box offset values.
     * @type {{top:number, right:number, bottom:number, left:number}}
     */
    offset = { top: 20, right: 35, bottom: 10, left: 35 };

    /** @type {number} Character height in pixels */
    height = 240;

    /** @type {number} Character width in pixels */
    width = 140;

    /** @type {number} Initial X position */
    x = 120;

    /** @type {number} Initial Y position */
    y = 50;

    /** @type {number} Y position of the ground */
    groundY = 180;

    /** @type {number} Horizontal movement speed */
    speed = 10;

    /** @type {boolean} Indicates if the character is currently jumping */
    isJumping = false;

    /** @type {number} Timestamp (ms) until which the character is invincible */
    invincibleUntil = 0;

    /**
     * Walking animation frames.
     * @type {string[]}
     */
    animatedCharachter = [
        'assets/img/2_character_pepe/2_walk/W-21.png',
        'assets/img/2_character_pepe/2_walk/W-22.png',
        'assets/img/2_character_pepe/2_walk/W-23.png',
        'assets/img/2_character_pepe/2_walk/W-24.png',
        'assets/img/2_character_pepe/2_walk/W-25.png',
        'assets/img/2_character_pepe/2_walk/W-26.png'
    ];

    /**
     * Jumping animation frames.
     * @type {string[]}
     */
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
    ];

    /**
     * Death animation frames.
     * @type {string[]}
     */
    imagesDead = [
        'assets/img/2_character_pepe/5_dead/D-51.png',
        'assets/img/2_character_pepe/5_dead/D-52.png',
        'assets/img/2_character_pepe/5_dead/D-53.png',
        'assets/img/2_character_pepe/5_dead/D-54.png',
        'assets/img/2_character_pepe/5_dead/D-55.png',
        'assets/img/2_character_pepe/5_dead/D-56.png',
        'assets/img/2_character_pepe/5_dead/D-57.png',
    ];

    /**
     * Hurt animation frames.
     * @type {string[]}
     */
    imagesHurt = [
        'assets/img/2_character_pepe/4_hurt/H-41.png',
        'assets/img/2_character_pepe/4_hurt/H-42.png',
        'assets/img/2_character_pepe/4_hurt/H-43.png',
    ];

    /**
     * Idle animation frames.
     * @type {string[]}
     */
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

    /**
     * Sleeping animation frames.
     * @type {string[]}
     */
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

    /**
     * Reference to the game world.
     * @type {World}
     */
    world;

    /**
     * Creates a new Character instance.
     * Initializes animations, gravity, and state values.
     */
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

    /**
     * Starts the animation loop.
     * Handles state-based animation switching and jump triggering.
     */
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

    /**
     * Makes the character jump.
     * Resets animation frame and sets vertical speed.
     */
    jump() {
        this.speedY = 20;
        this.currentImage = 0;
        this.isJumping = true;
    }

    /**
     * Checks whether the character is currently falling.
     * 
     * @returns {boolean} True if falling, otherwise false.
     */
    isFalling() {
        return this.speedY < 0 && this.isInAir();
    }

    /**
     * Grants temporary invincibility.
     * 
     * @param {number} [ms=2500] Duration in milliseconds.
     */
    grantInvincibility(ms = 2500) {
        this.invincibleUntil = Date.now() + ms;
    }

    /**
     * Checks if the character is currently invincible.
     * 
     * @returns {boolean} True if invincible.
     */
    isInvincible() {
        return Date.now() < this.invincibleUntil;
    }

    /**
     * Applies damage to the character.
     * Automatically grants temporary invincibility after being hit.
     * 
     * @param {number} [damage=5] Amount of energy to remove.
     * @param {number} [invMs=2500] Invincibility duration in milliseconds.
     */
    hit(damage = 5, invMs = 2500) {
        if (this.isInvincible()) return;

        this.energy = Math.max(0, this.energy - damage);
        this.lastHit = Date.now();

        this.grantInvincibility(invMs); 
    }
}