/**
 * Represents a chicken enemy in the game.
 *
 * The Chicken moves horizontally, plays a walking animation,
 * and can transition into a dead state.
 *
 * This class extends {@link movableObject}.
 *
 * @class Chicken
 * @extends movableObject
 */
class Chicken_Big extends movableObject {
    dead = false;
    height = 80;
    width = 80;
    x = 120;
    y = 340;

    /**
     * Walking animation image paths.
     * @type {string[]}
     */
    animatedChickens = [
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    /**
     * Image path used when the chicken is dead.
     * @type {string}
     */
    IMAGE_DEAD = 'assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    /**
     * Index of the currently displayed image.
     * @type {number}
     * @default 0
     */
    currentImage = 0;
    animationInterval = null;

    /**
     * Creates a new Chicken instance.
     *
     * If no x position is provided, a random spawn position
     * between 600 and 1800 is generated.
     *
     * @param {number|null} [x=null] - Optional horizontal position.
     */
    constructor(x = null) {
        super();
        this.loadImage(this.animatedChickens[0]);
        this.loadImages(this.animatedChickens);
        this.loadImage(this.IMAGE_DEAD);
        this.x = (x !== null) ? x : (600 + Math.random() * 1200);
        this.speed = 0.15 + Math.random() * 0.5;
        
        this.animate();
    }

    /**
     * Starts the walking animation loop.
     *
     * The animation updates every 120 milliseconds
     * while the chicken is alive.
     *
     */
    animate() {
        this.animationInterval = setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.animatedChickens);
            }
        }, 120);
    }

    /**
     * Kills the chicken.
     *
     * - Sets the dead state
     * - Stops movement
     * - Displays the dead image
     * - Clears the animation interval
     *
     */
    die() {
        if (this.dead) return;

        this.dead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
}