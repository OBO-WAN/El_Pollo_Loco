/**
 * Renders a {@link World} onto its canvas.
 * Keeps drawing separate from game logic.
 */
class WorldRender {
    /**
     * @param {World} world Active world instance.
     */
    constructor(world) {
        /** @type {World} */
        this.world = world;
    }

    /**
     * Clears the full canvas in screen space (ignores camera transform).
     * @returns {void}
     */
    clearCanvas() {
        const world = this.world;

        world.ctx.save();
        world.ctx.setTransform(1, 0, 0, 1, 0, 0);
        world.ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
        world.ctx.restore();
    }

    /**
     * Renders the current frame (world, UI and overlays).
     * @returns {void}
     */
    render() {
        const drawCharacterAboveUi = this.shouldCharacterDrawAboveUi();
        this.drawWorldLayer(drawCharacterAboveUi);
        this.drawUiLayer();
        this.drawOverlayLayer(drawCharacterAboveUi);
    }

    /**
     * Draws non-UI world content with camera transform applied.
     * @param {boolean} drawCharacterAboveUi Whether character should be drawn above UI.
     * @returns {void}
     */
    drawWorldLayer(drawCharacterAboveUi) {
        this.drawBackground();

        this.withCamera(() => {
            this.drawClouds();
            this.drawEnemies();
            this.drawBottles();
            this.drawCoins();
            this.drawBottlesOnGround();

            if (!drawCharacterAboveUi) {
                this.drawCharacter();
            }
        });
    }

    /**
     * Draws HUD/UI elements in screen space (no camera translation).
     * @returns {void}
     */
    drawUiLayer() {
        const world = this.world;
        const view = world.view;
        if (!view) return;

        world.ctx.save();
        world.ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, 0);
        this.drawStatusBar();
        world.ctx.restore();
    }

    /**
     * Draws overlays that must appear above the UI (e.g. character while in air).
     * @param {boolean} drawCharacterAboveUi Whether character should be drawn above UI.
     * @returns {void}
     */
    drawOverlayLayer(drawCharacterAboveUi) {
        if (!drawCharacterAboveUi) return;
        this.withCamera(() => this.drawCharacter());
    }

    /**
     * Checks if the character should render above the UI layer.
     * @returns {boolean}
     */
    shouldCharacterDrawAboveUi() {
        const world = this.world;
        return world.character?.isInAir?.() === true;
    }

    /**
     * Runs a draw callback with camera translation applied.
     * @param {Function} callback Drawing function.
     * @returns {void}
     */
    withCamera(callback) {
        const world = this.world;

        world.ctx.save();
        world.ctx.translate(Math.floor(world.camera_x), 0);
        callback();
        world.ctx.restore();
    }

    /**
     * Draws background objects with parallax grouping.
     * @returns {void}
     */
    drawBackground() {
        const world = this.world;
        const groupsByFactor = new Map();

        world.level.backgroundObjects.forEach(backgroundObject => {
            const parallaxFactor = backgroundObject.parallaxFactor ?? 1;
            if (!groupsByFactor.has(parallaxFactor)) groupsByFactor.set(parallaxFactor, []);
            groupsByFactor.get(parallaxFactor).push(backgroundObject);
        });

        for (const [parallaxFactor, objects] of groupsByFactor.entries()) {
            world.ctx.save();
            const translateX = Math.floor(world.camera_x * parallaxFactor);
            world.ctx.translate(translateX, 0);
            this.addObjectsToMap(objects);
            world.ctx.restore();
        }
    }

    /**
     * Draws the main character.
     * @returns {void}
     */
    drawCharacter() {
        this.addToMap(this.world.character);
    }

    /**
     * Draws the cloud layer.
     * @returns {void}
     */
    drawClouds() {
        this.addObjectsToMap(this.world.level.clouds);
    }

    /**
     * Draws enemies.
     * @returns {void}
     */
    drawEnemies() {
        this.addObjectsToMap(this.world.level.enemies);
    }

    /**
     * Draws status bars and (optionally) the endboss bar.
     * @returns {void}
     */
    drawStatusBar() {
        const world = this.world;

        this.addToMap(world.statusBarHealth);
        this.addToMap(world.statusBarCoins);
        this.addToMap(world.statusBarBottles);

        if (world.endbossBarVisible && world.endboss && !world.endboss.dead) {
            this.addToMap(world.statusBarEndboss);
        }
    }

    /**
     * Draws throwable bottles currently in flight.
     * @returns {void}
     */
    drawBottles() {
        this.addObjectsToMap(this.world.throwableObjects);
    }

    /**
     * Draws coins.
     * @returns {void}
     */
    drawCoins() {
        this.addObjectsToMap(this.world.level.coins);
    }

    /**
     * Draws bottles placed on the ground in the level.
     * @returns {void}
     */
    drawBottlesOnGround() {
        this.addObjectsToMap(this.world.level.bottles);
    }

    /**
     * Draws a list of drawable objects.
     * @param {Array<any>} objects Objects to draw.
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach(drawable => this.addToMap(drawable));
    }

    /**
     * Draws a single object and its debug frame, handling horizontal flipping.
     * @param {any} drawable Object to draw.
     * @returns {void}
     */
    addToMap(drawable) {
        const world = this.world;

        if (drawable.otherDirection) {
            this.flipImage(drawable);
        } else {
            drawable.draw(world.ctx);
        }

        if (drawable.drawFrame) drawable.drawFrame(world.ctx);
    }

    /**
     * Draws an object flipped horizontally (used when otherDirection is true).
     * @param {any} drawable Object to draw.
     * @returns {void}
     */
    flipImage(drawable) {
        const world = this.world;
        if (!drawable.img) return;

        world.ctx.save();
        world.ctx.translate(drawable.x + drawable.width, 0);
        world.ctx.scale(-1, 1);

        const previousX = drawable.x;
        drawable.x = 0;
        drawable.draw(world.ctx);
        drawable.x = previousX;

        world.ctx.restore();
    }
}
