const START_TIME          = Date.now();
const SCALE_STEP    	  = 1.0;
const MAX_SCALE     	  = 10.0;
const MOVEMENT_STEP 	  = 10.0;
const DEG_TO_RAD    	  = Math.PI / 180.0;
const RAD_TO_DEG    	  = 180.0 / Math.PI;
const NUMERICAL_ACCURACY  = 1e-6;
const MSEC                = 1e-3;

const current_time = () => { return MSEC * (Date.now() - START_TIME);}

const set_bit = (bytes, bit) => 
{
    bytes |= (1 << bit);
    return bytes;
}
const set_bits = (bytes, bits) => 
{
    for(const bit of bits) bytes |= (1 << bit);
    return bytes;
}
const is_bit_set = (bytes, bit) =>
{
    return (bytes & (1 << bit)) != 0;
}
const clear_bit = (bytes, bit) =>
{
    bytes &= ~(1 << bit);
    return bytes;
}

/**
 * Состояния:
 *|  prev | curr  |       | 
 *________________________
 *| F | P | F | P | value | state
 *________________________
 *| 0 | 0 | 0 | 0 |   0   | on_idle
 *| 0 | 0 | 1 | 0 |   4   | on_begin_focus
 *| 1 | 0 | 1 | 0 |   5   | on_focus
 *| 1 | 0 | 0 | 0 |   1   | on_end_focus
 *| 1 | 0 | 1 | 1 |   13  | on_begin_press
 *| 1 | 1 | 1 | 0 |   7   | on_end_press
 *| 1 | 1 | 1 | 1 |   15  | on_press
 *| 1 | 1 | 0 | 1 |   10  | on_press 
 *| 0 | 1 | 1 | 1 |   14  | on_press 
 *| 0 | 1 | 0 | 0 |   2   | on_end_press
 *________________________
 */
const MOUSE_INPUTS_MASK      = 3
const MOUSE_INPUTS_MASK_BITS = 2
const ON_IDLE_STATE          = 0

const ON_FOCUS_BEGIN_STATE   = 4;
const ON_FOCUS_STATE         = 5;
const ON_FOCUS_END_STATE     = 1;
const ON_PRESS_BEGIN_STATE   = 13;
const ON_PRESS_STATE_1       = 15;
const ON_PRESS_STATE_2       = 14;
const ON_PRESS_STATE_3       = 10;
const ON_PRESS_END_STATE_1   = 7;
const ON_PRESS_END_STATE_2   = 2;
const OBJECT_FOCUS_BIT       = 0;
const OBJECT_PRESS_BIT       = 1;
const OBJECT_TOGGLE_BIT      = 2;
const OBJECT_SHOW_BIT        = 3;
const OBJECT_FOCUSABLE_BIT   = 4;
const OBJECT_VIEWPORT_CAST   = 5;
const OBJECT_SELECTABLE_BIT  = 6;
const OBJECT_MOVEABLE_BIT    = 7;
const OBJECT_COLOR_INFO_MASK = set_bits(0, [OBJECT_FOCUS_BIT, OBJECT_PRESS_BIT, OBJECT_TOGGLE_BIT]);
class ObjectState
{
	#curr_absolute_state = 0;
	#prev_absolute_state = 0;
	#curr_state          = 0;
	#prev_state          = 0;
	#inst_state          = 0;
	#state_change_time   = 0;
	constructor (value=0)
	{
		 this.#curr_state = value;
		 this.#prev_state = value;
		 this.#curr_absolute_state = value;
		 this.#prev_absolute_state = value;
		 this.#state_change_time = 0.0;
	}
    /**
     * Мгновенное значение состояния
     */
	get inst_state    () { this._update(); return this.#inst_state;}
	get curr_state    () { return this.#curr_state;}
	get prev_state    () { return this.#prev_state;}
	get curr_absolute_state () { return this.#curr_absolute_state;}
	get prev_absolute_state () { return this.#prev_absolute_state;}
	get on_focus      () { return is_bit_set(this.curr_state, OBJECT_FOCUS_BIT);}
	get on_press      () { return is_bit_set(this.curr_state, OBJECT_PRESS_BIT);}
	get state_time    () { return current_time() - this.#state_change_time;}
	_setup  (state, key) 
	{ 
		this.#curr_state = state ? set_bit(this.curr_state, key): clear_bit(this.curr_state, key);
		if(is_bit_set(this.curr_absolute_state, key) == state)return;
		this.#state_change_time   = current_time();
		this.#prev_absolute_state = this.#curr_absolute_state;
		this.#curr_absolute_state = state ? set_bit(this.curr_absolute_state, key): clear_bit(this.curr_absolute_state, key);
	}
	_update ()
	{
		this.#inst_state = (this.prev_state & MOUSE_INPUTS_MASK)|((this.curr_state & MOUSE_INPUTS_MASK) << MOUSE_INPUTS_MASK_BITS);
		this.#prev_state = this.#curr_state;
	}
	set on_focus (value) 
	{	
		 this._setup(value, OBJECT_FOCUS_BIT)
	}
	set on_press (value) 
	{
		this._setup(value, OBJECT_PRESS_BIT);
	}
}