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
const key_on_down_event = (evt) => 
{
    switch(evt.key)
    {
        case 'Escape':
        {
            Transform2d.root.reset();
            Transform2d.root.position = new Vector2d(RenderCanvas.instance.width * 0.5,
                                                     RenderCanvas.instance.height * 0.5);
            PatternCanvas.instance.lines_frequency = Transform2d.root.scale; // ??                     
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


const init_app = () =>
{
    rootElement = document.getElementById("mainContainer");
    window.addEventListener("mouseup",   mouse_on_up      );
    window.addEventListener("mousedown", mouse_on_down    );
    window.addEventListener("mousemove", mouse_on_move    );
    window.addEventListener("wheel",     mouse_on_wheel   );
    window.addEventListener("keydown",   key_on_down_event);
    init_common_styles();
	create_visual_objects();
	init_statistics();
	main_menu_init();
	RenderCanvas.instance.clear();
}

const repaint_app = () =>
{
    RenderCanvas.instance.clear();
    render_all_objects(RenderCanvas.instance.canvas_ctx);
}