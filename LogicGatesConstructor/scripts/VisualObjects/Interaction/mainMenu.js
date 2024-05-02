// // @ts-check

import { VisualObject, TextObject, FIRST_UI_OBJECTS_LAYER} from "../visualObject.js";
import { InputGate, OutputGate } from "../CustomObjects/ioGates.js";
import { RenderCanvas } from "../../Rendering/renderCanvas.js";
import { VisualSettings, Color } from "../visualSettings.js";
import { Vector2d } from "../../Geometry/geometry.js";
import { DropDownMenu } from "./dropDownPanel.js";

export var UI_BUTTON_SIZE                         = null;
export var MAIN_MENU_BUTTON_VISUAL_SETTINGS       = null;
export var MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS  = null;
export var MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS = null;
export var MAIN_MENU_VISUAL_SETTINGS              = null;
export var MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS  = null;
export var INFO_PANEL_VISUAL_SETTINGS             = null;

export const  init_ui_styles = () => {
    UI_BUTTON_SIZE = new Vector2d(155, 45);
    INFO_PANEL_VISUAL_SETTINGS             = new VisualSettings();
    MAIN_MENU_BUTTON_VISUAL_SETTINGS       = new VisualSettings();
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS  = new VisualSettings();
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS = new VisualSettings();
    MAIN_MENU_VISUAL_SETTINGS              = new VisualSettings();
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS  = new VisualSettings();

    INFO_PANEL_VISUAL_SETTINGS.font_size    = 12;
    INFO_PANEL_VISUAL_SETTINGS.color        = new Color(125, 125, 125, 0.5);
    INFO_PANEL_VISUAL_SETTINGS.font_color   = new Color(225, 225, 225, 255);
    INFO_PANEL_VISUAL_SETTINGS.stroke_width = 0.0;
    INFO_PANEL_VISUAL_SETTINGS.text_align   = 'left';

    MAIN_MENU_VISUAL_SETTINGS.font_size    = 12;
    MAIN_MENU_VISUAL_SETTINGS.color        = new Color(125, 125, 125, 0.5);
    MAIN_MENU_VISUAL_SETTINGS.font_color   = new Color(225, 225, 225, 255);
    MAIN_MENU_VISUAL_SETTINGS.stroke_width = 0.0;
    MAIN_MENU_VISUAL_SETTINGS.text_align   = 'left';
    
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.up_left_radius    = 12.0;
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.down_left_radius  = 12.0;
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.up_right_radius   = 12.0;
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.down_right_radius = 12.0;
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.focus_color       = new Color(55, 55, 55, 255);
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.click_color       = new Color(255, 0,  0, 255);
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.color             = new Color(25,  25, 25, 255);
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.font_size         = 15;
    MAIN_MENU_BUTTON_VISUAL_SETTINGS.stroke_width      = 2;
    
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.up_left_radius   = 12.0;
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.down_left_radius = 12.0;
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.focus_color      = new Color(55, 55, 55, 255);
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.click_color      = new Color(255, 0,  0, 255);
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.color            = new Color(25,  25, 25, 255);
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.font_size        = 15;
    MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.stroke_width     = 2;
    
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.down_right_radius = 12.0;
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.up_right_radius   = 12.0;
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.focus_color       = new Color(55, 55, 55, 255);
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.click_color       = new Color(255, 0,  0, 255);
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.color             = new Color(25,  25, 25, 255);
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.font_size         = 15;
    MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.stroke_width      = 2;
    
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.up_right_radius = 12.0;
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.up_left_radius  = 12.0;
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.focus_color     = new Color(55, 55, 55, 255);
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.click_color     = new Color(255, 0,  0, 255);
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.color           = new Color(25,  25, 25, 255);
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.font_size       = 15;
    MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.stroke_width    = 2;
}

export class MainMenu extends VisualObject
{
    constructor(button_size, labels=null)
    {
	    button_size = button_size == null? UI_BUTTON_SIZE: button_size;
        const stroke_w = MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.stroke_width
        super(new Vector2d(-RenderCanvas.instance.width * 0.5, -RenderCanvas.instance.height * 0.5),
              new Vector2d( RenderCanvas.instance.width * 0.5, -RenderCanvas.instance.height * 0.5 + stroke_w + button_size.y));
        this.layer += FIRST_UI_OBJECTS_LAYER;
        this.transform.freeze    = true;
        this.state.is_focusable  = false;
        this.state.viewport_cast = false;
        this.visual     = MAIN_MENU_VISUAL_SETTINGS;
        labels = labels == null ? ["File", "Edit", "Gates", "Settings", "Help"]:labels;
        const x_shift   = labels.length * button_size.x * 0.5;
        var   index     = -1;
        for(const label of labels)
        {
            index++;
            const position  = new Vector2d(button_size.x * (index + 0.5) - x_shift, 0);
            const dorp_down = new DropDownMenu(position, button_size, this);
            dorp_down.name  = label;
            dorp_down.text  = label;
            dorp_down.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        }
        this.#init_input_pins_controllers();

    }
    #init_input_pins_controllers()
    {
        const append_input_pin = new TextObject(new Vector2d(15 + 40  - RenderCanvas.instance.width * 0.5, -20 +  RenderCanvas.instance.height - 80),
                                                new Vector2d(15 + 80  - RenderCanvas.instance.width * 0.5,  20 +  RenderCanvas.instance.height - 80));
        const remove_input_pin = new TextObject(new Vector2d(5  +     - RenderCanvas.instance.width * 0.5, -20 +  RenderCanvas.instance.height - 80),
                                                new Vector2d(5  + 40  - RenderCanvas.instance.width * 0.5,  20 +  RenderCanvas.instance.height - 80));
        append_input_pin.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        remove_input_pin.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        append_input_pin.parent = this;
        remove_input_pin.parent = this;
        append_input_pin.text  = '+';
        remove_input_pin.text  = '-';
        append_input_pin.name  = 'append_input_pin';
        remove_input_pin.name  = 'remove_input_pin';
		append_input_pin.on_end_press_callback_append(InputGate.append);
		remove_input_pin.on_end_press_callback_append(InputGate.remove_last);

        const append_output_pin = new TextObject(new Vector2d(-5       + RenderCanvas.instance.width * 0.5, -20 +  RenderCanvas.instance.height - 80),
                                                 new Vector2d(-5  - 40 + RenderCanvas.instance.width * 0.5,  20 +  RenderCanvas.instance.height - 80));
        const remove_output_pin = new TextObject(new Vector2d(-15 - 40 + RenderCanvas.instance.width * 0.5, -20 +  RenderCanvas.instance.height - 80),
                                                 new Vector2d(-15 - 80 + RenderCanvas.instance.width * 0.5,  20 +  RenderCanvas.instance.height - 80));
        append_output_pin.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        remove_output_pin.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        append_output_pin.parent = this;
        remove_output_pin.parent = this;
        append_output_pin.text  = '+';
        remove_output_pin.text  = '-';
        append_output_pin.name  = 'append_output_pin';
        remove_output_pin.name  = 'remove_output_pin';
		append_output_pin.on_end_press_callback_append(OutputGate.append);
		remove_output_pin.on_end_press_callback_append(OutputGate.remove_last);
    }

}

// export {MainMenu};