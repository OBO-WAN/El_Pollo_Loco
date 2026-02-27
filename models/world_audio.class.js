/**
 * Manages all world-related audio including effects,
 * idle detection and endgame sounds.
 */
class WorldAudio {

    /**
     * Creates a new audio manager.
     * @param {World} world Reference to the active world instance.
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
     * Plays an audio element.
     * @param {HTMLAudioElement} audio Audio instance to play.
     * @param {{restart?: boolean}} [options] Playback options.
     * @param {boolean} [options.restart=true] Restart audio from beginning.
     * @returns {void}
     */
    playSound(audio, { restart = true } = {}) {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (!audio) return;

        if (restart) audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    /**
     * Evaluates idle state and handles snoring logic.
     * @returns {void}
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
     * Determines if idle check should be skipped.
     * @returns {boolean} True if paused or character is dead.
     */
    shouldSkipIdleCheck() {
        const world = this.world;

        if (world.isPaused || world.character.isDead()) {
            this.stopSnoring();
            return true;
        }
        return false;
    }

    /**
     * Checks whether the character is currently moving.
     * @returns {boolean}
     */
    isCharacterMoving() {
        const keyboard = this.world.keyboard;
        return !!(keyboard.LEFT || keyboard.RIGHT || keyboard.UP || keyboard.SPACE);
    }

    /**
     * Starts idle timeout that triggers snoring.
     * @returns {void}
     */
    startIdleCountdownIfNeeded() {
        const world = this.world;

        if (world.idleTimeout || world.isSnoring) return;

        world.idleTimeout = setTimeout(() => {
            if (this.shouldSkipIdleCheck()) return;
            this.startSnoring();
        }, 3000);
    }

    /**
     * Clears idle timeout and stops snoring.
     * @returns {void}
     */
    resetIdleTimer() {
        const world = this.world;

        if (world.idleTimeout) {
            clearTimeout(world.idleTimeout);
            world.idleTimeout = null;
        }

        world.isCharacterSleeping = false;
        this.stopSnoring();
    }

    /**
     * Starts looping snoring sound and marks sleeping state.
     * @returns {void}
     */
    startSnoring() {
        const world = this.world;

        if (world.isSnoring) return;

        world.isCharacterSleeping = true;

        this.snoringSound.loop = true;
        this.snoringSound.volume = 0.4;
        this.snoringSound.muted = typeof isMuted !== 'undefined' ? isMuted : false;
        this.snoringSound.currentTime = 0;
        this.snoringSound.play().catch(() => {});

        world.isSnoring = true;
    }

    /**
     * Stops snoring and resets idle state.
     * @returns {void}
     */
    stopSnoring() {
        const world = this.world;

        this.snoringSound.pause();
        this.snoringSound.currentTime = 0;

        world.isSnoring = false;
        world.isCharacterSleeping = false;

        if (world.idleTimeout) {
            clearTimeout(world.idleTimeout);
            world.idleTimeout = null;
        }
    }

    /**
     * Triggers game-over sequence.
     * @returns {void}
     */
    gameOver() {
        this.finishGame({
            overlayId: 'gameOverOverlay',
            sound: this.gameOverSound,
        });
    }

    /**
     * Triggers win sequence.
     * @returns {void}
     */
    win() {
        this.finishGame({
            overlayId: 'winOverlay',
            sound: this.winSound,
        });
    }

    /**
     * Finalizes the game state and shows result overlay.
     * @param {{overlayId: string, sound: HTMLAudioElement}} params
     * @param {string} params.overlayId DOM id of overlay element.
     * @param {HTMLAudioElement} params.sound Endgame sound to play.
     * @returns {void}
     */
    finishGame({ overlayId, sound }) {
        const world = this.world;

        if (world.isGameOver) return;

        world.isGameOver = true;
        world.isPaused = true;
        world.endbossAttackStarted = false;

        world.stopLoops();
        this.stopSnoring();

        if (typeof stopBackgroundMusic === 'function') {
            stopBackgroundMusic();
        }

        this.playSound(sound);

        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.style.display = 'flex';
    }
}