// const TOP_CENTER    = 0;
// const BOTTOM_CENTER = 1;
// const LEFT_CENTER   = 2;
// const RIGHT_CENTER  = 3;
// const CENTER        = 4;
// const FREE          = 5;
// 
// const exact_pack_center = (position, mode) => 
// {
//     switch(mode)
//     {
//         case TOP_CENTER: position.x = 0; position.y = RenderCanvas.Instance.height * 0.5; break;
//         case BOTTOM_CENTER: position.x = 0; position.y = -RenderCanvas.Instance.height * 0.5;  break;
//         case LEFT_CENTER: position.y = 0; position.x = -RenderCanvas.Instance.width * 0.5; break;
//         case RIGHT_CENTER: position.y = 0; position.x = RenderCanvas.Instance.width * 0.5; break;
//         case CENTER: position.y = 0; position.x =0; break;
//         case FREE: break;
//         default:break;
//     }
//     return position;
// }

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

const  vertical_pack = (objects, position, space_between=0.0) => 
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
        obj_height = obj.bounds.height;
        obj.transform.position = new Vector2d(position.x, position.y + obj_height * 0.5 + height);
        height += obj_height + space_between;
    }
}

const  vertical_pack_zero_center = (objects, space_between=0.0) => 
{
    const center = objects_center(objects);
    vertical_pack(objects, new Vector2d(center.x, 0.0), space_between);
}

const horizontal_pack = (objects, position, space_between=0.0) => 
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
        obj_width = obj.bounds.width;
        obj.transform.position = new Vector2d(position.x + obj_width * 0.5 + width, position.y);
        width += obj_width + space_between;
    }
}

const  horizontal_pack_zero_center = (objects, space_between=0.0) => 
{
    const center = objects_center(objects);
    horizontal_pack(objects, new Vector2d(0.0, center.y), space_between);
}

const  horizontal_pack_common_center = (objects, space_between=0.0) => 
{
    horizontal_pack(objects,  objects_center(objects), space_between);
}

const  vertical_pack_common_center = (objects, space_between=0.0) => 
{
    vertical_pack(objects, objects_center(objects), space_between);
}