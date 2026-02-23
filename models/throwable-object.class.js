/**
 * Represents a throwable object (e.g., salsa bottle).
 *
 * Extends {@link movableObject} and adds:
 * - Horizontal throw movement
 * - Gravity-based arc physics
 * - Automatic stop when hitting the ground
 *
 * @class ThrowableObject
 * @extends movableObject
 */
class ThrowableObject extends movableObject {

  /**
   * Image paths used for the throwable object's animation.
   * @type {string[]}
   */
  IMAGES_THROW = [
    'assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  /**
   * Creates a new ThrowableObject.
   *
   * @param {number} x - Starting horizontal position.
   * @param {number} y - Starting vertical position.
   * @param {number} [direction=1] - Throw direction (1 = right, -1 = left).
   */
  constructor(x, y, direction = 1) {
    super();

    this.loadImage(this.IMAGES_THROW[0]);
    this.loadImages(this.IMAGES_THROW);

    /**
     * Width of the throwable object.
     * @type {number}
     */
    this.width = 60;

    /**
     * Height of the throwable object.
     * @type {number}
     */
    this.height = 80;

    /**
     * Horizontal position.
     * @type {number}
     */
    this.x = x;

    /**
     * Vertical position.
     * @type {number}
     */
    this.y = y;

    /**
     * Ground level for this object.
     * Used to determine when it should stop falling.
     *
     * @type {number}
     * @default 350
     */
    this.groundY = 350;

    /**
     * Throw direction.
     * 1 = right, -1 = left.
     *
     * @type {number}
     */
    this.direction = direction;

    /**
     * Horizontal throw speed.
     *
     * @type {number}
     */
    this.speedX = 12 * direction;

    this.throw();
  }

  /**
   * Initiates the throwing motion.
   *
   * - Applies upward force
   * - Activates gravity
   * - Moves horizontally until hitting the ground
   *
   * @returns {void}
   */
  throw() {
    this.speedY = 20;
    this.applyGravity();

    this.moveInterval = setInterval(() => {
      this.x += this.speedX;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.stop();
      }
    }, 25);
  }

  /**
   * Stops horizontal movement of the throwable object.
   *
   * @returns {void}
   */
  stop() {
    clearInterval(this.moveInterval);
  }
}