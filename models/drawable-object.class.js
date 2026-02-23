/**
 * Base class for all drawable objects in the game.
 *
 * Provides fundamental rendering functionality including:
 * - Position and dimension handling
 * - Image loading
 * - Image caching for animations
 * - Canvas drawing
 *
 * Other game objects (e.g., characters, enemies, collectibles)
 * typically extend this class either directly or indirectly.
 *
 * @class DrawableObject
 */
class DrawableObject {

    /**
     * Horizontal position.
     * @type {number}
     * @default 120
     */
    x = 120;

    /**
     * Vertical position.
     * @type {number}
     * @default 360
     */
    y = 360;

    /**
     * Height of the object.
     * @type {number}
     * @default 100
     */
    height = 100;

    /**
     * Width of the object.
     * @type {number}
     * @default 50
     */
    width = 50;

    /**
     * The currently loaded image.
     * @type {HTMLImageElement|undefined}
     */
    img;

    /**
     * Indicates whether the object is a background element.
     * Used to slightly adjust rendering width to avoid visual gaps.
     *
     * @type {boolean}
     * @default true
     */
    isBackground = true;

    /**
     * Cache for preloaded images.
     * Used for animations to prevent repeated loading.
     *
     * @type {{ [key: string]: HTMLImageElement }}
     */
    imageCache = {};

    /**
     * Index of the current animation frame.
     *
     * @type {number}
     * @default 0
     */
    currentImage = 0;

    /**
     * Loads a single image.
     *
     * @param {string} path - Path to the image file.
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.onerror = () => console.error('Image failed to load:', path);
        this.img.src = path;
    }

    /**
     * Draws the object onto a canvas context.
     *
     * If the object is marked as background,
     * its width is slightly increased to prevent visual gaps.
     *
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @returns {void}
     */
    draw(ctx) {
        if (!this.img) return;

        let width = this.width;

        if (this.isBackground) {
            width += 1; // Prevents pixel gaps in scrolling backgrounds
        }

        ctx.drawImage(this.img, this.x, this.y, width, this.height);
    }

    /**
     * Preloads multiple images and stores them in the image cache.
     *
     * Used for animation sequences.
     *
     * @param {string[]} arr - Array of image paths.
     * @returns {void}
     */
    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}