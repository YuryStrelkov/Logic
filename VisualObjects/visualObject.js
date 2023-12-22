
class VisualObject
{
	static #eval_objects_destroy()
	{
		while(VisualObject.#delete_request.length != 0)
		{
			const object = VisualObject.#delete_request.pop();
			VisualObject.#visual_objects.delete(object);
		}
	}
	static #on_focus_and_press_prepare()
	{
		if(!MouseInfo.instance.is_any_down)
		{
			if(VisualObject.#pressed_object != null) VisualObject.#pressed_object.state.on_down = false;
			VisualObject.#pressed_object = null;
			VisualObject.#obj_press_delta_position = new Vector2d();
		}
	}
	static #press_update() 
	{
		if (VisualObject.pressed_object  != null) return;
		if (VisualObject.on_focus_object === null) return;
		if (!MouseInfo.instance.is_any_down) return;
		VisualObject.#pressed_object = VisualObject.on_focus_object; 
		VisualObject.pressed_object.state.on_down = true;
		const scale = Transform2d.root_transform.scale;
		VisualObject.#obj_press_delta_position = Vector2d.sub(MouseInfo.instance.position, Vector2d.mul(VisualObject.pressed_object.transform.position, scale));
		/// VisualObject.#obj_press_delta_position = Transform2d.root_transform.world_transform_direction(VisualObject.#obj_press_delta_position);
	}
	static #limit_movement(obj)
	{
		const position = obj.transform.position;
		const w        = obj.bounds.width * 0.5;
		const h        = obj.bounds.height * 0.5;
		const cw       = RenderCanvas.instance.width * 0.5;
		const ch       = RenderCanvas.instance.height * 0.5;
		position.x     = position.x < w - cw ? w - cw: position.x;
		position.x     = position.x > cw - w ? cw - w: position.x;
		position.y     = position.y < h - ch ? h - ch: position.y;
		position.y     = position.y > ch - h ? ch - h: position.y;
		obj.transform.position = position;
	}
	static #move_update()
	{
		if ( VisualObject.pressed_object === null) return;
		if (!VisualObject.pressed_object.state.is_moveable) return;
		if (!VisualObject.pressed_object.state.on_down) return;
		if (!MouseInfo.instance.is_left_down)return;
		const scale    = Transform2d.root_transform.scale;
		VisualObject.pressed_object.transform.position = Vector2d.div(Vector2d.sub(MouseInfo.instance.position, VisualObject.obj_press_delta_position), scale);
		VisualObject.#limit_movement(VisualObject.pressed_object);
	}
	static destroy(visual_object) 
	{
		VisualObject.#delete_request.push(visual_object);
		if(!visual_object.has_children)return;
		for(const child of visual_object.children)VisualObject.destroy(child);
	}
	static update()
	{
		VisualObject.#on_focus_and_press_prepare();
		for(const obj of VisualObject.#visual_objects) obj.update();
		VisualObject.#press_update();
		VisualObject.#move_update();
		Transform2d. sync_transforms();
		VisualObject.#eval_objects_destroy();
	}
	static render(ctx)
	{
		for(const obj of VisualObject.#visual_objects)
		{
			if(!obj.state.is_shown)continue;
			if(obj.cast_by_view)continue;
			ctx.beginPath();
			obj.render (ctx);
			ctx.setTransform(1,0,0,1,0,0)
		}
	}
	static get pressed_object          (){return VisualObject.#pressed_object;          }
	static get on_focus_object         (){return VisualObject.#on_focus_object;         }
	static get obj_press_delta_position(){return VisualObject.#obj_press_delta_position;}
	static #delete_request           = [];
	static #visual_objects           = new Set();
	static #pressed_object           = null;
	static #on_focus_object          = null;
	static #obj_press_delta_position = new Vector2d();

	#_parent;
	#_children;
	#_bounds;
	#_transform;
	#_visual;
	#_state;
	constructor(min, max)
	{
	  this.#_parent           = null;
	  this.#_children         = new Set();
	  this.#_bounds           = new RectBounds(min, max);
	  this.#_transform        = new Transform2d();
	  this.#_visual           = VisualSettings.default;
	  this.#_state            = new VisualObjectState(set_bits(0, [SHOW_BIT, MOVEABLE_BIT, FOCUSABLE_BIT]));
	  this.transform.position = this.bounds.center;
	  this.bounds.center      = new Vector2d(0, 0);
	  VisualObject.#visual_objects.add(this);
	}
	get cast_by_view() {return RenderCanvas.instance.cast_by(this.bounds, this.transform);}
	get intersect_by_view() {return RenderCanvas.instance.intersect_by(this.bounds, this.transform);}
	get parent      () {return this.#_parent;}
	get has_parent  () {return this.#_parent != null;}
	get children    () {return this.#_children;}
	get has_children() {return this.#_children.length != 0;}
	get layer       () {return this.transform.transform_layer;}
	get bounds   () {return this.#_bounds;}
	get transform() {return this.#_transform;}
	get visual   () {return this.#_visual;}
	get state    () {return this.#_state;}
	get points   ()
	{
		const points = this.bounds.points;
		return [this.transform.world_transform_point(points[0]),
				this.transform.world_transform_point(points[1]),
				this.transform.world_transform_point(points[2]),
				this.transform.world_transform_point(points[3])];
	}
	get edges  ()
	{
		const points = this.points;
	    return [[points[0], points[1]],
				[points[1], points[2]],
				[points[2], points[3]],
				[points[3], points[0]]];
	}
	set visual (value){this.#_visual = value;}
	set parent (value)
	{
		if(this.has_parent) this.parent.#_children.delete(this);
		this.#_parent = value;
		value.#_children.add(this);
		this.transform.parent = value.transform
		return;
	}

	contains(point) { return this.bounds.contains(this.transform.inv_world_transform_point(point)); }
	
	#focus_update()
	{
		if (!this.state.is_focusable) return;
		
		if (this === VisualObject.on_focus_object)
		{
			this.state.on_focus = this.contains(MouseInfo.instance.position);
			VisualObject.#on_focus_object = this.state.on_focus? this : null;
			return;
		}

		if (VisualObject.on_focus_object === null) 
		{
			this.state.on_focus = this.contains(MouseInfo.instance.position);
			if(!this.state.on_focus) return;
			VisualObject.#on_focus_object = this;
			return;
		}
	   /// Сортировка по слоям. Предпочтение отдаётся слою с большим значением
		if (this.layer < VisualObject.on_focus_object.layer) return;
		this.state.on_focus = this.contains(MouseInfo.instance.position);
		if (!this.state.on_focus) return;
		VisualObject.on_focus_object.state.on_focus = false; 
		VisualObject.#on_focus_object = this;
	}

	update() {this.#focus_update();}
	
	render(ctx)
	{
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		const width     = this.bounds.width ;
		const height    = this.bounds.height;
		const x0        = this.bounds.min.x; 
		const y0        = this.bounds.min.y; 
		ctx.fillStyle   = this.visual.eval_object_color(this.state).color_code;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.fill();	
		if(this.visual.stroke_width === 0)return;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.stroke();
	}
}