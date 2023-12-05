const not_w = 120;
const not_h = 50;
const and_w = 120;
const and_h = 100;			

var startTime = Date.now();

function current_time()
{
	return Date.now() - startTime;
}

class Vector2
{
	static lerp(a, b, t)
	{
		if(a instanceof Vector2)return 0.0;
		if(b instanceof Vector2)return 0.0;
		const _t = Math.min(Math.max(0.0, t), 1.0);
		return new Vector2(a.x + (b.x - a.x) * _t, a.y + (b.y - a.y) * _t);
	}
	
	static dot(a, b)
	{
		if(a instanceof Vector2)return 0.0;
		if(b instanceof Vector2)return 0.0;
		return a.x * b.x + a.y * b.y;
	}
	
	static cross(a, b)
	{
		if(a instanceof Vector2)return 0.0;
		if(b instanceof Vector2)return 0.0;
		return a.x * b.y - a.y * b.x;
	}
	
	static angle(a, b)
	{
		if(a instanceof Vector2)return 0.0;
		if(b instanceof Vector2)return 0.0;
		return Math.acos(Vector2.dot(a, b) * a.inv_length * b.inv_length);
	}
	static distance()
	{
		if(a instanceof Vector2)return -1.0;
		if(b instanceof Vector2)return -1.0;
		const x = b.x - a.x;
		const y = b.y - a.y;
		return Math.sqrt(x * x + y * y);
	}
	static manhattan_distance()
	{
		if(a instanceof Vector2)return -1.0;
		if(b instanceof Vector2)return -1.0;
		return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
	}
	
