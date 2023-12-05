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
	#focus_update() { this.state.on_focus = this.contains(MouseInfo.instance.position); return this.state.on_focus;}
	#press_update() 
	{
		if (!MouseInfo.instance.is_left_down){this.state.on_down = false; return false;}
		if (!this.state.on_down) this.#delta_drag_position = Vector2d.sub(MouseInfo.instance.position, this.transform.position);
		this.state.on_down = true;
		return true;
	}
	#move_update ()
	{
		if(!this.state.is_focusable) return;
		if(!this.#focus_update()) return;
		if(!this.#press_update()) return;
		this.transform.position = Vector2d.sub(MouseInfo.instance.position, this.#delta_drag_position)
	}
	update() { if(this.state.is_moveable)this.#move_update();}

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
		
		if (color.a != 0)
		{
			ctx.fillStyle = color.color_code;
			ctx.fillRect(x0, y0, width, height);
		}
		if((stroke_width != 0)&&(stroke_color.a != 0))
		{
			ctx.lineWidth   = stroke_width;
			ctx.strokeStyle = stroke_color.color_code;
			ctx.strokeRect(x0, y0, width, height);
		}
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
        // if(!(ctx instanceof CanvasRenderingContext2D))return;
        super.render(ctx);
        const center = this.bounds.center;
        draw_text(ctx, center.x, center.y, this.text);
	}
}
const rectVisualObject = new RectangleObject(new Vector2d(-100, -200), new Vector2d(100, 200));
const circVisualObject = new CircleObject   (new Vector2d(450, 440), 100);
const textVisualObject = new TextObject     (new Vector2d(250, 250), new Vector2d(400, 500), 'myText');
rectVisualObject.transform.angle = 45;

// circVisualObject.transform.parent = rectVisualObject.transform
// textVisualObject.transform.parent = rectVisualObject.transform
// Transform2d.root.angle = 30;

const visualObjects = [circVisualObject, rectVisualObject, textVisualObject];

const render_all_objects = (ctx) => 
{
	t = current_time();
	Transform2d.sync_transforms();
	for(const obj of visualObjects)
	{
		if(!obj.state.is_shown)continue;
		ctx.save   ();
		obj.render (ctx);
		ctx.restore();
	}
	for(const obj of visualObjects) obj.update();
	draw_text(ctx, 20, 20, `frame time: ${(current_time() - t) * 0.001}`, 14);
}