let obj_press_delta_position   = new Vector2d();
/**
 * Ограничивает перемешение объекта границами экрана
 * @param {VisualObject} obj 
 */
const limit_object_movement = (obj)=>
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
/**
 * 
 * @param {VisualObject} obj 
 */
const object_movement_callback = (obj) =>
{
	if (!MouseInfo.instance.is_left_down)return;
	const delta = Vector2d.sub(MouseInfo.instance.position, obj_press_delta_position);
	obj.transform.position = Transform2d.root.inv_world_transform_direction(delta);
	limit_object_movement(obj);
}
/**
 * 
 * @param {VisualObject} obj 
 */
const object_movement_end_callback = (obj) => {obj_press_delta_position = new Vector2d();}
/**
 * 
 * @param {VisualObject} obj 
 */
const object_movement_begin_callback = (obj) =>
{
	if (!MouseInfo.instance.is_left_down) return;
	const position = Transform2d.root.world_transform_direction(VisualObject.on_press_object.transform.position);
	obj_press_delta_position = Vector2d.sub(MouseInfo.instance.position, position);
}
/**
 * 
 * @param {VisualObject} obj 
 */
const make_object_moveable = (obj) => 
{
	obj.on_begin_press_callback_append(object_movement_begin_callback);
	obj.on_press_callback_append      (object_movement_callback      );
	obj.on_end_press_callback_append  (object_movement_end_callback  );
}