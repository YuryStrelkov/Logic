class RenderCanvas
{
    #limit_movement()
	{
		const position = Transform2d.root_transform.position;
		const scale    = Transform2d.root_transform.scale;
		const cw       = this.width  * 0.5;
		const ch       = this.height * 0.5;
        const actual_w = cw / scale.x;
        const actual_h = ch / scale.y;
		position.x     = Math.min(Math.max(actual_w, position.x), 2.0 * cw - actual_w);
		position.y     = Math.min(Math.max(actual_h, position.y), 2.0 * ch - actual_h);
		Transform2d.root_transform.position.position = position;
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
    get scale()     {return Transform2d.root_transform.scale.x;}
    set scale(value)
    {
        Transform2d.root_transform.scale       = new Vector2d(value, value);
        Transform2d.root_transform.scale.x     =  Math.max(Math.min(Transform2d.root_transform.scale.x, MAX_SCALE), 1.0);
        Transform2d.root_transform.scale.y     =  Math.max(Math.min(Transform2d.root_transform.scale.y, MAX_SCALE), 1.0);
        PatternCanvas.instance.lines_frequency = Transform2d.root_transform.scale; // ??
    }
    get position(){return  Transform2d.root_transform.position;}
    set position(value){this.change_view_position(value);}
    zoom_in () { this.scale = this.scale + SCALE_STEP;}
    zoom_out() { this.scale = this.scale - SCALE_STEP;}
    change_view_position(position)
    {
        Transform2d.root_transform.position = Vector2d.sum(position, Transform2d.root_transform.position);
        this.#limit_movement();
    }
    constructor()
    {
        if(RenderCanvas.#instance != null) return RenderCanvas.instance;
        this.#color          = new Color(80, 90, 100);
        this.#canvas         = document.getElementById("mainCanvas");
        this.#canvas_ctx     = this.#canvas.getContext('2d');
        this.#pattern        = this.canvas_ctx.createPattern(PatternCanvas.instance.canvas, "repeat");
        this.#border         = new RectBounds(new Vector2d(), new Vector2d(this.width, this.height));
        Transform2d.root_transform.position = new Vector2d(this.width * 0.5, this.height * 0.5);
        RenderCanvas.#instance = this;
    }
    get border_points_local(){return this.#border.points;}
    get border_points_world(){
        const points = this.bounds.points;
		return [Transform2d.root_transform.transform_point(points[0]),
				Transform2d.root_transform.transform_point(points[1]),
				Transform2d.root_transform.transform_point(points[2]),
				Transform2d.root_transform.transform_point(points[3])];
    }
    get canvas      (){return this.#canvas;}
    get canvas_ctx  (){return this.#canvas_ctx;}
    get width       (){return this.canvas.width;}
    get height      (){return this.canvas.height;}
    get clear_color (){return this.#color;}
    set clear_color (value){this.#color = (value instanceof Color) ? value: this.#color;}
    clear()
    {
        this.#update_background_pattern();
        this.canvas_ctx.fillStyle = this.#pattern === null ? this.clear_color.color_code : this.#pattern;
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
            for(const point of bounds.points) if(this.#border.contains(transform.world_transform_point(point))) return false;
            return true;
        }
        for(const point of bounds.points) if(this.#border.contains(point)) return false;
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
}