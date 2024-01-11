// import {VisualObject} from "visualObject.js";

var ROOT_POSITION_INFO = null;
var ROOT_SCALING_INFO  = null;
var ROOT_ROTATION_INFO = null;
var FPS_COUNT_INFO     = null;
var TOOL_ACTIVE_INFO   = null;

var MAIN_MENU = null;
const MAIN_MENU_ITEMS = ["File", "Edit", "Gates", "Settings", "Help"];
const main_menu_init = () => {

	MAIN_MENU = new MainMenu(BUTTON_SIZE, MAIN_MENU_ITEMS);
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
var FRAME_TIME = 0.0
const render_all_objects = (ctx) => 
{
	VisualObject.update_objects();
	VisualObject.render_objects(ctx);
}