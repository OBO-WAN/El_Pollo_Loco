/**
 * Base class for all movable game objects.
 *
 * Extends {@link DrawableObject} and adds:
 * - Horizontal movement
 * - Gravity & jumping physics
 * - Collision detection
 * - Health system
 * - Animation handling
 *
 * @class movableObject
 * @extends DrawableObject
 */
class movableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.0;
    energy = 100;
    lastHit = 0;

    /**
     * Applies gravity to the object.
     *
     * Updates vertical position 25 times per second.
     * Stops falling when ground level is reached.
     *
     */
    applyGravity() {
        setInterval(() => {
            const groundY = (typeof this.groundY === 'number') ? this.groundY : 180;

            if (this.isInAir() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;

                if (this.y > groundY) {
                    this.y = groundY;
                    this.speedY = 0;
                }
            } else {
                this.speedY = 0;
                this.y = groundY;
            }
        }, 1000 / 25);
    }

    /**
     * Checks whether the object is currently in the air.
     *
     * ThrowableObjects are always considered airborne.
     *
     * @returns {boolean}
     */
    isInAir() {
        if (this instanceof ThrowableObject) return true;

        const groundY = (typeof this.groundY === 'number') ? this.groundY : 180;
        return this.y < groundY;
    }

    /**
     * Checks collision between this object and another movable object.
     *
     * Uses optional hitbox offsets for more accurate collision detection.
     *
     * @param {movableObject} mo - The other movable object.
     * @returns {boolean} True if objects overlap.
     */
    isColliding(mo) {
        const a = this.offset || { top: 0, right: 0, bottom: 0, left: 0 };
        const b = mo.offset || { top: 0, right: 0, bottom: 0, left: 0 };

        return (
            this.x + a.left < mo.x + mo.width - b.right &&
            this.x + this.width - a.right > mo.x + b.left &&
            this.y + a.top < mo.y + mo.height - b.bottom &&
            this.y + this.height - a.bottom > mo.y + b.top
        );
    }

    /**
     * Reduces energy when the object is hit.
     *
     * - Prevents damage if invincible
     * - Reduces energy by 5
     * - Updates last hit timestamp
     *
     */
    hit() {
        if (typeof this.isInvincible === 'function' && this.isInvincible()) {
            return;
        }
        this.energy -= 5;

        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = Date.now();
        }
    }

    /**
     * Checks if the object has no remaining energy.
     *
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Checks whether the object is currently in a hurt state.
     * The hurt state lasts 1 second after being hit.
     *
     * @returns {boolean}
     */
    isHurt() {
        const timePassed = (Date.now() - this.lastHit) / 1000;
        return timePassed < 1;
    }

    /**
     * Plays an animation by cycling through provided image paths.
     *
     * Uses cached images from {@link DrawableObject#imageCache}.
     *
     * @param {string[]} images - Array of image paths.
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }

    /**
     * Moves the object to the right.
     *
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left.
     *
     */
    moveLeft() {
        this.x -= this.speed;
    }
}