const BUTTON_SIZE = new Vector2d(155, 45);
var MAIN_MENU_BUTTON_VISUAL_SETTINGS = null;
var MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS = null;
var MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS = null;
var MAIN_MENU_VISUAL_SETTINGS = null;
var MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS = null;

MAIN_MENU_VISUAL_SETTINGS              = new VisualSettings();
MAIN_MENU_VISUAL_SETTINGS.font_size    = 12;
MAIN_MENU_VISUAL_SETTINGS.color        = new Color(125, 125, 125, 0.5);
MAIN_MENU_VISUAL_SETTINGS.font_color   = new Color(225, 225, 225, 255);
MAIN_MENU_VISUAL_SETTINGS.stroke_width = 0.0;
MAIN_MENU_VISUAL_SETTINGS.text_align   = 'left';

MAIN_MENU_BUTTON_VISUAL_SETTINGS             = VisualSettings.default;
MAIN_MENU_BUTTON_VISUAL_SETTINGS             = new VisualSettings();
MAIN_MENU_BUTTON_VISUAL_SETTINGS.up_left_radius   = 12.0;
MAIN_MENU_BUTTON_VISUAL_SETTINGS.down_left_radius = 12.0;
MAIN_MENU_BUTTON_VISUAL_SETTINGS.up_right_radius   = 12.0;
MAIN_MENU_BUTTON_VISUAL_SETTINGS.down_right_radius = 12.0;
MAIN_MENU_BUTTON_VISUAL_SETTINGS.focus_color = new Color(55, 55, 55, 255);
MAIN_MENU_BUTTON_VISUAL_SETTINGS.click_color = new Color(255, 0,  0, 255);
MAIN_MENU_BUTTON_VISUAL_SETTINGS.color       = new Color(25,  25, 25, 255);
MAIN_MENU_BUTTON_VISUAL_SETTINGS.font_size   = 15;
MAIN_MENU_BUTTON_VISUAL_SETTINGS.stroke_width = 2;

MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS                  = VisualSettings.default;
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS                  = new VisualSettings();
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.up_left_radius   = 12.0;
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.down_left_radius = 12.0;
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.focus_color      = new Color(55, 55, 55, 255);
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.click_color      = new Color(255, 0,  0, 255);
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.color            = new Color(25,  25, 25, 255);
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.font_size       = 15;
MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.stroke_width    = 2;

MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS                   = VisualSettings.default;
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS                   = new VisualSettings();
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.down_right_radius = 12.0;
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.up_right_radius   = 12.0;
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.focus_color       = new Color(55, 55, 55, 255);
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.click_color       = new Color(255, 0,  0, 255);
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.color             = new Color(25,  25, 25, 255);
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.font_size       = 15;
MAIN_MENU_BUTTON_VISUAL_RIGHT_SETTINGS.stroke_width = 2;

MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS                 = VisualSettings.default;
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS                 = new VisualSettings();
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.up_right_radius = 12.0;
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.up_left_radius  = 12.0;
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.focus_color     = new Color(55, 55, 55, 255);
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.click_color     = new Color(255, 0,  0, 255);
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.color           = new Color(25,  25, 25, 255);
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.font_size       = 15;
MAIN_MENU_BUTTON_VISUAL_DOWN_SETTINGS.stroke_width = 2;

class MainMenu extends VisualObject
{
    constructor(button_size, labels=null)
    {
	    button_size = button_size == null? BUTTON_SIZE: button_size;
        const stroke_w = MAIN_MENU_BUTTON_VISUAL_LEFT_SETTINGS.stroke_width
        super(new Vector2d(-RenderCanvas.instance.width * 0.5, -RenderCanvas.instance.height * 0.5),
              new Vector2d( RenderCanvas.instance.width * 0.5, -RenderCanvas.instance.height * 0.5 + stroke_w + button_size.y));
        this.transform.freeze   = true;
        this.state.is_focusable = false;
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
    }
}
