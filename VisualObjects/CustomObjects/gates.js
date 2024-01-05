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
    	make_object_moveable(this.#p1_controller);
    	make_object_moveable(this.#p2_controller);
    	make_object_moveable(this.#p3_controller);
    	make_object_moveable(this.#p4_controller);
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
        this.on_begin_focus_callback_append(OutputDigitalPin.#on_focus);
        this.on_end_focus_callback_append  (OutputDigitalPin.#on_lost_focus);
    }
}
class PinToPinLink extends BezierObject
{
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
    get source  () {return this.#source_pin};
    get target  () {return this.#target_pin};
    update() { this.is_toggle = this.source.state.is_toggle;}
    get is_toggle() { return this.state.is_toggle;}
    set is_toggle(value)
    {
        if(this.is_toggle === value) return;
        this.state.is_toggle = value;
        this.target.eval_state();
    }
}

class NotGate extends TextObject
{
    static #update_links_geometry(source)
    {
        for(const link of source.input.links) link.update_link_geometry();
        for(const link of source.output.links) link.update_link_geometry();
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
        this.on_press_callback_append(NotGate.#update_links_geometry);
        this.on_end_press_callback_append(NotGate.#update_links_geometry);
        make_object_selectable(this);
    	make_object_moveable(this);
    }
    update(){ this.output.state.is_toggle = !this.input.state.is_toggle;}
}
class TwoInSingleOutGate extends TextObject
{
    static #update_links_geometry(source)
    {
        for(const link of source.input_a.links) link.update_link_geometry();
        for(const link of source.input_b.links) link.update_link_geometry();
        for(const link of source.output.links)  link.update_link_geometry();
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
        this.on_press_callback_append    (TwoInSingleOutGate.#update_links_geometry);
        this.on_end_press_callback_append(TwoInSingleOutGate.#update_links_geometry);
        make_object_selectable(this);
        make_object_moveable(this);
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
