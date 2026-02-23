/**
 * Represents a game level configuration.
 *
 * A Level contains all objects required to run a stage:
 * - Enemies
 * - Clouds
 * - Background objects (parallax layers)
 * - Collectible coins
 * - Collectible bottles
 *
 * It also defines the X-coordinate where the level ends.
 *
 * @class Level
 */
class Level {

    /**
     * Array of enemy objects in the level.
     *
     * @type {Array<movableObject>}
     */
    enemies;

    /**
     * Array of cloud background objects.
     *
     * @type {Cloud[]}
     */
    clouds;

    /**
     * Array of parallax background objects.
     *
     * @type {BackgroundObject[]}
     */
    backgroundObjects;

    /**
     * Array of collectible coins.
     *
     * @type {Coin[]}
     */
    coins;

    /**
     * Array of collectible bottles.
     *
     * @type {Bottle[]}
     */
    bottles;

    /**
     * X-coordinate marking the end of the level.
     * When the player reaches this position,
     * the level is considered complete.
     *
     * @type {number}
     * @default 2500
     */
    level_end_x = 2500;

    /**
     * Creates a new Level instance.
     *
     * @param {Array<movableObject>} enemies - All enemies in the level.
     * @param {Cloud[]} clouds - Background cloud objects.
     * @param {BackgroundObject[]} backgroundObjects - Parallax background layers.
     * @param {Coin[]} coins - Collectible coins.
     * @param {Bottle[]} bottles - Collectible bottles.
     */
    constructor(enemies, clouds, backgroundObjects, coins, bottles) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
    }
}