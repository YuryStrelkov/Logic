// // @ts-check
import { SELECTION_PREVIEW_VISUAL_OBJECT_STYLE } from "../visualSettings.js";
import { Transform2d } from "../../Geometry/transform2d.js";
import { Vector2d } from "../../Geometry/geometry.js";
import { VisualObject, SelectionRectangle} from "../visualObject.js";
import { MouseInfo } from "../inputs.js";

export class VisualObjectSelectionSystem
{
    static #selectable_objects = new Set();
    static #selected_objects   = new Set();
    static #selection_preview_obj = null;
    static #selection_region_start_pt = new Vector2d();
    static #selection_region_current_pt = new Vector2d();

    static get selected_objects     (){return VisualObjectSelectionSystem.#selected_objects;}
    static get selection_preview_obj()
    {   if(VisualObjectSelectionSystem.#selection_preview_obj === null)
        {
            VisualObjectSelectionSystem.#selection_preview_obj = new SelectionRectangle();
        }
        return VisualObjectSelectionSystem.#selection_preview_obj;
    }
    static #recompute_selected_bounds = () =>
    {
        if(VisualObjectSelectionSystem.#selected_objects.size === 0)
        {
            VisualObjectSelectionSystem.clear_selection();
            return;
        }
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = true;
        const selection_bounds = VisualObject.visual_objects_bounds(VisualObjectSelectionSystem.#selected_objects);
        VisualObjectSelectionSystem.#selection_preview_obj.bounds.size  = selection_bounds.size;
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = selection_bounds.center; // Vector2d.lerp(min_bound, max_bound, 0.5);
    }

    static display_selection_region = (obj) => 
    {
        if (!MouseInfo.instance.is_left_down)return;
        VisualObjectSelectionSystem.#selection_region_current_pt = Transform2d.root.inv_world_transform_point(MouseInfo.instance.position);
        const position = Vector2d.lerp(VisualObjectSelectionSystem.#selection_region_start_pt,
                                       VisualObjectSelectionSystem.#selection_region_current_pt, 0.5);
        const size     = Vector2d.abs (Vector2d.sub(VisualObjectSelectionSystem.#selection_region_start_pt, 
                                                    VisualObjectSelectionSystem.#selection_region_current_pt));
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = position;
        VisualObjectSelectionSystem.#selection_preview_obj.bounds.size = size;
    }

    static before_display_selection_region = (src) => 
    {
        VisualObjectSelectionSystem.#selection_region_start_pt = Transform2d.root.inv_world_transform_point(MouseInfo.instance.position);
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = true;
    }
	
    static after_display_selection_region = (src) => 
    {
        VisualObjectSelectionSystem.#selection_region_start_pt = MouseInfo.instance.position;
        if(Vector2d.dist(VisualObjectSelectionSystem.#selection_region_start_pt,
                         VisualObjectSelectionSystem.#selection_region_current_pt) < 1.0) return;
		const ctrl_pressed = false; // TODO add keys press handle system...
		const selected_objects = VisualObjectSelectionSystem.#selection_request();
		if(ctrl_pressed)
		{
			if(selected_objects.length === 0)
			{
				this.clear_selection();
				return;
			}
			selected_objects.forEach((o)=>{ this.#select_object(o);});
		}
		else
		{
			this.clear_selection();
			if(selected_objects.length === 0)return;
			selected_objects.forEach((o)=>{ this.#select_object(o);});
		}
		VisualObjectSelectionSystem.#recompute_selected_bounds();
		VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = true;
    }

    static clear_selection = () =>{
		VisualObjectSelectionSystem.#selected_objects.forEach((o)=>{o.state.is_toggle = false;});
        VisualObjectSelectionSystem.#selected_objects.clear();
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown     = false;
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = new Vector2d();
        VisualObjectSelectionSystem.#selection_preview_obj.transform.scale    = new Vector2d();
    }
    
    static #selection_request()
    {
		var selected_objects = []
        for(const object of VisualObjectSelectionSystem.#selectable_objects)
        {
			object.points.every((p) => 
			{
				if(!VisualObjectSelectionSystem.selection_preview_obj.contains(p))return true;
				selected_objects.push(object);
				return false;
			});
        }
		return selected_objects;
    }

    static #select_object(object, merge = true)
    {
		if(VisualObjectSelectionSystem.#selected_objects.has(object))
		{
			if(!merge)VisualObjectSelectionSystem.#selected_objects.delete(object);
			return;
		}
		VisualObjectSelectionSystem.#selected_objects.add(object);
		object.state.is_toggle = true;
		return;
    }

    static on_begin_press(object) 
    {
        if (MouseInfo.instance.is_middle_down)
		{
			VisualObject.destroy_visual_object(object);
			return;
		};
        VisualObjectSelectionSystem.#select_object(object);
        VisualObjectSelectionSystem.#recompute_selected_bounds();
    }

    static subscribe(obj) 
	{
		if(VisualObjectSelectionSystem.#selectable_objects.has(obj))return;
		VisualObjectSelectionSystem.#selectable_objects.add(obj);
		obj.on_begin_press_callback_append(VisualObjectSelectionSystem.on_begin_press);
	}

	static unsubscribe(obj) 
	{
		if(!VisualObjectSelectionSystem.#selectable_objects.has(obj))return;
		VisualObjectSelectionSystem.#selectable_objects.delete(obj);
		obj.on_begin_press_callback_remove(VisualObjectSelectionSystem.on_begin_press);
	}
}

// export{VisualObjectSelectionSystem, SelectionRectangle}