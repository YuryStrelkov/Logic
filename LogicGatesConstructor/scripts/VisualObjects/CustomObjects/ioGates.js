// const ONE_T_ONE_GATE_SIZE = new Vector2d(100, 40);
/*
const  vertical_pack = (objects, position, space_between=0.0) => 
{
    var n_objects = 0;
    var length    = 0.0;
    for(const obj of objects)
    {
        n_objects += 1;
        length    += obj.bounds.height;
    }
    length += (n_objects - 1) * space_between;
    var height = -length * 0.5;
    var obj_height = 0.0;

    for(const obj of objects)
    {
        obj_height = obj.bounds.height;
        obj.transform.position = new Vector2d(position.x, position.y + obj_height * 0.5 + height);
        height += obj_height + space_between;
    }
}

const  vertical_pack_common_center = (objects, space_between=0.0) => 
{
    const position = new Vector2d(0, 0);
    var n_objects = 0
    for(const obj of objects)
    {
        n_objects  += 1;
        position.x += obj.transform.position.x;
        position.y += obj.transform.position.y;
    }
    if(n_objects == 0) return;
    position.x /= n_objects;
    position.y /= n_objects;
    console.log(`position.y:${position.y}`)
    vertical_pack(objects, new Vector2d(position.x, 0.0), space_between);
}
*/

class InputGate extends TextObject
{
    static #input_gates = new Set();
    #input_pin;
	static pack_gates(position=null)
	{
		if(position == null)
		{
			vertical_pack_zero_center(InputGate.input_gates, ONE_T_ONE_GATE_SIZE.y * 0.125 );
            for(const gate of InputGate.input_gates)
            for(const link of gate.input_pin.links) link.update_link_geometry();
            return;
		}
          vertical_pack(InputGate.input_gates,
		  new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y), ONE_T_ONE_GATE_SIZE.y * 0.125);
          for(const gate of InputGate.input_gates)
          for(const link of gate.input_pin.links) link.update_link_geometry();
    }
	
	static remove_last()
	{
		if(InputGate.input_gates_count == 1) return;
		var last_val = [...InputGate.input_gates.values()].pop();
		InputGate.input_gates.delete(last_val);
		VisualObject.destroy_visual_object(last_val);
	}
	
	static append     ()
	{
		var pos = new Vector2d();
		for (const gate of InputGate.input_gates) pos = Vector2d.sum(pos, gate.transform.position);
		pos.x /= InputGate.input_gates_count;
		pos.y /= InputGate.input_gates_count;
		new InputGate(pos, "In");
		InputGate.pack_gates();
	}
	
    static get input_gates(){return InputGate.#input_gates;}
    static get input_gates_count(){return InputGate.#input_gates.size;}
    static create_gates(position, count)
    {
        for(var index = 0; index < count; index++) new InputGate(position, "In");
        InputGate.pack_gates(position);
	}
    get input_pin() { return this.#input_pin;}
    constructor(position, name = "pin")
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - ONE_T_ONE_GATE_SIZE.y * 0.5),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + ONE_T_ONE_GATE_SIZE.y * 0.5), `${name}:${InputGate.input_gates_count}`);
	    this.visual = TEXT_VISUAL_SETTINGS;
        this.#input_pin = new OutputDigitalPin(new Vector2d(ONE_T_ONE_GATE_SIZE.x * 0.5, 0.0), this);
        InputGate.input_gates.add(this);
        VisualObjectSelectionSystem.subscribe(this);
        this.on_end_press_callback_append((obj) => {obj.input_pin.state.is_toggle =! obj.input_pin.state.is_toggle;})
    }
    on_delete() 
    {
        InputGate.input_gates.delete(this);
        VisualObjectSelectionSystem.unsubscribe(this);
        InputGate.pack_gates(); // vertical_pack_common_center(InputGate.input_gates, ONE_T_ONE_GATE_SIZE.y * 0.5);
    }
}

class OutputGate extends TextObject
{
    static #output_gates = new Set();
    #output_pin;
	static pack_gates(position=null)
	{
		if(position == null)
		{
			vertical_pack_zero_center(OutputGate.output_gates, ONE_T_ONE_GATE_SIZE.y * 0.125);
            for(const gate of OutputGate.output_gates)
            {
                for(const link of gate.output_pin.links) link.update_link_geometry();
            }
            return;
		}
        vertical_pack(OutputGate.output_gates,
					  new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y), ONE_T_ONE_GATE_SIZE.y * 0.125);
        for(const gate of OutputGate.output_gates)
            for(const link of gate.output_pin.links) link.update_link_geometry();
	}
	static remove_last()
	{
		if(OutputGate.output_gates_count == 1) return;
		var last_val = [...OutputGate.output_gates.values()].pop();
		OutputGate.output_gates.delete(last_val);
		VisualObject.destroy_visual_object(last_val);
	}
	
	static append     ()
	{
		var pos = new Vector2d();
		for (const gate of OutputGate.output_gates) pos = Vector2d.sum(pos, gate.transform.position);
		pos.x /= OutputGate.output_gates_count;
		pos.y /= OutputGate.output_gates_count;
		new OutputGate(pos, "Out");
		OutputGate.pack_gates();
	}
    static get output_gates(){return OutputGate.#output_gates;}
    static get output_gates_count(){return OutputGate.#output_gates.size;}
    get output_pin() { return this.#output_pin;}
    static create_gates(position, count)
    {
        for(var index = 0; index < count; index++) new OutputGate(position, "Out");
		OutputGate.pack_gates(position);
	}
    constructor(position, name = "pin")
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - ONE_T_ONE_GATE_SIZE.y * 0.5),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + ONE_T_ONE_GATE_SIZE.y * 0.5), `${name}:${OutputGate.output_gates_count}`);
	    this.visual = TEXT_VISUAL_SETTINGS;
        this.#output_pin = new InputDigitalPin (new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5,  0.0), this);
        OutputGate.output_gates.add(this);
        VisualObjectSelectionSystem.subscribe(this);
    }
    on_delete() 
    {
        OutputGate.output_gates.delete(this);
        VisualObjectSelectionSystem.unsubscribe(this);
        OutputGate.pack_gates();//vertical_pack_common_center(OutputGate.output_gates, ONE_T_ONE_GATE_SIZE.y * 0.5);
    }
}
