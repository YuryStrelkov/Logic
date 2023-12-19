class RenderCanvas
{
    static #instance = null;
    static get instance()
    {   
        if(RenderCanvas.#instance == null) RenderCanvas.#instance = new RenderCanvas();
        return RenderCanvas.#instance;
    }
    #canvas    ;
    #canvas_ctx;
    #color;
    static #on_mouse_up       (evt) {MouseInfo.instance.on_up   (evt);}
    static #on_mouse_down     (evt) {MouseInfo.instance.on_down (evt);}
    static #on_mouse_move     (evt) {MouseInfo.instance.on_move (evt);}
    static #on_mouse_reset    (evt) {MouseInfo.instance.on_reset(evt);}
    static #on_key_down_event (evt)
    {
        // console.log(evt.key)
        switch(evt.key)
        {
            case 's':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0, 10), Transform2d.root_transform.position); break;
            case 'a':Transform2d.root_transform.position = Vector2d.sum(new Vector2d(-10, 0), Transform2d.root_transform.position); break;
            case 'd':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 10, 0), Transform2d.root_transform.position); break;
            case 'w':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0,-10), Transform2d.root_transform.position); break;
            
            case 'S':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0, 10), Transform2d.root_transform.position); break;
            case 'A':Transform2d.root_transform.position = Vector2d.sum(new Vector2d(-10, 0), Transform2d.root_transform.position); break;
            case 'S':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 10, 0), Transform2d.root_transform.position); break;
            case 'W':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0,-10), Transform2d.root_transform.position); break;

            case 'Ы':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0, 10), Transform2d.root_transform.position); break;
            case 'Ф':Transform2d.root_transform.position = Vector2d.sum(new Vector2d(-10, 0), Transform2d.root_transform.position); break;
            case 'В':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 10, 0), Transform2d.root_transform.position); break;
            case 'Ц':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0,-10), Transform2d.root_transform.position); break;

            case 'ы':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0, 10), Transform2d.root_transform.position); break;
            case 'ф':Transform2d.root_transform.position = Vector2d.sum(new Vector2d(-10, 0), Transform2d.root_transform.position); break;
            case 'в':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 10, 0), Transform2d.root_transform.position); break;
            case 'ц':Transform2d.root_transform.position = Vector2d.sum(new Vector2d( 0,-10), Transform2d.root_transform.position); break;
            
            case '+':
            {
                Transform2d.root_transform.scale = new Vector2d(Transform2d.root_transform.scale.x + 0.1, Transform2d.root_transform.scale.y + 0.1);
            }
            break;
            case '-': 
            {
                Transform2d.root_transform.scale = new Vector2d(Transform2d.root_transform.scale.x - 0.1, Transform2d.root_transform.scale.y - 0.1);
                Transform2d.root_transform.scale.x = Math.max(Transform2d.root_transform.scale.x, 0.1);
                Transform2d.root_transform.scale.y = Math.max(Transform2d.root_transform.scale.y, 0.1);
            }; 
            break;
        }
    }
    constructor()
    {
        if(RenderCanvas.#instance != null) return RenderCanvas.instance;
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
    get canvas     (){return this.#canvas;}
    get canvas_ctx (){return this.#canvas_ctx;}
    get width      (){return this.canvas.width;}
    get height     (){return this.canvas.height;}
    get clear_color(){return this.#color;}
    set clear_color(value){this.#color = (value instanceof Color) ? value: this.#color;}
    clear()
    {
        this.canvas_ctx.fillStyle = this.clear_color.color_code;
        this.canvas_ctx.fillRect(0, 0, this.width, this.height);
    }
}