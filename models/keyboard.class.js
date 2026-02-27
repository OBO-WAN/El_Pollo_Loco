/**
 * Represents the keyboard input state of the player.
 *
 * This class stores boolean flags for relevant control keys.
 * It does not handle event listeners itself — it is intended
 * to be updated externally (e.g., via keydown/keyup events).
 *
 * Example usage:
 * const keyboard = new Keyboard();
 * window.addEventListener('keydown', (e) => keyboard.LEFT = true);
 *
 * @class Keyboard
 */
class Keyboard {

    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
}