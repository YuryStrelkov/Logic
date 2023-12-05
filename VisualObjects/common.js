var startTime = Date.now();
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;
const NUMERICAL_ACCURACY = 1e-6;
const is_number = (value) => { return typeof value === 'number'; }

const current_time = () => { return Date.now() - startTime;}

const set_bit = (bytes, bit) => 
{
    bytes |= (1 << bit);
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

// const MOUSE_L_HOLD    = 2;
// const MOUSE_L_PRESS   = 3;
// const MOUSE_L_RELEASE = 4;
// const MOUSE_R_HOLD    = 5;
// const MOUSE_R_PRESS   = 6;
// const MOUSE_R_RELEASE = 7;
// const MOUSE_M_HOLD    = 8;
// const MOUSE_M_PRESS   = 9;
// const MOUSE_M_RELEASE = 10;