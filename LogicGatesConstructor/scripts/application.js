// // @ts-check
console.log("0");
import { VisualObject } from "./VisualObjects/visualObject.js";
console.log("1");
import { vertical_pack_common_center, horizontal_pack_common_center } from "./VisualObjects/visualObjectsAlignment.js";
console.log("2");
import { AndGate, XorGate, OrGate, NorGate, NandGate, NotGate} from "./VisualObjects/CustomObjects/basicGates.js";
console.log("3");
import { VisualObjectSelectionSystem } from "./VisualObjects/Interaction/visualObjectsSelection.js";
console.log("4");
import { MainMenu, UI_BUTTON_SIZE } from "./VisualObjects/Interaction/mainMenu.js";
console.log("5");
import { InputGate, OutputGate } from "./VisualObjects/CustomObjects/ioGates.js";
console.log("6");
import { init_ui_styles } from "./VisualObjects/Interaction/mainMenu.js";
console.log("7");
import { init_common_styles } from "./VisualObjects/visualSettings.js";
console.log("8");
import { render_gates_preview } from "./Rendering/previewRenderer.js";
console.log("9");
import { InfoPanel } from "./VisualObjects/Interaction/infoPanel.js";
console.log("10");
import { MouseInfo, KeyboardInfo } from "./VisualObjects/inputs.js";
console.log("11");
import { RenderCanvas } from "./Rendering/renderCanvas.js";
console.log("12");
import { MOVEMENT_STEP } from "./VisualObjects/common.js";
console.log("13");
import { Transform2d } from "./Geometry/transform2d.js";
console.log("14");
import { Vector2d } from "./Geometry/geometry.js";

var MAIN_MENU = null;
const MAIN_MENU_ITEMS = ["File", "Edit", "Gates", "Settings", "Help"];
const main_menu_init = () => {

	MAIN_MENU = new MainMenu(UI_BUTTON_SIZE, MAIN_MENU_ITEMS);
	const file = MAIN_MENU.get_by_name("File");
	file.add_button("Open");
	file.add_button("Save");
	file.add_button("SaveAs");
	file.add_button("Close");

	const edit = MAIN_MENU.get_by_name("Edit");
	edit.add_button("Undo");
	edit.add_button("Redo");

	const gates = MAIN_MENU.get_by_name("Gates");
	gates.add_button("NOT");
	gates.add_button("OR");
	gates.add_button("AND");
	gates.add_button("XOR");
	gates.add_button("Input");
	gates.add_button("Output");
	gates.add_button("Custom");

	const settings = MAIN_MENU.get_by_name("Settings");
	settings.add_button("Colors");
	settings.add_button("Graphics");

	const help = MAIN_MENU.get_by_name("Help");
	help.add_button("About");
	help.add_button("Basics");
}
var INFO_PANEL = null; 
const init_statistics = () => { INFO_PANEL = new InfoPanel();}

const and_gate  = (center) => new AndGate (center);
const xor_gate  = (center) => new XorGate (center);
const or_gate   = (center) => new OrGate  (center);
const nor_gate  = (center) => new NorGate (center);
const nand_gate = (center) => new NandGate(center);
const not_gate  = (center) => new NotGate(center);

const create_visual_objects = () =>
{
	 const gates = [and_gate, xor_gate, or_gate, nor_gate, nand_gate, not_gate];
	 const visualObjects = [];
	 const numb = 6;
	 // const numb = 1;
   	 for(var i = 0; i < numb; i++)
   	 {
   	 	for(var j = 0; j < numb; j++)
   	 	{
   	 		const objects = gates[i % 6](new Vector2d((-2.5 + i) * 200 , (-2.5 + j) * 80));
	 		visualObjects.push(objects);
   	 	}
   	 }
	 InputGate.create_gates(new Vector2d(-RenderCanvas.instance.width * 0.5, 0.0), 8);
	 OutputGate.create_gates(new Vector2d(RenderCanvas.instance.width * 0.5, 0.0), 8);
     return visualObjects;
	// return [and_gate(new Vector2d(0, 0))]//visualObjects;
}

const mouse_on_up    = (evt) => {MouseInfo.instance.on_up   (evt);}
const mouse_on_down  = (evt) => {MouseInfo.instance.on_down (evt);}
const mouse_on_move  = (evt) => {MouseInfo.instance.on_move (evt);}
const mouse_on_reset = (evt) => {MouseInfo.instance.on_reset(evt);}
const mouse_on_wheel = (evt) => 
{
    if(evt.deltaY === 0)return;
    if(evt.deltaY > 0) RenderCanvas.instance.zoom_in();
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
        case 'g':RenderCanvas.instance.grab_screen_shot();break;
        case 'v':vertical_pack_common_center(VisualObjectSelectionSystem.selected_objects, 0.5);break;
        case 'h':horizontal_pack_common_center(VisualObjectSelectionSystem.selected_objects, 0.5);break;
    }
}

// var bezier = null;
// RENDER_CANVAS = null
const init_callbacks = () =>
{
    window.addEventListener("mouseup",   mouse_on_up      );
    window.addEventListener("mousedown", mouse_on_down    );
    window.addEventListener("mousemove", mouse_on_move    );
    window.addEventListener("wheel",     mouse_on_wheel   );
    window.addEventListener("keydown",   key_on_down_event);
    window.addEventListener("keydown",   on_key_down);
    window.addEventListener("keypress",  on_key_press);
    window.addEventListener("keyup",     on_key_up);
}


const init_app = () =>
{
    // const t = new Test();
    // t.do_thing();
    const rootElement = document.getElementById("mainContainer");
	const RENDER_CANVAS = new RenderCanvas(1600, 900);
    Transform2d.init_transforms();
    RENDER_CANVAS.clear  ();
    init_callbacks       ();
    init_ui_styles       ();
    init_common_styles   ();
    render_gates_preview ();
	main_menu_init       ();
	init_statistics      ();
	create_visual_objects();
 }

 const render_all_objects = (ctx) => 
 {
     VisualObject.update_objects();
     VisualObject.render_objects(ctx);
 }

const repaint_app = () =>
{
    RenderCanvas.instance.clear();
    render_all_objects(RenderCanvas.instance.canvas_ctx);
}

export {init_app, repaint_app};