// // @ts-check
import { VisualObject, TextObject, FIRST_UI_OBJECTS_LAYER } from "../visualObject.js";
import { RenderCanvas } from "../../Rendering/renderCanvas.js";
import { Transform2d } from "../../Geometry/transform2d.js";
import { INFO_PANEL_VISUAL_SETTINGS } from "./mainMenu.js";
import { Vector2d } from "../../Geometry/geometry.js";
import { current_time, SCALE_STEP} from "../common.js";


export class InfoPanel extends VisualObject
{
    #fps_acum      = 0.0;
    #fps_curr      = 0.0;
    #fps_count     = 0;
    #fps_max_count = 10;
    #root_position_info; 
    #root_scaling_info ;
    #root_rotation_info; 
    #fps_count_info    ;     
    #tool_active_info  ;   
    #last_frame_time   ;
    get position_text_field   (){return this.#root_position_info}; 
    get scale_text_field      (){return this.#root_scaling_info };
    get rotation_text_field   (){return this.#root_rotation_info}; 
    get fps_text_field        (){return this.#fps_count_info    };     
    get active_tool_text_field(){return this.#tool_active_info  };   
    constructor(position=null, element_size=null)
    {
        super();
        this.layer += FIRST_UI_OBJECTS_LAYER;
        this.state.viewport_cast = false;
        position = position==null? new Vector2d(-RenderCanvas.instance.width * 0.5, RenderCanvas.instance.height * 0.5):position;
        this.transform.position = position;
        this.state.is_shown     = false;
        this.#last_frame_time   = 0.0;
        element_size = element_size==null? new Vector2d(RenderCanvas.instance.width / 5, 33):element_size;
    	this.#root_position_info    = new TextObject(new Vector2d(0.0), element_size);
        this.#root_scaling_info     = new TextObject(new Vector2d(0.0), element_size);
        this.#root_rotation_info    = new TextObject(new Vector2d(0.0), element_size);
        this.#fps_count_info        = new TextObject(new Vector2d(0.0), element_size);
        this.#tool_active_info      = new TextObject(new Vector2d(0.0), element_size);
        this.#tool_active_info.text = '| Active tool: NONE';
        const elements = [this.#root_position_info, this.#root_scaling_info, this.#root_rotation_info, this.#fps_count_info, this.#tool_active_info];
    	var index = 0;
        for(const element of elements)
        {
           element.transform.freeze = true;
           element.state.is_focusable = false;
           element.state.viewport_cast = false;
           element.visual = INFO_PANEL_VISUAL_SETTINGS;
           element.transform.position = new Vector2d(element_size.x * (index + 0.5), -element_size.y * 0.5);
           element.parent = this;
           index++;
        }
    }
    update()
    {
        this.#root_position_info.text = `| Center: {${Transform2d.root.position.x.toFixed(2)}; ${Transform2d.root.position.y.toFixed(2)}}`;
        this.#root_scaling_info .text = `| Scale: {${Math.round(Transform2d.root.scale.x / SCALE_STEP) * 100}%;  ${Math.round(Transform2d.root.scale.y / SCALE_STEP) * 100}%}`;
        this.#root_rotation_info.text = `| Angle: ${Math.round(Transform2d.root.angle)} deg`;
        this.#fps_acum  += 1.0 / Math.max(0.001, (current_time() - this.#last_frame_time));
        this.#fps_count += 1;
        if(this.#fps_count === this.#fps_max_count)
        {
            this.#fps_count = 0;
            this.#fps_curr = this.#fps_acum / this.#fps_max_count; 
            this.#fps_acum = 0;
        }
        this.#fps_count_info    .text = `| FPS: ${Math.round(this.#fps_curr)}`;
        this.#last_frame_time   = current_time();
    }
}

// export {InfoPanel};