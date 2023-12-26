// import {VisualObject} from "visualObject.js";

var ROUND_PIN_VISUAL_SETTINGS    = null;
var TEXT_VISUAL_SETTINGS         = null;
var STATISTICS_VISUAL_SETTINGS   = null;
var BUTTON_VISUAL_SETTINGS       = null;
var BUTTON_VISUAL_LEFT_SETTINGS  = null;
var BUTTON_VISUAL_RIGHT_SETTINGS = null;
var COMMON_VISUAL_SETTINGS       = null;

const init_common_styles = () =>
{
	COMMON_VISUAL_SETTINGS    = VisualSettings.default;
	ROUND_PIN_VISUAL_SETTINGS = new VisualSettings();
	ROUND_PIN_VISUAL_SETTINGS.up_left_radius    = 12.0;
	ROUND_PIN_VISUAL_SETTINGS.down_left_radius  = 12.0;
	ROUND_PIN_VISUAL_SETTINGS.down_right_radius = 12.0;
	ROUND_PIN_VISUAL_SETTINGS.up_right_radius   = 12.0;
	ROUND_PIN_VISUAL_SETTINGS.focus_color  = new Color(255, 55, 55, 255);
	ROUND_PIN_VISUAL_SETTINGS.click_color  = new Color(255, 0,  0, 255);
	ROUND_PIN_VISUAL_SETTINGS.color        = new Color(25,  25, 25, 255);


	BUTTON_VISUAL_SETTINGS    = VisualSettings.default;
	BUTTON_VISUAL_SETTINGS = new VisualSettings();
	BUTTON_VISUAL_SETTINGS.focus_color  = new Color(55, 55, 55, 255);
	BUTTON_VISUAL_SETTINGS.click_color  = new Color(255, 0,  0, 255);
	BUTTON_VISUAL_SETTINGS.color        = new Color(25,  25, 25, 255);

	BUTTON_VISUAL_LEFT_SETTINGS    = VisualSettings.default;
	BUTTON_VISUAL_LEFT_SETTINGS = new VisualSettings();
	BUTTON_VISUAL_LEFT_SETTINGS.up_left_radius    = 12.0;
	BUTTON_VISUAL_LEFT_SETTINGS.down_left_radius  = 12.0;
	BUTTON_VISUAL_LEFT_SETTINGS.focus_color  = new Color(55, 55, 55, 255);
	BUTTON_VISUAL_LEFT_SETTINGS.click_color  = new Color(255, 0,  0, 255);
	BUTTON_VISUAL_LEFT_SETTINGS.color        = new Color(25,  25, 25, 255);

	BUTTON_VISUAL_RIGHT_SETTINGS = VisualSettings.default;
	BUTTON_VISUAL_RIGHT_SETTINGS = new VisualSettings();
	BUTTON_VISUAL_RIGHT_SETTINGS.down_right_radius = 12.0;
	BUTTON_VISUAL_RIGHT_SETTINGS.up_right_radius   = 12.0;
	BUTTON_VISUAL_RIGHT_SETTINGS.focus_color  = new Color(55, 55, 55, 255);
	BUTTON_VISUAL_RIGHT_SETTINGS.click_color  = new Color(255, 0,  0, 255);
	BUTTON_VISUAL_RIGHT_SETTINGS.color        = new Color(25,  25, 25, 255);
	
	TEXT_VISUAL_SETTINGS = new VisualSettings();
	TEXT_VISUAL_SETTINGS.up_left_radius    = 12.0;
	TEXT_VISUAL_SETTINGS.down_left_radius  = 12.0;
	TEXT_VISUAL_SETTINGS.down_right_radius = 12.0;
	TEXT_VISUAL_SETTINGS.up_right_radius   = 12.0;
	
	STATISTICS_VISUAL_SETTINGS              = new VisualSettings();
	STATISTICS_VISUAL_SETTINGS.font_size    = 12;
	STATISTICS_VISUAL_SETTINGS.color        = new Color(125, 125, 125, 0.5);
	STATISTICS_VISUAL_SETTINGS.font_color   = new Color(225, 225, 225, 255);
	STATISTICS_VISUAL_SETTINGS.stroke_width = 0.0;
	STATISTICS_VISUAL_SETTINGS.text_align   = 'left';
}

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

const not_gate = (center) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 20),
											   new Vector2d(center.x + 50, center.y + 20), 'NOT');
	textVisualObject.visual = TEXT_VISUAL_SETTINGS;
	const circVisualObject1 = RectangleObject.from_center_and_size(new Vector2d(-50, 0), new Vector2d(24, 24));
	const circVisualObject2 = RectangleObject.from_center_and_size(new Vector2d( 50, 0), new Vector2d(24, 24));
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject1.visual = ROUND_PIN_VISUAL_SETTINGS;
	circVisualObject2.visual = ROUND_PIN_VISUAL_SETTINGS;
	make_object_moveable(textVisualObject);
	return [textVisualObject, circVisualObject1, circVisualObject2];
}

const simple_gate = (center, title) => 
{
	const textVisualObject  = new TextObject  (new Vector2d(center.x - 50, center.y - 35),
											   new Vector2d(center.x + 50, center.y + 35), title);
	textVisualObject.visual = TEXT_VISUAL_SETTINGS;
	const circVisualObject1 = RectangleObject.from_center_and_size(new Vector2d(-50,  17), new Vector2d(24, 24));
	const circVisualObject2 = RectangleObject.from_center_and_size(new Vector2d(-50, -17), new Vector2d(24, 24));
	const circVisualObject3 = RectangleObject.from_center_and_size(new Vector2d( 50,   0), new Vector2d(24, 24));
	circVisualObject1.parent = textVisualObject
	circVisualObject2.parent = textVisualObject
	circVisualObject3.parent = textVisualObject
	circVisualObject1.state.is_moveable = false;
	circVisualObject2.state.is_moveable = false;
	circVisualObject3.state.is_moveable = false;
	circVisualObject1.visual = ROUND_PIN_VISUAL_SETTINGS;
	circVisualObject2.visual = ROUND_PIN_VISUAL_SETTINGS;
	circVisualObject3.visual = ROUND_PIN_VISUAL_SETTINGS;
	make_object_moveable(textVisualObject);
	return [textVisualObject]; ///, circVisualObject1, circVisualObject2, circVisualObject3];
}

const and_gate  = (center) => simple_gate(center, 'AND');
const xor_gate  = (center) => simple_gate(center, 'XOR');
const or_gate   = (center) => simple_gate(center, 'OR');
const nor_gate  = (center) => simple_gate(center, 'NOR');
const nand_gate = (center) => simple_gate(center, 'NAND');

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
			for(const o of objects) visualObjects.push(o);
   		}
   	}
    return visualObjects;
	// return [and_gate(new Vector2d(0, 0))]//visualObjects;
}
var FRAME_TIME = 0.0
const render_all_objects = (ctx) => 
{
	VisualObject.update_objects();
	VisualObject.render_objects(ctx);
}