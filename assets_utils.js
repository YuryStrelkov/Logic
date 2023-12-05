function _load_asset(url, x_0=0, y_0=0, parentContainer=null)
{
	return new Promise((resolve, reject)=>{
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function()
		{	
			if (this.status != 200) {
				var error = new Error(this.statusText);
				error.code = this.status;
				reject(error);
			}
			const parser    = new DOMParser();
			const html_node = parser.parseFromString(this.responseText, 'text/html');
			var   asset     = html_node.body.children[0];
			asset           = parentContainer == null ? document.body.appendChild(asset):
														parentContainer.appendChild(asset);
			make_dragable(asset, x_0, y_0);
			resolve(asset);
		}
		xhr.send();
	});
}

function load_asset(url, x_0=0, y_0=0, parentContainer=null)
{
	return _load_asset(url, x_0, y_0, parentContainer);
}

function make_custom_gate(inputs=3, outputs=3, x_0=0, y_0=0, name='custom_gate', parent=null)
{
	load_asset('/assets/custom/custom_gate_body.html', x_0, y_0, parent).
	then(function(response){
		const pin_in = '/assets/custom/custom_gate_pin_in.html';
		const pin_out = '/assets/custom/custom_gate_pin_out.html';
		gate_name = response.getElementsByClassName("custom_gate_header_name")[0];
		gate_name.innerHTML = name;
		inputs_container = response.getElementsByClassName("gate_inputs")[0];
		outputs_container = response.getElementsByClassName("gate_outputs")[0];
		loading_requests = [];
		for(var index = 0; index < inputs; ++index)
		{		
			loading_requests.push(load_asset(pin_in, 0, 0, inputs_container));
		}
		for(var index = 0; index < outputs; ++index)
		{
			loading_requests.push(load_asset(pin_out, 0, 0, outputs_container));
		}
		
		Promise.all(loading_requests).then(() => 
		{
		 	inputs_pins_names  = inputs_container. getElementsByClassName("pin_name");
			outputs_pins_names = outputs_container.getElementsByClassName("pin_name");
			for(var index = 0; index < inputs_pins_names.length; ++index)
			{	
				inputs_pins_names[index].innerHTML = 'A' + index;
			}
			for(var index = 0; index < outputs_pins_names.length; ++index)
			{
				outputs_pins_names[index].innerHTML = 'B' + index;
			}
		});
		
		return response;
	});
}

