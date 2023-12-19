
const draw_text = (ctx, x_c, y_c, text_value, text_size = 20, text_font = 'consolas', text_color = "#FFFFFF") =>
{
	ctx.font = `${text_size}pt ${text_font}`;
	ctx.fillStyle = text_color;
	old_text_color = ctx.fillStyle;
	ctx.fillStyle = old_text_color;
	ctx.textBaseline = 'middle';
	old = ctx.textAlign;
	ctx.textAlign = "left";
	ctx.fillText(text_value, x_c,  y_c);
	ctx.textAlign = old;
	ctx.fillStyle = old_text_color;
}

class VisualObject
{
	static destroy(visual_object) 
	{
		VisualObject.#delete_request.push(visual_object);
		if(!visual_object.has_children)return;
		for(const child of visual_object.children)VisualObject.destroy(child);
	}
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
		if (VisualObject.on_focus_object == null) return;
		if (!MouseInfo.instance.is_any_down) return;
		VisualObject.#pressed_object = VisualObject.on_focus_object; 
		VisualObject.pressed_object.state.on_down = true;
		VisualObject.#obj_press_delta_position = Vector2d.sub(MouseInfo.instance.position, VisualObject.pressed_object.transform.position);
	}
	static #move_update()
	{
		if ( VisualObject.pressed_object == null) return;
		if (!VisualObject.pressed_object.state.is_moveable) return;
		if (!VisualObject.pressed_object.state.on_down) return;
		VisualObject.pressed_object.transform.position = Vector2d.sub(MouseInfo.instance.position, 
														 Vector2d.div(VisualObject.obj_press_delta_position, Transform2d.root_transform.scale))
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
			ctx.beginPath();
			obj.render (ctx);
			ctx.setTransform(1,0,0,1,0,0)
		}
	}
	static get pressed_object          (){return VisualObject.#pressed_object;          }
	static get on_focus_object         (){return VisualObject.#on_focus_object;         }
	static get obj_press_delta_position(){return VisualObject.#obj_press_delta_position;}
	static #visual_objects            = new Set();
	static #delete_request            = [];
	static #pressed_object            = null;
	static #on_focus_object           = null;
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
	get parent      () {return this.#_parent;}
	get has_parent  () {return this.#_parent != null;}
	get children    () {return this.#_children;}
	get has_children() {return this.#_children.length != 0;}
	set visual    (value){this.#_visual = value;}
	set parent    (v_object)
	{
		if(this.has_parent) this.parent.#_children.delete(this);
		this.#_parent = v_object;
		v_object.#_children.add(this);
		this.transform.parent = v_object.transform
		return;
	}
	get layer    ()   {return this.transform.transform_layer;}
	get bounds   ()   {return this.#_bounds;}
	get transform()   {return this.#_transform;}
	get visual   ()   {return this.#_visual;}
	get state    ()   {return this.#_state;}
	get points   ()
	{
		const points = this.bounds.points;
		return [this.transform.transform_point(points[0]),
				this.transform.transform_point(points[1]),
				this.transform.transform_point(points[2]),
				this.transform.transform_point(points[3])];
	}
	get edges   ()
	{
		const points = this.points;
	    return [[points[0], points[1]],
				[points[1], points[2]],
				[points[2], points[3]],
				[points[3], points[0]]];
	}
	contains(point) { return this.bounds.contains(this.transform.inv_world_transform_point(point)); }
	#focus_update()
	{
		if (!this.state.is_focusable) return;
		
		if (this == VisualObject.on_focus_object)
		{
			this.state.on_focus = this.contains(MouseInfo.instance.position);
			VisualObject.#on_focus_object = this.state.on_focus? this : null;
			return;
		}

		if (VisualObject.on_focus_object == null) 
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
		if(this.visual.stroke_width == 0)return;
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
    render(ctx)
	{
        super.render(ctx);
		const center  = this.bounds.center;
		ctx.fillStyle = this.visual.font_color.color_code;
		ctx.fillText(this.text, center.x, center.y);
	}
}

round_pin_settings = new VisualSettings();
round_pin_settings.up_left_radius    = 12.0;
round_pin_settings.down_left_radius  = 12.0;
round_pin_settings.down_right_radius = 12.0;
round_pin_settings.up_right_radius   = 12.0;
round_pin_settings.focus_color  = new Color(255, 55, 55, 255);
round_pin_settings.click_color  = new Color(255, 0,  0, 255);
round_pin_settings.color        = new Color(25,  25, 25, 255);

text_settings = new VisualSettings();
text_settings.up_left_radius    = 12.0;
text_settings.down_left_radius  = 12.0;
text_settings.down_right_radius = 12.0;
text_settings.up_right_radius   = 12.0;


text_info_settings = new VisualSettings();
text_info_settings.color = new Color(125, 125, 125, 0.5);
text_info_settings.font_color = new Color(225, 225, 225, 255);
text_info_settings.stroke_width = 0.0;
text_info_settings.text_align  = 'middle';


const non_gate = (center) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 20),
											   new Vector2d(center.x + 50, center.y + 20), 'NOT');
	textVisualObject.visual = text_settings;
	const circVisualObject1 = RectangleObject.from_center_and_size(new Vector2d(-50, 0), new Vector2d(24, 24));
	const circVisualObject2 = RectangleObject.from_center_and_size(new Vector2d( 50, 0), new Vector2d(24, 24));
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject1.visual = round_pin_settings;
	circVisualObject2.visual = round_pin_settings;
	const visualObjects = [textVisualObject, circVisualObject1, circVisualObject2];
	return visualObjects;
}

const and_gate = (center) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 35),
											   new Vector2d(center.x + 50, center.y + 35), 'AND');
	textVisualObject.visual = text_settings;
	const circVisualObject1 = RectangleObject.from_center_and_size(new Vector2d(-50,  17), new Vector2d(24, 24));
	const circVisualObject2 = RectangleObject.from_center_and_size(new Vector2d(-50, -17), new Vector2d(24, 24));
	const circVisualObject3 = RectangleObject.from_center_and_size(new Vector2d( 50,   0), new Vector2d(24, 24));
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject3.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject3.state.is_moveable = false;
	circVisualObject1.visual = round_pin_settings;
	circVisualObject2.visual = round_pin_settings;
	circVisualObject3.visual = round_pin_settings;
	const visualObjects = [textVisualObject, circVisualObject1, circVisualObject2, circVisualObject3];
	return visualObjects;
}

const create_visual_objects = () =>
{
	const visualObjects = [];
   	for(var i = 0; i < 5; i++)
   	{
   		for(var j = 0; j < 5; j++)
   		{
   			const objects = and_gate(new Vector2d((-2.5 + i) * 200 + 120, (-2.5 + j) * 80));
			for(const o of objects) visualObjects.push(o);
   		}
   	}
	return visualObjects;
}

root_position_info = null;
root_scaling_info  = null;
root_rotation_info = null;
fps_count_info     = null;
const init_statistics = () =>
{
	up_left = new Vector2d(-800, -450);
	line_size = new Vector2d(260, 33);
	
	root_position_info = new TextObject(new Vector2d(up_left.x, up_left.y                  ), new Vector2d(up_left.x + line_size.x, up_left.y +     line_size.y));
	root_scaling_info  = new TextObject(new Vector2d(up_left.x, up_left.y +     line_size.y), new Vector2d(up_left.x + line_size.x, up_left.y + 2 * line_size.y));
	root_rotation_info = new TextObject(new Vector2d(up_left.x, up_left.y + 2 * line_size.y), new Vector2d(up_left.x + line_size.x, up_left.y + 3 * line_size.y));
	fps_count_info     = new TextObject(new Vector2d(up_left.x, up_left.y + 3 * line_size.y), new Vector2d(up_left.x + line_size.x, up_left.y + 4 * line_size.y));
	root_position_info.transform.freeze = true;
	root_scaling_info .transform.freeze = true;
	root_rotation_info.transform.freeze = true;
	fps_count_info    .transform.freeze = true;
	
	root_position_info.visual = text_info_settings;
	root_scaling_info .visual = text_info_settings;
	root_rotation_info.visual = text_info_settings;
	fps_count_info    .visual = text_info_settings;
	root_position_info.state.is_moveable = false;
	root_scaling_info .state.is_moveable = false;
	root_rotation_info.state.is_moveable = false;
	fps_count_info    .state.is_moveable = false;
	
	root_position_info.state.is_focusable = false;
	root_scaling_info .state.is_focusable = false;
	root_rotation_info.state.is_focusable = false;
	fps_count_info    .state.is_focusable = false;
}

const render_all_objects = (ctx) => 
{
	t    = current_time();
	VisualObject.update();
	VisualObject.render(ctx);
	root_position_info.text = `origin: {${Transform2d.root_transform.position.x};${Transform2d.root_transform.position.y}}`;
	root_scaling_info .text = `scale: {${Transform2d.root_transform.scale.x};${Transform2d.root_transform.scale.y}}`;
	root_rotation_info.text	= `angle: ${Transform2d.root_transform.angle}`;
	fps_count_info.text =  `fps: ${Math.round(1.0 / Math.max(0.001, (current_time() - t)))}`;
	// draw_text(ctx, 20, 20, `frames per sec: ${Math.round(1.0 / Math.max(0.001, (current_time() - t)))}`, 14);
}