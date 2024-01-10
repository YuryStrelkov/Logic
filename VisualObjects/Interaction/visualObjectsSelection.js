SELECTION_PREVIEW_VISUAL_OBJECT_STYLE              = new VisualSettings();
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.up_left_radius    = 5.0;
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.down_left_radius  = 5.0;
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.down_right_radius = 5.0;
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.up_right_radius   = 5.0;
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.stroke_width = 1.5;
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.stroke_color = new Color(255, 255, 255, 0.5);
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.focus_color  = new Color(0, 0, 0, 0.0);
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.click_color  = new Color(0, 0, 0, 0.0);
SELECTION_PREVIEW_VISUAL_OBJECT_STYLE.color        = new Color(0, 0, 0, 0.0);

class SelectionRectangle extends VisualObject
{
    #dash_length;
    #swap;
    constructor()
    {
       super(new Vector2d(0, 0), new Vector2d(0, 0));
       this.state.is_focusable = false;
       this.state.is_shown     = false;
       this.layer              = 10;
       this.#dash_length       = 3.0;
       this.#swap              = false;
       this.visual = SELECTION_PREVIEW_VISUAL_OBJECT_STYLE;
    }
    _render_object(ctx) {
		this.transform.apply_to_context(ctx);
		this.visual.apply_to_context(ctx);
		const width = this.bounds.width;
		const height = this.bounds.height;
		const x0 = this.bounds.min.x;
		const y0 = this.bounds.min.y;
        ctx.setLineDash([2.5, 2.5]);
        // const t = current_time() % 1.0;
        // const w  = this.#dash_length;
        // if(t > 0.95) this.#swap = !this.#swap; 
        // if(this.#swap)
        // {
        //     ctx.setLineDash([t * w, 0, (1.0 - t) * w, t * w, (1.0 - t) * w, 0]);
        // }
        // else
        // {
        //     ctx.setLineDash([0, t * w, (1.0 - t) * w, 0, t * w, (1.0 - t) * w]);
        // }
        ctx.roundRect(x0, y0, width, height, this.visual.corners_radiuses);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}

class VisualObjectSelectionSystem
{
    static #selectable_objects = new Set();
    static #selected_objects   = new Set();
    static #selection_preview_obj = new SelectionRectangle();
    static #selection_region_start_pt = null;
    static #selection_region_current_pt = null;

    static get selected_objects(){return VisualObjectSelectionSystem.#selected_objects;}
    static get selection_preview_obj(){return VisualObjectSelectionSystem.#selection_preview_obj;}

    static #recompute_obj_bounds = (obj, min_bound, max_bound) =>
    {
        const inv_tm = Transform2d.root.inv_world_tm
        const scl = Vector2d.mul(Transform2d.root.scale, new Vector2d(1.05, 1.05));
        const min = Vector2d.min(min_bound, inv_tm.multiply_by_point(Vector2d.sum(Vector2d.mul(obj.bounds.min, scl), obj.transform.position_world)));
        const max = Vector2d.max(max_bound, inv_tm.multiply_by_point(Vector2d.sum(Vector2d.mul(obj.bounds.max, scl), obj.transform.position_world)));
        
        min_bound.x = min.x;
        min_bound.y = min.y;

        max_bound.x = max.x;
        max_bound.y = max.y;
        
        for(const obj_child of obj.children) VisualObjectSelectionSystem.#recompute_obj_bounds(obj_child, min_bound, max_bound);
    }

    static #recompute_selected_bounds = () =>
    {
        if(VisualObjectSelectionSystem.#selected_objects.size === 0)
        {
            VisualObjectSelectionSystem.clear_selection();
            return;
        }
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = true;
        // const bounds = new RectBounds();
        const min_bound = new Vector2d( 1e32,  1e32);
        const max_bound = new Vector2d(-1e32, -1e32);
        for(const obj of VisualObjectSelectionSystem.#selected_objects)
            VisualObjectSelectionSystem.#recompute_obj_bounds(obj, min_bound, max_bound);
        VisualObjectSelectionSystem.#selection_preview_obj.bounds.size  = Vector2d.sub(max_bound, min_bound);
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = Vector2d.lerp(min_bound, max_bound, 0.5);
    }

    static display_selection_region = (obj) => 
    {
        if (!MouseInfo.instance.is_left_down)return;
        VisualObjectSelectionSystem.#selection_region_current_pt = Transform2d.root.inv_world_transform_point(MouseInfo.instance.position);
        const position = Vector2d.lerp(VisualObjectSelectionSystem.#selection_region_start_pt,
                                      VisualObjectSelectionSystem.#selection_region_current_pt, 0.5);
        const size     = Vector2d.abs (Vector2d.sub(VisualObjectSelectionSystem.#selection_region_start_pt, 
                                                    VisualObjectSelectionSystem.#selection_region_current_pt));
        //  const inv_tm = Transform2d.root.inv_world_tm;
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = position;
        VisualObjectSelectionSystem.#selection_preview_obj.bounds.size = size;
        // const dp = Vector2d.sub(MouseInfo.instance.position, delta);
        // obj.transform.position = Transform2d.root.inv_world_transform_direction(dp);
        // limit_object_movement(obj);
    }

    static before_display_selection_region = (src) => 
    {
        VisualObjectSelectionSystem.#selection_region_start_pt = Transform2d.root.inv_world_transform_point(MouseInfo.instance.position);
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = true;
    }
    static after_display_selection_region = (src) => 
    {
        VisualObjectSelectionSystem.#selection_region_start_pt = MouseInfo.instance.position;
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = false;
    }


    static clear_selection = () =>{
        if(Vector2d.dist(VisualObjectSelectionSystem.#selection_region_start_pt,
                         VisualObjectSelectionSystem.#selection_region_current_pt) > 1)
            {
               VisualObjectSelectionSystem.#selection_request();
               return;
            }
        for(const obj of VisualObjectSelectionSystem.#selected_objects)obj.state.is_toggle = false;
        VisualObjectSelectionSystem.#selected_objects.clear();
        VisualObjectSelectionSystem.#selection_preview_obj.state.is_shown = false;
        VisualObjectSelectionSystem.#selection_preview_obj.transform.position = new Vector2d();
        VisualObjectSelectionSystem.#selection_preview_obj.transform.size = new Vector2d();
    }
    
    static #selection_request()
    {
        for(const object of VisualObjectSelectionSystem.#selectable_objects)
        {
            for(const point of object.points)
            {
                if(!VisualObjectSelectionSystem.selection_preview_obj.contains(point))continue;
                VisualObjectSelectionSystem.#select_object(object, true);
                break;
            }
        }
    }

    static #select_object(object, is_ctrl_press=false)
    {
        if(is_ctrl_press)
        {
            if(VisualObjectSelectionSystem.#selected_objects.has(object))
            {
                VisualObjectSelectionSystem.#selected_objects.delete(object);
                return;
            }
            VisualObjectSelectionSystem.#selected_objects.add(object);
            object.state.is_toggle = true;
            return;
        }
        for(const obj of VisualObjectSelectionSystem.#selected_objects)obj.state.is_toggle = false;
        VisualObjectSelectionSystem.#selected_objects.clear();
        VisualObjectSelectionSystem.#selected_objects.add(object);
        object.state.is_toggle = true;
    }

    static on_begin_press(object) 
    {
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