// //@ts-check

import { ON_PRESS_BEGIN_STATE, ON_FOCUS_BEGIN_STATE, ON_FOCUS_END_STATE, ON_FOCUS_STATE,
	     ON_PRESS_END_STATE_1, ON_PRESS_END_STATE_2, ON_PRESS_STATE_3,ON_PRESS_STATE_2, ON_PRESS_STATE_1} from "./common.js";
import { VisualObjectState, VisualSettings, BEZIER_VISUAL_SETTINGS} from "./visualSettings.js";
import { cubic_bezier, is_close_to_bezier, cubic_bezier_bounds } from "../Geometry/bezier.js";
import { Vector2d, RectBounds } from "../Geometry/geometry.js";
import { RenderCanvas } from "../Rendering/renderCanvas.js";
import { Transform2d } from "../Geometry/transform2d.js";
import { MouseInfo } from "./inputs.js";
		 
const FIRST_OBJECTS_LAYER = 1;
const FIRST_UI_OBJECTS_LAYER = 32;
class VisualObject {
	static #draw_queue = new Map();
	static #delete_request = [];
	static #visual_objects = new Set();
	static #on_press_object = null;
	static #on_focus_object = null;
	static get on_press_object() { return VisualObject.#on_press_object; }
	static get on_focus_object() { return VisualObject.#on_focus_object; }
	static get visual_objects () { return VisualObject.#visual_objects; }
	
	static #eval_objects_destroy() {
		while (VisualObject.#delete_request.length != 0) {
			const object = VisualObject.#delete_request.pop();
			VisualObject.#visual_objects.delete(object);
			object._delete_object();
			if(object === VisualObject.on_focus_object) VisualObject.#on_focus_object = null;
			if(object === VisualObject.on_press_object) VisualObject.#on_press_object = null;
		}
	}
	static #focus_update()
	{
		var focus_object = null;
		for (const obj of VisualObject.#visual_objects)
		{
			if(! obj.state.is_focusable) continue;
			if(! obj.state.is_shown) continue;
			if(! obj.contains(MouseInfo.instance.position)) continue;
			if(focus_object === null)
			{
				focus_object = obj;
				continue;
			}
			if (obj.layer < focus_object.layer) continue;
			focus_object = obj;
		}
		if(focus_object === null)
		{
			if(VisualObject.on_focus_object !== null)
			{
				VisualObject.on_focus_object.state.on_focus = false;
				VisualObject.#on_focus_object = null;
			}
			return;
		}
		if(VisualObject.on_focus_object === focus_object) return;
		if(VisualObject.on_focus_object !== null) VisualObject.on_focus_object.state.on_focus = false;
		VisualObject.#on_focus_object = focus_object;
		focus_object.state.on_focus = true;
	}
	static #press_update()
	{
		if (MouseInfo.instance.is_any_down)
		{
			if(VisualObject.on_press_object !== null) return;
			if(VisualObject.on_focus_object === null) return;
			VisualObject.#on_press_object = VisualObject.on_focus_object;
			VisualObject.#on_press_object.state.on_press = true;
			return;
		}
		if(VisualObject.on_press_object === null) return;
		VisualObject.on_press_object.state.on_press = false;
		VisualObject.#on_press_object = null;
	}
	static #mouse_input_update() {
		VisualObject.#focus_update();
		VisualObject.#press_update();
	}
	static register_object(object)
	{
		if(VisualObject.#visual_objects.has(object)) return;
		VisualObject.#visual_objects.add(object);
	}
	static render_object(object)
	{
		if (!object.state.is_shown) return;
		if (object.state.viewport_cast) if (object.cast_by_view) return;
		if (!VisualObject.#draw_queue.has(object.layer)) { VisualObject.#draw_queue.set(object.layer, new Set()); }
		VisualObject.#draw_queue.get(object.layer).add(object);
	}

	static destroy_visual_object(visual_object) {
		VisualObject.#delete_request.push(visual_object);
	}

	static update_objects() {
		VisualObject.#eval_objects_destroy();
		VisualObject.#mouse_input_update();
		for (const obj of VisualObject.#visual_objects) obj._update_object();
		Transform2d.sync_transforms();
	}
	static clear_render_queue()
	{
		for(const q of VisualObject.#draw_queue.values())q.clear();
		VisualObject.#draw_queue.clear();
	}

	static render_objects(ctx) {
		const layers = [... VisualObject.#draw_queue.keys()].sort(function (a, b) {return a - b;});
		for (const layer_id of layers) {
			const layer_object = VisualObject.#draw_queue.get(layer_id); 
			for (const obj of layer_object) {
				ctx.beginPath();
				obj._render_object(ctx);
				ctx.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
			}
			layer_object.clear();
		}
	}

static #visual_object_bounds = (obj, min_bound, max_bound) =>
{
	const inv_tm = Transform2d.root.inv_world_tm;
	const scl = Vector2d.mul(Transform2d.root.scale, new Vector2d(1.05, 1.05));
	const min = Vector2d.min(min_bound, inv_tm.multiply_by_point(Vector2d.sum(Vector2d.mul(obj.bounds.min, scl), obj.transform.position_world)));
	const max = Vector2d.max(max_bound, inv_tm.multiply_by_point(Vector2d.sum(Vector2d.mul(obj.bounds.max, scl), obj.transform.position_world)));
	
	min_bound.x = min.x;
	min_bound.y = min.y;

	max_bound.x = max.x;
	max_bound.y = max.y;
	for(const obj_child of obj.children) VisualObject.#visual_object_bounds(obj_child, min_bound, max_bound);
}

static visual_object_bounds = (obj) =>
{
	const min_bound = new Vector2d( 1e32,  1e32);
	const max_bound = new Vector2d(-1e32, -1e32);
	VisualObject.#visual_object_bounds(obj, min_bound, max_bound);
	return new RectBounds(min_bound, max_bound);
}

static visual_objects_bounds = (objects) =>
{
	var count = 0;
	for(const o of objects) count++;
	if(count === 0) return new RectBounds(new Vector2d(), new Vector2d());
	// const bounds = new RectBounds();
	const min_bound = new Vector2d( 1e32,  1e32);
	const max_bound = new Vector2d(-1e32, -1e32);
	for(const obj of objects) VisualObject.#visual_object_bounds(obj, min_bound, max_bound);
	return new RectBounds(min_bound, max_bound);
}

	#_name;
	#_layer;
	#_parent;
	#_children;
	_bounds;
	#_transform;
	#_visual;
	#_state;
	#_callbacks;
	constructor(min, max) {
		this.#_name = `visualObject ${VisualObject.visual_objects.size}`;
		this.#_parent   = null;
		this.#_children = new Set();
		this.#_callbacks = new Map();
		this._bounds     = new RectBounds(min, max);
		this.#_transform = new Transform2d();
		this.#_layer     = this.transform.layer;
		this.#_visual    = VisualSettings.default;
		this.#_state     = new VisualObjectState();
		this.transform.position = this.bounds.center;
		this.bounds.center = new Vector2d(0, 0);
		// this.on_begin_focus_callback_append((obj) => { console.log(`begin focus at layer ${obj.layer}`) });
		// this.on_end_focus_callback_append  ((obj) => { console.log(`end focus at layer ${obj.layer}`) });
		// this.on_focus_callback_append      ((obj) => { console.log(`focus at layer ${obj.layer}`) });
		// this.on_press_callback_append      ((obj) => { console.log(`press at layer ${obj.layer}`) });
		// this.on_begin_press_callback_append((obj) => { console.log(`begin press at layer ${obj.layer}`) });
		// this.on_end_press_callback_append  ((obj) => { console.log(`end press at layer ${obj.layer}`) });
		VisualObject.register_object(this);
	}
	/**
	 * 
	 * @param {Number} key 
	 * @param {function(VisualObject)} fcn 
	 * @returns 
	 */
	#register_callback(key, fcn) {
		if (!this.#_callbacks.has(key)) this.#_callbacks.set(key, new Set());
		this.#_callbacks.get(key).add(fcn);
	}
	#unregister_callback(key, fcn) {
		if (!this.#_callbacks.has(key)) return;
		this.#_callbacks.get(key).delete(fcn);
	}
	eval_callbacks() {
		const state = this.state.inst_state;
		if (state == 0) return;
		if (!this.#_callbacks.has(state)) return;
		for (const callback of this.#_callbacks.get(state)) callback(this);
	}

	/**
	 * @function on_begin_focus_callback_append
	 * @param {function(VisualObject)} callback_fcn 
	 */
	on_begin_focus_callback_append(callback_fcn) { this.#register_callback(ON_FOCUS_BEGIN_STATE, callback_fcn); }
	on_end_focus_callback_append  (callback_fcn) { this.#register_callback(ON_FOCUS_END_STATE, callback_fcn); }
	on_focus_callback_append      (callback_fcn) { this.#register_callback(ON_FOCUS_STATE, callback_fcn); }
	on_begin_press_callback_append(callback_fcn) { this.#register_callback(ON_PRESS_BEGIN_STATE, callback_fcn); }
	on_end_press_callback_append  (callback_fcn) {
		this.#register_callback(ON_PRESS_END_STATE_1, callback_fcn);
		this.#register_callback(ON_PRESS_END_STATE_2, callback_fcn);
	}
	on_press_callback_append(callback_fcn) {
		this.#register_callback(ON_PRESS_STATE_1, callback_fcn);
		this.#register_callback(ON_PRESS_STATE_2, callback_fcn);
		this.#register_callback(ON_PRESS_STATE_3, callback_fcn);
	}

	on_begin_focus_callback_remove(callback_fcn) { this.#unregister_callback(ON_FOCUS_BEGIN_STATE, callback_fcn); }
	on_end_focus_callback_remove  (callback_fcn) { this.#unregister_callback(ON_FOCUS_END_STATE, callback_fcn); }
	on_focus_callback_remove      (callback_fcn) { this.#unregister_callback(ON_FOCUS_STATE, callback_fcn); }
	on_begin_press_callback_remove(callback_fcn) { this.#unregister_callback(ON_PRESS_BEGIN_STATE, callback_fcn); }
	on_end_press_callback_remove  (callback_fcn) {
		this.#unregister_callback(ON_PRESS_END_STATE_1, callback_fcn);
		this.#unregister_callback(ON_PRESS_END_STATE_2, callback_fcn);
	}
	on_press_callback_remove(callback_fcn) {
		this.#unregister_callback(ON_PRESS_STATE_1, callback_fcn);
		this.#unregister_callback(ON_PRESS_STATE_2, callback_fcn);
		this.#unregister_callback(ON_PRESS_STATE_3, callback_fcn);
	}
	move_to_layer (layer) {
		this.layer = layer;
		for(const child of this.children)child.layer = layer + 1;
	}
	get cast_by_view      ()      { return RenderCanvas.instance.cast_by(this.bounds, this.transform); }
	get intersect_by_view ()      { return RenderCanvas.instance.intersect_by(this.bounds, this.transform); }
	get parent            ()      { return this.#_parent; }
	get has_parent        ()      { return this.#_parent != null; }
	get children          ()      { return this.#_children; }
	get children_count    ()      { return this.#_children.size; }
	get has_children      ()      { return this.children_count != 0; }
	get layer             ()      { return this.#_layer; }
	set layer             (value) 
	{ 
		if(!this.has_parent) 
		{
			this.#_layer = Math.max(0, value);
			return;
		};
		if(value <= this.parent.layer) return;
		this.#_layer = value;
		for(const child of this.children)child.layer = this.layer + 1;
	}
	/**
	 * @returns {RectBounds}
	 */
	get bounds() { return this._bounds; }
	/**
	 * @returns {Transform2d}
	 */
	get transform() { return this.#_transform; }
	/**
	 * @returns {VisualSettings}
	 */
	get visual() { return this.#_visual; }
	/**
	 * @returns {VisualObjectState}
	 */
	get state () { return this.#_state; }
	get name  () { return this.#_name; }
	set name  (value) { this.#_name = value; }
	get points() {
		const points = this.bounds.points;
		return [this.transform.world_transform_point(points[0]),
		this.transform.world_transform_point(points[1]),
		this.transform.world_transform_point(points[2]),
		this.transform.world_transform_point(points[3])];
	}
	get edges() {
		const points = this.points;
		return [[points[0], points[1]],
		[points[1], points[2]],
		[points[2], points[3]],
		[points[3], points[0]]];
	}
	set visual(value) { this.#_visual = value; }
	set parent(value) {
		if (this.has_parent) this.parent.children.delete(this);
		this.#_parent = value;
		if (!this.has_parent) return;
		value.children.add(this);
		this.transform.parent = value.transform
		this.layer = this.parent.layer + 1;
		return;
	}

	remove_child(child_object) {
		this.#_children.delete(child_object);
	}

	append_child(child_object) {
		this.#_children.add(child_object);
	}

	/**
	 * 
	 * @returns {VisualObject|null}  
	 */
	get_by_name(name) {
		if (this.name == name) return this;
		for (const child of this.children) {
			if (child.name == name)
				return child; //.get_by_name (name);
		}
		return null;
	}

	contains(point) { return this.bounds.contains(this.transform.inv_world_transform_point(point)); }

	update() { }

	render() { VisualObject.render_object(this);}

	on_delete() {}

	on_move(){};

	_delete_object()
	{
		this.on_delete();
		for(const child of this.children) VisualObject.destroy_visual_object(child);
	}

	_update_object() {
		this.update();
		this.eval_callbacks();
		this.render();
	}

	_render_object(ctx) {
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		const width = this.bounds.width;
		const height = this.bounds.height;
		const x0 = this.bounds.min.x;
		const y0 = this.bounds.min.y;
		ctx.fillStyle = this.visual.eval_object_color(this.state).color_code;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.fill();
		if (this.visual.stroke_width === 0) return;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.stroke();
	}
}

class RectangleObject extends VisualObject
{
	static from_center_and_size(center, size)
	{
		return new RectangleObject(new Vector2d(center.x - size.x * 0.5, center.y - size.y * 0.5),
								   new Vector2d(center.x + size.x * 0.5, center.y + size.y * 0.5));
	}
}

class TextObject extends VisualObject
{
    #_text;
    constructor( min, max, text="text")
    {
        super(min, max);
        this.#_text = text === null? "no text" : text;
    }
    get text(){return this.#_text;}
    set text(value){this.#_text = value;}
    _render_object(ctx)
	{
        super._render_object(ctx);
		const center  = this.bounds.center;
		const width   = this.bounds.width;
		ctx.fillStyle = this.visual.font_color.color_code;
		switch(this.visual.text_align)
		{
			case 'center':ctx.fillText(this.text, center.x, center.y);break;
			case 'left':  ctx.fillText(this.text, center.x - width * 0.5, center.y);break;
			case 'right': ctx.fillText(this.text, center.x + width * 0.5, center.y);break;
		}
	}
}

const  param_t =
 [0.0, 
  0.05,
  0.1,
  0.15,
  0.2,
  0.25,
  0.3,
  0.35,
  0.4,
  0.45,
  0.5,
  0.55,
  0.6,
  0.65,
  0.7,
  0.75,
  0.8,
  0.85,
  0.9,
  0.95,
  1.0]

class BezierObject extends VisualObject
{
	static #bezier_preview_curve = null;
    static get preview_curve()
    {
        if(BezierObject.#bezier_preview_curve === null)
        {
            BezierObject.#bezier_preview_curve = new BezierObject(new Vector2d(50, 50), 
            new Vector2d(50, 150),
            new Vector2d(150, 150),
            new Vector2d(150, 50));
            BezierObject.#bezier_preview_curve.state.is_focusable = false;
            BezierObject.#bezier_preview_curve.state.is_shown     = false;
			BezierObject.#bezier_preview_curve.visual = BEZIER_VISUAL_SETTINGS;
        }
        return BezierObject.#bezier_preview_curve;
    }
	#p1; // начало
	#p2; // якорь - 1 
	#p3; // якорь - 2
	#p4; // конец

	#update_bounds()
	{
		if(!this.state.is_focusable) return;
		this._bounds = cubic_bezier_bounds(this.p1, this.p2, this.p3, this.p4); 
	}

	get p1(){return this.#p1;};
	get p2(){return this.#p2;};
	get p3(){return this.#p3;};
	get p4(){return this.#p4;};
	set p1(value){this.#p1 = value; this.#update_bounds();};
	set p2(value){this.#p2 = value; this.#update_bounds();};
	set p3(value){this.#p3 = value; this.#update_bounds();};
	set p4(value){this.#p4 = value; this.#update_bounds();};
	/**
	 * 
	 * @param {Vector2d} p1 
	 * @param {Vector2d} an1 
	 * @param {Vector2d} an2 
	 * @param {Vector2d} p2 
	 */
	constructor(p1, an1, an2, p2)
	{
		super();
		this.#p1 = p1;
		this.#p2 = an1;
		this.#p3 = an2;
		this.#p4 = p2;
		this.visual = BEZIER_VISUAL_SETTINGS;
		this.#update_bounds();
	}
	contains(point)
	{
		if(!super.contains(point))return false;
		const pt = Transform2d.root.inv_world_transform_point(point);
		const line_width = this.visual.stroke_width;// * Math.sqrt(Transform2d.root.scale.x);
		return is_close_to_bezier(pt, this.p1, this.p2, this.p3, this.p4, line_width);
	}
	_render_object(ctx) {
		ctx.beginPath()
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		ctx.strokeStyle  = this.state.is_toggle ? 'rgb(255, 0, 0, 1.0)': this.visual.eval_object_color(this.state).color_code;
		// const points = [];
		
		const pt = Transform2d.root.inv_world_transform_point(MouseInfo.instance.position);
		ctx.roundRect(pt.x - 2.5, pt.y - 2.5, 5, 5, [5,5,5,5]);
		ctx.fill();

		ctx.moveTo(this.p1.x, this.p1.y);
		for(const t of param_t)
		{
			const point = cubic_bezier(t, this.p1, this.p2, this.p3, this.p4);
			ctx.lineTo(point.x, point.y);
		}
		// for(const p of points)ctx.lineTo(p.x, p.y);
		// ctx.moveTo(this.p1.x, this.p1.y);
		// ctx.bezierCurveTo(this.p2.x, this.p2.y,
		// 				  this.p3.x, this.p3.y,
		// 				  this.p4.x, this.p4.y);
		ctx.stroke();
		// const width  = this.bounds.width;
		// const height = this.bounds.height;
		// const x0     = this.bounds.min.x;
		// const y0     = this.bounds.min.y;
		// ctx.roundRect(x0, y0, width, height,[5,5,5,5]);
		// ctx.stroke();
	}
}

export {VisualObject, RectangleObject, TextObject, BezierObject, FIRST_UI_OBJECTS_LAYER, FIRST_OBJECTS_LAYER}