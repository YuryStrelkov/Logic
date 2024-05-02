import { Matrix3d } from "./matrix3d.js";
import { Vector2d } from "./matrix3d.js";
import {State32} from "../Utils/bit_set.js"
const RAW_TRANSFORM_BIT = 0;
const SYNC_TRANSFORM_BIT = 1;
const FREEZE_TRANSFORM_BIT = 2;
class Transform2d{
  #position;
  #scale;
  #angle;
  //////////////////
  #transform_m;
  #inv_transform_m;
  /////////////////
  #transform_status;
  constructor() {
    this.#position        = new Vector2d(0.0, 0.0);
    this.#scale           = new Vector2d(1.0, 1.0);
    this.#angle           = 0.0;
    this.#transform_m     = Matrix3d.identity();
    this.#inv_transform_m = Matrix3d.identity();
    this.#transform_status = new State32();
  }

update_transform()
{
  if(this.freeze) return false;
  if(!this.raw_transform)return false;
  this.raw_transform = false;
  this.#update_forward_transform();
  this.#update_backward_transform();
  return true;
}

#update_forward_transform ()
{
		this.#transform_m = Matrix3d.build_transform_2d(
			this.position,
			this.scale,
			this.#angle
		);
}

#update_backward_transform()
{
  this.#inv_transform_m = Matrix3d.build_inv_transform_2d(
    this.position,
    this.scale,
    this.#angle
  );
}

  /**
   *
   * @returns {boolean}
   */
  get raw_transform() {
    return this.#transform_status.is_bit_set(RAW_TRANSFORM_BIT);
    // return is_bit_set(this.#transform_status, RAW_TRANSFORM_BIT);
  }
  /**
   * @param {boolean} value
   * @returns {boolean}
   */
  set raw_transform(value) {
    if(value)
      this.#transform_status.set_bit(RAW_TRANSFORM_BIT);
    else
      this.#transform_status.clear_bit(RAW_TRANSFORM_BIT);
  }
  /**
   * @returns {boolean}
   */
  get freeze() {
    return this.#transform_status.is_bit_set(FREEZE_TRANSFORM_BIT);
  }
  /**
   * @param {boolean} value
   * @returns {boolean}
   */
  set freeze(value) {
    if(value)
      this.#transform_status.set_bit(FREEZE_TRANSFORM_BIT);
    else
      this.#transform_status.clear_bit(FREEZE_TRANSFORM_BIT);
  }
  /**
   * @returns {Matrix3d}
   */
  get transform_m() {
    return this.#transform_m;
  }
  /**
   * @returns {Matrix3d}
   */
  get inv_transform_m() {
    return this.#inv_transform_m;
  }

  set position(value) {
    this.#position = value; 
    this.raw_transform = true;
  }

  set scale(value) {
    this.#scale = value;
    this.raw_transform = true;
  }

  set angle(value) {
    this.angle_rad = value * DEG_TO_RAD 
  }

  set angle_rad(value) {
    this.#angle = value;
    this.raw_transform = true;
  }

  get position() {
    return this.#position;
  }

  get scale() {
    return this.#scale;
  }

  get angle_rad() {
    return this.#angle; 
  }
  
  get angle() {
    return this.angle_rad * RAD_TO_DEG; 
  }

  reset() {
    this.angle = 0.0;
    this.position = new Vector2d(0.0, 0.0);
    this.scale = new Vector2d(1.0, 1.0);
    this.raw_transform = true;
  }
}
