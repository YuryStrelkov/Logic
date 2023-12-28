ONE_T_ONE_GATE_SIZE = new Vector2d(100, 40);
PIN_SIZE = new Vector2d(24, 24)

const toggle_pin = (source) => { source.state.is_toggle = !source.state.is_toggle;}


class PinToPinLink
{

}

class InputPin extends RectangleObject
{

}

class NotGate extends TextObject
{
    #input ;
    #output;
    get input (){return this.#input;};
    get output(){return this.#output;};
    constructor(position)
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - ONE_T_ONE_GATE_SIZE.y * 0.5),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + ONE_T_ONE_GATE_SIZE.y * 0.5), 'NOT');
	    this.visual  = TEXT_VISUAL_SETTINGS;
        this.#input  = RectangleObject.from_center_and_size(new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5, 0), PIN_SIZE);
        this.#output = RectangleObject.from_center_and_size(new Vector2d( ONE_T_ONE_GATE_SIZE.x * 0.5, 0), PIN_SIZE);
        this.#input .parent = this;
        this.#output.parent = this;
        this.#input .visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#output.visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#input. on_end_press_callback_append(toggle_pin);
        this.#output.on_end_press_callback_append(toggle_pin);
    	make_object_moveable(this);
    }
    update()
    {
        this.output.state.is_toggle = !this.input.state.is_toggle;
    }
}
class TwoInSingleOutGate extends TextObject
{
    #input_a;
    #input_b;
    #output;
    get input_a(){return this.#input_a;};
    get input_b(){return this.#input_b;};
    get output (){return this.#output;};
    constructor(position, name = "gate 2:1")
    {
        super(new Vector2d(position.x - ONE_T_ONE_GATE_SIZE.x * 0.5, position.y - 0.8 * ONE_T_ONE_GATE_SIZE.y),
              new Vector2d(position.x + ONE_T_ONE_GATE_SIZE.x * 0.5, position.y + 0.8 * ONE_T_ONE_GATE_SIZE.y), name);
	    this.visual   = TEXT_VISUAL_SETTINGS;
        this.#input_a = RectangleObject.from_center_and_size(new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5,  0.4 * ONE_T_ONE_GATE_SIZE.y), PIN_SIZE);
        this.#input_b = RectangleObject.from_center_and_size(new Vector2d(-ONE_T_ONE_GATE_SIZE.x * 0.5, -0.4 * ONE_T_ONE_GATE_SIZE.y), PIN_SIZE);
        this.#output  = RectangleObject.from_center_and_size(new Vector2d( ONE_T_ONE_GATE_SIZE.x * 0.5, 0), PIN_SIZE);
        this.#input_a.parent = this;
        this.#input_b.parent = this;
        this.#output. parent = this;
        this.#input_a.visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#input_b.visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#output. visual = ROUND_PIN_VISUAL_SETTINGS;
        this.#input_a.on_end_press_callback_append(toggle_pin);
        this.#input_b.on_end_press_callback_append(toggle_pin);
        this.#output.on_end_press_callback_append(toggle_pin);
    	make_object_moveable(this);
    }
    // update(){ this.output.state.is_toggle = this.input_a.state.is_toggle || this.input_b.state.is_toggle;}
}

class OrGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "OR");
    }
    update(){ this.output.state.is_toggle = this.input_a.state.is_toggle || this.input_b.state.is_toggle;}
}
class AndGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "AND");
    }
    update(){ this.output.state.is_toggle = this.input_a.state.is_toggle && this.input_b.state.is_toggle;}
}

class XorGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "XOR");
    }
    update(){ this.output.state.is_toggle = this.input_a.state.is_toggle ^ this.input_b.state.is_toggle;}
}

class NandGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "NAND");
    }
    update(){ this.output.state.is_toggle = !(this.input_a.state.is_toggle && this.input_b.state.is_toggle);}
}

class NorGate extends TwoInSingleOutGate
{
    constructor(position)
    {
        super(position, "NOR");
    }
    update(){ this.output.state.is_toggle = !(this.input_a.state.is_toggle || this.input_b.state.is_toggle);}
}

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
    	make_object_moveable(this.#p1_controller);
    	make_object_moveable(this.#p2_controller);
    	make_object_moveable(this.#p3_controller);
    	make_object_moveable(this.#p4_controller);
    }
}