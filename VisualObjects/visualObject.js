const draw_circ = (ctx, x_c, y_c, radius, color, stroke_w = 3, stroke_color = "#AAAAAA") =>
{
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x_c, y_c, radius, 0, 2 * Math.PI);
	ctx.fill();
	
	if(stroke_w != 0)
	{
		ctx.lineWidth = stroke_w;
		ctx.strokeStyle =  stroke_color;
		ctx.beginPath();
		ctx.arc(x_c, y_c, radius, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

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
		VisualObject.#delete_request_objects.push(visual_object);
		if(!visual_object.has_children)return;
		for(const child of visual_object.children)VisualObject.destroy(child);
	}
	static #eval_objects_destroy()
	{
		while(VisualObject.#delete_request_objects.length != 0)
		{
			const object = VisualObject.#delete_request_objects.pop();
			VisualObject.#visual_objects.delete(object);
		}
	}
	static update()
	{
		for(const obj of VisualObject.#visual_objects) obj.update();
		Transform2d.sync_transforms();
		VisualObject.#eval_objects_destroy();
	}
	static render(ctx)
	{
		for(const obj of VisualObject.#visual_objects)
		{
			if(!obj.state.is_shown)continue;
			ctx.save   ();
			obj.render (ctx);
			ctx.restore();
		}
	}

	// TODO:
	// блокировать движение мышью 
	// блокировать отслеживание фокуса
	// скрыть/показать
	static #visual_objects = new Set();
	static #delete_request_objects = [];
	static #active = null;
	#_parent;
	#_children;
	#_bounds;
	#_transform;
	#_visual;
	#_state;
	#delta_drag_position;
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
	set parent    (v_object)
	{
		if(this.has_parent) this.parent.#_children.delete(this);
		this.#_parent = v_object;
		v_object.#_children.add(this);
		this.transform.parent = v_object.transform
		return;
	}
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
		if(VisualObject.#active != null) return VisualObject.#active == this;
		 this.state.on_focus = this.contains(MouseInfo.instance.position);
		 return this.state.on_focus;
	}
	#press_update() 
	{
		if (MouseInfo.instance.is_middle_down) VisualObject.destroy(this);
		if (!MouseInfo.instance.is_left_down)
		{
			VisualObject.#active = null; 
			this.state.on_down = false;
			return false;
		}
		if (!this.state.on_down)
		{
			VisualObject.#active = this; 
			this.#delta_drag_position = Vector2d.sub(MouseInfo.instance.position, this.transform.position);
		}
		this.state.on_down = true;
		return true;
	}
	#move_update ()
	{
		if(!this.state.is_focusable) return;
		if(!this.#focus_update()) return;
		if(!this.state.is_moveable) return;
		if(!this.#press_update()) return;
		this.transform.position = Vector2d.sub(MouseInfo.instance.position, this.#delta_drag_position)
	}
	// TODO корректное отслеживание состояний 
	update() { this.#move_update();}
	
	render(ctx)
	{
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		const width     = this.bounds.width ;
		const height    = this.bounds.height;
		const x0        = this.bounds.min.x; 
		const y0        = this.bounds.min.y; 
		const corners   = [this.visual.corner_radius, this.visual.corner_radius, this.visual.corner_radius, this.visual.corner_radius];
		ctx.fillStyle = this.visual.eval_object_color(this.state).color_code;
		ctx.roundRect(x0, y0, width, height, corners);
		ctx.fill();	
		ctx.roundRect(x0, y0, width, height, corners);
		ctx.stroke();
	}
}

class RectangleObject extends VisualObject{}

class CircleObject    extends VisualObject
{   
    #radius;
    constructor(center, radius=1.0)
    {
        super(new Vector2d(-radius + center.x, -radius + center.y), 
			  new Vector2d( radius + center.x,  radius + center.y));
        this.#radius = Math.abs(radius); 
    }
    get radius(){return this.#radius;}
    
    set radius(value){if(!isNaN(radius))return; this.#radius = Math.abs(value);}
    
    contains(point)
    {
		const p = this.transform.inv_world_transform_point(point)
        return p.length < this.radius;
    }

    render(ctx)
	{
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		ctx.fillStyle = this.visual.eval_object_color(this.state).color_code;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
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
    render(ctx)
	{
        super.render(ctx);
        const center  = this.bounds.center;
		ctx.fillStyle = this.visual.font_color.color_code;
		ctx.fillText(this.text, center.x, center.y);
	}
}

const non_gate = (center) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 20),
											   new Vector2d(center.x + 50, center.y + 20), 'NOT');
	textVisualObject.visual.corner_radius = 5;
	const circVisualObject1 = new CircleObject(new Vector2d(-50, 0), 12);
	const circVisualObject2 = new CircleObject(new Vector2d( 50, 0), 12);
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject1.visual.focus_color = new Color(255, 0, 0, 255);
	circVisualObject1.visual.click_color = new Color(255, 0,0,   255);
	circVisualObject2.visual.focus_color = new Color(255, 0, 0, 255);
	circVisualObject2.visual.click_color = new Color(255, 0,   0,   255);
	const visualObjects = [textVisualObject, circVisualObject1, circVisualObject2];
	return visualObjects;
}

const and_gate = (center) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 35),
											   new Vector2d(center.x + 50, center.y + 35), 'AND');
	textVisualObject.visual.corner_radius = 10;
	const circVisualObject1 = new CircleObject(new Vector2d(-50,  17), 12);
	const circVisualObject2 = new CircleObject(new Vector2d(-50, -17), 12);
	const circVisualObject3 = new CircleObject(new Vector2d( 50, 0), 12);
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject3.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject3.state.is_moveable = false;
	circVisualObject1.visual.focus_color = new Color(255, 0, 0, 255);
	circVisualObject1.visual.click_color = new Color(255, 0,0,   255);
	circVisualObject2.visual.focus_color = new Color(255, 0, 0, 255);
	circVisualObject2.visual.click_color = new Color(255, 0,   0,   255);
	circVisualObject3.visual.focus_color = new Color(255, 0, 0, 255);
	circVisualObject3.visual.click_color = new Color(255, 0,   0,   255);
	const visualObjects = [textVisualObject, circVisualObject1, circVisualObject2, circVisualObject3];
	return visualObjects;
}

const create_visual_objects = () =>
{
	Transform2d.root_transform.position = new Vector2d(RenderCanvas.instance.width * 0.5, RenderCanvas.instance.height * 0.5);
	const visualObjects = [];
   	for(var i = 0; i < 1; i++)
   	{
   		for(var j = 0; j < 1; j++)
   		{
   			const objects = non_gate(new Vector2d((-2.5 + i) * 200 + 120, (-2.5 + j) * 80));
			for(const o of objects) visualObjects.push(o);
   		}
   	}
	return visualObjects;
}

const render_all_objects = (ctx) => 
{
	t    = current_time();
	VisualObject.update();
	VisualObject.render(ctx);
	draw_text(ctx, 20, 20, `frames per sec: ${Math.round(1.0 / Math.max(0.001, (current_time() - t)))}`, 14);
}