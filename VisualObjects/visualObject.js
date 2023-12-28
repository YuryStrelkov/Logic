
class VisualObject {
	static #draw_queue = new Map();
	static #delete_request = [];
	static #visual_objects = new Set();
	static #on_press_object = null;
	static #on_focus_object = null;
	static get on_press_object() { return VisualObject.#on_press_object; }
	static get on_focus_object() { return VisualObject.#on_focus_object; }
	static get visual_objects() { return VisualObject.#visual_objects; }

	static #eval_objects_destroy() {
		while (VisualObject.#delete_request.length != 0) {
			const object = VisualObject.#delete_request.pop();
			VisualObject.#visual_objects.delete(object);
		}
	}
	static #before_mouse_input_update() {
		if (MouseInfo.instance.is_any_down) return;
		VisualObject.#on_focus_object = null;
		if (VisualObject.on_press_object != null) VisualObject.on_press_object.state.on_press = false;
		VisualObject.#on_press_object = null;
	}

	static #after_mouse_input_update() {
		if (VisualObject.on_press_object !== null) return;
		if (VisualObject.on_focus_object === null) return;
		if (!MouseInfo.instance.is_any_down) return;
		VisualObject.#on_press_object = VisualObject.on_focus_object;
		VisualObject.on_press_object.state.on_press = true;
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
	_bounds;
	#_transform;
	#_visual;
	#_state;
	#_callbacks;
	constructor(min, max) {
		this.#_name = `visualObject${VisualObject.visual_objects.length}`;
		this.#_parent = null;
		this.#_children = new Set();
		this.#_callbacks = new Map();
		this._bounds = new RectBounds(min, max);
		this.#_transform = new Transform2d();
		this.#_visual = VisualSettings.default;
		this.#_state = new VisualObjectState(set_bits(0, [OBJECT_SHOW_BIT, OBJECT_FOCUSABLE_BIT]));
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
	get state() { return this.#_state; }
	get name() { return this.#_name; }
	set name(value) { this.#_name = value; }
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
		if (this.has_parent) this.parent.#_children.delete(this);
		this.#_parent = value;
		if (!this.has_parent) return;
		value.#_children.add(this);
		this.transform.parent = value.transform
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
		if ((VisualObject.on_focus_object === null) || (this === VisualObject.on_focus_object)) {
			VisualObject.#on_focus_object = this.state.on_focus ? this : null;
			return;
		}
		/// Сортировка по слоям. Предпочтение отдаётся слою с большим значением
		if (this.layer < VisualObject.on_focus_object.layer) { this.state.on_focus = false; return; };
		VisualObject.on_focus_object.state.on_focus = false;
		VisualObject.#on_focus_object = this;
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

class BezierObject extends VisualObject
{
	// f(t)=p_1 * (1−t)^3 + 3 * p_2 * t * (1 − t)^2 + 3_p * 3 * t^2 * (1 − t) + p4 * t^3
	// f'(t)= p_1 * (1−t)^3 + 3 * p_2 * t * (1 − t)^2 + 3_p * 3 * t^2 * (1 − t) + p4 * t^3
	#p1; // начало
	#p2; // якорь - 1 
	#p3; // якорь - 2
	#p4; // конец

	#bezier_x(t)
	{
		return this.p1.x * Math.pow((1.0 - t), 3.0) + 3.0 * this.p2.x * t * Math.pow((1.0 - t), 2.0) + this.p3.x * 3.0 * t * t * (1.0 - t) + this.p4.x * t * t * t;
	}
	
	#bezier_y(t)
	{
		return this.p1.y * Math.pow((1.0 - t), 3.0) + 3.0 * this.p2.y * t * Math.pow((1.0 - t), 2.0) + this.p3.y * 3.0 * t * t * (1.0 - t) + this.p4.y * t * t * t;
	}

	#bounds_x_size()
	{
		const a =-3 * this.p1.x + 9  * this.p2.x - 9 * this.p3.x + 3 * this.p4.x;
		const b = 6 * this.p1.x - 12 * this.p2.x + 6 * this.p3.x;
		const c =-3 * this.p1.x + 3  * this.p2.x;
		if(Math.abs(a) < 1e-3)
		{
			if(Math.abs(b) < 1e-3) return new Vector2d(Math.min(this.p1.x, this.p4.x), Math.max(this.p1.x, this.p4.x));
			const x = this.#bezier_x(-c / b);
			return Math.min(Math.min(x, this.p1.x), this.p4.x), Math.max(Math.max(x, this.p1.x), this.p4.x)
		}
		const d = b * b - a * c * 4.0;
		if(d <= 0) return new Vector2d(Math.min(this.p1.x, this.p4.x), Math.max(this.p1.x, this.p4.x));
		const sqd = Math.sqrt(d);
		const x_0 = this.#bezier_x(Math.min(Math.max(0.0, (-sqd - b) / (2.0 * a)), 1.0));
		const x_1 = this.#bezier_x(Math.min(Math.max(0.0, ( sqd - b) / (2.0 * a)), 1.0));
		return new Vector2d(Math.min(Math.min(Math.min(this.p1.x, this.p4.x), x_0), x_1),
						    Math.max(Math.max(Math.max(this.p1.x, this.p4.x), x_0), x_1));
	}

	#bounds_y_size()
	{
		const a =-3 * this.p1.y + 9  * this.p2.y - 9 * this.p3.y + 3 * this.p4.y;
		const b = 6 * this.p1.y - 12 * this.p2.y + 6 * this.p3.y;
		const c =-3 * this.p1.y + 3  * this.p2.y;
		if(Math.abs(a) < 1e-3)
		{
			if(Math.abs(b) < 1e-3) return new Vector2d(Math.min(this.p1.y, this.p4.y), Math.max(this.p1.y, this.p4.y));
			const y = this.#bezier_y(-c / b);
			return Math.min(Math.min(y, this.p1.y), this.p4.y), Math.max(Math.max(y, this.p1.y), this.p4.y)
		}
		const d = b * b - a * c * 4.0
		if(d <= 0) return new Vector2d(Math.min(this.p1.y, this.p4.y), Math.max(this.p1.y, this.p4.y));
		const sqd = Math.sqrt(d);
		const x_0 = this.#bezier_y(Math.min(Math.max(0.0, (-sqd - b) / (2.0 * a)), 1.0));
		const x_1 = this.#bezier_y(Math.min(Math.max(0.0, ( sqd - b) / (2.0 * a)), 1.0));
		return new Vector2d(Math.min(Math.min(Math.min(this.p1.y, this.p4.y), x_0), x_1),
						    Math.max(Math.max(Math.max(this.p1.y, this.p4.y), x_0), x_1));
	}

	#update_bounds()
	{
		if(!this.state.is_focusable) return;
		const min_max_x = this.#bounds_x_size();
		const min_max_y = this.#bounds_y_size();
		this._bounds = new RectBounds(new Vector2d(min_max_x.x, min_max_y.x), new Vector2d(min_max_x.y, min_max_y.y));
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
		this.#update_bounds();
	}
	contains(point)
	{
		if(!super.contains(point))return false;
		return true;
	}
	_render_object(ctx) {
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		// ctx.strokeStyle = this.visual.eval_object_color(this.state).color_code;
		ctx.strokeStyle  = this.state.on_focus?'rgb(255, 0, 0, 0.5)': ctx.lineColor;
		ctx.moveTo(this.p1.x, this.p1.y);
		ctx.bezierCurveTo(this.p2.x, this.p2.y,
						  this.p3.x, this.p3.y,
						  this.p4.x, this.p4.y);
		// ctx.stroke();
		const width  = this.bounds.width;
		const height = this.bounds.height;
		const x0     = this.bounds.min.x;
		const y0     = this.bounds.min.y;
		ctx.roundRect(x0, y0, width, height,[5,5,5,5]);
		ctx.stroke();
	}
}