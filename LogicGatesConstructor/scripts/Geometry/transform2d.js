import { Vector2d, Matrix3d } from "./geometry.js";
import { is_bit_set, clear_bit, DEG_TO_RAD, RAD_TO_DEG, set_bit } from "../VisualObjects/common.js";

const RAW_TRANSFORM_BIT = 0;
const SYNC_TRANSFORM_BIT = 1;
const FREEZE_TRANSFORM_BIT = 2;
class Transform2d {
	static #transforms_layers = null;
	static #root = null;
	static init_transforms() {
		if (Transform2d.#root != null) return;
		Transform2d.#transforms_layers = new Map();
		Transform2d.#root = new Transform2d();
		Transform2d.#append_to_transform_layers(Transform2d.root);
	}
	/**
	 * 
	 * @returns {Transform2d}
	 */
	static get root() {
		return Transform2d.#root;
	}
	/**
	 *
	 * @param {Transform2d} t
	 * @returns
	 */
	static #remove_from_transform_layers(t) {
		if (!Transform2d.#transforms_layers.has(t.layer)) return;
		Transform2d.#transforms_layers.get(t.layer).delete(t);
	}
	static #append_to_transform_layers(t) {
		if (!Transform2d.#transforms_layers.has(t.layer))
			Transform2d.#transforms_layers.set(t.layer, new Set());
		Transform2d.#transforms_layers.get(t.layer).add(t);
	}
	static sync_transforms() {
		for (const layer of Transform2d.#transforms_layers.values())
			for (const transform of layer) transform.sync_transform();
	}

	#layer = 0;
	#children_sync_count = 0;
	#parent = null;
	#children;
	#position;
	#scale;
	#angle;
	#local_transform_m;
	#world_transform_m;
	#inv_local_transform_m;
	#inv_world_transform_m;
	#transform_status; // изменено ли поле / необходимо ли учесть изменения в дочерних элементах?
	constructor(parent = null) {
		this.#children = new Set();
		this.#position = new Vector2d(0.0, 0.0);
		this.#scale = new Vector2d(1.0, 1.0);
		this.#angle = 0.0;
		this.#local_transform_m = Matrix3d.identity();
		this.#world_transform_m = Matrix3d.identity();
		this.#inv_local_transform_m = Matrix3d.identity();
		this.#inv_world_transform_m = Matrix3d.identity();
		this.#transform_status = 0;
		this.parent = parent === null ? Transform2d.root : parent;
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
	get sync_required() {
		return this.#children_sync_count != this.children_count;
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
	 * @returns {boolean}
	 */
	get sync_required() {
		return this.#children_sync_count != this.children_count;
	}
	/**
	 * @param {boolean} value
	 * @returns {boolean}
	 */
	set sync_required(value) {
		this.#children_sync_count = value ? 0 : this.#children_sync_count;
	}
	reset() {
		this.angle = 0.0;
		this.position = new Vector2d(0.0, 0.0);
		this.scale = new Vector2d(1.0, 1.0);
	}
	sync_transform() {
		this.#sync_transform_matrices();
		this.#sync_world_transform();
	}
	#sync_transform_matrices() {
		if (!this.raw_transform) return;
		this.raw_transform = false;
		this.sync_required = true;
		this.#local_transform_m = Matrix3d.build_transform_2d(
			this.position,
			this.scale,
			this.#angle
		);
		this.#inv_local_transform_m = Matrix3d.build_inv_transform_2d(
			this.position,
			this.scale,
			this.#angle
		);
		if (this.has_parent) {
			this.#world_transform_m = Matrix3d.mat_mul(
				this.parent.world_tm,
				this.local_tm
			);
			this.#inv_world_transform_m = Matrix3d.mat_mul(
				this.inv_local_tm,
				this.parent.inv_world_tm
			);
			return;
		}
		this.#world_transform_m = this.#local_transform_m;
		this.#inv_world_transform_m = this.#inv_local_transform_m;
	}
	#sync_world_transform() {
		if (!this.has_parent) return;
		if (!this.parent.sync_required) return;
		if (this.freeze) {
			this.parent.#children_sync_count += 1;
			return;
		}
		this.#world_transform_m = Matrix3d.mat_mul(
			this.parent.world_tm,
			this.local_tm
		);
		this.#inv_world_transform_m = Matrix3d.mat_mul(
			this.inv_local_tm,
			this.parent.inv_world_tm
		);
		this.parent.#children_sync_count += 1;
		this.sync_required = true;
		// console.log("sync transform at layer" + this.transform_layer);
	}

	get layer() {
		return this.#layer;
	}
	get has_parent() {
		return this.parent != null;
	}
	get children_count() {
		return this.#children.size;
	}
	get has_children() {
		return this.children_count != 0;
	}
	get children() {
		return this.#children.values();
	}
	get parent() {
		return this.#parent;
	}
	set parent(value) {
		if (this.has_parent) this.parent.remove_child(this);
		this.#parent = value;
		if (this.has_parent) {
			this.#layer = value.layer + 1;
			this.parent.append_child(this);
		}
	}
	/**
	 * @returns {Matrix3d}
	 */
	get local_tm() {
		return this.#local_transform_m;
	}
	/**
	 * @returns {Matrix3d}
	 */
	get inv_local_tm() {
		return this.#inv_local_transform_m;
	}
	/**
	 * @returns {Matrix3d}
	 */
	get world_tm() {
		return this.#world_transform_m;
	}
	/**
	 * @returns {Matrix3d}
	 */
	get inv_world_tm() {
		return this.#inv_world_transform_m;
	}
	/**
	 * @returns {Vector2d}
	 */
	get position() {
		return this.#position;
	}
	/**
	 * @returns {Vector2d}
	 */
	get position_world() {
		if(this.has_parent)
			return this.parent.world_transform_point(this.position);
		return this.position;
	}
	/**
	 * @returns {Vector2d}
	 */
	get scale() {
		return this.#scale;
	}
	/**
	 * @returns {Number}
	 */
	get angle() {
		return this.#angle * RAD_TO_DEG;
	}
	/**
	 * @param {Vector2d} value
	 * @returns {Vector2d}
	 */
	set position(value) {
		this.#position = value; //this.has_parent?this.parent.inv_world_transform_point(value):value;
		this.raw_transform = true;
	}
	/**
	 * @param {Vector2d} value
	 * @returns {Vector2d}
	 */
	set scale(value) {
		this.#scale = value;
		this.raw_transform = true;
	}
	/**
	 * @param {Number} value
	 * @returns {Number}
	 */
	set angle(value) {
		this.#angle = value * DEG_TO_RAD;
		this.raw_transform = true;
	}
	append_child(child_transform) {
		Transform2d.#append_to_transform_layers(child_transform);
		this.#children.add(child_transform);
	}
	remove_child(child_transform) {
		Transform2d.#remove_from_transform_layers(child_transform);
		this.#children.delete(child_transform);
	}
	local_transform_point(point) {
		return this.local_tm.multiply_by_point(point);
	}
	local_transform_direction(point) {
		return this.local_tm.multiply_by_direction(point);
	}
	inv_local_transform_point(point) {
		return this.inv_local_tm.multiply_by_point(point);
	}
	inv_local_transform_direction(point) {
		return this.inv_local_tm.multiply_by_direction(point);
	}

	world_transform_point(point) {
		return this.world_tm.multiply_by_point(point);
	}
	world_transform_direction(point) {
		return this.world_tm.multiply_by_direction(point);
	}
	inv_world_transform_point(point) {
		return this.inv_world_tm.multiply_by_point(point);
	}
	inv_world_transform_direction(point) {
		return this.inv_world_tm.multiply_by_direction(point);
	}

	apply_to_context(ctx) {
		if (this.parent === null) {
			ctx.transform(
				this.local_tm.m00,
				this.local_tm.m10, // ex
				this.local_tm.m01,
				this.local_tm.m11, // ey
				this.local_tm.m02,
				this.local_tm.m12
			); // pos
			return;
		}
		ctx.transform(
			this.world_tm.m00,
			this.world_tm.m10, // ex
			this.world_tm.m01,
			this.world_tm.m11, // ey
			this.world_tm.m02,
			this.world_tm.m12
		); // pos
	}

	toString()
	{
		return "{" + `\n\t"position": ${this.position},` + 
				     `\n\t"scale":    ${this.scale},` + 
				     `\n\t"angle":    ${this.angle},` +
					 `\n\t"layer":    ${this.layer},` + 
					 `\n\t"state":    ${this.#transform_status}\n` + "}"
	}
}

export {Transform2d, RAW_TRANSFORM_BIT, SYNC_TRANSFORM_BIT, FREEZE_TRANSFORM_BIT};

// Transform2d.init_transforms();
