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
	ctx.textBaseline = 'middle';
	ctx.textAlign = "left";
	ctx.fillText(text_value, x_c,  y_c);
}

const FOCUS_BIT     = 0;
const DOWN_BIT      = 1;
const UP_BIT        = 2;
const SHOW_BIT      = 3;
const MOVEABLE_BIT  = 4;
const FOCUSABLE_BIT = 5;

class VisualObjectState
{
	#_state = 0;
	constructor     (value=0) { this.#_state = value;}
	get state       () { return this.#_state;}
	get on_focus    () { return is_bit_set(this.state, FOCUS_BIT    );}
	get on_down     () { return is_bit_set(this.state, DOWN_BIT     );}
	get on_up       () { return is_bit_set(this.state, UP_BIT       );}
	get is_shown    () { return is_bit_set(this.state, SHOW_BIT     );}
	get is_moveable () { return is_bit_set(this.state, MOVEABLE_BIT );}
	get is_focusable() { return is_bit_set(this.state, FOCUSABLE_BIT );}
	
	set on_focus    (value) { this.#_state = value ? set_bit(this.state, FOCUS_BIT   ): clear_bit(this.state, FOCUS_BIT   );}
	set on_down     (value) { this.#_state = value ? set_bit(this.state, DOWN_BIT    ): clear_bit(this.state, DOWN_BIT    );}
	set on_up       (value) { this.#_state = value ? set_bit(this.state, UP_BIT      ): clear_bit(this.state, UP_BIT      );}
	set is_shown    (value) { this.#_state = value ? set_bit(this.state, SHOW_BIT    ): clear_bit(this.state, SHOW_BIT    );}
	set is_moveable (value) { this.#_state = value ? set_bit(this.state, MOVEABLE_BIT): clear_bit(this.state, MOVEABLE_BIT);}
	set is_focusable(value) { this.#_state = value ? set_bit(this.state, FOCUSABLE_BIT): clear_bit(this.state, FOCUSABLE_BIT);}
}

class VisualObject
{
	// TODO:
	// блокировать движение мышью 
	// блокировать отслеживание фокуса
	// скрыть/показать
	static #active = null;
	#_bounds;
	#_transform;
	#_visual;
	#_state;
	#delta_drag_position;
	constructor(min, max)
	{
	  this.#_bounds           = new RectBounds(min, max);
	  this.#_transform        = new Transform2d();
	  this.#_visual           = new VisualSettings();
	  this.#_state            = new VisualObjectState(set_bit(set_bit(set_bit(0, SHOW_BIT), MOVEABLE_BIT), FOCUSABLE_BIT));
	  this.transform.position = this.bounds.center;
	  this.bounds.center      = new Vector2d(0, 0);
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
	update() { this.#move_update();}

	_evaluate_color()
	{
		if(this.state.on_down)  return this.visual.click_color;
		if(this.state.on_focus) return this.visual.focus_color;
		return this.visual.color;
	}
	
	render(ctx)
	{
		this.transform.apply_to_context(ctx);
		const width        = this.bounds.width ;// * 0.5;
		const height       = this.bounds.height;// * 0.5;
		const x0           = this.bounds.min.x; // - width;
		const y0           = this.bounds.min.y; // - height;
		const color        = this._evaluate_color();
		const stroke_color = this.visual.stroke_color;
		const stroke_width = this.visual.stroke_width;
		
		ctx.fillStyle = color.color_code;
		const corners = [this.visual.corner_radius,this.visual.corner_radius,this.visual.corner_radius,this.visual.corner_radius];
		ctx.roundRect(x0, y0, width, height, corners);
		ctx.fill();	
		ctx.lineWidth   = stroke_width;
		ctx.strokeStyle = stroke_color.color_code;
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
		const color        = this._evaluate_color();
		const stroke_color = this.visual.stroke_color;
		const stroke_width = this.visual.stroke_width;
	    if(color.a != 0)
        {
            ctx.fillStyle = color.color_code;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
        if((stroke_width != 0) && (stroke_color.a != 0))
        {
            ctx.lineWidth   = stroke_width;
            ctx.strokeStyle = stroke_color.color_code;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
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
        const center = this.bounds.center;
		this.visual.apply_text_settings_to_context(ctx);
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
	circVisualObject1.transform.parent = textVisualObject.transform
	circVisualObject2.transform.parent = textVisualObject.transform
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
	circVisualObject1.transform.parent = textVisualObject.transform
	circVisualObject2.transform.parent = textVisualObject.transform
	circVisualObject3.transform.parent = textVisualObject.transform
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
   	for(var i = 0; i < 2; i++)
   	{
   		for(var j = 0; j < 1; j++)
   		{
   			const objects = and_gate(new Vector2d((-2.5 + i) * 200 + 120, (-2.5 + j) * 80));
			// objects[0].transform.angle = (i + j) * 10;
   			for(const o of objects) visualObjects.push(o);
   		}
   	}
	return visualObjects;
}

const render_all_objects = (ctx, objects) => 
{
	t = current_time();
	for(const obj of objects) obj.update();
	Transform2d.sync_transforms();
	for(const obj of objects)
	{
		if(!obj.state.is_shown)continue;
		ctx.save   ();
		obj.render (ctx);
		ctx.restore();
	}
	draw_text(ctx, 20, 20, `frame time: ${(current_time() - t) * 0.001}`, 14);
}