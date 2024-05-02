// // @ts-check

import { Vector2d } from "../Geometry/geometry.js";
import { VisualObject } from "./visualObject.js";

const objects_center = (objects) => 
{
    var n_objects = objects.length ? objects.length: objects.size;
    if (!n_objects) return null;
    if (n_objects === 0) return null;
    const position = new Vector2d(0, 0);
    for(const obj of objects)
    {
        position.x += obj.transform.position.x;
        position.y += obj.transform.position.y;
    }
    position.x /= n_objects;
    position.y /= n_objects;
    return position;
}

export const  vertical_pack = (objects, position, space_between=0.0) => 
{
    var n_objects = objects.length ? objects.length: objects.size;
    if (!n_objects) return;
    if (n_objects === 0) return;
    var total_height = (n_objects - 1) * space_between;
    for(const obj of objects) total_height += obj.bounds.height;
    var height = -total_height * 0.5;
    var obj_height = 0.0;
    
    for(const obj of objects)
    {
        obj_height = VisualObject.visual_object_bounds(obj).height;
        obj.transform.position = new Vector2d(position.x, position.y + obj_height * 0.5 + height);
        height += obj_height + space_between;
    }
}

export const  vertical_pack_zero_center = (objects, space_between=0.0) => 
{
    const center = objects_center(objects);
    if(!center) return;
    vertical_pack(objects, new Vector2d(center.x, 0.0), space_between);
}

export const horizontal_pack = (objects, position, space_between=0.0) => 
{
    if (!position) return;
    var n_objects = objects.length ? objects.length: objects.size;
    if (!n_objects) return;
    if (n_objects === 0) return;
    var total_width = (n_objects - 1) * space_between;
    for(const obj of objects) total_width += obj.bounds.width;
    var width = -total_width * 0.5;
    var obj_width = 0.0;

    for(const obj of objects)
    {
        obj_width = VisualObject.visual_object_bounds(obj).width;
        obj.transform.position = new Vector2d(position.x + obj_width * 0.5 + width, position.y);
        width += obj_width + space_between;
    }
}

export const  horizontal_pack_zero_center = (objects, space_between=0.0) => 
{
    const center = objects_center(objects);
    if(!center) return;
    horizontal_pack(objects, new Vector2d(0.0, center.y), space_between);
}

export const  horizontal_pack_common_center = (objects, space_between=0.0) => 
{
    horizontal_pack(objects,  objects_center(objects), space_between);
}

export const  vertical_pack_common_center = (objects, space_between=0.0) => 
{
    vertical_pack(objects, objects_center(objects), space_between);
}

// export {objects_center, vertical_pack, vertical_pack_zero_center, horizontal_pack,
//         horizontal_pack_zero_center, horizontal_pack_common_center, vertical_pack_common_center};