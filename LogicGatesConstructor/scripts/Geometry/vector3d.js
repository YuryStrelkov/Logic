export class Vector3d {
    /**
     *
     * @param {Vector3d} lhs
     * @returns {Vector3d}
     */
    static abs(lhs) {
      return new Vector3d(Math.abs(lhs.x), Math.abs(lhs.y), Math.abs(lhs.z));
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static min(lhs, rhs) {
      return new Vector3d(
        Math.min(lhs.x, rhs.x),
        Math.min(lhs.y, rhs.y),
        Math.min(lhs.z, rhs.z)
      );
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static max(lhs, rhs) {
      return new Vector3d(
        Math.max(lhs.x, rhs.x),
        Math.max(lhs.y, rhs.y),
        Math.max(lhs.z, rhs.z)
      );
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @param {Number} t
     * @returns {Vector3d}
     */
    static lerp(lhs, rhs, t) {
      const _t = Math.min(Math.max(0.0, t), 1.0);
      return new Vector3d(
        lhs.x + (rhs.x - lhs.x) * _t,
        lhs.y + (rhs.y - lhs.y) * _t,
        lhs.z + (rhs.z - lhs.z) * _t
      );
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Number}
     */
    static dot(lhs, rhs) {
      return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static cross(lhs, rhs) {
      return new Vector3d(
        lhs.z * rhs.y - lhs.y * rhs.z,
        lhs.x * rhs.z - lhs.z * rhs.x,
        lhs.y * rhs.x - lhs.x * rhs.y
      );
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Number}
     */
    static angle(lhs, rhs) {
      return Math.acos(Vector3d.dot(lhs, rhs) * lhs.inv_length * rhs.inv_length);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static sub(lhs, rhs) {
      return new Vector3d(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static sum(lhs, rhs) {
      return new Vector3d(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static mul(lhs, rhs) {
      return new Vector3d(lhs.x * rhs.x, lhs.y * rhs.y, lhs.z * rhs.z);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Vector3d}
     */
    static div(lhs, rhs) {
      return new Vector3d(lhs.x / rhs.x, lhs.y / rhs.y, lhs.z / rhs.z);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Number}
     */
    static dist(lhs, rhs) {
      const x = rhs.x - lhs.x;
      const y = rhs.y - lhs.y;
      const z = rhs.z - lhs.z;
      return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     *
     * @param {Vector3d} lhs
     * @param {Vector3d} rhs
     * @returns {Number}
     */
    static manhattan_dist(lhs, rhs) {
      return Math.abs(rhs.x - lhs.x) + Math.abs(rhs.y - lhs.y) + Math.abs(rhs.z - lhs.z);
    }
    /**
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    constructor(x = 0.0, y = 0.0, z = 0.0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    get length_sqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    get length() {
      return Math.sqrt(this.length_sqr);
    }
    get inv_length() {
      return 1.0 / this.length;
    }
    get normalized() {
      const i_length = this.inv_length;
      return new Vector3d(
        this.x * i_length,
        this.y * i_length,
        this.z * i_length
      );
    }
    normalize() {
      const i_length = this.inv_length;
      this.x *= i_length;
      this.y *= i_length;
      this.z *= i_length;
      return this;
    }
    toString() {
      return `{"x": ${this.x}, "y": ${this.y}, "z": ${this.y}}`;
    }
}