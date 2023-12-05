
class Transform2d
{
	#parent=null;
	#children;
	#position;
	#scale;
	#angle;
	#local_transform_m;
	#world_transform_m;
	#inv_local_transform_m;
	#inv_world_transform_m;
	#raw_transform_m;
	#transform_layer = 0;
	static _transforms_layers = new Map();
	static _root              = new Transform2d();
	static get root(){return Transform2d._root;};
	#build_local_transforms()
	{
		if(!this.#raw_transform_m) return;
		this.#local_transform_m     = Matrix3d.build_transform_2d    (this.position, this.scale, this.#angle);
		this.#inv_local_transform_m = Matrix3d.build_inv_transform_2d(this.position, this.scale, this.#angle);
		this.#raw_transform_m = false;
	}
	static remove_from_transform_layers(t)
	{
		if(!Transform2d._transforms_layers.has(t.transform_layer))return;
			Transform2d._transforms_layers.get(t.transform_layer).delete(t);
	}
	static append_to_transform_layers(t)
	{
		if(!Transform2d._transforms_layers.has(t.transform_layer)) Transform2d._transforms_layers.set(t.transform_layer, new Set());
			Transform2d._transforms_layers.get(t.transform_layer).add(t);
	}
	static sync_transforms()
	{
		for(const [_, layer] of Transform2d._transforms_layers)
			for(const transform of layer) transform.sync();
	}
	constructor()
	{
	  this.#children              = new Set();
	  this.#position              = new Vector2d(0.0, 0.0);
	  this.#scale                 = new Vector2d(1.0, 1.0);
	  this.#angle                 = 0.0;
	  this.#local_transform_m     = new Matrix3d();
	  this.#world_transform_m     = new Matrix3d();
	  this.#inv_local_transform_m = new Matrix3d();
	  this.#inv_world_transform_m = new Matrix3d();
	  this.#raw_transform_m       = false;
	  if(Transform2d.root == null)
	  {
		Transform2d.append_to_transform_layers(this);
		return;
	  }
	  this.parent = Transform2d.root;
	}
	sync()
	{
		if(!this.has_parent)
		{
			this.#world_transform_m     = this.local_tm;
			this.#inv_world_transform_m = this.inv_local_tm;
			return;
		}
		this.#world_transform_m     = Matrix3d.mat_mul(this.parent.world_tm, this.local_tm);
		this.#inv_world_transform_m = Matrix3d.mat_mul(this.inv_local_tm, this.parent.inv_world_tm);
	}
	get transform_layer() { return this.#transform_layer;}
	get has_parent     () { return this.parent != null;}
	get has_children   () { return this.#children.size != 0;}
	get children       () { return this.#children.values();}
	get parent(){return this.#parent;}
	set parent(value)
	{
		// if(!(value instanceof Transform2d))return;
		if(this.parent != null) this.parent.remove_child(this);
		this.#parent = value;
		this.#transform_layer = value.transform_layer + 1;
		if(this.parent != null) this.parent.append_child(this);
	}
	get local_tm()
	{	
		this.#build_local_transforms();
		return this.#local_transform_m;
	}
	get inv_local_tm()
	{
		this.#build_local_transforms();
		return this.#inv_local_transform_m;
	}
	get world_tm()
	{
		return this.#world_transform_m;
	}
	get inv_world_tm()
	{
		return this.#inv_world_transform_m;
	}
	get position(){return this.#position;}
	get scale   (){return this.#scale;}
	get angle   (){return this.#angle * RAD_TO_DEG;}
	set position(value)
	{
		// if(!(value instanceof Vector2d))return; 
		this.#position = value;
		this.#raw_transform_m = true;
	}
	set scale   (value)
	{
		// if(!(value instanceof Vector2d))return;
		this.#scale  = value;
		this.#raw_transform_m = true;
	}
	set angle(value)
	{
		if(!is_number(value))return;
		this.#angle  = value * DEG_TO_RAD;
		this.#raw_transform_m = true;
	}
	append_child(child_transform)
	{
		// if(!(child_transform instanceof Transform2d))return; 
		Transform2d.append_to_transform_layers(child_transform);
		this.#children.add(child_transform);
	}
	remove_child(child_transform)
	{
		// if(!(child_transform instanceof Transform2d))return; 
		Transform2d.remove_from_transform_layers(child_transform);
		this.#children.delete(child_transform);
	}
	local_transform_point        (point) { return this.local_tm.multiply_by_point        (point);}
	local_transform_direction    (point) { return this.local_tm.multiply_by_direction    (point);}
	inv_local_transform_point    (point) { return this.inv_local_tm.multiply_by_point    (point);}
	inv_local_transform_direction(point) { return this.inv_local_tm.multiply_by_direction(point);}
	
	world_transform_point        (point) { return this.world_tm.multiply_by_point        (point);}
	world_transform_direction    (point) { return this.world_tm.multiply_by_direction    (point);}
	inv_world_transform_point    (point) { return this.inv_world_tm.multiply_by_point    (point);}
	inv_world_transform_direction(point) { return this.inv_world_tm.multiply_by_direction(point);}

	apply_to_context(ctx)
	{
		if(this.parent == null)
		{
			ctx.transform(this.local_tm.m00, this.local_tm.m10,  // ex
						  this.local_tm.m01, this.local_tm.m11,  // ey
						  this.local_tm.m02, this.local_tm.m12); // pos
			return;
		}
		ctx.transform(this.world_tm.m00, this.world_tm.m10,  // ex
					  this.world_tm.m01, this.world_tm.m11,  // ey
					  this.world_tm.m02, this.world_tm.m12); // pos
	}
}