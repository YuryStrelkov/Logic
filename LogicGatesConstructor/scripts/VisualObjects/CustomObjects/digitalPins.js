// // @ts-check
import { VisualObjectSelectionSystem } from "../Interaction/visualObjectsSelection.js";
import { RectangleObject, BezierObject } from "../visualObject.js";
import { Transform2d } from "../../Geometry/transform2d.js";
import { Vector2d } from "../../Geometry/geometry.js";
import { VisualObject } from "../visualObject.js";
import { PIN_SIZE, ROUND_PIN_VISUAL_SETTINGS } from "../visualSettings.js";
import { MouseInfo } from "../inputs.js";

var INPUT_TARGET_PIN  = null;
var OUTPUT_TARGET_PIN = null;

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

export class DigitalPin extends RectangleObject
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
    update_links_geometry()
    {
        for(const link of this.links) link.update_link_geometry();
    }
    eval_state      ()
    {   
        if(this.links_count == 0)return;
        this.state.is_toggle = false;
        for(const link of this.links) this.state.is_toggle |= link.is_toggle;
    }
    on_delete() { for(const link of this.links) VisualObject.destroy_visual_object(link); }
}

export class InputDigitalPin extends DigitalPin
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

export class OutputDigitalPin extends DigitalPin
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

export class PinToPinLink extends BezierObject
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

// export {DigitalPin, InputDigitalPin, OutputDigitalPin, PinToPinLink}