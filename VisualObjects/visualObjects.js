// import {VisualObject} from "visualObject.js";

class RectangleObject extends VisualObject
{
	static from_center_and_size(center, size)
	{
		return new RectangleObject(new Vector2d(center.x - size.x * 0.5, center.y - size.y * 0.5),
								   new Vector2d(center.x + size.x * 0.5, center.y + size.y * 0.5));
	}
}

class TextObject extends VisualObject
{
    #_text;
    constructor( min, max, text="text")
    {
        super(min, max);
        this.#_text = text;
    }
    get text(){return this.#_text;}
    set text(value){this.#_text = value;}
    render(ctx)
	{
        super.render(ctx);
		const center  = this.bounds.center;
		const width   = this.bounds.width;
		ctx.fillStyle = this.visual.font_color.color_code;
		switch(this.visual.text_align)
		{
			case 'center': ctx.fillText(this.text, center.x, center.y);break;
			case 'left':   ctx.fillText(this.text, center.x - width * 0.5, center.y);break;
			case 'right':  ctx.fillText(this.text, center.x + width * 0.5, center.y);break;
		}
	}
}

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

const main_menu_init = () => {
	btn_size  = new Vector2d(125, 45);
	const stroke_w = BUTTON_VISUAL_LEFT_SETTINGS.stroke_width
	rect = RectangleObject.from_center_and_size(new Vector2d(0, -450 + btn_size.y * 0.5), new Vector2d(1600, btn_size.y + 2 * stroke_w));
	rect.transform.freeze   = true;
	rect.state.is_moveable  = false;
	rect.state.is_focusable = false;
	rect.visual = STATISTICS_VISUAL_SETTINGS;
	const labels =['NEW', 'SAVE', 'SAVE AS','NOT', 'OR', 'AND', 'XOR', 'CUSTOM', 'INPUT', 'OUTPUT','CLOSE'];
	const x_shift = labels.length * btn_size.x * 0.5;
	for(var index = 0; index < labels.length; index++)
	{
		const label = labels[index];
		const btn = new TextObject(
					new Vector2d(btn_size.x * index - x_shift, -btn_size.y * 0.5 + stroke_w * 0.5),
					new Vector2d(btn_size.x * (index + 1) - x_shift,  btn_size.y * 0.5 + stroke_w * 0.5), label);
		btn.transform.freeze = true;
		btn.state.is_moveable = false;
		btn.parent = rect;
		if(index === 0)
		{
			btn .visual = BUTTON_VISUAL_LEFT_SETTINGS;
			continue;
		}
		if(index === labels.length - 1)
		{
			btn .visual = BUTTON_VISUAL_RIGHT_SETTINGS;
			continue;
		}
		btn .visual = BUTTON_VISUAL_SETTINGS;
	}
}

const init_statistics = () =>
{
	down_left   = new Vector2d(-800, 450);
	line_size = new Vector2d(1600 / 5, 33);
	ROOT_POSITION_INFO = new TextObject(new Vector2d(0.0), line_size);
	ROOT_SCALING_INFO  = new TextObject(new Vector2d(0.0), line_size);
	ROOT_ROTATION_INFO = new TextObject(new Vector2d(0.0), line_size);
	FPS_COUNT_INFO     = new TextObject(new Vector2d(0.0), line_size);
	TOOL_ACTIVE_INFO   = new TextObject(new Vector2d(0.0), line_size);
	TOOL_ACTIVE_INFO.text = '| Active tool: NONE';
	const elements = [ROOT_POSITION_INFO, ROOT_SCALING_INFO, ROOT_ROTATION_INFO, FPS_COUNT_INFO, TOOL_ACTIVE_INFO];
	for(var index = 0; index < elements.length; index++)
	{
		elements[index].transform.freeze = true;
		elements[index].state.is_moveable = false;
		elements[index].state.is_focusable = false;
		elements[index].visual = STATISTICS_VISUAL_SETTINGS;
		elements[index].transform.position = new Vector2d(down_left.x + line_size.x * (index + 0.5), down_left.y - line_size.y * 0.5);
	}
}

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
	return [textVisualObject, circVisualObject1, circVisualObject2, circVisualObject3];
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
   	for(var i = 0; i < 6; i++)
   	{
   		for(var j = 0; j < 6; j++)
   		{
   			const objects = gates[i % 6](new Vector2d((-2.5 + i) * 200 , (-2.5 + j) * 80));
			for(const o of objects) visualObjects.push(o);
   		}
   	}
	return visualObjects;
}
var FRAME_TIME = 0.0
const render_all_objects = (ctx) => 
{
	t    = current_time();
	VisualObject.update();
	VisualObject.render(ctx);
	ROOT_POSITION_INFO.text = `| Center: {${Transform2d.root_transform.position.x.toFixed(2)}; ${Transform2d.root_transform.position.y.toFixed(2)}}`;
	ROOT_SCALING_INFO .text = `| Scale: {${Math.round(Transform2d.root_transform.scale.x / SCALE_STEP) * 10}%;  ${Math.round(Transform2d.root_transform.scale.y / SCALE_STEP) * 10}%}`;
	ROOT_ROTATION_INFO.text	= `| Angle: ${Math.round(Transform2d.root_transform.angle)} deg`;
	FPS_COUNT_INFO    .text = `| FPS: ${Math.round(1.0 / Math.max(0.001, (current_time() - t)))}, Sync FPS: ${Math.round(1.0 / Math.max(0.001, current_time() - FRAME_TIME))}`;
	FRAME_TIME = t;
}