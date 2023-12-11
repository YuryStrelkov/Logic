
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
	#_raw = true;
	#color_code = 'rgba(0,0,0,255)'
	constructor(r=128, g=138, b=148, a=255)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	#update_color_code()
	{
		if (!this.#_raw) return;
		this.#_raw = false;
		this.#color_code = `rgba(${this.r},${this.g},${this.b},${this.a})`;
	}
	get color_code() {this.#update_color_code(); return this.#color_code;}

	get r(){return this.#_r;}
	get g(){return this.#_g;}
	get b(){return this.#_b;}
	get a(){return this.#_a;}
	set r(value){this.#_r = value & 255; this.#_raw = true;}
	set g(value){this.#_g = value & 255; this.#_raw = true;}
	set b(value){this.#_b = value & 255; this.#_raw = true;}
	set a(value){this.#_a = value & 255; this.#_raw = true;}
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
	#_font_family  ;
	#_font_color   ;
	#_font_size    ;
	#_text_baseline;
	#_text_align   ;
	#_corner_radius;
	
	constructor()
	{
		this.#_stroke_color          = new Color(128, 138, 148, 255);
		this.#_main_color            = new Color(0, 0, 0, 255);                   // 0
		this.#_main_color_focus      = new Color(10, 10, 10, 255); // 1
		this.#_main_color_clicked    = new Color(40, 40, 40, 255); // 2
		this.#_curr_color            = new Color(0, 0, 0, 255);
		this.#_prev_color            = new Color(0, 0, 0, 255);
		this.#_stroke_width          = 5;
		this.#_transition_time       = 200;// milli - seconds
		this.#_transition_time_start = 0.0;
		this.#_transition_color_id   = -1;
		this.#_font_family   = 'consolas';
		this.#_font_color    = new Color(250, 250, 250);
		this.#_font_size     = 20;
		this.#_text_baseline = 'middle';
		this.#_text_align    = 'center';
		this.#_corner_radius = 0.0
	}
	#evaluate_color(color)
	{
		const t = (current_time() - this.#_transition_time_start) / this.#_transition_time;
		this.#_curr_color = Color.lerp(this.#_prev_color, color, t);
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
	}
	get focus_color() 
	{
		this.#swap_color(2);
		return this.#evaluate_color(this.#_main_color_focus);	
	}
	get font_family  (){return this.#_font_family  ;}
	get font_color   (){return this.#_font_color   ;}
	get font_size    (){return this.#_font_size    ;}
	get text_baseline(){return this.#_text_baseline;}
	get text_align   (){return this.#_text_align   ;}
	get corner_radius(){return this.#_corner_radius;}

	get stroke_color(){return this.#_stroke_color;}
	get stroke_width(){return this.#_stroke_width;}
	set color       (value){this.#_main_color         = (value instanceof Color)? value: this.#_main_color  ;}
	set stroke_color(value){this.#_stroke_color       = (value instanceof Color)? value: this.#_stroke_color;}
	set click_color (value){this.#_main_color_clicked = (value instanceof Color)? value: this.#_main_color_clicked  ;}
	set focus_color (value){this.#_main_color_focus   = (value instanceof Color)? value: this.#_main_color_focus;}
	set stroke_width(value){this.#_stroke_width       = (!isNaN(value))? value: this.#_stroke_width;}

	set font_family  (value){this.#_font_family   = value;}
	set font_color   (value){this.#_font_color    = value;}
	set font_size    (value){this.#_font_size     = value;}
	set text_baseline(value){this.#_text_baseline = value;}
	set text_align   (value){this.#_text_align    = value;}
	set corner_radius(value){this.#_corner_radius = value;}
	apply_text_settings_to_context(ctx)
	{
		ctx.font         = `${this.font_size}pt ${this.font_family}`;
		ctx.fillStyle    = this.font_color.color_code;
		ctx.textBaseline = this.text_baseline;
		ctx.textAlign    = this.text_align;
	}
}
