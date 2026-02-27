/**
 * Handles all world-related audio and idle/sleep sound behavior.
 */
class WorldAudio {
    /**
     * @param {World} world
     */
    constructor(world) {
        this.world = world;
        this.coinSound = new Audio('assets/audio/coin.mp3');
        this.bottleSound = new Audio('assets/audio/bottle.mp3');
        this.throwBottleSound = new Audio('assets/audio/throw_bottle.mp3');
        this.snoringSound = new Audio('assets/audio/pepe-snoring.mp3');
        this.winSound = new Audio('assets/audio/win.mp3');
        this.gameOverSound = new Audio('assets/audio/game_over.mp3');
    }

    /**
     * Plays an audio clip (respects the global `isMuted` flag if present).
     * @param {HTMLAudioElement} audio
     * @param {{restart?: boolean}=} options
     */
    playSound(audio, { restart = true } = {}) {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (!audio) return;

        if (restart) audio.currentTime = 0;
        audio.play().catch(() => { });
    }

    /**
     * Checks for idle/sleep state and starts/stops snoring accordingly.
     */
    checkIdleState() {
        if (this.shouldSkipIdleCheck()) return;

        if (this.isCharacterMoving()) {
            this.resetIdleTimer();
            return;
        }

        this.startIdleCountdownIfNeeded();
    }

    /**
     * @returns {boolean}
     */
    shouldSkipIdleCheck() {
        const w = this.world;

        if (w.isPaused || w.character.isDead()) {
            this.stopSnoring();
            return true;
        }
        return false;
    }

    /**
     * @returns {boolean}
     */
    isCharacterMoving() {
        const k = this.world.keyboard;
        return !!(k.LEFT || k.RIGHT || k.UP || k.SPACE);
    }

    /**
     * Starts the idle countdown which, after a delay, triggers snoring.
     */
    startIdleCountdownIfNeeded() {
        const w = this.world;

        if (w.idleTimeout || w.isSnoring) return;

        w.idleTimeout = setTimeout(() => {
            this.startSnoring();
        }, 3000);
    }

    /**
     * Resets idle timer and stops snoring if the player interacts.
     */
    resetIdleTimer() {
        const w = this.world;

        if (w.idleTimeout) {
            clearTimeout(w.idleTimeout);
            w.idleTimeout = null;
        }

        w.isCharacterSleeping = false;
        this.stopSnoring();
    }

    /**
     * Starts the snoring loop and marks the character as sleeping.
     */
    startSnoring() {
        const w = this.world;

        if (w.isSnoring) return;

        w.isCharacterSleeping = true;

        this.snoringSound.loop = true;
        this.snoringSound.volume = 0.4;
        this.snoringSound.muted = typeof isMuted !== 'undefined' ? isMuted : false;
        this.snoringSound.currentTime = 0;
        this.snoringSound.play().catch(() => { });

        w.isSnoring = true;
    }

    /**
     * Stops snoring and clears idle state flags/timers.
     */
    stopSnoring() {
        const w = this.world;

        this.snoringSound.pause();
        this.snoringSound.currentTime = 0;

        w.isSnoring = false;
        w.isCharacterSleeping = false;

        if (w.idleTimeout) {
            clearTimeout(w.idleTimeout);
            w.idleTimeout = null;
        }
    }

    /**
     * Triggers the game over sequence once.
     */
    gameOver() {
        this.finishGame({
            overlayId: 'gameOverOverlay',
            sound: this.gameOverSound,
        });
    }

    /**
     * Triggers the win sequence once.
     */
    win() {
        this.finishGame({
            overlayId: 'winOverlay',
            sound: this.winSound,
        });
    }

    /**
     * Finishes the game: stops loops, background music and plays a sound + shows overlay.
     * @param {{overlayId: string, sound: HTMLAudioElement}} params
     */
    finishGame({ overlayId, sound }) {
        const w = this.world;

        if (w.isGameOver) return;

        w.isGameOver = true;
        w.isPaused = true;
        w.endbossAttackStarted = false;

        w.stopLoops();
        this.stopSnoring();

        if (typeof stopBackgroundMusic === 'function') {
            stopBackgroundMusic();
        }

        this.playSound(sound);

        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.style.display = 'flex';
    }
}
