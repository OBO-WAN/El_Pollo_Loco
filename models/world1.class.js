
    render() {
        const aboveUi = this.shouldCharacterDrawAboveUi();
        this.drawWorldLayer(aboveUi);
        this.drawUiLayer();
        this.drawOverlayLayer(aboveUi);
    }

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

    drawUiLayer() {
        this.drawStatusBar();
    }

    drawOverlayLayer(aboveUi) {
        if (!aboveUi) return;
        this.withCamera(() => this.drawCharacter());
    }

    shouldCharacterDrawAboveUi() {
        return this.character?.isInAir?.() === true;
    }

    withCamera(fn) {
        this.ctx.save();
        this.ctx.translate(Math.floor(this.camera_x), 0);
        fn();
        this.ctx.restore();
    }

    drawBackground() {
        const groups = new Map();

        this.level.backgroundObjects.forEach(obj => {
            const factor = obj.parallaxFactor ?? 1;
            if (!groups.has(factor)) groups.set(factor, []);
            groups.get(factor).push(obj);
        });

        for (const [factor, objects] of groups.entries()) {
            this.ctx.save();
            const tx = Math.floor(this.camera_x * factor);
            this.ctx.translate(tx, 0);
            this.addObjectsToMap(objects);
            this.ctx.restore();
        }
    }

    drawCharacter() {
        this.addToMap(this.character);
    }

    drawClouds() {
        this.addObjectsToMap(this.level.clouds);
    }

    drawEnemies() {
        this.addObjectsToMap(this.level.enemies);
    }
    drawStatusBar() {
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        if (this.endbossBarVisible && this.endboss && !this.endboss.dead) {
            this.addToMap(this.statusBarEndboss);
        }
    }

    drawBottles() {
        this.addObjectsToMap(this.throwableObjects);
    }

    drawCoins() {
        this.addObjectsToMap(this.level.coins);
    }
    drawBottlesOnGround() {
        this.addObjectsToMap(this.level.bottles);
    }


    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        } else {
            mo.draw(this.ctx);
        }
        if (mo.drawFrame) mo.drawFrame(this.ctx);
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
        this.ctx.restore();
    }

    resetIdleTimer() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
        this.isCharacterSleeping = false;
        this.stopSnoring();
    }

    startSnoring() {
        if (this.isSnoring) return;
        this.isCharacterSleeping = true;
        this.snoringSound.loop = true;
        this.snoringSound.volume = 0.4;
        this.snoringSound.muted = isMuted;
        this.snoringSound.currentTime = 0;
        this.snoringSound.play().catch(() => { });
        this.isSnoring = true;
    }

    stopSnoring() {
        this.snoringSound.pause();
        this.snoringSound.currentTime = 0;

        this.isSnoring = false;
        this.isCharacterSleeping = false;

        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
    }

    stopLoops() {
        if (this.collisionInterval) clearInterval(this.collisionInterval);
        this.collisionInterval = null;

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }


    playSound(audio, { restart = true } = {}) {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (!audio) return;

        if (restart) audio.currentTime = 0;
        audio.play().catch(() => { });
    }

    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;

        if (!this.animationFrameId) {
            this.draw();
        }
    }


    initStatusBars() {

        this.statusBarHealth.setImages(this.statusBarHealth.HEALTH_BAR_IMAGES);
        this.statusBarHealth.setPercentage(this.character.energy);
        this.statusBarHealth.x = 20;
        this.statusBarHealth.y = 10;


        this.statusBarCoins.setImages(this.statusBarCoins.COIN_BAR_IMAGES);
        this.statusBarCoins.setPercentage(0);
        this.statusBarCoins.x = 20;
        this.statusBarCoins.y = 60;


        this.statusBarBottles.setImages(this.statusBarBottles.BOTTLE_BAR_IMAGES);
        this.statusBarBottles.setPercentage(0);
        this.statusBarBottles.x = 20;
        this.statusBarBottles.y = 110;
    }

    resolveEndbossWall() {
        if (!this.endboss || this.endboss.dead) return;

        if (this.character.isColliding(this.endboss)) {
            const bossLeft = this.endboss.x;
            const padding = 6;

            if (this.character.x < bossLeft) {
                this.character.x = bossLeft - this.character.width + padding;
            }
        }
    }

    clampCharacterToWorld() {
        if (this.character.x < 0) this.character.x = 0;
    }

}
