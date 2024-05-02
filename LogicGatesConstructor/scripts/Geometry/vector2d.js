export class Vector2d {
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static min(lhs, rhs) {
      return new Vector2d(Math.min(lhs.x, rhs.x), Math.min(lhs.y, rhs.y));
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static max(lhs, rhs) {
      return new Vector2d(Math.max(lhs.x, rhs.x), Math.max(lhs.y, rhs.y));
    }
    /**
     *
     * @param {Vector2d} lhs
     * @returns {Vector2d}
     */
    static abs(lhs) {
      return new Vector2d(Math.abs(lhs.x), Math.abs(lhs.y));
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static lerp(lhs, rhs, t) {
      const _t = Math.min(Math.max(0.0, t), 1.0);
      return new Vector2d(lhs.x + (rhs.x - lhs.x) * _t, lhs.y + (rhs.y - lhs.y) * _t);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Number}
     */
    static dot(lhs, rhs) {
      return lhs.x * rhs.x + lhs.y * rhs.y;
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Number}
     */
    static cross(lhs, rhs) {
      return lhs.x * rhs.y - lhs.y * rhs.x;
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Number}
     */
    static angle(lhs, rhs) {
      return Math.acos(Vector2d.dot(lhs, rhs) * lhs.inv_length * rhs.inv_length);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static sub(lhs, rhs) {
      return new Vector2d(lhs.x - rhs.x, lhs.y - rhs.y);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static sum(lhs, rhs) {
      return new Vector2d(lhs.x + rhs.x, lhs.y + rhs.y);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static mul(lhs, rhs) {
      return new Vector2d(lhs.x * rhs.x, lhs.y * rhs.y);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Vector2d}
     */
    static div(lhs, rhs) {
      return new Vector2d(lhs.x / rhs.x, lhs.y / rhs.y);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Number}
     */
    static dist(lhs, rhs) {
      const x = rhs.x - lhs.x;
      const y = rhs.y - lhs.y;
      return Math.sqrt(x * x + y * y);
    }
    /**
     *
     * @param {Vector2d} lhs
     * @param {Vector2d} rhs
     * @returns {Number}
     */
    static manhattan_dist(lhs, rhs) {
      return Math.abs(rhs.x - lhs.x) + Math.abs(rhs.y - lhs.y);
    }
  
    static distance_to_line(point, p1, p2) {
      const pp1  = Vector2d.sub(point, p1);
      const p2p1 = Vector2d.sub(p2, p1);
      const projection_l = Vector2d.dot(pp1, p2p1) * p2p1.inv_length;
      return new Vector2d(p2p1.x * projection_l - point.x, p2p1.y * projection_l - point.y)
        .length;
    }
    /**
     *
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x = 0.0, y = 0.0) {
      this.x = x;
      this.y = y;
    }
    get length_sqr() {
      return this.x * this.x + this.y * this.y;
    }
    get length() {
      return Math.sqrt(this.length_sqr);
    }
    get inv_length() {
      return 1.0 / this.length;
    }
    get normalized() {
      const i_length = this.inv_length;
      return new Vector2d(this.x * i_length, this.y * i_length);
    }
    normalize() {
      const i_length = this.inv_length;
      this.x *= i_length;
      this.y *= i_length;
      return this;
    }
    toString() {
      return `{"x": ${this.x}, "y": ${this.y}}`;
    }
}