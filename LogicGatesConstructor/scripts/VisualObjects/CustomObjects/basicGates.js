// const ONE_T_ONE_GATE_SIZE = new Vector2d(100, 40);

// class BezierCurveObject extends BezierObject
// {
//     #p1_controller;
//     #p2_controller;
//     #p3_controller;
//     #p4_controller;
// 
//     get p1_controller(){return this.#p1_controller;};
//     get p2_controller(){return this.#p2_controller;};
//     get p3_controller(){return this.#p3_controller;};
//     get p4_controller(){return this.#p4_controller;};
//     
//     constructor(p1, p2, p3, p4)
//     {
//         super(p1, p2, p3, p4);
//         const controller_size = new Vector2d(10, 10)
//         this.#p1_controller = RectangleObject.from_center_and_size(p1, controller_size);
//         this.#p2_controller = RectangleObject.from_center_and_size(p2, controller_size);
//         this.#p3_controller = RectangleObject.from_center_and_size(p3, controller_size);
//         this.#p4_controller = RectangleObject.from_center_and_size(p4, controller_size);
//         this.#p1_controller.on_press_callback_append((source)=>{this.p1 = source.transform.position;});
//         this.#p2_controller.on_press_callback_append((source)=>{this.p2 = source.transform.position;});
//         this.#p3_controller.on_press_callback_append((source)=>{this.p3 = source.transform.position;});
//         this.#p4_controller.on_press_callback_append((source)=>{this.p4 = source.transform.position;});
//         this.#p1_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
//         this.#p2_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
//         this.#p3_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
//         this.#p4_controller. visual = ROUND_PIN_VISUAL_SETTINGS;
//         VisualObjectMovementSystem.subscribe(this.#p1_controller);
//         VisualObjectMovementSystem.subscribe(this.#p2_controller);
//         VisualObjectMovementSystem.subscribe(this.#p3_controller);
//         VisualObjectMovementSystem.subscribe(this.#p4_controller);
//     }
//     on_delete() 
//     {
//         VisualObjectMovementSystem.unsubscribe(this.#p1_controller);
//         VisualObjectMovementSystem.unsubscribe(this.#p2_controller);
//         VisualObjectMovementSystem.unsubscribe(this.#p3_controller);
//         VisualObjectMovementSystem.unsubscribe(this.#p4_controller);
//     }
// }

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
