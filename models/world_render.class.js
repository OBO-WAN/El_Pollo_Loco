/**
 * Handles all canvas drawing responsibilities for a {@link World} instance.
 * Keeps rendering concerns out of the main game/logic loop.
 */
class WorldRender {
    /**
     * @param {World} world
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Clears the full canvas (independent of camera transform).
     */
    clearCanvas() {
        const w = this.world;
        w.ctx.save();
        w.ctx.setTransform(1, 0, 0, 1, 0, 0);
        w.ctx.clearRect(0, 0, w.canvas.width, w.canvas.height);
        w.ctx.restore();
    }

    /**
     * Renders the current world frame (background, entities, UI, overlay).
     */
    render() {
        const aboveUi = this.shouldCharacterDrawAboveUi();
        this.drawWorldLayer(aboveUi);
        this.drawUiLayer();
        this.drawOverlayLayer(aboveUi);
    }

    /**
     * Draws the non-UI world content, applying the camera transform.
     * @param {boolean} aboveUi
     */
    drawWorldLayer(aboveUi) {
        this.drawBackground();

        this.withCamera(() => {
            this.drawClouds();
            this.drawEnemies();
            this.drawBottles();
            this.drawCoins();
            this.drawBottlesOnGround();
            if (!aboveUi) {
                this.drawCharacter();
            }
        });
    }

    /**
     * Draws HUD/UI elements in screen space (no camera translation).
     */
    drawUiLayer() {
        const w = this.world;
        const v = w.view;
        if (!v) return;

        w.ctx.save();
        w.ctx.setTransform(v.dpr * v.scale, 0, 0, v.dpr * v.scale, 0, 0);
        this.drawStatusBar();
        w.ctx.restore();
    }

    /**
     * Draws any overlays that should appear above the UI (e.g. character while in air).
     * @param {boolean} aboveUi
     */
    drawOverlayLayer(aboveUi) {
        if (!aboveUi) return;
        this.withCamera(() => this.drawCharacter());
    }

    /**
     * Determines if the character should render above the UI layer.
     * @returns {boolean}
     */
    shouldCharacterDrawAboveUi() {
        const w = this.world;
        return w.character?.isInAir?.() === true;
    }

    /**
     * Runs a drawing callback with the camera translation applied.
     * @param {Function} fn
     */
    withCamera(fn) {
        const w = this.world;
        w.ctx.save();
        w.ctx.translate(Math.floor(w.camera_x), 0);
        fn();
        w.ctx.restore();
    }

    /**
     * Draws background objects with optional parallax grouping.
     */
    drawBackground() {
        const w = this.world;
        const groups = new Map();

        w.level.backgroundObjects.forEach(obj => {
            const factor = obj.parallaxFactor ?? 1;
            if (!groups.has(factor)) groups.set(factor, []);
            groups.get(factor).push(obj);
        });

        for (const [factor, objects] of groups.entries()) {
            w.ctx.save();
            const tx = Math.floor(w.camera_x * factor);
            w.ctx.translate(tx, 0);
            this.addObjectsToMap(objects);
            w.ctx.restore();
        }
    }

    /**
     * Draws the main character.
     */
    drawCharacter() {
        this.addToMap(this.world.character);
    }

    /**
     * Draws the cloud layer.
     */
    drawClouds() {
        this.addObjectsToMap(this.world.level.clouds);
    }

    /**
     * Draws enemies.
     */
    drawEnemies() {
        this.addObjectsToMap(this.world.level.enemies);
    }

    /**
     * Draws status bars and (optionally) the endboss bar.
     */
    drawStatusBar() {
        const w = this.world;
        this.addToMap(w.statusBarHealth);
        this.addToMap(w.statusBarCoins);
        this.addToMap(w.statusBarBottles);

        if (w.endbossBarVisible && w.endboss && !w.endboss.dead) {
            this.addToMap(w.statusBarEndboss);
        }
    }

    /**
     * Draws throwable bottles currently in flight.
     */
    drawBottles() {
        this.addObjectsToMap(this.world.throwableObjects);
    }

    /**
     * Draws coins.
     */
    drawCoins() {
        this.addObjectsToMap(this.world.level.coins);
    }

    /**
     * Draws bottles placed on the ground in the level.
     */
    drawBottlesOnGround() {
        this.addObjectsToMap(this.world.level.bottles);
    }

    /**
     * Draws a list of drawable objects.
     * @param {Array<any>} objects
     */
    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    /**
     * Draws a single drawable object, handling horizontal flipping when needed.
     * @param {any} mo
     */
    addToMap(mo) {
        const w = this.world;
        if (mo.otherDirection) {
            this.flipImage(mo);
        } else {
            mo.draw(w.ctx);
        }
        if (mo.drawFrame) mo.drawFrame(w.ctx);
    }

    /**
     * Draws an object flipped horizontally (used when otherDirection is true).
     * @param {any} mo
     */
    flipImage(mo) {
        const w = this.world;
        if (!mo.img) return;

        w.ctx.save();
        w.ctx.translate(mo.x + mo.width, 0);
        w.ctx.scale(-1, 1);

        const oldX = mo.x;
        mo.x = 0;
        mo.draw(w.ctx);
        mo.x = oldX;

        w.ctx.restore();
    }
}
