class VisualObjectMovementSystem
{
	static #delta_positions  = [];
	static #moveable_objects = new Set();
	/**
	 * 
	 * @param {VisualObject} obj 
	 */
	static object_movement_begin_callback(obj)
	{
		if (!MouseInfo.instance.is_left_down) return;
		for(const object of VisualObjectSelectionSystem.selected_objects)
		{
			const position = Transform2d.root.world_transform_direction(object.transform.position); 
			const delta = Vector2d.sub(MouseInfo.instance.position, position);
			VisualObjectMovementSystem.#delta_positions.push([delta, object]);
		}
		const position = Transform2d.root.world_transform_direction(VisualObjectSelectionSystem.selection_preview_obj.transform.position); 
		const delta = Vector2d.sub(MouseInfo.instance.position, position);
		VisualObjectMovementSystem.#delta_positions.push([delta, VisualObjectSelectionSystem.selection_preview_obj]);
	}
	/**
	 * 
	 * @param {VisualObject} obj 
	 */
	static object_movement_callback(o)
	{
		if (MouseInfo.instance.is_middle_down)
		{
			VisualObject.destroy_visual_object(o);
			return;
		};

		if (!MouseInfo.instance.is_left_down)return;
		for(const [delta, obj] of VisualObjectMovementSystem.#delta_positions)
		{
			const dp = Vector2d.sub(MouseInfo.instance.position, delta);
			obj.transform.position = Transform2d.root.inv_world_transform_direction(dp);
			obj.on_move();
			VisualObjectMovementSystem.limit_object_movement(obj);
		}
	}
	/**
	 * 
	 * @param {VisualObject} obj 
	 */
	static object_movement_end_callback(obj) 
	{
		VisualObjectMovementSystem.object_movement_callback(obj);
		VisualObjectMovementSystem.#delta_positions = []; 
	}

	static limit_object_movement(obj)
	{
		// TODO учесть трансформации 
		const position = obj.transform.position;
		const w        = obj.bounds.width * 0.5;
		const h        = obj.bounds.height * 0.5;
		const cw       = RenderCanvas.instance.width * 0.5;
		const ch       = RenderCanvas.instance.height * 0.5;
		position.x     = position.x < w - cw ? w - cw: position.x;
		position.x     = position.x > cw - w ? cw - w: position.x;
		position.y     = position.y < h - ch ? h - ch: position.y;
		position.y     = position.y > ch - h ? ch - h: position.y;
		obj.transform.position = position;
	}

	static subscribe(obj) 
	{
		if(VisualObjectMovementSystem.#moveable_objects.has(obj))return;
		VisualObjectMovementSystem.#moveable_objects.add(obj);
		obj.on_begin_press_callback_append(VisualObjectMovementSystem.object_movement_begin_callback);
		obj.on_press_callback_append      (VisualObjectMovementSystem.object_movement_callback );
		obj.on_end_press_callback_append  (VisualObjectMovementSystem.object_movement_end_callback  );
	}
	static unsubscribe(obj) 
	{
		if(!VisualObjectMovementSystem.#moveable_objects.has(obj))return;
		VisualObjectMovementSystem.#moveable_objects.delete(obj);
		obj.on_begin_press_callback_remove(VisualObjectMovementSystem.object_movement_begin_callback);
		obj.on_press_callback_remove      (VisualObjectMovementSystem.object_movement_callback );
		obj.on_end_press_callback_remove  (VisualObjectMovementSystem.object_movement_end_callback  );
	}
}