class Wiring
{

}

function init()
{
	const canvas = document.getElementById("mainCanvas");
}




var mouse_down = false;
var direction = 0;
var points = [];
var mouse_point = null;

function getElementCoords(elem) {   // кроме IE8-
	var box = elem.getBoundingClientRect();
	return {top: box.top + pageYOffset, left: box.left + pageXOffset};
}

function on_mouse_down(evt)
{
	mouse_down = true;
	direction = 0;
	console.clear();
	points.push(canvasCliqueCoord(evt));
}

function on_mouse_up(evt)
{
	mouse_down = false;
	mouse_point = null;
	points = [];
}

function on_mouse_move(evt)
{
	if(!mouse_down) return;
	curr_coords = mouse_point = canvasCliqueCoord(evt);
	evaluateDirection(curr_coords);
}

function evaluateDirection(p_curr, dist_thresshold = 25.0, default_dir = 0)
{	
	const p_prev = points[points.length - 1];
	const dx = p_curr.x - p_prev.x;
	const dy = p_curr.y - p_prev.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist < dist_thresshold)
	{	
		if (points.length == 2)
		{	
			const _dx = p_curr.x - points[0].x;
			const _dy = p_curr.y - points[0].y;
			console.log(Math.sqrt(_dx * _dx + _dy * _dy));
			direction = Math.abs(_dx) < Math.abs(_dy)? 1 : 0;
		}
		
		if (points.length >= 2)
		{	
			points.pop();
		}
		
		if(direction == 0)
		{
			points.push({x: p_curr.x, y: p_prev.y});
		}
		if(direction == 1)
		{
			points.push({x: p_prev.x, y: p_curr.y});
		}
		return;
	}
	
	if (Math.abs(dx) < Math.abs(dy))
	{
		if(direction == 1)return;
		direction = 1;
		points.push({x: p_prev.x, y: p_curr.y});
	}
	else
	{
		if(direction == 0)return;
		direction = 0;
		points.push({x: p_curr.x, y: p_prev.y});
	}
}