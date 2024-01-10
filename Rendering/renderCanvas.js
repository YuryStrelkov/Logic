
class RenderCanvas extends VisualObject
{
    #limit_movement()
	{
		const position = Transform2d.root.position;
		const scale    = Transform2d.root.scale;
		const cw       = this.width  * 0.5;
		const ch       = this.height * 0.5;
        const actual_w = cw / scale.x;
        const actual_h = ch / scale.y;
		position.x     = Math.min(Math.max(actual_w, position.x), 2.0 * cw - actual_w);
		position.y     = Math.min(Math.max(actual_h, position.y), 2.0 * ch - actual_h);
		Transform2d.root.position.position = position;
	}

    #update_background_pattern()
    {
        if(!PatternCanvas.instance.repaint())return;
        this.#pattern = this.canvas_ctx.createPattern(PatternCanvas.instance.canvas, "repeat");
    }
    #canvas    ;
    #canvas_ctx;
    #color     ;
    #border    ;
    #pattern   ;
    static #instance = null;
    static get instance()
    {   
        if(RenderCanvas.#instance === null) RenderCanvas.#instance = new RenderCanvas();
        return RenderCanvas.#instance;
    }
    get scale()     {return Transform2d.root.scale.x;}
    set scale(value)
    {
        value                  = Math.max(Math.min(value, MAX_SCALE), 1.0)
        Transform2d.root.scale = new Vector2d(value, value);
        PatternCanvas.instance.stroke_width = Math.sqrt(Math.max(value)); // ??
    }
    get position(){return  Transform2d.root.position;}
    set position(value){this.change_view_position(value);}
    zoom_in () { this.scale = this.scale + SCALE_STEP;}
    zoom_out() { this.scale = this.scale - SCALE_STEP;}
    change_view_position(position)
    {
        Transform2d.root.position = Vector2d.sum(position, Transform2d.root.position);
        // this.#limit_movement();
        // PatternCanvas.instance.lines_shift = Transform2d.root.position; // ??
    }
    constructor(width, height)
    {
        if(RenderCanvas.#instance != null) return RenderCanvas.instance;
        super(new Vector2d(-width * 0.5 + 2, -height * 0.5 + 2), new Vector2d(width * 0.5 - 2, height * 0.5 - 2));
        // this.state.is_focusable = false;
        this.state.viewport_cast = false;
        this.#color      = new Color(80, 90, 100);
        this.#canvas     = document.getElementById("mainCanvas");
        this.#canvas_ctx = this.#canvas.getContext('2d');
        this.width       = width;     
        this.height      = height;
        this.layer       = 0;     
        this.#pattern    = this.canvas_ctx.createPattern(PatternCanvas.instance.canvas, "repeat");
        this.on_end_press_callback_append  (VisualObjectSelectionSystem.clear_selection);
        this.on_begin_press_callback_append(VisualObjectSelectionSystem.before_display_selection_region);
        this.on_end_press_callback_append  (VisualObjectSelectionSystem.after_display_selection_region);
        this.on_press_callback_append      (VisualObjectSelectionSystem.display_selection_region);
        RenderCanvas.#instance = this;
    }
    get canvas      (){return this.#canvas;}
    get canvas_ctx  (){return this.#canvas_ctx;}
    get width       (){return this.canvas.width;}
    get height      (){return this.canvas.height;}
    set width       (value)
    {
        this.canvas.width  = Math.max(value, 256);
        Transform2d.root.position = new Vector2d(this.width * 0.5, this.height * 0.5);
    }
    set height      (value)
    {
        this.canvas.height = Math.max(value, 256);
        Transform2d.root.position = new Vector2d(this.width * 0.5, this.height * 0.5);
    }
    get clear_color (){return this.#color;}
    set clear_color (value){this.#color = (value instanceof Color) ? value: this.#color;}
    clear()
    {
        this.canvas_ctx.fillStyle = this.clear_color.color_code;
        this.canvas_ctx.fillRect(0, 0, this.width, this.height);
    }
    /**
     * Верно, если ни одна из точек bounds не принадлежит границе RenderCanvas. 
     * @param   {RectBounds}  bounds 
     * @param   {Transform2d} transform 
     * @returns {boolean}
     */
    cast_by(bounds, transform=null)
	{
        if (transform!==null)
        {
            for(const point of bounds.points) if(this.contains(transform.world_transform_point(point))) return false;
            return true;
        }
        for(const point of bounds.points) if(this.contains(point)) return false;
        return true;
	}
     /**
     * Верно, если хотя бы одна из точек bounds принадлежит границе RenderCanvas. 
     * @param   {RectBounds}  bounds 
     * @param   {Transform2d} transform 
     * @returns {boolean}
     */
    intersect_by(bounds, transform=null)
	{
        if (transform!==null)
        {
            for(const point of bounds.points) if(this.#border.contains(transform.world_transform_point(point))) return true;
            return false;
        }
        for(const point of bounds.points) if(this.#border.contains(point)) return true;
        return false;
	}
    
    _render_object(ctx) {
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
        this.#update_background_pattern();
		const width = this.bounds.width;
		const height = this.bounds.height;
		const x0 = this.bounds.min.x;
		const y0 = this.bounds.min.y;
		ctx.fillStyle = this.#pattern;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.fill();
		if (this.visual.stroke_width === 0) return;
		ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.stroke();
	}
}