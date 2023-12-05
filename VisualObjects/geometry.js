class Vector2d
{
	static lerp(a, b, t)
	{
		if(!(a instanceof Vector2d))return new Vector2d();
		if(!(b instanceof Vector2d))return new Vector2d();
		const _t = Math.min(Math.max(0.0, t), 1.0);
		return new Vector2d(a.x + (b.x - a.x) * _t, a.y + (b.y - a.y) * _t);
	}
	
	static dot(a, b)
	{
		if(!(a instanceof Vector2d))return 0.0;
		if(!(b instanceof Vector2d))return 0.0;
		return a.x * b.x + a.y * b.y;
	}
	
	static cross(a, b)
	{
		if(!(a instanceof Vector2d))return 0.0;
		if(!(b instanceof Vector2d))return 0.0;
		return a.x * b.y - a.y * b.x;
	}
	
	static angle(a, b)
	{
		if(!(a instanceof Vector2d))return 0.0;
		if(!(b instanceof Vector2d))return 0.0;
		return Math.acos(Vector2d.dot(a, b) * a.inv_length * b.inv_length);
	}
	static distance(a, b)
	{
		if(!(a instanceof Vector2d))return -1.0;
		if(!(b instanceof Vector2d))return -1.0;
		const x = b.x - a.x;
		const y = b.y - a.y;
		return Math.sqrt(x * x + y * y);
	}
	static manhattan_distance(a, b)
	{
		if(!(a instanceof Vector2d))return -1.0;
		if(!(b instanceof Vector2d))return -1.0;
		return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
	}
	static sub(a, b)
	{
		if(!(a instanceof Vector2d))return new Vector2d();
		if(!(b instanceof Vector2d))return new Vector2d();
		return new Vector2d(a.x - b.x, a.y - b.y);
	}
	static sum(a, b)
	{
		if(!(a instanceof Vector2d))return new Vector2d();
		if(!(b instanceof Vector2d))return new Vector2d();
		return new Vector2d(a.x + b.x, a.y + b.y);
	}
	#x = 0.0;
	#y = 0.0;
	get x(){return this.#x;};
	get y(){return this.#y;};
	set x(value){this.#x = (is_number(value))? value: this.#x;};
	set y(value){this.#y = (is_number(value))? value: this.#y;};
	constructor(x = 0.0, y = 0.0)
	{
		this.x = x;
		this.y = y;
	}
	get length(){ return Math.sqrt(this.x * this.x + this.y  * this.y); }
	get inv_length(){ return 1.0 / this.length; }
	
	get normalized()
	{
		const i_length = this.inv_length;
		return Vector2d(this.x * i_length, this.y * i_length);
	}
	
	normalize()
	{
		const i_length = this.inv_length;
		this.x *= i_length;
		this.y *= i_length;
		return this;
	}
}
class Vector3d
{
	static lerp(a, b, t)
	{
		if(!(a instanceof Vector3d))return new Vector3d();
		if(!(b instanceof Vector3d))return new Vector3d();
		const _t = Math.min(Math.max(0.0, t), 1.0);
		return new Vector3d(a.x + (b.x - a.x) * _t,
		                    a.y + (b.y - a.y) * _t,
		                    a.z + (b.z - a.z) * _t);
	}
	
	static dot(a, b)
	{
		if(!(a instanceof Vector3d))return 0.0;
		if(!(b instanceof Vector3d))return 0.0;
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}
	///////////////////////////
	static cross(a, b)
	{
		if(!(a instanceof Vector3d))return Vector3d();
		if(!(b instanceof Vector3d))return Vector3d();
		return new Vector3d(a.z * b.y - a.y * b.z, a.x * b.z - a.z * b.x, a.y * b.x - a.x * b.y);
	}
	
	static angle(a, b)
	{
		if(!(a instanceof Vector3d))return 0.0;
		if(!(b instanceof Vector3d))return 0.0;
		return Math.acos(Vector3d.dot(a, b) * a.inv_length * b.inv_length);
	}
	static distance(a, b)
	{
		if(!(a instanceof Vector3d))return -1.0;
		if(!(b instanceof Vector3d))return -1.0;
		const x = b.x - a.x;
		const y = b.y - a.y;
		const z = b.z - a.z;
		return Math.sqrt(x * x + y * y + z * z);
	}
	static manhattan_distance(a, b)
	{
		if(!(a instanceof Vector3d))return -1.0;
		if(!(b instanceof Vector3d))return -1.0;
		return Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z);
	}
	static sub(a, b)
	{
		if(!(a instanceof Vector3d))return new Vector3d();
		if(!(b instanceof Vector3d))return new Vector3d();
		return new Vector3d(a.x - b.x, a.y - b.y, a.z - b.z);
	}
	static sum(a, b)
	{
		if(!(a instanceof Vector3d))return new Vector3d();
		if(!(b instanceof Vector3d))return new Vector3d();
		return new Vector3d(a.x + b.x, a.y + b.y, a.z + b.z);
	}
	#x = 0.0;
	#y = 0.0;
	#z = 0.0;
	get x(){return this.#x;};
	get y(){return this.#y;};
	get z(){return this.#z;};
	set x(value){this.#x = (is_number(value))? value: this.#x;};
	set y(value){this.#y = (is_number(value))? value: this.#y;};
	set z(value){this.#z = (is_number(value))? value: this.#z;};
	constructor(x = 0.0, y = 0.0, z = 0.0)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}
	get length(){ return Math.sqrt(this.x * this.x + this.y  * this.y + this.z  * this.z); }
	get inv_length(){ return 1.0 / this.length; }
	
	get normalized()
	{
		const i_length = this.inv_length;
		return Vector3d(this.x * i_length, this.y * i_length, this.z * i_length);
	}
	
	normalize()
	{
		const i_length = this.inv_length;
		this.x *= i_length;
		this.y *= i_length;
		this.z *= i_length;
		return this;
	}
}
class Matrix3d
{
	#m00; #m01; #m02;
	#m10; #m11; #m12;
	#m20; #m21; #m22;
	get m00(){return this.#m00;}
	get m10(){return this.#m10;}
	get m20(){return this.#m20;}
	get m01(){return this.#m01;}
	get m11(){return this.#m11;}
	get m21(){return this.#m21;}
	get m02(){return this.#m02;}
	get m12(){return this.#m12;}
	get m22(){return this.#m22;}
	set m00(value){this.#m00 = (is_number(value))? value: this.#m00;}
	set m10(value){this.#m10 = (is_number(value))? value: this.#m10;}
	set m20(value){this.#m20 = (is_number(value))? value: this.#m20;}
	set m01(value){this.#m01 = (is_number(value))? value: this.#m01;}
	set m11(value){this.#m11 = (is_number(value))? value: this.#m11;}
	set m21(value){this.#m21 = (is_number(value))? value: this.#m21;}
	set m02(value){this.#m02 = (is_number(value))? value: this.#m02;}
	set m12(value){this.#m12 = (is_number(value))? value: this.#m12;}
	set m22(value){this.#m22 = (is_number(value))? value: this.#m22;}
	constructor(m00 = 1.0, m01 = 0.0, m02 = 0.0,
				m10 = 0.0, m11 = 1.0, m12 = 0.0,
				m20 = 0.0, m21 = 0.0, m22 = 1.0)
	{
		this.m00 = m00;
		this.m10 = m10;
		this.m20 = m20;
		this.m01 = m01;
		this.m11 = m11;
		this.m21 = m21;
		this.m02 = m02;
		this.m12 = m12;
		this.m22 = m22;
	}
	get right(){return new Vector3d(this.m00, this.m10, this.m20);}
	get up   (){return new Vector3d(this.m01, this.m11, this.m21);}
	get front(){return new Vector3d(this.m02, this.m12, this.m22);}
	static rotate_x(angle, angle_in_rad=true)
	{
        if(!angle_in_rad) angle *= DEG_TO_RAD;
        const cos_a = Math.cos(angle)
        const sin_a = Math.sin(angle)
        return new Matrix3d(1.0, 0.0,    0.0,
                            0.0, cos_a, -sin_a,
                            0.0, sin_a,  cos_a)
	}
	static rotate_y(angle, angle_in_rad=true)
	{
        if(!angle_in_rad) angle *= DEG_TO_RAD;
        const cos_a = Math.cos(angle)
        const sin_a = Math.sin(angle)
        return new Matrix3d( cos_a, 0.0, sin_a,
							 0.0,   1.0, 0.0,
							-sin_a, 0.0, cos_a)
	}
	static rotate_z(angle, angle_in_rad=true)
	{
        if(!angle_in_rad) angle *= DEG_TO_RAD;
        const cos_a = Math.cos(angle)
        const sin_a = Math.sin(angle)
        return new Matrix3d(cos_a, -sin_a, 0.0,
							sin_a,  cos_a, 0.0,
							0.0,    0.0,   1.0)
	}
	static rotate(roll, pitch, yaw, angles_in_rad=true)
	{
		if(angles_in_rad)
		{
			const cr = math.cos(roll);
			const sr = math.sin(roll);
			const cp = math.cos(pitch);
			const sp = math.sin(pitch);
			const cy = math.cos(yaw);
			const sy = math.sin(yaw);
			return  new Matrix3d(cp * cy, (sr * sp * cy) - (cr * sy), (cr * sp * cy) + (sr * sy),
								 cp * sy, (sr * sp * sy) + (cr * cy), (cr * sp * sy) - (sr * cy),
								-sp, sr * cp, cr * cp);
		}
		const cr = math.cos(roll * DEG_TO_RAD);
		const sr = math.sin(roll * DEG_TO_RAD);
		const cp = math.cos(pitch * DEG_TO_RAD);
		const sp = math.sin(pitch * DEG_TO_RAD);
		const cy = math.cos(yaw * DEG_TO_RAD);
		const sy = math.sin(yaw * DEG_TO_RAD);
		return  new Matrix3d(cp * cy, (sr * sp * cy) - (cr * sy), (cr * sp * cy) + (sr * sy),
							 cp * sy, (sr * sp * sy) + (cr * cy), (cr * sp * sy) - (sr * cy),
						    -sp, sr * cp, cr * cp);

	}
	get euler_angles()
	{
        if(Math.abs(this.m20 + 1.0) < NUMERICAL_ACCURACY)
            return new Vector3d(0.0, math.pi * 0.5, Math.atan2(this.m01, this.m02));

        if (Math.abs(this.m20 - 1.0) < NUMERICAL_ACCURACY)
            return new Vector3d(0.0, -math.pi * 0.5, Math.atan2(-this.m01, -this.m02));
		x1 = -Math.asin(this.m20)
		inv_cos_x1 = 1.0 / Math.cos(x1)
		x2 = Math.PI + x1
		inv_cos_x2 = 1.0 / Math.cos(x1)
		y1 = Math.atan2(this.m21 * inv_cos_x1, this.m22 * inv_cos_x1)
		y2 = Math.atan2(this.m21 * inv_cos_x2, this.m22 * inv_cos_x2)
		z1 = Math.atan2(this.m10 * inv_cos_x1, this.m00 * inv_cos_x1)
		z2 = Math.atan2(this.m10 * inv_cos_x2, this.m00 * inv_cos_x2)
		if((Math.abs(x1) + Math.abs(y1) + Math.abs(z1)) <= (Math.abs(x2) + Math.abs(y2) + Math.abs(z2)))
			return new Vector3d(y1, x1, z1)
		return new Vector3d(y2, x2, z2)
	}
	invert()
	{
        const det = (this.m00 * (this.m11 * this.m22 - this.m21 * this.m12) -
                     this.m01 * (this.m10 * this.m22 - this.m12 * this.m20) +
                     this.m02 * (this.m10 * this.m21 - this.m11 * this.m20));
        if (Math.abs(det) < NUMERICAL_ACCURACY) return new Matrix3d();
        det = 1.0 / det;
        const _m00 = this.m00;
        const _m01 = this.m10;
        const _m02 = this.m20;
        const _m10 = this.m01;
        const _m11 = this.m11;
        const _m12 = this.m21;
        const _m20 = this.m02;
        const _m21 = this.m12;
        const _m22 = this.m22;

        this.#m00 = (_m11 * _m22 - _m21 * _m12) * det;
        this.#m10 = (_m02 * _m21 - _m01 * _m22) * det;
        this.#m20 = (_m01 * _m12 - _m02 * _m11) * det;
        this.#m01 = (_m12 * _m20 - _m10 * _m22) * det;
        this.#m11 = (_m00 * _m22 - _m02 * _m20) * det;
        this.#m21 = (_m10 * _m02 - _m00 * _m12) * det;
        this.#m02 = (_m10 * _m21 - _m20 * _m11) * det;
        this.#m12 = (_m20 * _m01 - _m00 * _m21) * det;
        this.#m22 = (_m00 * _m11 - _m10 * _m01) * det;
        return this;
	}
	m_mul(other)
	{
		if(!(other instanceof Matrix3d))return this;
		const _m00 = this.m00;
		const _m01 = this.m01;
		const _m02 = this.m02;
		const _m10 = this.m10;
		const _m11 = this.m11;
		const _m12 = this.m12;
		const _m20 = this.m20;
		const _m21 = this.m21;
		const _m22 = this.m22;

		this.#m00 = other.m00 * _m00 + other.m01 * _m10 + other.m02 * _m20;
		this.#m01 = other.m00 * _m01 + other.m01 * _m11 + other.m02 * _m21;
		this.#m02 = other.m00 * _m02 + other.m01 * _m12 + other.m02 * _m22;
		this.#m10 = other.m10 * _m00 + other.m11 * _m10 + other.m12 * _m20;
		this.#m11 = other.m10 * _m01 + other.m11 * _m11 + other.m12 * _m21;
		this.#m12 = other.m10 * _m02 + other.m11 * _m12 + other.m12 * _m22;
		this.#m20 = other.m20 * _m00 + other.m21 * _m10 + other.m22 * _m20;
		this.#m21 = other.m20 * _m01 + other.m21 * _m11 + other.m22 * _m21;
		this.#m22 = other.m20 * _m02 + other.m21 * _m12 + other.m22 * _m22;
		return this;
	}
	rm_mul(other)
	{
		if(!(other instanceof Matrix3d))return this;
		const _m00 = this.m00;
		const _m01 = this.m01;
		const _m02 = this.m02;
		const _m10 = this.m10;
		const _m11 = this.m11;
		const _m12 = this.m12;
		const _m20 = this.m20;
		const _m21 = this.m21;
		const _m22 = this.m22;

		this.#m00 = _m00 * other.m00 + _m01 * other.m10 + _m02 * other.m20;
		this.#m01 = _m00 * other.m01 + _m01 * other.m11 + _m02 * other.m21;
		this.#m02 = _m00 * other.m02 + _m01 * other.m12 + _m02 * other.m22;
		this.#m10 = _m10 * other.m00 + _m11 * other.m10 + _m12 * other.m20;
		this.#m11 = _m10 * other.m01 + _m11 * other.m11 + _m12 * other.m21;
		this.#m12 = _m10 * other.m02 + _m11 * other.m12 + _m12 * other.m22;
		this.#m20 = _m20 * other.m00 + _m21 * other.m10 + _m22 * other.m20;
		this.#m21 = _m20 * other.m01 + _m21 * other.m11 + _m22 * other.m21;
		this.#m22 = _m20 * other.m02 + _m21 * other.m12 + _m22 * other.m22;
		return this;
	}
	v_mul(other)
	{
		if(!(other instanceof Vector3d))return new Vector3d();
		return new Vector3(this.m00 * other.x + this.m01 * other.y + this.m02 * other.z,
			   			   this.m10 * other.x + this.m11 * other.y + this.m12 * other.z,
			  			   this.m20 * other.x + this.m21 * other.y + this.m22 * other.z);
	}
	rv_mul(other)
	{
		if(!(other instanceof Vector3d))return new Vector3d();
		return new Vector3(this.m00 * other.x + this.m10 * other.y + this.m20 * other.z,
			   			   this.m01 * other.x + this.m11 * other.y + this.m21 * other.z,
			  			   this.m02 * other.x + this.m12 * other.y + this.m22 * other.z);
	}
	static vec_mul(mat, vec)
	{
		if(!(mat instanceof Matrix3d))return new Vector3d();
		return mat.v_mul(vec);
	}
	static r_vec_mul(mat, vec)
	{
		if(!(mat instanceof Matrix3d))return new Vector3d();
		return mat.rv_mul(vec);
	}
	static mat_mul(left, right)
	{
		if(!(left  instanceof Matrix3d))return new Matrix3d();
		if(!(right instanceof Matrix3d))return new Matrix3d();
		return new Matrix3d(left.m00 * right.m00 + left.m01 * right.m10 + left.m02 * right.m20,
						   left.m00 * right.m01 + left.m01 * right.m11 + left.m02 * right.m21,
						   left.m00 * right.m02 + left.m01 * right.m12 + left.m02 * right.m22,
						   left.m10 * right.m00 + left.m11 * right.m10 + left.m12 * right.m20,
						   left.m10 * right.m01 + left.m11 * right.m11 + left.m12 * right.m21,
						   left.m10 * right.m02 + left.m11 * right.m12 + left.m12 * right.m22,
						   left.m20 * right.m00 + left.m21 * right.m10 + left.m22 * right.m20,
						   left.m20 * right.m01 + left.m21 * right.m11 + left.m22 * right.m21,
						   left.m20 * right.m02 + left.m21 * right.m12 + left.m22 * right.m22);
	}
	static r_mat_mul(left, right)
	{
		if(!(left  instanceof Matrix3d))return new Matrix3d();
		if(!(right instanceof Matrix3d))return new Matrix3d();
		return new Matrix3d(right.m00 * left.m00 + right.m01 * left.m10 + right.m02 * left.m20,
						   right.m00 * left.m01 + right.m01 * left.m11 + right.m02 * left.m21,
						   right.m00 * left.m02 + right.m01 * left.m12 + right.m02 * left.m22,
						   right.m10 * left.m00 + right.m11 * left.m10 + right.m12 * left.m20,
						   right.m10 * left.m01 + right.m11 * left.m11 + right.m12 * left.m21,
						   right.m10 * left.m02 + right.m11 * left.m12 + right.m12 * left.m22,
						   right.m20 * left.m00 + right.m21 * left.m10 + right.m22 * left.m20,
						   right.m20 * left.m01 + right.m21 * left.m11 + right.m22 * left.m21,
						   right.m20 * left.m02 + right.m21 * left.m12 + right.m22 * left.m22);
	}
	static build_transform_2d(position, scaling, rotation)
	{
		const cos = Math.cos(rotation);
		const sin = Math.sin(rotation);
		return new Matrix3d(cos * scaling.x, -sin * scaling.y, position.x,
							sin * scaling.x,  cos * scaling.y, position.y,
							0.0,  0.0, 1.0);
	}
	static build_inv_transform_2d(position, scaling, rotation)
	{
		const cos = Math.cos(rotation);
		const sin = Math.sin(rotation);
		const sx = 1.0 / scaling.x;
		const sy = 1.0 / scaling.y;
		return new Matrix3d( cos * sx, sin * sx, -( position.x * cos + position.y * sin) * sx,
							-sin * sy, cos * sy, -(-position.x * sin + position.y * cos) * sy,
							 0.0,  0.0, 1.0);
	}
	multiply_by_point(point)
	{
		if(!(point instanceof Vector2d))return new Vector2d();
		return new Vector2d(this.m00 * point.x + this.m01 * point.y + this.m02,
					        this.m10 * point.x + this.m11 * point.y + this.m12);
	}
	multiply_by_direction(point)
	{
		if(!(point instanceof Vector2d))return new Vector2d();
		return Vector2d(this.m00 * point.x + this.m01 * point.y,
					    this.m10 * point.x + this.m11 * point.y);
	}
}
class RectBounds
{
	#min_pt;
	#max_pt;	
	constructor(min, max)
	{
		this.#min_pt = (min instanceof Vector2d) ? new Vector2d(Math.min(min.x, max.x), Math.min(min.y, max.y)): new Vector2d(0.0, 0.0);
		this.#max_pt = (max instanceof Vector2d) ? new Vector2d(Math.max(min.x, max.x), Math.max(min.y, max.y)): new Vector2d(1.0, 1.0);
	}
	get width (){ return this.max.x - this.min.x; }
	get height(){ return this.max.y - this.min.y; }

	get min (){ return this.#min_pt; }
	get max (){ return this.#max_pt; }
	
	get size  (){ return new Vector2d( this.max.x - this.min.x,         this.max.y - this.min.y); }
	get center(){ return new Vector2d((this.max.x + this.min.x) * 0.5, (this.max.y + this.min.y) * 0.5);}
	set size(size)
	{
		if(!(size instanceof Vector2d))return;
		const center = this.center;
		this.#setup(size, center);
	}
	set center(center)
	{
		if(!(center instanceof Vector2d))return;
		const size = this.size;
		this.#setup(size, center);
	}
	#setup(size, center)
	{
		this.#min_pt = new Vector2d(center.x - size.x * 0.5, center.y - size.y * 0.5); 
		this.#max_pt = new Vector2d(center.x + size.x * 0.5, center.y + size.y * 0.5);
	}
	#contains(point)
	{
		if(point.x < this.min.x) return false;
		if(point.x > this.max.x) return false;
		if(point.y < this.min.y) return false;
		if(point.y > this.max.y) return false;
		return true;
	}
	contains(point)
	{
		if(!(point instanceof Vector2d))return false;
		return this.#contains(point);
	}
	contains_rect(rect)
	{
		if(!(rect instanceof RectBounds))return false;
		return this.#contains(rect.min)&&this.#contains(rect.max);
	}
	intersect_rect(rect)
	{
		if(!(rect instanceof RectBounds))return false;
		return this.#contains(rect.min)||this.#contains(rect.max);
	}
	distance(point)
	{
		if(!(point instanceof Vector2d))return 1e32;
		const orig = this.center;
        const size = this.size;

        const x_l = point.x - (orig.x - size.x * 0.5);
        const x_r = point.x - (orig.x + size.x * 0.5);

        const y_l = point.y - (orig.y - size.y * 0.5);
        const y_r = point.y - (orig.y + size.y * 0.5);

        return Math.max(Math.max(Math.abs(y_l), Math.abs(y_r)) - size.y, 
						Math.max(Math.abs(x_l), Math.abs(x_r)) - size.x);
	}
	get points()
	{
		const c = this.center;
        const s = this.size;
        return [new Vector2d(c.x - s.x * 0.5, c.y + s.y * 0.5),
				new Vector2d(c.x - s.x * 0.5, c.y - s.y * 0.5),
				new Vector2d(c.x + s.x * 0.5, c.y - s.y * 0.5),
				new Vector2d(c.x + s.x * 0.5, c.y + s.y * 0.5)];
	}
	get edges()
	{
		const points = this.points;
	    return [[points[0], points[1]],
				[points[1], points[2]],
				[points[2], points[3]],
				[points[3], points[0]]];
	}
}