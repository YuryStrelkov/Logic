const render_object_recursive = (object) => 
{
    VisualObject.render_object(object);
    for(const child of object.children) render_object_recursive(child);
}

const render_gates = () => 
{
    const gates = [new OrGate(new Vector2d),
                   new AndGate(new Vector2d), new XorGate(new Vector2d),
                   new NandGate(new Vector2d), new NorGate(new Vector2d),new NotGate(new Vector2d)];
    const color = new Color(0, 0, 0, 0.0)
    const prev_shape = RenderCanvas.instance.shape;
    Transform2d.root.scale = new Vector2d(5, 5);
    VisualObject.update_objects    ();
    for(var index = 0; index < gates.length; index++) 
    {
        const bounds = VisualObject.visual_object_bounds(gates[index]);
        RenderCanvas.instance.width  = bounds.width  * 5.05;
        RenderCanvas.instance.height = bounds.height * 5.05;
        VisualObject.update_objects    ();
        VisualObject.clear_render_queue();
        // RenderCanvas.instance.canvas_ctx.clearRect(0, 0, RenderCanvas.instance.width, RenderCanvas.instance.height);
        RenderCanvas.instance.clear(color);
        render_object_recursive(gates[index]);
        VisualObject.render_objects(RenderCanvas.instance.canvas_ctx);
        RenderCanvas.instance.grab_screen_shot(`${gates[index].text}_GATE_PREVIEW.png`, '/gate_image_preview_save');
        VisualObject.destroy_visual_object(gates[index]);
    }
    Transform2d.root.scale = new Vector2d(1, 1);
    RenderCanvas.instance.width  = prev_shape.x;
    RenderCanvas.instance.height = prev_shape.y;
    VisualObject.update_objects();
}

const render_gates_preview = () => { render_gates(); }