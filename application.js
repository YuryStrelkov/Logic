const mouse_on_up    = (evt) => {MouseInfo.instance.on_up   (evt);}
const mouse_on_down  = (evt) => {MouseInfo.instance.on_down (evt);}
const mouse_on_move  = (evt) => {MouseInfo.instance.on_move (evt);}
const mouse_on_reset = (evt) => {MouseInfo.instance.on_reset(evt);}
const mouse_on_wheel = (evt) => 
{
    if(evt.deltaY === 0)return;
    if(evt.deltaY > 0)RenderCanvas.instance.zoom_in();
    else RenderCanvas.instance.zoom_out();
}

const on_key_down  = (evt) => { KeyboardInfo.instance.update_begin_press_key(evt);}
const on_key_press = (evt) => { KeyboardInfo.instance.update_press_key      (evt);}
const on_key_up    = (evt) => { KeyboardInfo.instance.update_end_press_key  (evt);}

const key_on_down_event = (evt) => 
{
    // console.log(evt);
    switch(evt.key)
    {
        case 'Escape':
        {
            Transform2d.root.reset();
            Transform2d.root.position = new Vector2d(RenderCanvas.instance.width * 0.5,
                                                     RenderCanvas.instance.height * 0.5);
            RenderCanvas.instance.scale = Transform2d.root.scale.x; // ??                     
        }break;
        case 'q':Transform2d.root.angle = Transform2d.root.angle + 15; break;
        case 'e':Transform2d.root.angle = Transform2d.root.angle - 15; break;
        
        case 's':RenderCanvas.instance.position = new Vector2d( 0,-MOVEMENT_STEP); break;
        case 'a':RenderCanvas.instance.position = new Vector2d( MOVEMENT_STEP, 0); break;
        case 'd':RenderCanvas.instance.position = new Vector2d(-MOVEMENT_STEP, 0); break;
        case 'w':RenderCanvas.instance.position = new Vector2d( 0, MOVEMENT_STEP); break;
        
        case 'S':RenderCanvas.instance.position = new Vector2d( 0,-MOVEMENT_STEP); break;
        case 'A':RenderCanvas.instance.position = new Vector2d( MOVEMENT_STEP, 0); break;
        case 'S':RenderCanvas.instance.position = new Vector2d(-MOVEMENT_STEP, 0); break;
        case 'W':RenderCanvas.instance.position = new Vector2d( 0, MOVEMENT_STEP); break;

        case 'Ы':RenderCanvas.instance.position = new Vector2d( 0,-MOVEMENT_STEP); break;
        case 'Ф':RenderCanvas.instance.position = new Vector2d( MOVEMENT_STEP, 0); break;
        case 'В':RenderCanvas.instance.position = new Vector2d(-MOVEMENT_STEP, 0); break;
        case 'Ц':RenderCanvas.instance.position = new Vector2d( 0, MOVEMENT_STEP); break;

        case 'ы':RenderCanvas.instance.position = new Vector2d( 0,-MOVEMENT_STEP); break;
        case 'ф':RenderCanvas.instance.position = new Vector2d( MOVEMENT_STEP, 0); break;
        case 'в':RenderCanvas.instance.position = new Vector2d(-MOVEMENT_STEP, 0); break;
        case 'ц':RenderCanvas.instance.position = new Vector2d( 0, MOVEMENT_STEP); break;
        
        case '+':RenderCanvas.instance.zoom_in ();break;
        case '-':RenderCanvas.instance.zoom_out();break;
    }
}

// var bezier = null;
RENDER_CANVAS = null
const init_app = () =>
{
    rootElement = document.getElementById("mainContainer");
    window.addEventListener("mouseup",   mouse_on_up      );
    window.addEventListener("mousedown", mouse_on_down    );
    window.addEventListener("mousemove", mouse_on_move    );
    window.addEventListener("wheel",     mouse_on_wheel   );
    window.addEventListener("keydown",   key_on_down_event);
    window.addEventListener("keydown",   on_key_down);
    window.addEventListener("keypress",  on_key_press);
    window.addEventListener("keyup",     on_key_up);
	RENDER_CANVAS = new RenderCanvas(1600, 900);
    RENDER_CANVAS.clear  ();
	main_menu_init       ();
	init_statistics      ();
    init_common_styles   ();
	create_visual_objects();
    // bezier = new BezierCurveObject(new Vector2d(50, 50), new Vector2d(50, 150), new Vector2d(150, 150), new Vector2d(150, 50));
}

const repaint_app = () =>
{
    RenderCanvas.instance.clear();
    render_all_objects(RenderCanvas.instance.canvas_ctx);
}