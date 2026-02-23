/**
 * Represents a background object used in a parallax scrolling environment.
 * 
 * This class extends {@link movableObject} and is responsible for rendering
 * background layers with different parallax movement speeds depending on
 * their image path.
 * 
 * The parallax effect is controlled by the {@link parallaxFactor} property,
 * which is automatically determined based on the image path.
 * 
 * @class BackgroundObject
 * @extends movableObject
 */
class BackgroundObject extends movableObject {

    /**
     * The width of the background object.
     * @type {number}
     * @default 720
     */
    width = 720;

    /**
     * The height of the background object.
     * @type {number}
     * @default 480
     */
    height = 480;

    /**
     * Creates a new BackgroundObject instance.
     *
     * @param {string} imagePath - The path to the background image.
     * @param {number} x - The horizontal position of the background object.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);

        /**
         * The horizontal position of the background object.
         * @type {number}
         */
        this.x = x;

        /**
         * The vertical position of the background object.
         * @type {number}
         */
        this.y = 0;

        /**
         * The width of the background object.
         * @type {number}
         */
        this.width = 720;

        /**
         * The height of the background object.
         * @type {number}
         */
        this.height = 480;

        /**
         * The parallax movement factor.
         * Lower values move slower (farther background),
         * higher values move faster (closer foreground).
         *
         * @type {number}
         */
        this.parallaxFactor = this.getParallaxFactor(imagePath);
    }

    /**
     * Determines the parallax factor based on the image path.
     *
     * Layer rules:
     * - `'air'` → 0.1 (farthest background)
     * - `'3_third_layer'` → 0.3
     * - `'2_second_layer'` → 0.5
     * - `'1_first_layer'` → 0.8
     * - default → 1 (foreground or no parallax)
     *
     * @param {string} path - The image path used to identify the layer.
     * @returns {number} The calculated parallax factor.
     */
    getParallaxFactor(path) {
        if (path.includes('air')) return 0.1;
        if (path.includes('3_third_layer')) return 0.3;
        if (path.includes('2_second_layer')) return 0.5;
        if (path.includes('1_first_layer')) return 0.8;
        return 1;
    }
}