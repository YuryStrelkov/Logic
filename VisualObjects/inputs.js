
const KEY_UP      = 0;
const KEY_PRESS   = 1;
const KEY_HOLD    = 2;
const KEY_RELEASE = 3;
const KEY_STATES  = 4;    
                           /* INPUT -> |  UP  | PRESS | HOLD | RELEASE */
const KEY_STATE_MACHINE = [/*     UP */      0,      1,     0,       0, 
                           /*  PRESS */      0,      0,     1,       1, 
                           /*   HOLD */      0,      0,     0,       1, 
                           /*RELEASE */      1,      0,     0,       0]; 

const MOUSE_MOVE   = 0;
const MOUSE_DRAG   = 1;
const MOUSE_SCROLL = 2;

const NO_BUTTON          = 0;
const LEFT_BUTTON_BIT    = 0;
const RIGHT_BUTTON_BIT   = 1;
const MIDDLE_BUTTON_BIT  = 2;
const BACK_BUTTON_BIT    = 3;
const FORWARD_BUTTON_BIT = 4;

class KeyState
{
	#_state = KEY_UP;
	constructor() {}
    
    #validate_state_change(state){ return KEY_STATE_MACHINE[state + this.state * KEY_STATES] === 1; }

    update(state)
    {
        if(!this.#validate_state_change(state)) return;
        this.#_state = state;
    }
    reset         (){this.#_state = KEY_UP; }
	get state     (){return this.#_state;}
	get on_press  (){return this.state === KEY_PRESS  ;}
	get on_hold   (){return this.state === KEY_HOLD   ;}
	get on_up     (){return this.state === KEY_UP     ;}
	get on_release(){return this.state === KEY_RELEASE;}
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
        this.#position       = new Vector2d();
        this.#press_position = new Vector2d();
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