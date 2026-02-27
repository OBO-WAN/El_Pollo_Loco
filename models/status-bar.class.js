/**
 * Represents a visual status bar in the game UI.
 *
 * This class extends {@link DrawableObject} and is used to display:
 * - Player health
 * - Collected coins
 * - Collected bottles
 * - Endboss health
 *
 * The displayed image changes depending on the current percentage value.
 *
 * @class StatusBar
 * @extends DrawableObject
 */
class StatusBar extends DrawableObject {

    images = [];

    /**
     * Image paths for the health status bar.
     * @type {string[]}
     */
    HEALTH_BAR_IMAGES = [
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png',
    ];

    /**
     * Image paths for the coin status bar.
     * @type {string[]}
     */
    COIN_BAR_IMAGES = [
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png',
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png',
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png',
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png',
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png',
        'assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png',
    ];

    /**
     * Image paths for the bottle status bar.
     * @type {string[]}
     */
    BOTTLE_BAR_IMAGES = [
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        'assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png',
    ];

    /**
     * Image paths for the endboss health bar.
     * @type {string[]}
     */
    ENDBOSS_BAR_IMAGES = [
        'assets/img/7_statusbars/2_statusbar_endboss/green/green0.png',
        'assets/img/7_statusbars/2_statusbar_endboss/green/green20.png',
        'assets/img/7_statusbars/2_statusbar_endboss/green/green40.png',
        'assets/img/7_statusbars/2_statusbar_endboss/green/green60.png',
        'assets/img/7_statusbars/2_statusbar_endboss/green/green80.png',
        'assets/img/7_statusbars/2_statusbar_endboss/green/green100.png',
    ];

    /**
     * Current percentage value represented by the status bar.
     * @type {number}
     * @default 100
     */
    percentage = 100;

    /**
     * Creates a new StatusBar instance.
     *
     * Sets default position and dimensions.
     */
    constructor() {
        super();
        this.x = 20;
        this.y = 10;
        this.width = 200;
        this.height = 60;
        this.percentage = 100;
    }

    /**
     * Assigns an image set to this status bar.
     *
     * Preloads images and updates the displayed image
     * according to the current percentage.
     *
     * @param {string[]} images - Array of image paths.
     */
    setImages(images) {
        this.images = images;
        this.loadImages(this.images);
        this.setPercentage(this.percentage);
    }

    /**
     * Updates the percentage value and changes the displayed image.
     *
     * @param {number} percentage - New percentage value (0–100).
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        const path = this.images[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves the image index based on the current percentage value.
     *
     * The percentage is normalized to the range 0–100 and then mapped
     * to a 20% step interval (0, 20, 40, 60, 80, 100).
     *
     * Example mapping:
     * - 100 → 5
     * - 85  → 4
     * - 60  → 3
     * - 25  → 1
     * - 0   → 0
     *
     * @returns {number} Index of the corresponding status bar image.
     */

    resolveImageIndex() {
        const normalized = Math.max(0, Math.min(100, this.percentage));
        const step = Math.floor(normalized / 20);
        return step;
    }
}