/**
 * Represents a moving cloud background element.
 *
 * The Cloud object moves continuously to the left,
 * creating a dynamic sky background effect.
 *
 * This class extends {@link movableObject}.
 *
 * @class Cloud
 * @extends movableObject
 */
class Cloud extends movableObject {

    y = 20;
    height = 250;

    /**
     * Creates a new Cloud instance.
     *
     * - Loads the cloud image
     * - Sets a random horizontal start position
     * - Defines width
     * - Starts movement animation
     */
    constructor() {
        super().loadImage('assets/img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 500;
        this.width = 490;

        this.animateClouds();
    }

    /**
     * Initializes the cloud movement animation.
     *
     * @returns {void}
     */
    animateClouds() {
        this.moveLeft();
    }

    /**
     * Continuously moves the cloud to the left.
     *
     * The movement runs at approximately 60 FPS.
     * Speed: 0.15 pixels per frame.
     *
     * @returns {void}
     */
    moveLeft() {
        setInterval(() => {
            this.x -= 0.15;
        }, 1000 / 60);
    }
}