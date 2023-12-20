class RenderCanvas
{
    static #instance = null;
    static get instance()
    {   
        if(RenderCanvas.#instance === null) RenderCanvas.#instance = new RenderCanvas();
        return RenderCanvas.#instance;
    }
    #canvas    ;
    #canvas_ctx;
    #color;
    #border;
    static #change_view_scale (scl_step)
    {
        if(scl_step > 0)
        {
            Transform2d.root_transform.scale = new Vector2d(Transform2d.root_transform.scale.x + SCALE_STEP,
                                                   Transform2d.root_transform.scale.y + SCALE_STEP);
            Transform2d.root_transform.scale.x = Math.min(Transform2d.root_transform.scale.x, MAX_SCALE);
            Transform2d.root_transform.scale.y = Math.min(Transform2d.root_transform.scale.y, MAX_SCALE);
            return;
        }
        Transform2d.root_transform.scale = new Vector2d(Transform2d.root_transform.scale.x - SCALE_STEP,
                    Transform2d.root_transform.scale.y - SCALE_STEP);
        Transform2d.root_transform.scale.x = Math.max(Transform2d.root_transform.scale.x, SCALE_STEP);
        Transform2d.root_transform.scale.y = Math.max(Transform2d.root_transform.scale.y, SCALE_STEP);
    }
    static #limit_movement()
	{
        // console.log(Transform2d.root_transform.position)
		// const position = Transform2d.root_transform.position;
		// const cw       = RenderCanvas.instance.width  * 0.5;
		// const ch       = RenderCanvas.instance.height * 0.5;
		// position.x     = position.x < -cw ? -cw: position.x;
		// position.x     = position.x >  cw ? cw: position.x;
		// position.y     = position.y < -ch ? -ch: position.y;
		// position.y     = position.y >  ch ? ch: position.y;
		// Transform2d.root_transform.position.position = position;
	}
    static #change_view_position(position)
    {
        Transform2d.root_transform.position = Vector2d.sum(position, Transform2d.root_transform.position);
        RenderCanvas.#limit_movement();
    }

    static #on_mouse_up       (evt) {MouseInfo.instance.on_up   (evt);}
    static #on_mouse_down     (evt) {MouseInfo.instance.on_down (evt);}
    static #on_mouse_move     (evt) {MouseInfo.instance.on_move (evt);}
    static #on_mouse_reset    (evt) {MouseInfo.instance.on_reset(evt);}
    static #on_key_down_event (evt)
    {
        // console.log(evt.key)
        switch(evt.key)
        {
            case 'Escape':
            {
                Transform2d.root_transform.reset();
                Transform2d.root_transform.position = new Vector2d(RenderCanvas.instance.width * 0.5,
                                                                   RenderCanvas.instance.height * 0.5)                     
            }break;
            // case 'q':Transform2d.root_transform.angle = Transform2d.root_transform.angle + 15; break;
            // case 'e':Transform2d.root_transform.angle = Transform2d.root_transform.angle - 15; break;
            
            case 's':RenderCanvas. #change_view_position(new Vector2d( 0, MOVEMENT_STEP)); break;
            case 'a':RenderCanvas. #change_view_position(new Vector2d(-MOVEMENT_STEP, 0)); break;
            case 'd':RenderCanvas. #change_view_position(new Vector2d( MOVEMENT_STEP, 0)); break;
            case 'w':RenderCanvas. #change_view_position(new Vector2d( 0,-MOVEMENT_STEP)); break;
            
            case 'S':RenderCanvas. #change_view_position(new Vector2d( 0, MOVEMENT_STEP)); break;
            case 'A':RenderCanvas. #change_view_position(new Vector2d(-MOVEMENT_STEP, 0)); break;
            case 'S':RenderCanvas. #change_view_position(new Vector2d( MOVEMENT_STEP, 0)); break;
            case 'W':RenderCanvas. #change_view_position(new Vector2d( 0,-MOVEMENT_STEP)); break;

            case 'Ы':RenderCanvas. #change_view_position(new Vector2d( 0, MOVEMENT_STEP)); break;
            case 'Ф':RenderCanvas. #change_view_position(new Vector2d(-MOVEMENT_STEP, 0)); break;
            case 'В':RenderCanvas. #change_view_position(new Vector2d( MOVEMENT_STEP, 0)); break;
            case 'Ц':RenderCanvas. #change_view_position(new Vector2d( 0,-MOVEMENT_STEP)); break;

            case 'ы':RenderCanvas. #change_view_position(new Vector2d( 0, MOVEMENT_STEP)); break;
            case 'ф':RenderCanvas. #change_view_position(new Vector2d(-MOVEMENT_STEP, 0)); break;
            case 'в':RenderCanvas. #change_view_position(new Vector2d( MOVEMENT_STEP, 0)); break;
            case 'ц':RenderCanvas. #change_view_position(new Vector2d( 0,-MOVEMENT_STEP)); break;
            
            case '+':RenderCanvas.#change_view_scale( 1.0);break;
            case '-':RenderCanvas.#change_view_scale(-1.0);break;
        }
    }
    constructor()
    {
        if(RenderCanvas.#instance != null) return RenderCanvas.instance;
       // this.#border     = new RectBounds(new Vector2d(-this.width * 0.5, -this.height * 0.5), 
       //                                   new Vector2d(this.width * 0.5, this.height * 0.5));
        this.#color      = new Color(80, 90, 100);
        this.#canvas     = document.getElementById("mainCanvas");
        this.#canvas_ctx = this.#canvas.getContext('2d');
        this.canvas.addEventListener("mouseup",    RenderCanvas.#on_mouse_up  );
        this.canvas.addEventListener("mousedown",  RenderCanvas.#on_mouse_down);
        this.canvas.addEventListener("mousemove",  RenderCanvas.#on_mouse_move);
        this.canvas.addEventListener("mouseenter", RenderCanvas.#on_mouse_reset);
        this.canvas.addEventListener("mouseleave", RenderCanvas.#on_mouse_reset);
        window.addEventListener("keydown", RenderCanvas.#on_key_down_event);
        RenderCanvas.#instance = this;
    }
    get border_local(){return this.#border.points;}
    get border_world(){
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
        this.canvas_ctx.fillStyle = this.clear_color.color_code;
        this.canvas_ctx.fillRect(0, 0, this.width, this.height);
    }
    #cast_points(points)
    {
        for(const point of points)
		{
			if(point.x < 0)          continue;
			if(point.x > this.width) continue;
			if(point.y < 0)          continue;
			if(point.y > this.height)continue;
			return false;
		}
		return true;
    }
    cast_by(bounds, transform=null)
	{
        var points = bounds.points;
        if (transform!==null)
        {
            points = [transform.world_transform_point(points[0]),
                      transform.world_transform_point(points[1]),
                      transform.world_transform_point(points[2]),
                      transform.world_transform_point(points[3])];
        }
       return this.#cast_points(points);
	}
	#intersect_by_points(points)
	{
		for(const point of points)
		{
			if(point.x < 0)          continue;
			if(point.x > this.width) continue;
			if(point.y < 0)          continue;
			if(point.y > this.height)continue;
            return true;
		}
		return false;
	}
    intersect_by(bounds, transform=null)
	{
        var points = bounds.points;
        if (transform!==null)
        {
            points = [transform.world_transform_point(points[0]),
                      transform.world_transform_point(points[1]),
                      transform.world_transform_point(points[2]),
                      transform.world_transform_point(points[3])];
        }
       return this.#intersect_by_points(points);
	}
}