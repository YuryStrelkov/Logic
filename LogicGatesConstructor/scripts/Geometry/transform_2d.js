import { Vector2d, Matrix3d } from "./geometry.js";
import { is_bit_set, clear_bit, DEG_TO_RAD, RAD_TO_DEG, set_bit } from "../VisualObjects/common.js";

class Transform2d 
{
	#position;
	#scale;
	#angle;
	#transform_m;
	#inv_transform_m;
	#transform_status;
	constructor(parent = null) {
		this.#position = new Vector2d(0.0, 0.0);
		this.#scale = new Vector2d(1.0, 1.0);
		this.#angle = 0.0;
		this.#transform_m = Matrix3d.identity();
		this.#inv_transform_m = Matrix3d.identity();
		this.#transform_status = 0;
	}
	/**
	 *
	 * @returns {boolean}
	 */
	get raw_transform() {
		return is_bit_set(this.#transform_status, RAW_TRANSFORM_BIT);
	}
	/**
	 * @param {boolean} value
	 * @returns {boolean}
	*/
	set raw_transform(value) {
		this.#transform_status = value
			? set_bit(this.#transform_status, RAW_TRANSFORM_BIT)
			: clear_bit(this.#transform_status, RAW_TRANSFORM_BIT);
	}
	/**
	 * @returns {boolean}
	 */
	get freeze() {
		return is_bit_set(this.#transform_status, FREEZE_TRANSFORM_BIT);
	}
	/**
	 * @param {boolean} value
	 * @returns {boolean}
	 */
	set freeze(value) {
		this.#transform_status = value
			? set_bit(this.#transform_status, FREEZE_TRANSFORM_BIT)
			: clear_bit(this.#transform_status, FREEZE_TRANSFORM_BIT);
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
		this.#position = value; //this.has_parent?this.parent.inv_world_transform_point(value):value;
		this.raw_transform = true;
	}
	
	set scale(value) {
		this.#scale = scale; //this.has_parent?this.parent.inv_world_transform_point(value):value;
		this.raw_transform = true;
	}
	
	set angle(value) {
		this.#angle = value * DEG_TO_RAD;
		this.raw_transform = true;
	}
	
	get position() {
		return this.#position; //this.has_parent?this.parent.inv_world_transform_point(value):value;
	}
	
	get scale() {
		return this.#scale; //this.has_parent?this.parent.inv_world_transform_point(value):value;
	}
	
	get angle() {
		return this.#angle * RAD_TO_DEG;// = value * DEG_TO_RAD;
	}
	
	reset() {
		this.angle = 0.0;
		this.position = new Vector2d(0.0, 0.0);
		this.scale = new Vector2d(1.0, 1.0);
		this.raw_transform = true;
	}
}