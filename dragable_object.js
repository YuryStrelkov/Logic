function getElementCoords(element)
{   // кроме IE8-
	const box = element.getBoundingClientRect();
	return {top: box.top + pageYOffset, left: box.left + pageXOffset};
}

function register_events(element)
{	
   element.onmousedown = function(e)
   {
   	   if(e.button != 0)return;
	   if(e.target.classList.contains('pin'))return;
	   var coords = getElementCoords(element);
	   var shiftX = e.pageX - coords.left;
	   var shiftY = e.pageY - coords.top;
	   
	   element.style.position = 'absolute';
	   moveAt(e);
	
	   const oldZIndex = element.style.zIndex;
	
	   element.style.zIndex = 1000; // над другими элементами
	   
	   function moveAt(e)
	   {
		 element.style.left = (e.pageX - shiftX) + 'px';
		 element.style.top  = (e.pageY - shiftY) + 'px';
	   }
	   
	   document.onmousemove = function(e) {
		 moveAt(e);
	   };
	   
	   element.onmouseup = function() {
		 document.onmousemove = null;
		 element.onmouseup = null;
		 element.style.zIndex = oldZIndex;
	   };
	}

	element.ondragstart = function() {
		return false;
	};
}

function create_dragable(x_0, y_0, width, height, parent = null)
{
	var element = document.createElement("div");
	element.style.position = "absolute";
	element.style.left     = (x_0 - (width  >> 1)) + 'px';
	element.style.top      = (y_0 - (height >> 1)) + 'px';
	element.style.width    = width  + 'px';
	element.style.height   = height + 'px';
	element.style.backgroundColor = "rgba(0,0,0,0.5)";
	register_events(element);
	return element;
}


function make_dragable(element, x_0, y_0, parent = null)
{	

	// if(!element.classList.contains("moveable"))return element;
	// 
	// const listItems = element.children;
	// const childrenArray = Array.from(element.children);
	// childrenArray.forEach((item) =>
	// {
	// 	if(item.classList.contains("wiring"))
	// 	{
	// 		item.style.zIndex = 1000;
	// 	}
	// });
	if(!element.classList.contains("moveable"))return;
	element.style.position = "absolute";
	element.style.left     = (x_0 - (Number(element.style.width.replace('px', ''))  >> 1)) + 'px';
	element.style.top      = (y_0 - (Number(element.style.height.replace('px', '')) >> 1)) + 'px';
	register_events(element);
	// element.appendChild(element, parent == null ? document.body : parent);
	return element;
}
