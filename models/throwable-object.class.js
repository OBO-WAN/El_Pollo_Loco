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
    this.width = 60;
    this.height = 80;
    this.x = x;
    this.y = y;
    this.groundY = 350;
    this.direction = direction;
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
   */
  stop() {
    clearInterval(this.moveInterval);
  }
}