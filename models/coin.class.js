/**
 * Represents a collectible coin in the game.
 *
 * The Coin is a static collectible object that extends {@link movableObject}.
 * It has a defined collision offset to better match the visible coin shape.
 *
 * @class Coin
 * @extends movableObject
 */
class Coin extends movableObject {

  /**
   * Collision offset values.
   * These values adjust the hitbox relative to the visual sprite.
   *
   * @type {{top: number, right: number, bottom: number, left: number}}
   */
  offset = {
    top: 15,
    right: 30,
    bottom: 100,
    left: 30
  };

  /**
   * Creates a new Coin instance.
   *
   * - Loads the coin image
   * - Sets position
   * - Defines width and height
   *
   * @param {number} x - Horizontal position of the coin.
   * @param {number} y - Vertical position of the coin.
   */
  constructor(x, y) {
    super();

    /**
     * Horizontal position of the coin.
     * @type {number}
     */
    this.x = x;

    /**
     * Vertical position of the coin.
     * @type {number}
     */
    this.y = y;

    /**
     * Width of the coin.
     * @type {number}
     */
    this.width = 80;

    /**
     * Height of the coin.
     * @type {number}
     */
    this.height = 80;

    this.loadImage('assets/img/8_coin/coin_1.png');
  }
}