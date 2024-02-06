// // @ts-check
import { Vector2d } from "../Geometry/geometry.js";
import { RenderCanvas } from "../Rendering/renderCanvas.js";

const MOUSE_MOVE   = 0;
const MOUSE_DRAG   = 1;
const MOUSE_SCROLL = 2;

const NO_BUTTON          = 0;
const LEFT_BUTTON_BIT    = 0;
const RIGHT_BUTTON_BIT   = 1;
const MIDDLE_BUTTON_BIT  = 2;
const BACK_BUTTON_BIT    = 3;
const FORWARD_BUTTON_BIT = 4;
const MAX_KEYS_COUNT = 256;

/**
 * Состояния:
 *|  prev | curr  |       | 
 *________________________
 *|   P   |   P   | value | state
 *________________________
 *|   0   |   0   |   0   | on_idle
 *|   0   |   1   |   2   | on_begin_press
 *|   1   |   1   |   3   | on_press
 *|   1   |   0   |   1   | on_end_press
 *________________________
 */
const KEY_IDLE = 0;
const KEY_BEGIN_PRESS = 2;
const KEY_PRESS = 3;
const KEY_END_PRESS = 1;
class KeyState
{
    #state;
    constructor() {}
    update()
    {
        this.#state;
    }
    reset             (){ this.#state = 0; }
	get state         (){return this.#state;}
	get on_begin_press(){return this.#state === KEY_BEGIN_PRESS;}
	get on_end_press  (){return this.#state === KEY_END_PRESS;}
	get on_press      (){return this.#state === KEY_PRESS;}
	get on_idle       (){return this.#state === KEY_IDLE;}
}

class KeyboardInfo
{
    static _instance = new KeyboardInfo();
    static get instance() { return KeyboardInfo._instance;}
    #begin_press_keys = null;
    #press_keys       = null;
    #end_press_keys   = null;
    constructor()
    {
        if(KeyboardInfo.instance != null) return KeyboardInfo.instance;
        this.#begin_press_keys = new Set();
        this.#press_keys       = new Set();
        this.#end_press_keys   = new Set();
    }
    
    is_key_begin_pressed(key_code) { return this.#begin_press_keys.has(key_code);}
    is_key_pressed      (key_code) { return this.#press_keys.has      (key_code);}
    is_key_end_pressed  (key_code) { return this.#end_press_keys.has  (key_code);}
    
    update_begin_press_key(evt)
    {
        this.#begin_press_keys.add (evt.keyCode);
        this.#end_press_keys.delete(evt.keyCode);
        console.log(`begin press ${evt.keyCode}`);
    }
    
    update_press_key(evt)
    {
        this.#begin_press_keys.delete(evt.keyCode);
        this.#press_keys.add         (evt.keyCode);
        // console.log(evt.keyCode);
        console.log(`press ${evt.keyCode}`);
        // console.log(this.#press_keys);
    }

    update_end_press_key(evt)
    {
        this.#press_keys.delete (evt.keyCode);
        this.#end_press_keys.add(evt.keyCode);
        console.log(`end press ${evt.keyCode}`);
        //console.log(evt.keyCode);
        // console.log(this.#press_keys);
    }

    clear_released_keys() { this.#end_press_keys.clear(); }
}

const canvas_clique_coord = (evt) => { return new Vector2d(evt.clientX - RenderCanvas.instance.canvas.offsetLeft,
                                                           evt.clientY - RenderCanvas.instance.canvas.offsetTop);}
class MouseInfo
{
    static _instance = new MouseInfo();
    static get instance() { return MouseInfo._instance;}
    #keys;
    #position;
    #press_position;
    constructor()
    {
        if(MouseInfo.instance != null) return MouseInfo.instance;
        this.#keys           = 0;
        this.#position       = new Vector2d(1e32, 1e32);
        this.#press_position = new Vector2d(1e32, 1e32);
    }
    on_down(evt)
    {
        this.#keys           = evt.buttons;
        this.#position       = canvas_clique_coord(evt);
        this.#press_position = canvas_clique_coord(evt);
    }
    on_move (evt) { this.#position = canvas_clique_coord(evt);}
    on_up   (evt) { this.#keys = evt.buttons;}
    on_reset(evt) { this.#keys = 0;}
    get position      (){return this.#position;}
    get press_position(){return this.#press_position;}
    get keys          (){return this.#keys;}
    get is_any_down   ()
    {
        if(this.is_left_down)  return true;
        if(this.is_right_down) return true;
        if(this.is_middle_down)return true;
        return false;
    }
    get is_left_down  (){return is_bit_set(this.keys, LEFT_BUTTON_BIT);  }
    get is_right_down (){return is_bit_set(this.keys, RIGHT_BUTTON_BIT) ;}
    get is_middle_down(){return is_bit_set(this.keys, MIDDLE_BUTTON_BIT);}
    get is_left_up    (){return !this.is_left_down;  }
    get is_right_up   (){return !this.is_right_down; }
    get is_middle_up  (){return !this.is_middle_down;}
}

export {KeyState, KeyboardInfo, MouseInfo}