	#_x = 0.0;
	#_y = 0.0;
	get x(){return this.#_x;};
	get y(){return this.#_y;};
	set x(value){this.#_x = (!isNaN(value))? value: this.#_x;};
	set y(value){this.#_y = (!isNaN(value))? value: this.#_y;};
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
	get length(){ return Math.sqrt(this.x * this.x + this.y  * this.y); }
	get inv_length(){ return 1.0 / this.length; }
	
	get normalized()
	{
		const i_length = this.inv_length;
		return Vector2(this.x * i_length, this.y * i_length);
	}
	
	normalize()
	{
		const i_length = this.inv_length;
		this.x *= i_length;
		this.y *= i_length;
		return this;
	}
}

class RectBounds
{
	#min_pt;
	#max_pt;	
	constructor(min, max)
	{
		this.#min_pt = (min instanceof Vector2) ? new Vector2(Math.min(min.x, max.x), Math.min(min.y, max.y)): new Vector2(0.0, 0.0);
		this.#max_pt = (max instanceof Vector2) ? new Vector2(Math.max(min.x, max.x), Math.max(min.y, max.y)): new Vector2(1.0, 1.0);
	}
	get width (){ return this.max.x - this.min.x; }
	get height(){ return this.max.y - this.min.y; }

	get min (){ return this.#min_pt; }
	get max (){ return this.#max_pt; }
	
	get size  (){ return new Vector2( this.max.x - this.min.x,         this.max.y - this.min.y); }
	get center(){ return new Vector2((this.max.x + this.min.x) * 0.5, (this.max.y + this.min.y) * 0.5);}
	set size(size)
	{
		if(!(size instanceof Vector2))return;
		const center = this.center;
		this.#_setup(size, center);
	}
	set center(center)
	{
		if(!(center instanceof Vector2))return;
		const size = this.size;
		this.#_setup(size, center);
	}
	#_setup(size, center)
	{
		this.#min_pt = new Vector2(center.x - size.x * 0.5, center.y - size.y * 0.5); 
		this.#max_pt = new Vector2(center.x + size.x * 0.5, center.y + size.y * 0.5);
	}
	#_contains(point)
	{
		if(point.x < this.min.x) return false;
		if(point.x > this.max.x) return false;
		if(point.y < this.min.y) return false;
		if(point.y > this.max.y) return false;
		return true;
	}
	contains(point)
	{
		if(!(point instanceof Vector2))return false;
		return this.#_contains(point);
	}
	contains_rect(rect)
	{
		if(!(rect instanceof RectBounds))return false;
		return this.#_contains(rect.min)&&this.#_contains(rect.max);
	}
	intersect_rect(rect)
	{
		if(!(rect instanceof RectBounds))return false;
		return this.#_contains(rect.min)||this.#_contains(rect.max);
	}
	distance(point)
	{
		if(!(point instanceof Vector2))return 1e32;
		const orig = this.center;
        const size = this.size;

        const x_l = point.x - (orig.x - size.x * 0.5);
        const x_r = point.x - (orig.x + size.x * 0.5);

        const y_l = point.y - (orig.y - size.y * 0.5);
        const y_r = point.y - (orig.y + size.y * 0.5);

        return Math.max(Math.max(Math.abs(y_l), Math.abs(y_r)) - size.y, 
						Math.max(Math.abs(x_l), Math.abs(x_r)) - size.x);
	}
	get points()
	{
		const c = this.center;
        const s = this.size;
        return [new Vector2(c.x - s.x * 0.5, c.y + s.y * 0.5),
				new Vector2(c.x - s.x * 0.5, c.y - s.y * 0.5),
				new Vector2(c.x + s.x * 0.5, c.y - s.y * 0.5),
				new Vector2(c.x + s.x * 0.5, c.y + s.y * 0.5)];
	}
	get edges()
	{
		const points = this.points;
	    return [[points[0], points[1]],
				[points[1], points[2]],
				[points[2], points[3]],
				[points[3], points[0]]];
	}
}

class Transform2d
{
	#_position;
	#_scale;
	#_rotation;
	#_angle;
	constructor()
	{
	  this.#_position = new Vector2(0.0, 0.0);
	  this.#_scale    = new Vector2(1.0, 1.0);
	  this.#_rotation = new Vector2(1.0, 0.0);  // {x: cos(angle), y: sin(angle)}
	  this.#_angle    = 0.0;
	}
	get position(){return this.#_position;}
	get scale   (){return this.#_scale;}
	get angle   (){return (this.#_angle / Math.PI) * 180.0;}
	set position(value)
	{
		if(!(value instanceof Vector2))return; 
		this.#_position = value;
	}
	set scale   (value)
	{
		if(!(value instanceof Vector2))return;
		this.#_scale = value;
	}
	set angle(value)
	{
		if(isNaN(value))return;
		this.#_angle    = (value * Math.PI) / 180.0;
		this.#_rotation = new Vector2(Math.sin(this.#_angle), Math.cos(this.#_angle));
	}
	transform_point(point)
	{
		// i = Matrix3( cos_a, sin_a, 0.0,
        //             -sin_a, cos_a, 0.0,
        //              0.0,     0.0, 1.0)
		if(!(point instanceof Vector2))return new Vector2(0.0, 0.0);
		return new Vector2( point.x * this.#_rotation.y * this.scale.x + point.y * this.#_rotation.x * this.scale.y + this.position.x,
					       -point.x * this.#_rotation.x * this.scale.x + point.y * this.#_rotation.y * this.scale.y + this.position.y);
	}
	transform_direction(point)
	{
		// i = Matrix3( cos_a, sin_a, 0.0,
        //             -sin_a, cos_a, 0.0,
        //              0.0,     0.0, 1.0)
		if(!(point instanceof Vector2))return new Vector2(0.0, 0.0);
		return new Vector2( point.x * this.#_rotation.y + point.y * this.#_rotation.x,
					       -point.x * this.#_rotation.x + point.y * this.#_rotation.y);
	}
	inv_transform_point(point)
	{
		// ft = Matrix3( cos_a, sin_a, 0.0,
        //              -sin_a, cos_a, 0.0,
        //               0.0,     0.0, 1.0)
		// it = Matrix3( cos_a,-sin_a, 0.0,
        //               sin_a, cos_a, 0.0,
        //               0.0,     0.0, 1.0)
		if(!(point instanceof Vector2))return new Vector2(0.0, 0.0);
		const m00 = this.#_rotation.x / this.scale.x;
		const m10 =-this.#_rotation.y / this.scale.x;
		const m01 = this.#_rotation.y / this.scale.y;
		const m11 = this.#_rotation.x / this.scale.y;
		const x  = (m00 * point.y + m10 * point.x) - (m00 * this.position.y + m10 * this.position.x);
		const y  = (m01 * point.y + m11 * point.x) - (m01 * this.position.y + m11 * this.position.x);
		return new Vector2(x, y);
	}
	inv_transform_direction(point)
	{
		if(!(point instanceof Vector2))return new Vector2(0.0, 0.0);
		return new Vector2(point.x * this.#_rotation.x - point.y * this.#_rotation.y,
						   point.x * this.#_rotation.y + point.y * this.#_rotation.x);
	}
	apply_to_context(ctx)
	{
		ctx.translate(this.position.x, this.position.y);
		ctx.scale    (this.scale.x,    this.scale.y);
		ctx.rotate   (-this.#_angle);
	}
}

class Color
{
	static lerp(a, b, t)
	{
		if(!(a instanceof Color))return new Color(0, 0, 0);
		if(!(b instanceof Color))return new Color(0, 0, 0);
		const _t = Math.min(Math.max(0.0, t), 1.0);
		return new Color(a.r + (b.r - a.r) * _t,
						 a.g + (b.g - a.g) * _t,
						 a.b + (b.b - a.b) * _t,
						 a.a + (b.a - a.a) * _t);
	}
	#_r = 0;
	#_g = 0;
	#_b = 0;
	#_a = 255;
	constructor(r=128, g=138, b=148, a=255)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	get color_code()
	{
		// return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(16)}${this.a.toString(16)}`
		return `rgba(${this.r},${this.g},${this.b},${this.a})`;
	}
	get r(){return this.#_r;}
	get g(){return this.#_g;}
	get b(){return this.#_b;}
	get a(){return this.#_a;}
	set r(value){this.#_r = (!isNaN(value))? value & 255 : this.#_r;}
	set g(value){this.#_g = (!isNaN(value))? value & 255 : this.#_g;}
	set b(value){this.#_b = (!isNaN(value))? value & 255 : this.#_b;}
	set a(value){this.#_a = (!isNaN(value))? value & 255 : this.#_a;}
}

class VisualSettings
{
	#_stroke_color         ;
	#_main_color           ;
	#_main_color_focus     ;
	#_main_color_clicked   ;
	#_curr_color           ;
	#_prev_color           ;
	#_stroke_width         ;
	#_transition_color_id  ;
	#_transition_time      ;
	#_transition_time_start;
	
	constructor()
	{
		/*this.#_stroke_color          = new Color(0.2 * 128, 0.2 * 138, 0.2 * 148, 255);
		this.#_main_color            = new Color(128, 138, 148, 255);                   // 0
		this.#_main_color_focus      = new Color(1.1 * 128, 1.1 * 138, 1.1 * 148, 255); // 1
		this.#_main_color_clicked    = new Color(0.9 * 128, 0.9 * 138, 0.9 * 148, 255); // 2
		this.#_curr_color            = new Color(128, 138, 148, 255);
		this.#_prev_color            = new Color(128, 138, 148, 255);*/
		this.#_stroke_color          = new Color(0.2 * 128, 0.2 * 138, 0.2 * 148, 255);
		this.#_main_color            = new Color(128, 138, 148, 255);                   // 0
		this.#_main_color_focus      = new Color(255,  0,  0, 255); // 1
		this.#_main_color_clicked    = new Color(0, 0, 255, 255); // 2
		this.#_curr_color            = new Color(128, 138, 148, 255);
		this.#_prev_color            = new Color(128, 138, 148, 255);
		this.#_stroke_width          = 5;
		this.#_transition_time       = 1000;// milli - seconds
		this.#_transition_time_start = 0.0;
		this.#_transition_color_id   = -1;
	}
	#evaluate_color(color)
	{
		const t = (current_time() - this.#_transition_time_start) / this.#_transition_time;
		// console.log(t);
		this.#_curr_color = Color.lerp(this.#_prev_color, color, t);
		// console.log(this.#_curr_color.color_code);
		return this.#_curr_color;
	}
	#swap_color(color_id)
	{
		if(this.#_transition_color_id == color_id) return;
		this.#_transition_color_id = color_id;
		this.#_transition_time_start = current_time();
		this.#_prev_color = new Color(this.#_curr_color.r,
									  this.#_curr_color.g,
									  this.#_curr_color.b,
									  this.#_curr_color.a);
	}
	get color()
	{
		this.#swap_color(0);
		return this.#evaluate_color(this.#_main_color);
	}
	get click_color() 
	{
		this.#swap_color(1);
		return this.#evaluate_color(this.#_main_color_clicked);
		// return this.#_main_color_clicked;
	}
	get focus_color() 
	{
		this.#swap_color(2);
		return this.#evaluate_color(this.#_main_color_focus);	
		// return this.#_main_color_focus;
	}
	get stroke_color(){return this.#_stroke_color;}
	get stroke_width(){return this.#_stroke_width;}
	set color       (value){this.#_main_color         = (value instanceof Color)? value: this.#_main_color  ;}
	set stroke_color(value){this.#_stroke_color       = (value instanceof Color)? value: this.#_stroke_color;}
	set click_color (value){this.#_main_color_clicked = (value instanceof Color)? value: this.#_main_color_clicked  ;}
	set focus_color (value){this.#_main_color_focus   = (value instanceof Color)? value: this.#_main_color_focus;}
	set stroke_width(value){this.#_stroke_width       = (!isNaN(value))? value: this.#_stroke_width;}
}

const FOCUS_BIT   = 0;
const CLICKED_BIT = 1;
const HOLD_BIT    = 2;
const RELEASE_BIT = 3;
const DRAG_BIT    = 4;
const SHOW_BIT    = 5;

class VisualObjectState
{
	#_state = 0;
	static set_bit(bytes, bit)
	{
		bytes |= (1 << bit);
		return bytes;
	}
	static is_bit_set(bytes, bit)
	{
		return (bytes & (1 << bit)) != 0;
	}
	static clear_bit(bytes, bit)
	{
		bytes &= ~(1 << bit);
		return bytes;
	}
	constructor()
	{
		this.#_state = 0;
	}
	get state     (){return this.#_state;}
	get on_focus  (){return VisualObjectState.is_bit_set(this.state, FOCUS_BIT  );}
	get on_clicked(){return VisualObjectState.is_bit_set(this.state, CLICKED_BIT);}
	get on_hold   (){return VisualObjectState.is_bit_set(this.state, HOLD_BIT   );}
	get on_release(){return VisualObjectState.is_bit_set(this.state, RELEASE_BIT);}
	get on_drag   (){return VisualObjectState.is_bit_set(this.state, DRAG_BIT   );}
	get is_shown  (){return VisualObjectState.is_bit_set(this.state, SHOW_BIT   );}
	
	set on_focus  (value){this.#_state = value ? VisualObjectState.set_bit(this.state, FOCUS_BIT  ):VisualObjectState.clear_bit(this.state, FOCUS_BIT  );}
	set on_clicked(value){this.#_state = value ? VisualObjectState.set_bit(this.state, CLICKED_BIT):VisualObjectState.clear_bit(this.state, CLICKED_BIT);}
	set on_hold   (value){this.#_state = value ? VisualObjectState.set_bit(this.state, HOLD_BIT   ):VisualObjectState.clear_bit(this.state, HOLD_BIT   );}
	set on_release(value){this.#_state = value ? VisualObjectState.set_bit(this.state, RELEASE_BIT):VisualObjectState.clear_bit(this.state, RELEASE_BIT);}
	set on_drag   (value){this.#_state = value ? VisualObjectState.set_bit(this.state, DRAG_BIT   ):VisualObjectState.clear_bit(this.state, DRAG_BIT   ); }
	set is_shown  (value){this.#_state = value ? VisualObjectState.set_bit(this.state, SHOW_BIT   ):VisualObjectState.clear_bit(this.state, SHOW_BIT   ); }
}

class VisualObject
{
	#_bounds;
	#_transform;
	#_visual;
	#_state;
	
	constructor(min, max)
	{
	  this.#_bounds    = new RectBounds(min, max);
	  this.#_transform = new Transform2d();
	  this.#_visual    = new VisualSettings();
	  this.#_state     = new VisualObjectState();
	  // this.transform.angle = 45.0;
	  this.transform.position = this.bounds.center;
	  this.bounds.center      = new Vector2(0, 0);
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
	contains(point)
	{
		if(!(point instanceof Vector2))return false;
		return this.bounds.contains(this.transform.inv_transform_point(point));
	}
	render(ctx)
	{
		ctx.save     ();
		this.transform.apply_to_context(ctx);
		const width  = this.bounds.width ;// * 0.5;
		const height = this.bounds.height;// * 0.5;
		const x0     = this.bounds.min.x; // - width;
		const y0     = this.bounds.min.y; // - height;
		let   color  = this.state.on_focus ? this.visual.focus_color: this.visual.color;
		      color  = this.state.on_clicked ? this.visual.click_color: color;
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
		
		ctx.restore(); //setTransform(1, 0, 0, 1, 0, 0);
		for (const pt of this.points)draw_circ(ctx, pt.x, pt.y, 5, color, stroke_width, "#FFAAAA");
	}
}

/*
class MouseInfo
{
	static canvas_mouse_coord(evt)
	{
		return new Vector2(evt.clientX - canvas.offsetLeft, evt.clientY - canvas.offsetTop);
	}
	#_state;
	#_position;
	#_position_delta;
	#_drag_start_position;
	constructor()
	{
		this.#_state               = new ObjectState();
		this.#_position            = null;
		this.#_position_delta      = null;
		this.#_drag_start_position = null;
	}
	get position(){return this._position;};
	get position_delta;
	get drag_start_position;
	update(evt)
	{
		if(this.position == null)
		{
			this.#_position = MouseInfo.canvas_mouse_coord(evt);
			this.#_position_delta  = new Vector2(0,0);
		}
	}
}*/

function draw_rect(ctx, x_c, y_c, width, height, color, stroke_w = 3, stroke_color = "#AAAAAA")
{
	ctx.save();
	ctx.translate(x_c, y_c);
	ctx.fillStyle = color;
	ctx.fillRect(-width >> 1, -height >> 1, width, height);
	if(stroke_w != 0)
	{
		ctx.lineWidth = stroke_w;
		ctx.strokeStyle =  stroke_color;
		ctx.strokeRect(-width >> 1, -height >> 1, width, height);
	}
	ctx.restore();
}

function draw_circ(ctx, x_c, y_c, radius, color, stroke_w = 3, stroke_color = "#AAAAAA")
{
	ctx.save();
	ctx.translate(x_c, y_c);
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);
	ctx.fill();
	
	if(stroke_w != 0)
	{
		ctx.lineWidth = stroke_w;
		ctx.strokeStyle =  stroke_color;
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, 2 * Math.PI);
		ctx.stroke();
	}
	ctx.restore();
}

function draw_text(ctx, x_c, y_c, text_value, text_size = 30, text_font = 'consolas', text_color = "#FFFFFF")
{
	ctx.font = `#{text_size}pt #{text_font}`;
	ctx.fillStyle = text_color;
	ctx.textBaseline = 'middle';
	ctx.textAlign = "center";
	ctx.fillText(text_value, x_c,  y_c);
}

function draw_not(ctx, x_c, y_c, input=false, output=false)
{
	draw_rect(ctx, x_c,                y_c, not_w, not_h, "#111111");
	draw_circ(ctx, x_c - (not_w >> 1), y_c, 15, input?"#FF1111":"#888888");
	draw_circ(ctx, x_c + (not_w >> 1), y_c, 15, output?"#FF1111":"#888888");
	draw_text(ctx, x_c,                y_c, "NOT");
}

function draw_and(ctx, x_c, y_c, input_a=false, input_b=false, output=false)
{
	draw_rect(ctx, x_c,                y_c,                  and_w, and_h, "#111111");
	draw_circ(ctx, x_c - (and_w >> 1), y_c - 2 * 15, 15, input_a? "#FF1111":"#888888");
	draw_circ(ctx, x_c - (and_w >> 1), y_c + 2 * 15, 15, input_b? "#FF1111":"#888888");
	draw_circ(ctx, x_c + (and_w >> 1), y_c, 15, output?  "#FF1111":"#888888");
	draw_text(ctx, x_c,                y_c, "AND");
}

function draw_or(ctx, x_c, y_c, input_a=false, input_b=false, output=false)
{
	draw_rect(ctx, x_c,                y_c,                  and_w, and_h, "#111111");
	draw_circ(ctx, x_c - (and_w >> 1), y_c - 2 * 15, 15, input_a? "#FF1111":"#888888");
	draw_circ(ctx, x_c - (and_w >> 1), y_c + 2 * 15, 15, input_b? "#FF1111":"#888888");
	draw_circ(ctx, x_c + (and_w >> 1), y_c, 15, output?  "#FF1111":"#888888");
	draw_text(ctx, x_c,                y_c, "OR");
}

function draw_xor(ctx, x_c, y_c, input_a=false, input_b=false, output=false)
{
	draw_rect(ctx, x_c,                y_c,                  and_w, and_h, "#111111");
	draw_circ(ctx, x_c - (and_w >> 1), y_c - 2 * 15, 15, input_a? "#FF1111":"#888888");
	draw_circ(ctx, x_c - (and_w >> 1), y_c + 2 * 15, 15, input_b? "#FF1111":"#888888");
	draw_circ(ctx, x_c + (and_w >> 1), y_c, 15, output?  "#FF1111":"#888888");
	draw_text(ctx, x_c,                y_c, "XOR");
}