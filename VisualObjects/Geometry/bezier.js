// f(t)=p_1 * (1−t)^3 + 3 * p_2 * t * (1 − t)^2 + 3_p * 3 * t^2 * (1 − t) + p4 * t^3
// f'(t)= p_1 * (1−t)^3 + 3 * p_2 * t * (1 − t)^2 + 3_p * 3 * t^2 * (1 − t) + p4 * t^3
/**
 * 
 * @param {Number} t 
 * @param {Vector2d} p1 
 * @param {Vector2d} p2 
 * @param {Vector2d} p3 
 * @param {Vector2d} p4 
 * @returns {Vector2d}
 */
const cubic_bezier = (t, p1, p2, p3, p4) => 
{
    const t1 = Math.pow((1.0 - t), 3.0);
    const t2 = 3.0 * t * Math.pow((1.0 - t), 2.0);
    const t3 = 3.0 * t * t * (1.0 - t);
    const t4 = t * t * t;
    return new Vector2d(p1.x * t1 + p2.x * t2 + p3.x * t3 + p4.x * t4,
                        p1.y * t1 + p2.y * t2 + p3.y * t3 + p4.y * t4);

}
const cubic_bezier_x = (t, p1, p2, p3, p4) => 
{
    const t1 = Math.pow((1.0 - t), 3.0);
    const t2 = 3.0 * t * Math.pow((1.0 - t), 2.0);
    const t3 = 3.0 * t * t * (1.0 - t);
    const t4 = t * t * t;
    return p1.x * t1 + p2.x * t2 + p3.x * t3 + p4.x * t4;
}

const cubic_bezier_y = (t, p1, p2, p3, p4) => 
{
    const t1 = Math.pow((1.0 - t), 3.0);
    const t2 = 3.0 * t * Math.pow((1.0 - t), 2.0);
    const t3 = 3.0 * t * t * (1.0 - t);
    const t4 = t * t * t;
    return p1.y * t1 + p2.y * t2 + p3.y * t3 + p4.y * t4;
}

const cubic_bezier_bounds_x = (p1, p2, p3, p4) =>
{
    const a =-3 * p1.x + 9  * p2.x - 9 * p3.x + 3 * p4.x;
    const b = 6 * p1.x - 12 * p2.x + 6 * p3.x;
    const c =-3 * p1.x + 3  * p2.x;
    if(Math.abs(a) < 1e-3)
    {
        if(Math.abs(b) < 1e-3) return new Vector2d(Math.min(p1.x, p4.x), Math.max(p1.x, p4.x));
        const x = cubic_bezier_x(-c / b, p1, p2, p3, p4);
        return Math.min(Math.min(x, p1.x), p4.x), Math.max(Math.max(x, p1.x), p4.x)
    }
    const d = b * b - a * c * 4.0;
    if(d <= 0) return new Vector2d(Math.min(p1.x, p4.x), Math.max(p1.x, p4.x));
    const sqd = Math.sqrt(d);
    const x_0 = cubic_bezier_x(Math.min(Math.max(0.0, (-sqd - b) / (2.0 * a)), 1.0), p1, p2, p3, p4);
    const x_1 = cubic_bezier_x(Math.min(Math.max(0.0, ( sqd - b) / (2.0 * a)), 1.0), p1, p2, p3, p4);
    return new Vector2d(Math.min(Math.min(Math.min(p1.x, p4.x), x_0), x_1),
                        Math.max(Math.max(Math.max(p1.x, p4.x), x_0), x_1));
}

const cubic_bezier_bounds_y = (p1, p2, p3, p4) =>
{
    const a =-3 * p1.y + 9  * p2.y - 9 * p3.y + 3 * p4.y;
    const b = 6 * p1.y - 12 * p2.y + 6 * p3.y;
    const c =-3 * p1.y + 3  * p2.y;
    if(Math.abs(a) < 1e-3)
    {
        if(Math.abs(b) < 1e-3) return new Vector2d(Math.min(p1.y, p4.y), Math.max(p1.y, p4.y));
        const y = cubic_bezier_y(-c / b, p1, p2, p3, p4);
        return Math.min(Math.min(y, p1.y), p4.y), Math.max(Math.max(y, p1.y), p4.y)
    }
    const d = b * b - a * c * 4.0
    if(d <= 0) return new Vector2d(Math.min(p1.y, p4.y), Math.max(p1.y, p4.y));
    const sqd = Math.sqrt(d);
    const y_0 = cubic_bezier_y(Math.min(Math.max(0.0, (-sqd - b) / (2.0 * a)), 1.0), p1, p2, p3, p4);
    const y_1 = cubic_bezier_y(Math.min(Math.max(0.0, ( sqd - b) / (2.0 * a)), 1.0), p1, p2, p3, p4);
    return new Vector2d(Math.min(Math.min(Math.min(p1.y, p4.y), y_0), y_1),
                        Math.max(Math.max(Math.max(p1.y, p4.y), y_0), y_1));
}

/**
 * 
 * @param {Vector2d} p1 
 * @param {Vector2d} p2 
 * @param {Vector2d} p3 
 * @param {Vector2d} p4 
 * @returns {RectBounds}
 */
const cubic_bezier_bounds = (p1, p2, p3, p4) => 
{
    const min_max_x = cubic_bezier_bounds_x(p1, p2, p3, p4);
    const min_max_y = cubic_bezier_bounds_y(p1, p2, p3, p4);
    return new RectBounds(new Vector2d(min_max_x.x, min_max_y.x), new Vector2d(min_max_x.y, min_max_y.y));
}

const is_close_to_segment = (point, p1, p2, threshold = 1.0) => 
{
	if (Vector2d.sub(point, p1).length <= threshold) return true;
	if (Vector2d.sub(point, p2).length <= threshold) return true;
	const  d    = Vector2d.sub(p2,    p1);
	const  k    = Vector2d.sub(point, p1);
	const  c    = Vector2d.dot(d, k) / d.sq_length;
	if (c > 0) return false; 
	const  dist = Math.sqrt(Math.pow(point.x - c * d.x, 2) + Math.pow(point.y - c * d.y, 2));
    return dist <= threshold;
}

const BEZIER_SECTIONS_PARAM_T = 
   [[0.0, 0.1],
    [0.1, 0.2],
    [0.2, 0.3],
    [0.3, 0.4],
    [0.4, 0.5],
    [0.5, 0.6],
    [0.6, 0.7],
    [0.7, 0.8],
    [0.8, 0.9],
    [0.9, 1.0]];

/**
 * 
 * @param {Vector2d} point 
 * @param {Vector2d} p1 
 * @param {Vector2d} p2 
 * @param {Vector2d} p3 
 * @param {Vector2d} p4 
 * @param {Number} threshold 
 * @returns {Boolean}
 */
const is_close_to_bezier = (point, p1, p2, p3, p4, threshold = 1.0) =>
{
    for(const [t1, t2] of BEZIER_SECTIONS_PARAM_T)
    {
        const bezier_p1 = cubic_bezier(t1, p1, p2, p3, p4);
        const bezier_p2 = cubic_bezier(t2, p1, p2, p3, p4);
        if(is_close_to_segment(point, bezier_p1, bezier_p2, threshold))return true;
    }
    return false;
}