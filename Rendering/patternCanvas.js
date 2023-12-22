class PatternCanvas
{
    #apply_settings    ()
    {
        this.canvas_ctx.fillStyle   = this.color.color_code;
		this.canvas_ctx.lineWidth   = this.stroke_width;
		this.canvas_ctx.strokeStyle = this.stroke_color.color_code;
    }
    #pattern_canvas;
    #pattern_canvas_context;
    #main_color;
    #lines_color;
    #lines_width;
    #lines_frequency;
    #lines_shift;
    #raw;
    static #instance = null;
    static get instance()
    {   
        if(PatternCanvas.#instance === null) PatternCanvas.#instance = new PatternCanvas();
        return PatternCanvas.#instance;
    }
    constructor(width=200, height=200)
    {
        this.#pattern_canvas = document.createElement("canvas");
        this.#pattern_canvas_context = this.#pattern_canvas.getContext("2d");
        this.#main_color      = new Color(80, 90, 100);
        this.#lines_color     = new Color(40, 45, 50, 0.5);
        this.#lines_width     = 0.50;
        this.#lines_frequency = new Vector2d(25.0, 25.0);
        this.#lines_shift     = new Vector2d( 0.0,  0.0);
        this.canvas.width     = width;
        this.canvas.height    = height;
        this.#raw = true;
        this.repaint();
    }
    get color          ()     {return this.#main_color;}
    get stroke_color   ()     {return this.#lines_color;}
    get width          ()     {return this.canvas.width;}
    get height         ()     {return this.canvas.height;}
    get shape          ()     {return new Vector2d(this.width, this.height);};
    get stroke_width   ()     {return this.#lines_width;    }
    get lines_frequency()     {return this.#lines_frequency;}
    get lines_shift    ()     {return this.#lines_shift;   }
    get canvas         ()     {return this.#pattern_canvas;}
    get canvas_ctx     ()     {return this.#pattern_canvas_context;}
    set color          (value){this.#main_color  = value;  this.#raw = true;}
    set stroke_color   (value){this.#lines_color = value;  this.#raw = true;}
    set width          (value){this.canvas.width = value;  this.#raw = true;}
    set height         (value){this.canvas.height = value; this.#raw = true;}
    set shape          (value){this.canvas.width = Math.max(value.x, 128); this.canvas.height = Math.max(value.y, 128); this.#raw = true;};
    set stroke_width   (value){this.#lines_width = Math.max(0.01, value); this.#raw = true;}
    set lines_frequency(value){this.#lines_frequency = value; this.#raw = true;}
    set lines_shift    (value){this.#lines_shift = value; this.#raw = true;}
    repaint            ()
    {
        if(!this.#raw) return false;
        this.#raw = false;
        this.#apply_settings();
        const fx = Math.round(this.width  / 25.0 / this.lines_frequency.x);
        const fy = Math.round(this.height / 25.0 / this.lines_frequency.y);
        const dx = this.lines_shift.x % this.lines_frequency.x;
        const dy = this.lines_shift.y % this.lines_frequency.y;
		this.canvas_ctx.fillRect(0, 0, this.width, this.height);
		this.canvas_ctx.fill();	
        var y0 = 0.0;
        var x0 = 0.0;
        for (var row = 0; row <= fy; row++)
        {
            y0 = row * this.lines_frequency.y * 25.0;
            this.canvas_ctx.beginPath();
            this.canvas_ctx.moveTo(0,          y0);
            this.canvas_ctx.lineTo(this.width, y0);
            this.canvas_ctx.stroke();	
        }
        for (var col = 0; col < fx; col++)
        {
            x0 = col * this.lines_frequency.x * 25.0;
            this.canvas_ctx.beginPath();
            this.canvas_ctx.moveTo(x0, 0);
            this.canvas_ctx.lineTo(x0, this.height);
            this.canvas_ctx.stroke();	
        }

        // this.canvas_ctx.fillStyle   = this.stroke_color.color_code;
        // for (var row = 0; row < fy; row++)
        // {
        //     y0 = row * this.lines_frequency.y + dy - this.stroke_width * 2.5;
        //     for (var col = 0; col < fx; col++)
        //     {
        //         x0 = col * this.lines_frequency.x + dx - this.stroke_width * 2.5;
        //         this.canvas_ctx.fillRect(x0, y0, this.stroke_width * 5, this.stroke_width * 5);
        //         this.canvas_ctx.fill();	
        //     }
        // }
        return true;
    }
}