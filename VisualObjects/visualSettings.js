
const FOCUS_BIT       = 0;
const DOWN_BIT        = 1;
const SHOW_BIT        = 2;
const MOVEABLE_BIT    = 3;
const FOCUSABLE_BIT   = 4;
const VIEWPORT_CAST   = 5;
const COLOR_INFO_MASK = set_bits(0, [FOCUS_BIT, DOWN_BIT]);

class VisualObjectState
{
	#_state = 0;
	#_prev_state = 0;
	#_state_change_time = 0;
	constructor     (value=0)
	{
		 this.#_state = value;
		 this.#_state_change_time = 0.0;
	}
	get state        () { return this.#_state;}
	get prev_state   () { return this.#_prev_state;}
	get on_focus     () { return is_bit_set(this.state, FOCUS_BIT    );}
	get on_down      () { return is_bit_set(this.state, DOWN_BIT     );}
	get on_up        () { return !this.on_down;}
	get is_shown     () { return is_bit_set(this.state, SHOW_BIT      );}
	get viewport_cast() { return is_bit_set(this.state, VIEWPORT_CAST );}
	get is_moveable  () { return is_bit_set(this.state, MOVEABLE_BIT  );}
	get is_focusable () { return is_bit_set(this.state, FOCUSABLE_BIT );}
	get state_time   () { return current_time() - this.#_state_change_time;}
	#setup(state, key) 
	{
		this.#_prev_state = this.#_state;
		this.#_state = state ? set_bit(this.state, key): clear_bit(this.state, key); 
		// console.log('was ' + (this.#_prev_state & COLOR_INFO_MASK) + ' | become ' + (this.#_state & COLOR_INFO_MASK))
	}
	set on_focus     (value) 
	{	
		 if(this.on_focus == value)return;
		 this.#_state_change_time = current_time();
		 this.#setup(value, FOCUS_BIT);
	}
	set on_down     (value) 
	{
		if(this.on_down == value)return;
		this.#_state_change_time = current_time();
		this.#setup(value, DOWN_BIT);
	}
	set on_up        (value) { this.on_down != value; }
	set is_shown     (value) { this.#setup(value, SHOW_BIT); }
	set is_moveable  (value) { this.#setup(value, MOVEABLE_BIT); }
	set is_focusable (value) { this.#setup(value, FOCUSABLE_BIT); }
	set viewport_cast(value) { this.#setup(value, VIEWPORT_CAST); }
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
	#_raw = true;
	#color_code = 'rgba(0,0,0,255)'
	constructor(r=128, g=138, b=148, a=1.0)
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
	set a(value){this.#_a = value; this.#_raw = true;}
}

class VisualSettings
{
	static #active_settings;
	static #default_settings = new VisualSettings();
	static get default(){return VisualSettings.#default_settings;}
	#_stroke_color         ;
	#_main_color           ;
	#_main_color_focus     ;
	#_main_color_clicked   ;
	#_stroke_width         ;
	#_transition_time      ;
	#_transition_time_start;
	#_font_family  ;
	#_font_color   ;
	#_font_size    ;
	#_text_baseline;
	#_text_align   ;
	#_corners_radiuses;
	#_colors;
	
	constructor()
	{
		this.#_main_color_focus      = new Color(70, 70, 70, 255); // 1
		this.#_main_color_clicked    = new Color(90, 90, 90, 255); // 2
		this.#_main_color            = new Color(40, 40, 40, 255);                   // 0
		this.#_colors                = [this.#_main_color, this.#_main_color_focus, this.#_main_color_clicked];
		this.#_stroke_color          = new Color(128, 138, 148, 255);
		this.#_stroke_width          = 5;
		this.#_transition_time       = 0.50;// milli - seconds
		this.#_transition_time_start = 0.0;
		this.#_font_family           = 'consolas';
		this.#_font_color            = new Color(250, 250, 250);
		this.#_font_size             = 20;
		this.#_text_baseline         = 'middle';
		this.#_text_align            = 'center';
		this.#_corners_radiuses      = [0.0, 0.0, 0.0, 0.0]
	}
	get color()		  { return this.#_main_color}
	get click_color() { return this.#_main_color_clicked;}
	get focus_color() { return this.#_main_color_focus;}

	static #eval_state(state) 
	{
		switch(state)
		{
			case 0: return 0;
			case 1: return 1;
			case 2: return 2;
			case 3: return 2;
		}
		return 0;
	}

	eval_object_color(v_object_state)
	{
		const old_state  = VisualSettings.#eval_state(v_object_state.prev_state & COLOR_INFO_MASK);
		const now_state  = VisualSettings.#eval_state(v_object_state.state      & COLOR_INFO_MASK);
		const color_prev = this.#_colors[old_state];
		const color_curr = this.#_colors[now_state];
		const t = (v_object_state.state_time - this.#_transition_time_start) / this.#_transition_time;
		return Color.lerp(color_prev, color_curr, t);
	}
	get font_family       (){return this.#_font_family  ;}
	get font_color        (){return this.#_font_color   ;}
	get font_size         (){return this.#_font_size    ;}
	get text_baseline     (){return this.#_text_baseline;}
	get text_align        (){return this.#_text_align   ;}
	get corners_radiuses  (){return this.#_corners_radiuses;}
	get up_left_radius    (){return this.#_corners_radiuses[0];}
	get down_left_radius  (){return this.#_corners_radiuses[1];}
	get down_right_radius (){return this.#_corners_radiuses[2];}
	get up_right_radius   (){return this.#_corners_radiuses[3];}

	get stroke_color(){return this.#_stroke_color;}
	get stroke_width(){return this.#_stroke_width;}
	set color       (value)
	{
		this.#_main_color = (value instanceof Color)? value: this.#_main_color  ;
		this.#_colors[0] = this.#_main_color;
	}
	set click_color (value)
	{
		this.#_main_color_clicked = (value instanceof Color)? value: this.#_main_color_clicked  ;
		this.#_colors[2] = this.#_main_color_clicked;
	}
	set focus_color (value)
	{
		this.#_main_color_focus   = (value instanceof Color)? value: this.#_main_color_focus;
		this.#_colors[1] = this.#_main_color_focus;
	}
	set stroke_width(value)
	{
		this.#_stroke_width       = value;
	}
	set stroke_color(value){this.#_stroke_color       = (value instanceof Color)? value: this.#_stroke_color;}

	set font_family  (value){this.#_font_family   = value;}
	set font_color   (value){this.#_font_color    = value;}
	set font_size    (value){this.#_font_size     = value;}
	set text_baseline(value){this.#_text_baseline = value;}
	set text_align   (value){this.#_text_align    = value;}
	set up_left_radius   (value){this.#_corners_radiuses[0] = Math.max(0.0, value);}
	set down_left_radius (value){this.#_corners_radiuses[1] = Math.max(0.0, value);}
	set down_right_radius(value){this.#_corners_radiuses[2] = Math.max(0.0, value);}
	set up_right_radius  (value){this.#_corners_radiuses[3] = Math.max(0.0, value);}

	apply_to_context(ctx)
	{
		if(VisualSettings.#active_settings == this)return;
		VisualSettings.#active_settings = this;
		ctx.font         = `${this.font_size}pt ${this.font_family}`;
		ctx.textBaseline = this.text_baseline;
		ctx.textAlign    = this.text_align;
		ctx.lineWidth    = this.stroke_width;
		ctx.strokeStyle  = this.stroke_color.color_code;
	}
}

