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

    x = 120;
    y = 360;
    height = 100;
    width = 50;
    img;
    isBackground = true;
    imageCache = {};
    currentImage = 0;

    /**
     * Loads a single image.
     *
     * @param {string} path - Path to the image file.
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
     */
    draw(ctx) {
        if (!this.img) return;
        let width = this.width;
        if (this.isBackground) {
            width += 1; 
        }
        ctx.drawImage(this.img, this.x, this.y, width, this.height);
    }

    /**
     * Preloads multiple images and stores them in the image cache.
     *
     * Used for animation sequences.
     *
     * @param {string[]} arr - Array of image paths.
     */
    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}