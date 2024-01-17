const ONE_T_ONE_GATE_SIZE = new Vector2d(100, 40);
const PIN_SIZE = new Vector2d(24, 24)

const toggle_pin = (source) => { if (source.state.on_focus) {source.is_toggle = !source.is_toggle;}}

const show_preview_curve = (source) =>
{
    if(source.state.on_focus) return;
    BezierObject.preview_curve.state.is_shown = true;
    const point_a = Transform2d.root.inv_local_transform_point(source.transform.position_world);
    const point_b = Transform2d.root.inv_local_transform_point(MouseInfo.instance.position);
    const middle  = (point_a.x + point_b.x) * 0.5;
    BezierObject.preview_curve.p1 = point_a;
    BezierObject.preview_curve.p2 = new Vector2d(middle, point_a.y);
    BezierObject.preview_curve.p3 = new Vector2d(middle, point_b.y);
    BezierObject.preview_curve.p4 = point_b;
}

const hide_preview_curve = (source) => { BezierObject.preview_curve.state.is_shown = false; }

class BezierCurveObject extends BezierObject
{
    #p1_controller;
    #p2_controller;
    #p3_controller;
    #p4_controller;

    get p1_controller(){return this.#p1_controller;};
    get p2_controller(){return this.#p2_controller;};
    get p3_controller(){return this.#p3_controller;};
    get p4_controller(){return this.#p4_controller;};
    
    constructor(p1, p2, p3, p4)
    {
        super(p1, p2, p3, p4);
        const controller_size = new Vector2d(10, 10)
        this.#p1_controller = RectangleObject.from_center_and_size(p1, controller_size);
        this.#p2_controller = RectangleObject.from_center_and_size(p2, controller_size);
        this.#p3_controller = RectangleObject.from_center_and_size(p3, controller_size);
        this.#p4_controller = RectangleObject.from_center_and_size(p4, controller_size);
        this.#p1_controller.on_press_callback_append((source)=>{this.p1 = source.transform.position;});
        this.#p2_controller.on_press_callback_append((source)=>{this.p2 = source.transform.position;});
        this.#p3_controller.on_press_callback_append((source)=>{this.p3 = source.transform.position;});
        this.#p4_controller.on_press_callback_append((source)=>{this.p4 = source.transform.position;});
        this.#p1_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#p2_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#p3_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#p4_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
        VisualObjectMovementSystem.subscribe(this.#p1_controller);
        VisualObjectMovementSystem.subscribe(this.#p2_controller);
        VisualObjectMovementSystem.subscribe(this.#p3_controller);
        VisualObjectMovementSystem.subscribe(this.#p4_controller);
    }
}

var INPUT_TARGET_PIN = null;
var OUTPUT_TARGET_PIN = null;
class DigitalPin extends RectangleObject
{
    static #make_pin_to_pin_connection  (target) 
    {
        if((INPUT_TARGET_PIN !== null) && (OUTPUT_TARGET_PIN !== null))
        {
            if(PinToPinLink.is_connection_exists(OUTPUT_TARGET_PIN, INPUT_TARGET_PIN))
            {
                console.log(`connection already exists ${OUTPUT_TARGET_PIN.name}:${INPUT_TARGET_PIN.name}`);
                return;
            }
            const link = new PinToPinLink(OUTPUT_TARGET_PIN, INPUT_TARGET_PIN);
        }
        INPUT_TARGET_PIN  = null;
        OUTPUT_TARGET_PIN = null;
    }
    #links;
    constructor(position, parent=null)
    {
        super(new Vector2d(position.x - PIN_SIZE.x * 0.5, position.y - PIN_SIZE.y * 0.5),
              new Vector2d(position.x + PIN_SIZE.x * 0.5, position.y + PIN_SIZE.y * 0.5));
        this.#links = new Set();
        if(parent != null) this.parent = parent;
        this.visual = ROUND_PIN_VISUAL_SETTINGS;
        this.on_end_press_callback_append(hide_preview_curve);
        this.on_press_callback_append    (show_preview_curve);
        this.on_end_press_callback_append(DigitalPin.#make_pin_to_pin_connection);
    }
    get links       ()      { return this.#links; }
    get links_count ()      { return this.#links.size; }
    get is_toggle   ()      { return this.state.is_toggle;  }
    set is_toggle   (value) { this.state.is_toggle = value; }
    eval_state      ()
    {   
        if(this.links_count == 0)return;
        this.state.is_toggle = false;
        for(const link of this.links) this.state.is_toggle |= link.is_toggle;
    }
    on_delete() { for(const link of this.links) VisualObject.destroy_visual_object(link); }
}

class InputDigitalPin extends DigitalPin
{
    static #on_lost_focus(target) 
    { 
        if(INPUT_TARGET_PIN === null) return
        if(INPUT_TARGET_PIN.state.on_press) return;
        INPUT_TARGET_PIN = null;
    }  
    static #on_focus(target) 
    { 
        if(INPUT_TARGET_PIN === null)
        {
            INPUT_TARGET_PIN = target;
            return;
        }
        INPUT_TARGET_PIN = INPUT_TARGET_PIN.state.on_press ? INPUT_TARGET_PIN : target;
    }
    constructor(position, parent=null)
    {
        super(position, parent);
		this.name = `input pin ${VisualObject.visual_objects.size}`;
        this.on_end_press_callback_append(toggle_pin);
        this.on_begin_focus_callback_append(InputDigitalPin.#on_focus);
        this.on_end_focus_callback_append  (InputDigitalPin.#on_lost_focus);
    }
}
class OutputDigitalPin extends DigitalPin
{
    static #on_lost_focus(target) 
    { 
        if(OUTPUT_TARGET_PIN === null) return
        if(OUTPUT_TARGET_PIN.state.on_press) return;
        OUTPUT_TARGET_PIN = null;
    }  
    static #on_focus(target) 
    { 
        if(OUTPUT_TARGET_PIN === null)
        {
            OUTPUT_TARGET_PIN = target;
            return;
        }
        OUTPUT_TARGET_PIN = OUTPUT_TARGET_PIN.state.on_press ? OUTPUT_TARGET_PIN : target;
    }
    constructor(position, parent=null)
    {
        super(position, parent);
		this.name = `output pin ${VisualObject.visual_objects.size}`;
        this.on_begin_focus_callback_append(OutputDigitalPin.#on_focus);
        this.on_end_focus_callback_append  (OutputDigitalPin.#on_lost_focus);
    }
}
class PinToPinLink extends BezierObject
{
    static #connected_pins = new Set();
    
    static is_connection_exists(pin_a, pin_b) { return PinToPinLink.#connected_pins.has(`${pin_a.name}:${pin_b.name}`);}

    #source_pin;
    #target_pin;
    /**
     * 
     * @param {OutputDigitalPin} source 
     * @param {InputDigitalPin} target 
     */
    constructor(source, target)
    {
        super(new Vector2d(), new Vector2d(), new Vector2d(), new Vector2d());
        this.#source_pin = source;
        this.#target_pin = target;
        this.source.links.add(this);
        this.target.links.add(this);
        this.update_link_geometry();
        this.update();
        VisualObjectSelectionSystem.subscribe(this);
		PinToPinLink.#connected_pins.add(`${this.source.name}:${this.target.name}`);
    }
    update_link_geometry()
    {
        const point_a = Transform2d.root.inv_local_transform_point(this.source.transform.position_world);
        const point_b = Transform2d.root.inv_local_transform_point(this.target.transform.position_world);
        const middle  = (point_a.x + point_b.x) * 0.5;
        this.p1 = point_a;
        this.p2 = new Vector2d(middle, point_a.y);
        this.p3 = new Vector2d(middle, point_b.y);
        this.p4 = point_b;
    }
    get source   () {return this.#source_pin};
    get target   () {return this.#target_pin};
    get is_toggle() { return this.state.is_toggle;}
    set is_toggle(value)
    {
        if(this.is_toggle === value) return;
        this.state.is_toggle = value;
        this.target.eval_state();
    }
    update() { this.is_toggle = this.source.state.is_toggle;}
    on_delete()
    {
        this.source.links.delete(this);
        this.target.links.delete(this);
        if(this.target.links_count === 0) this.target.is_toggle = false;
        PinToPinLink.#connected_pins.delete(`${this.source.name}:${this.target.name}`);
		VisualObjectSelectionSystem.unsubscribe(this);
	}
}

class NotGate extends TextObject
{
    on_move()
    {
        for(const link of this.input.links)  link.update_link_geometry();
        for(const link of this.output.links) link.update_link_geometry();
    }
    #input ;
    #output;
    get input (){return this.#input;};
    get output(){return this.#output;};
    constructor(position)
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - ONE_T_ONE_GATE_SIZE.y * 0.5),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + ONE_T_ONE_GATE_SIZE.y * 0.5), 'NOT');
	    this.visual  = TEXT_VISUAL_SETTINGS;
        this.#input  = new InputDigitalPin (new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5, 0.0), this);
        this.#output = new OutputDigitalPin(new Vector2d( ONE_T_ONE_GATE_SIZE.x * 0.5, 0.0), this);
        VisualObjectSelectionSystem.subscribe(this);
        VisualObjectMovementSystem.subscribe(this);
    }
    update(){ this.output.state.is_toggle = !this.input.state.is_toggle;}
    on_delete() 
    {
        VisualObjectSelectionSystem.unsubscribe(this);
        VisualObjectMovementSystem.unsubscribe(this);
    }
}
class TwoInSingleOutGate extends TextObject
{
    on_move()
    {
        for(const link of this.input_a.links) link.update_link_geometry();
        for(const link of this.input_b.links) link.update_link_geometry();
        for(const link of this.output. links) link.update_link_geometry();
    }
    #input_a;
    #input_b;
    #output;
    get input_a(){return this.#input_a;};
    get input_b(){return this.#input_b;};
    get output (){return this.#output;};
    constructor(position, name = "g 2:1")
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - 0.8 * ONE_T_ONE_GATE_SIZE.y),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + 0.8 * ONE_T_ONE_GATE_SIZE.y), name);
	    this.visual   = TEXT_VISUAL_SETTINGS;
        this.#input_a = new InputDigitalPin (new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5,  0.4 * ONE_T_ONE_GATE_SIZE.y), this);
        this.#input_b = new InputDigitalPin (new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5, -0.4 * ONE_T_ONE_GATE_SIZE.y), this);
        this.#output  = new OutputDigitalPin(new Vector2d( ONE_T_ONE_GATE_SIZE.x * 0.5, 0), this);
        VisualObjectSelectionSystem.subscribe(this);
        VisualObjectMovementSystem.subscribe(this);
    }
    on_delete() 
    {
        VisualObjectSelectionSystem.unsubscribe(this);
        VisualObjectMovementSystem.unsubscribe(this);
    }
}

class OrGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "OR");
    }
    update(){ this.output.is_toggle = this.input_a.is_toggle || this.input_b.is_toggle;}
}
class AndGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "AND");
    }
    update(){ this.output.is_toggle = this.input_a.is_toggle && this.input_b.is_toggle;}
}

class XorGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "XOR");
    }
    update(){ this.output.is_toggle = this.input_a.is_toggle ^ this.input_b.is_toggle;}
}

class NandGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "NAND");
    }
    update(){ this.output.is_toggle = !(this.input_a.is_toggle && this.input_b.is_toggle);}
}

class NorGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "NOR");
    }
    update(){ this.output.is_toggle = !(this.input_a.is_toggle || this.input_b.is_toggle);}
}

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

class InputGate extends TextObject
{
    static #input_gates = new Set();
    #input_pin;
	static pack_gates(position=null)
	{
		if(position == null)
		{
			vertical_pack_common_center(InputGate.input_gates, ONE_T_ONE_GATE_SIZE.y * 0.5);
			return;
		}
          vertical_pack(InputGate.input_gates,
		  new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y), ONE_T_ONE_GATE_SIZE.y * 0.5);	}
	
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
        InputGate.pack_gates();// vertical_pack_common_center(InputGate.input_gates, ONE_T_ONE_GATE_SIZE.y * 0.5);
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
			vertical_pack_common_center(OutputGate.output_gates, ONE_T_ONE_GATE_SIZE.y * 0.5);
			return;
		}
        vertical_pack(OutputGate.output_gates,
					  new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y), ONE_T_ONE_GATE_SIZE.y * 0.5);
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
