const STATE_8_BITS_MASK  = 0xFF;
const STATE_16_BITS_MASK = 0xFFFF;
const STATE_32_BITS_MASK = 0xFFFFFFFF;
const STATE_64_BITS_MASK = 0xFFFFFFFFFFFFFFFF;

const _set_bit = (bytes, bit, cut_off) => 
{
    bytes |= (cut_off & (1 << bit));
    return bytes;
}
const _set_bits = (bytes, bits, cut_off) => 
{
    for(const bit of bits) bytes |= (1 << bit);
    return cut_off & bytes;
}
const _is_bit_set = (bytes, bit, cut_off) =>
{
    return (cut_off & (bytes & (1 << bit))) != 0;
}
const _clear_bit = (bytes, bit, cut_off) =>
{
    bytes &= ~(1 << bit);
    return cut_off & bytes;
}

// Provides only 8 possible states
export const set_bit_8 = (bytes, bit) => 
{
    return _set_bit(bytes, bit, STATE_8_BITS_MASK);
}
export const set_bits_8 = (bytes, bits) => 
{
    return _set_bits(bytes, bits, STATE_8_BITS_MASK);
}
export const is_bit_set_8 = (bytes, bit) =>
{
    return _is_bit_set(bytes, bit, STATE_8_BITS_MASK);
}
export const clear_bit_8 = (bytes, bit) =>
{
    return _clear_bit(bytes, bit, STATE_8_BITS_MASK);
}

// Provides only 16 possible states
export const set_bit_16 = (bytes, bit) => 
{
    return _set_bit(bytes, bit, STATE_16_BITS_MASK);
}
export const set_bits_16 = (bytes, bits) => 
{
    return _set_bits(bytes, bits, STATE_16_BITS_MASK);
}
export const is_bit_set_16 = (bytes, bit) =>
{
    return _is_bit_set(bytes, bit, STATE_16_BITS_MASK);
}
export const clear_bit_16 = (bytes, bit) =>
{
    return _clear_bit(bytes, bit, STATE_16_BITS_MASK);
}

// Provides only 32 possible states
export const set_bit_32 = (bytes, bit) => 
{
    return _set_bit(bytes, bit, STATE_32_BITS_MASK);
}
export const set_bits_32 = (bytes, bits) => 
{
    return _set_bits(bytes, bits, STATE_32_BITS_MASK);
}
export const is_bit_set_32 = (bytes, bit) =>
{
    return _is_bit_set(bytes, bit, STATE_32_BITS_MASK);
}
export const clear_bit_32 = (bytes, bit) =>
{
    return _clear_bit(bytes, bit, STATE_32_BITS_MASK);
}

const MSEC = 1e-3;

const current_time = () => { return MSEC * (Date.now() - START_TIME);}

export class State32
{
	#state = 0;
    constructor(state=0){this.#state = state;}
    get state (){return this.#state;}
    clear     ()   {this.#state = 0;}
    set_bit   (bit){this.#state = set_bit_32(this.#state, bit);}
    clear_bit (bit){this.#state = clear_bit_32(this.#state, bit);}
    is_bit_set(bit){return is_bit_set_32(this.#state, bit);}
}

export class DynamicState
{
    #curr_state = 0;
    #prev_state = 0;
	#curr_inst_state = 0;
	#prev_inst_state = 0;
	#inst_state = 0;
	#state_change_time = 0;

    get instant_state          (){return this.#inst_state;}
    get curr_instant_state     (){return this.#curr_inst_state;}
    get prev_instant_state     (){return this.#prev_inst_state;}
    get curr_state             (){return this.#curr_state;}
    get prev_state             (){return this.#prev_state;}
    get last_state_change_time (){return this.#state_change_time;}
    get state_change_delta_time(){return current_time() - this.#state_change_time;}

    static #build_inst_state(prev, curr)
    {
        return curr | ( prev << 16);
    }
    
    _update()
    {
        this.#prev_inst_state = this.#curr_inst_state;
        this.#inst_state = DynamicState.#build_inst_state(this.#curr_inst_state, this.#prev_inst_state);   
    }

    _setup()
    {
        this._update();
        [this.#prev_inst_state, this.#curr_inst_state] = [this.#curr_inst_state, this.#curr_state];
        this.#inst_state = DynamicState.#build_inst_state(this.#curr_inst_state, this.#prev_inst_state);   
        this.#state_change_time = current_time();
    }

    set_bit  (bit)
    {
        [this.#prev_state, this.#curr_state] = [this.#curr_state, set_bit_16(this.#curr_state, bit)];
        this._setup();
    }

    clear_bit(bit)
    {
        [this.#prev_state, this.#curr_state] = [this.#curr_state, clear_bit_16(this.#curr_state, bit)];
        this._setup();
    }

	constructor (value=0)
	{
        this.#curr_state = value;
        this.#prev_state = 0;
        this.#curr_inst_state = value;
        this.#prev_inst_state = 0;
        this.#inst_state = 0;
        this.#state_change_time = 0;
        this._setup();
	}
}