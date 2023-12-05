const canvas = document.querySelector("canvas");
canvas.width = 400;
canvas.height = 200;

const ctx = canvas.getContext("2d");
const cx = canvas.width / 2;
const cy = canvas.height / 2;

function draw_rect(x, y, w, h)
{
  ctx.translate(x, y);
  ctx.fillRect(-w/2, -h/2, w/2, h/2);
 
 const canvas = document.getElementById("canvas");
  if (!ctx)return;
  {
    // Filled triangle
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(105, 25);
    ctx.lineTo(25, 105);
    ctx.fill();

    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(125, 125);
    ctx.lineTo(125, 45);
    ctx.lineTo(45, 125);
    ctx.closePath();
    ctx.stroke();
  }
}


class Pt2
{
	constructor(x, y)
	{
	  this.x = x;
	  this.y = y;
	}
}

class NotGate
 {	
	  get output() {
		return !this.#_input;
	  }
	  
	  get input() {
		return this.#_input;
	  }
	  
	  eval_gate(a)
	  {
		  if(!(a instanceof Boolean)){this.#_input = false;}
		  return output();
	  }
	  
	  repaint(){}
	  
	  move(x, y)
	  {
		this.pos = Pt2(x, y);
		repaint();
	  }
	  
	  constructor(x, y)
	  {
		this.pos = Pt2(x, y);
        this.#_input  = false;
		this.repaint();
	  }
}

class AndGate
 {	
	  get output() {
		return this.input_a() & this.input_b();
	  }
	  
	  get input_a() {
		return this.#_input_a;
	  }
	  
	  get input_b() {
		return this.#_input_b;
	  }
	  
	  eval_gate(a, b)
	  {
		  if(!(a instanceof Boolean)){this.#_input_a = false;}
		  if(!(b instanceof Boolean)){this.#_input_b = false;}
		  return output();
	  }
	  
	  repaint(){}
	  
	  move(x, y)
	  {
		this.pos = Pt2(x, y);
		repaint();
	  }
	  
	  constructor(x, y)
	  {
		this.pos = Pt2(x, y);
		this.#_input_a = false;
		this.#_input_b = false;
	  }
}

class OrGate
{	
	  get output() {
		return this.input_a() | this.input_b();
	  }
	  
	  get input_a() {
		return this.#_input_a;
	  }
	  
	  get input_b() {
		return this.#_input_b;
	  }
	  
	  eval_gate(a, b)
	  {
		  if(!(a instanceof Boolean)){this.#_input_a = false;}
		  if(!(b instanceof Boolean)){this.#_input_b = false;}
		  return output();
	  }
	  
	  repaint(){}
	  
	  move(x, y)
	  {
		this.pos = Pt2(x, y);
		repaint();
	  }
	  
	  constructor(x, y)
	  {
		this.pos = Pt2(x, y);
     	this.#_input_a = false;
		this.#_input_b = false;
	  }
}

class XorGate
{	
	  get output() {
		return this.input_a() ^ this.input_b();
	  }
	  
	  get input_a() {
		return this.#_input_a;
	  }
	  
	  get input_b() {
		return this.#_input_b;
	  }
	  
	  eval_gate(a, b)
	  {
		  if(!(a instanceof Boolean)){this.#_input_a = false;}
		  if(!(b instanceof Boolean)){this.#_input_b = false;}
		  return output();
	  }
	  
	  repaint(){}
	  
	  move(x, y)
	  {
		this.pos = Pt2(x, y);
		repaint();
	  }
	  
	  constructor(x, y)
	  {
		this.pos = Pt2(x, y);
		this.#_input_a = false;
		this.#_input_b = false;
		this.repaint();
	  }
}
