/**
 * Represents a small chicken enemy in the game.
 *
 * This is a smaller and slightly faster variant of the normal Chicken enemy.
 * It plays a walking animation while alive and switches to a dead image
 * when defeated.
 *
 * This class extends {@link movableObject}.
 *
 * @class Chicken2
 * @extends movableObject
 */
class Chicken2 extends movableObject {

    /**
     * Indicates whether the chicken is dead.
     * @type {boolean}
     * @default false
     */
    dead = false;

    /**
     * Height of the small chicken.
     * @type {number}
     * @default 60
     */
    height = 60;

    /**
     * Width of the small chicken.
     * @type {number}
     * @default 60
     */
    width = 60;

    /**
     * Vertical ground position.
     * @type {number}
     * @default 360
     */
    y = 360;

    /**
     * Walking animation image paths for the small chicken.
     * @type {string[]}
     */
    animatedSmallChickens = [
        'assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    /**
     * Image path used when the small chicken is dead.
     * @type {string}
     */
    IMAGE_DEAD = 'assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    /**
     * Index of the currently displayed animation frame.
     * @type {number}
     * @default 0
     */
    currentImage = 0;

    /**
     * Reference to the animation interval.
     * @type {number|null}
     * @default null
     */
    animationInterval = null;

    /**
     * Creates a new small Chicken instance.
     *
     * If no x position is provided, a random spawn position
     * between 600 and 1800 is generated.
     *
     * The small chicken has a slightly higher speed range
     * compared to the normal Chicken.
     *
     * @param {number|null} [x=null] - Optional horizontal position.
     */
    constructor(x = null) {
        super();

        this.loadImage(this.animatedSmallChickens[0]);
        this.loadImages(this.animatedSmallChickens);
        this.loadImage(this.IMAGE_DEAD);

        /**
         * Horizontal position of the small chicken.
         * @type {number}
         */
        this.x = (x !== null) ? x : (600 + Math.random() * 1200);

        /**
         * Movement speed of the small chicken.
         * Slightly faster than the normal Chicken.
         *
         * @type {number}
         */
        this.speed = 0.2 + Math.random() * 0.6;

        this.animate();
    }

    /**
     * Starts the walking animation loop.
     *
     * The animation updates every 120 milliseconds
     * while the chicken is alive.
     *
     * @returns {void}
     */
    animate() {
        this.animationInterval = setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.animatedSmallChickens);
            }
        }, 120);
    }

    /**
     * Kills the small chicken.
     *
     * - Sets the dead state
     * - Stops movement
     * - Displays the dead image
     * - Clears the animation interval
     *
     * @returns {void}
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