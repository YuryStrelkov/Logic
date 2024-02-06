// // @ts-check

import { VisualObjectSelectionSystem } from "../Interaction/visualObjectsSelection.js";
import { VisualObjectMovementSystem } from "../Interaction/visualObjectsMovement.js";
import { InputDigitalPin, OutputDigitalPin} from "./digitalPins.js";
import { ONE_T_ONE_GATE_SIZE } from "../visualSettings.js";
import { TEXT_VISUAL_SETTINGS } from "../visualSettings.js";
import { Vector2d } from "../../Geometry/geometry.js";
import { TextObject } from "../visualObject.js";
class NotGate extends TextObject
{
    on_move()
    {
        this.input. update_links_geometry();
        this.output.update_links_geometry();
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
        this.input_a.update_links_geometry();
        this.input_b.update_links_geometry();
        this.output. update_links_geometry();
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

export {NotGate, AndGate, NandGate, NorGate, XorGate, OrGate, TwoInSingleOutGate};