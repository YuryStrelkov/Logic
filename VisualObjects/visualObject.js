
class VisualObject {
	static #draw_queue = new Map();
	static #delete_request = [];
	static #visual_objects = new Set();
	static #pressed_object = null;
	static #focus_object = null;
	static get pressed_object() { return VisualObject.#pressed_object; }
	static get focus_object() { return VisualObject.#focus_object; }
	static get visual_objects() { return VisualObject.#visual_objects; }

	static #eval_objects_destroy() {
		while (VisualObject.#delete_request.length != 0) {
			const object = VisualObject.#delete_request.pop();
			VisualObject.#visual_objects.delete(object);
		}
	}
	static #before_mouse_input_update() {
		if (MouseInfo.instance.is_any_down) return;
		VisualObject.#focus_object = null;
		if (VisualObject.#pressed_object != null) VisualObject.#pressed_object.state.on_press = false;
		VisualObject.#pressed_object = null;
	}

	static #after_mouse_input_update() {
		if (VisualObject.pressed_object !== null) return;
		if (VisualObject.focus_object === null) return;
		if (!MouseInfo.instance.is_any_down) return;
		VisualObject.#pressed_object = VisualObject.focus_object;
		VisualObject.#pressed_object.state.on_press = true;
	}

	static #mouse_input_update() {
		VisualObject.#before_mouse_input_update();
		for (const obj of VisualObject.#visual_objects) obj._focus_update();
		VisualObject.#after_mouse_input_update();
	}

	static destroy(visual_object) {
		VisualObject.#delete_request.push(visual_object);
		if (!visual_object.has_children) return;
		for (const child of visual_object.children) VisualObject.destroy(child);
	}

	static update_objects() {
		VisualObject.#eval_objects_destroy();
		VisualObject.#mouse_input_update();
		for (const obj of VisualObject.#visual_objects) obj._update_object();
		Transform2d.sync_transforms();
	}

	static render_objects(ctx) {
		for (const layer_object of VisualObject.#draw_queue.values()) {
			for (const obj of layer_object) {
				ctx.beginPath();
				obj._render_object(ctx);
				ctx.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
			}
			layer_object.clear();
		}
	}
	#_name;
	#_parent;
	#_children;
	#_bounds;
	#_transform;
	#_visual;
	#_state;
	#_callbacks;
	constructor(min, max) {
		this.#_name = `visualObject${VisualObject.visual_objects.length}`;
		this.#_parent = null;
		this.#_children = new Set();
		this.#_callbacks = new Map();
		this.#_bounds = new RectBounds(min, max);
		this.#_transform = new Transform2d();
		this.#_visual = VisualSettings.default;
		this.#_state = new VisualObjectState(set_bits(0, [OBJECT_SHOW_BIT, OBJECT_MOVEABLE_BIT, OBJECT_FOCUSABLE_BIT]));
		this.transform.position = this.bounds.center;
		this.bounds.center = new Vector2d(0, 0);
		VisualObject.#visual_objects.add(this);
		// this.on_begin_focus_callback_append((obj) => { console.log(`begin focus at layer ${obj.layer}`) });
		// this.on_end_focus_callback_append((obj) => { console.log(`end focus at layer ${obj.layer}`) });
		// this.on_focus_callback_append((obj) => { console.log('focus') });
		// this.on_press_callback_append((obj) => { console.log('press') });
		// this.on_begin_press_callback_append((obj) => { console.log('begin press') });
		// this.on_end_press_callback_append((obj) => { console.log('end press') });
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
	#eval_callbacks() {
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
	on_end_focus_callback_append(callback_fcn) { this.#register_callback(ON_FOCUS_END_STATE, callback_fcn); }
	on_focus_callback_append(callback_fcn) { this.#register_callback(ON_FOCUS_STATE, callback_fcn); }
	on_begin_press_callback_append(callback_fcn) { this.#register_callback(ON_PRESS_BEGIN_STATE, callback_fcn); }
	on_end_press_callback_append(callback_fcn) {
		this.#register_callback(ON_PRESS_END_STATE_1, callback_fcn);
		this.#register_callback(ON_PRESS_END_STATE_2, callback_fcn);
	}
	on_press_callback_append(callback_fcn) {
		this.#register_callback(ON_PRESS_STATE_1, callback_fcn);
		this.#register_callback(ON_PRESS_STATE_2, callback_fcn);
		this.#register_callback(ON_PRESS_STATE_3, callback_fcn);
	}

	on_begin_focus_callback_remove(callback_fcn) { this.#unregister_callback(ON_FOCUS_BEGIN_STATE, callback_fcn); }
	on_end_focus_callback_remove(callback_fcn) { this.#unregister_callback(ON_FOCUS_END_STATE, callback_fcn); }
	on_focus_callback_remove(callback_fcn) { this.#unregister_callback(ON_FOCUS_STATE, callback_fcn); }
	on_begin_press_callback_remove(callback_fcn) { this.#unregister_callback(ON_PRESS_BEGIN_STATE, callback_fcn); }
	on_end_press_callback_remove(callback_fcn) {
		this.#unregister_callback(ON_PRESS_END_STATE_1, callback_fcn);
		this.#unregister_callback(ON_PRESS_END_STATE_2, callback_fcn);
	}
	on_press_callback_remove(callback_fcn) {
		this.#unregister_callback(ON_PRESS_STATE_1, callback_fcn);
		this.#unregister_callback(ON_PRESS_STATE_2, callback_fcn);
		this.#unregister_callback(ON_PRESS_STATE_3, callback_fcn);
	}

	get cast_by_view() { return RenderCanvas.instance.cast_by(this.bounds, this.transform); }
	get intersect_by_view() { return RenderCanvas.instance.intersect_by(this.bounds, this.transform); }
	get parent() { return this.#_parent; }
	get has_parent() { return this.#_parent != null; }
	get children() { return this.#_children; }
	get has_children()   { return this.#_children.size != 0; }
	get children_count() { return this.#_children.size; }
	get layer() { return this.transform.layer; }
	/**
	 * @returns {RectBounds}
	 */
	get bounds() { return this.#_bounds; }
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
	get state() { return this.#_state; }
	get name() { return this.#_name; }
	set name(value) { this.#_name = value; }
	set visual(value) { this.#_visual = value; }
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

	remove_child(child_object) {
		this.#_children.delete(child_object);
	}

	append_child(child_object) {
		this.#_children.add(child_object);
	}

	set parent(value) {
		if (this.has_parent) this.parent.#_children.delete(this);
		this.#_parent = value;
		if (!this.has_parent) return;
		value.#_children.add(this);
		this.transform.parent = value.transform
		return;
	}
	/**
	 * 
	 * @returns {VisualObject}  
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

	render() {
		if (!this.state.is_shown) return;
		if (this.cast_by_view) return;
		if (!VisualObject.#draw_queue.has(this.layer)) { VisualObject.#draw_queue.set(this.layer, new Set()); }
		VisualObject.#draw_queue.get(this.layer).add(this);
	}

	_focus_update() {
		if (!this.state.is_focusable) return;
		if (!this.state.is_shown) return;
		this.state.on_focus = this.contains(MouseInfo.instance.position);
		if (!this.state.on_focus) return;
		if ((VisualObject.focus_object === null) || (this === VisualObject.focus_object)) {
			VisualObject.#focus_object = this.state.on_focus ? this : null;
			return;
		}
		/// Сортировка по слоям. Предпочтение отдаётся слою с большим значением
		if (this.layer < VisualObject.focus_object.layer) { this.state.on_focus = false; return; };
		VisualObject.focus_object.state.on_focus = false;
		VisualObject.#focus_object = this;
	}

	_update_object() {
		this.update();
		this.#eval_callbacks();
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
        this.#_text = text;
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
			case 'center': ctx.fillText(this.text, center.x, center.y);break;
			case 'left':   ctx.fillText(this.text, center.x - width * 0.5, center.y);break;
			case 'right':  ctx.fillText(this.text, center.x + width * 0.5, center.y);break;
		}
	}
}