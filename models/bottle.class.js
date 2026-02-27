/**
 * Represents a collectible salsa bottle object in the game.
 *
 * This class extends {@link movableObject} and is responsible for:
 * - Loading bottle images
 * - Setting its position and size
 * - Playing a looping idle animation
 *
 * @class Bottle
 * @extends movableObject
 */
class Bottle extends movableObject {


  IMAGES_BOTTLE = [
    'assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  /**
   * Creates a new Bottle instance.
   *
   * @param {number} x - The horizontal position of the bottle.
   * @param {number} y - The vertical position of the bottle.
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 80;
    this.animationInterval = undefined;
    this.loadImage(this.IMAGES_BOTTLE[0]);
    this.loadImages(this.IMAGES_BOTTLE);

    this.animate();
  }

  /**
   * Starts the idle animation of the bottle.
   *
   * The animation loops through {@link IMAGES_BOTTLE}
   * every 400 milliseconds.
   *
   * @returns {void}
   */
  animate() {
    this.animationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_BOTTLE);
    }, 400);
  }
}