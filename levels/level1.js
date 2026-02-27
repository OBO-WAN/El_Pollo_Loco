/**
 * Creates randomly positioned Bottle objects within a given X range.
 *
 * Ensures a minimum distance between bottles to prevent clustering.
 *
 * @param {number} amount - Number of bottles to generate.
 * @param {number} minX - Minimum X coordinate.
 * @param {number} maxX - Maximum X coordinate.
 * @returns {Bottle[]} Array of generated Bottle instances.
 */
function createRandomBottles(amount, minX, maxX) {
    const bottles = [];
    const minDistance = 250; 

    let lastX = minX - minDistance;

    for (let i = 0; i < amount; i++) {
        let x;

        do {
            x = minX + Math.random() * (maxX - minX);
        } while (Math.abs(x - lastX) < minDistance);

        bottles.push(new Bottle(x, 350));
        lastX = x;
    }

    return bottles;
}

/**
 * Initializes and returns Level 1 configuration.
 *
 * The level contains:
 * - Enemies (Chicken, Chicken2, Endboss)
 * - Background clouds
 * - Parallax background layers
 * - Collectible coins
 * - Randomly generated bottles
 *
 * @function initLevel1
 * @returns {Level} Configured Level instance.
 */
function initLevel1() {
    return new Level(

        /**
         * Enemies in the level.
         * @type {(Chicken|Chicken2|Endboss)[]}
         */
        [
            new Chicken(),
            new Chicken2(),
            new Chicken(),
            new Chicken2(),
            new Chicken(),
            new Endboss(),
        ],

        /**
         * Cloud background elements.
         * @type {Cloud[]}
         */
        [
            new Cloud()
        ],

        /**
         * Parallax background layers.
         * Ordered from farthest (air) to nearest (first layer).
         *
         * @type {BackgroundObject[]}
         */
        [
            new BackgroundObject('assets/img/5_background/layers/air.png', -720),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', -720),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', -720),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', -720),

            new BackgroundObject('assets/img/5_background/layers/air.png', 0),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 0),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 0),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 0),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', 720),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', 720),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', 720),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 720 * 2),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', 720 * 3),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 720 * 4),
        ],

        /**
         * Collectible coins in the level.
         * @type {Coin[]}
         */
        [
            new Coin(300, 200),
            new Coin(600, 150),
            new Coin(900, 180),
            new Coin(1200, 140),
            new Coin(1500, 170),
        ],

        /**
         * Randomly generated bottles.
         * @type {Bottle[]}
         */
        createRandomBottles(5, 200, 1800),
    )
}