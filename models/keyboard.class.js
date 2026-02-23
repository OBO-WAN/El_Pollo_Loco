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

    /**
     * Indicates whether the LEFT key is pressed.
     * @type {boolean}
     * @default false
     */
    LEFT = false;

    /**
     * Indicates whether the RIGHT key is pressed.
     * @type {boolean}
     * @default false
     */
    RIGHT = false;

    /**
     * Indicates whether the UP key is pressed.
     * @type {boolean}
     * @default false
     */
    UP = false;

    /**
     * Indicates whether the DOWN key is pressed.
     * @type {boolean}
     * @default false
     */
    DOWN = false;

    /**
     * Indicates whether the SPACE key is pressed.
     * Typically used for actions such as throwing.
     *
     * @type {boolean}
     * @default false
     */
    SPACE = false; // throw
}