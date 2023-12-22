var startTime = Date.now();
const SCALE_STEP = 0.1;
const MAX_SCALE = 10.0;
const MOVEMENT_STEP = 10.0;
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;
const NUMERICAL_ACCURACY = 1e-6;
const msec = 0.001;
const current_time = () => { return msec * (Date.now() - startTime);}

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
