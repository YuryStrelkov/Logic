import { Vector2d } from "./vector2d.js";
import { Vector3d } from "./vector3d.js";
import { DEG_TO_RAD, NUMERICAL_ACCURACY } from "./constants.js";

export class Matrix3d {
    static identity() {
      return new Matrix3d();
    }
    static zeros() {
      return new Matrix3d(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }
    static ones() {
      return new Matrix3d(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0);
    }
    constructor(
      m00 = 1.0,
      m01 = 0.0,
      m02 = 0.0,
      m10 = 0.0,
      m11 = 1.0,
      m12 = 0.0,
      m20 = 0.0,
      m21 = 0.0,
      m22 = 1.0
    ) {
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
    get right() {
      return new Vector3d(this.m00, this.m10, this.m20);
    }
    get up() {
      return new Vector3d(this.m01, this.m11, this.m21);
    }
    get front() {
      return new Vector3d(this.m02, this.m12, this.m22);
    }
    static rotate_x(angle, angle_in_rad = true) {
      if (!angle_in_rad) angle *= DEG_TO_RAD;
      const cos_a = Math.cos(angle);
      const sin_a = Math.sin(angle);
      return new Matrix3d(1.0, 0.0, 0.0, 0.0, cos_a, -sin_a, 0.0, sin_a, cos_a);
    }
    static rotate_y(angle, angle_in_rad = true) {
      if (!angle_in_rad) angle *= DEG_TO_RAD;
      const cos_a = Math.cos(angle);
      const sin_a = Math.sin(angle);
      return new Matrix3d(cos_a, 0.0, sin_a, 0.0, 1.0, 0.0, -sin_a, 0.0, cos_a);
    }
    static rotate_z(angle, angle_in_rad = true) {
      if (!angle_in_rad) angle *= DEG_TO_RAD;
      const cos_a = Math.cos(angle);
      const sin_a = Math.sin(angle);
      return new Matrix3d(cos_a, -sin_a, 0.0, sin_a, cos_a, 0.0, 0.0, 0.0, 1.0);
    }
    static rotate(roll, pitch, yaw, angles_in_rad = true) {
      if (angles_in_rad) {
        const cr = Math.cos(roll);
        const sr = Math.sin(roll);
        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        return new Matrix3d(
          cp * cy,
          sr * sp * cy - cr * sy,
          cr * sp * cy + sr * sy,
          cp * sy,
          sr * sp * sy + cr * cy,
          cr * sp * sy - sr * cy,
          -sp,
          sr * cp,
          cr * cp
        );
      }
      const cr = Math.cos(roll * DEG_TO_RAD);
      const sr = Math.sin(roll * DEG_TO_RAD);
      const cp = Math.cos(pitch * DEG_TO_RAD);
      const sp = Math.sin(pitch * DEG_TO_RAD);
      const cy = Math.cos(yaw * DEG_TO_RAD);
      const sy = Math.sin(yaw * DEG_TO_RAD);
      return new Matrix3d(
        cp * cy,
        sr * sp * cy - cr * sy,
        cr * sp * cy + sr * sy,
        cp * sy,
        sr * sp * sy + cr * cy,
        cr * sp * sy - sr * cy,
        -sp,
        sr * cp,
        cr * cp
      );
    }
    get euler_angles() {
      if (Math.abs(this.m20 + 1.0) < NUMERICAL_ACCURACY)
        return new Vector3d(0.0, Math.PI * 0.5, Math.atan2(this.m01, this.m02));
  
      if (Math.abs(this.m20 - 1.0) < NUMERICAL_ACCURACY)
        return new Vector3d(
          0.0,
          -Math.PI * 0.5,
          Math.atan2(-this.m01, -this.m02)
        );
      const x1 = -Math.asin(this.m20);
      const inv_cos_x1 = 1.0 / Math.cos(x1);
      const x2 = Math.PI + x1;
      const inv_cos_x2 = 1.0 / Math.cos(x1);
      const y1 = Math.atan2(this.m21 * inv_cos_x1, this.m22 * inv_cos_x1);
      const y2 = Math.atan2(this.m21 * inv_cos_x2, this.m22 * inv_cos_x2);
      const z1 = Math.atan2(this.m10 * inv_cos_x1, this.m00 * inv_cos_x1);
      const z2 = Math.atan2(this.m10 * inv_cos_x2, this.m00 * inv_cos_x2);
      if (
        Math.abs(x1) + Math.abs(y1) + Math.abs(z1) <=
        Math.abs(x2) + Math.abs(y2) + Math.abs(z2)
      )
        return new Vector3d(y1, x1, z1);
      return new Vector3d(y2, x2, z2);
    }
    get det() {
      return (
        this.m00 * (this.m11 * this.m22 - this.m21 * this.m12) -
        this.m01 * (this.m10 * this.m22 - this.m12 * this.m20) +
        this.m02 * (this.m10 * this.m21 - this.m11 * this.m20)
      );
    }
    invert() {
      var det = this.det;
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
  
      this.m00 = (_m11 * _m22 - _m21 * _m12) * det;
      this.m10 = (_m02 * _m21 - _m01 * _m22) * det;
      this.m20 = (_m01 * _m12 - _m02 * _m11) * det;
      this.m01 = (_m12 * _m20 - _m10 * _m22) * det;
      this.m11 = (_m00 * _m22 - _m02 * _m20) * det;
      this.m21 = (_m10 * _m02 - _m00 * _m12) * det;
      this.m02 = (_m10 * _m21 - _m20 * _m11) * det;
      this.m12 = (_m20 * _m01 - _m00 * _m21) * det;
      this.m22 = (_m00 * _m11 - _m10 * _m01) * det;
      return this;
    }
    m_mul(other) {
      const _m00 = this.m00;
      const _m01 = this.m01;
      const _m02 = this.m02;
      const _m10 = this.m10;
      const _m11 = this.m11;
      const _m12 = this.m12;
      const _m20 = this.m20;
      const _m21 = this.m21;
      const _m22 = this.m22;
  
      this.m00 = other.m00 * _m00 + other.m01 * _m10 + other.m02 * _m20;
      this.m01 = other.m00 * _m01 + other.m01 * _m11 + other.m02 * _m21;
      this.m02 = other.m00 * _m02 + other.m01 * _m12 + other.m02 * _m22;
      this.m10 = other.m10 * _m00 + other.m11 * _m10 + other.m12 * _m20;
      this.m11 = other.m10 * _m01 + other.m11 * _m11 + other.m12 * _m21;
      this.m12 = other.m10 * _m02 + other.m11 * _m12 + other.m12 * _m22;
      this.m20 = other.m20 * _m00 + other.m21 * _m10 + other.m22 * _m20;
      this.m21 = other.m20 * _m01 + other.m21 * _m11 + other.m22 * _m21;
      this.m22 = other.m20 * _m02 + other.m21 * _m12 + other.m22 * _m22;
      return this;
    }
    rm_mul(other) {
      const _m00 = this.m00;
      const _m01 = this.m01;
      const _m02 = this.m02;
      const _m10 = this.m10;
      const _m11 = this.m11;
      const _m12 = this.m12;
      const _m20 = this.m20;
      const _m21 = this.m21;
      const _m22 = this.m22;
  
      this.m00 = _m00 * other.m00 + _m01 * other.m10 + _m02 * other.m20;
      this.m01 = _m00 * other.m01 + _m01 * other.m11 + _m02 * other.m21;
      this.m02 = _m00 * other.m02 + _m01 * other.m12 + _m02 * other.m22;
      this.m10 = _m10 * other.m00 + _m11 * other.m10 + _m12 * other.m20;
      this.m11 = _m10 * other.m01 + _m11 * other.m11 + _m12 * other.m21;
      this.m12 = _m10 * other.m02 + _m11 * other.m12 + _m12 * other.m22;
      this.m20 = _m20 * other.m00 + _m21 * other.m10 + _m22 * other.m20;
      this.m21 = _m20 * other.m01 + _m21 * other.m11 + _m22 * other.m21;
      this.m22 = _m20 * other.m02 + _m21 * other.m12 + _m22 * other.m22;
      return this;
    }
    v_mul(other) {
      return new Vector3d(
        this.m00 * other.x + this.m01 * other.y + this.m02 * other.z,
        this.m10 * other.x + this.m11 * other.y + this.m12 * other.z,
        this.m20 * other.x + this.m21 * other.y + this.m22 * other.z
      );
    }
    rv_mul(other) {
      return new Vector3d(
        this.m00 * other.x + this.m10 * other.y + this.m20 * other.z,
        this.m01 * other.x + this.m11 * other.y + this.m21 * other.z,
        this.m02 * other.x + this.m12 * other.y + this.m22 * other.z
      );
    }
    static vec_mul(mat, vec) {
      return mat.v_mul(vec);
    }
    static r_vec_mul(mat, vec) {
      return mat.rv_mul(vec);
    }
    static mat_mul(left, right) {
      return new Matrix3d(
        left.m00 * right.m00 + left.m01 * right.m10 + left.m02 * right.m20,
        left.m00 * right.m01 + left.m01 * right.m11 + left.m02 * right.m21,
        left.m00 * right.m02 + left.m01 * right.m12 + left.m02 * right.m22,
        left.m10 * right.m00 + left.m11 * right.m10 + left.m12 * right.m20,
        left.m10 * right.m01 + left.m11 * right.m11 + left.m12 * right.m21,
        left.m10 * right.m02 + left.m11 * right.m12 + left.m12 * right.m22,
        left.m20 * right.m00 + left.m21 * right.m10 + left.m22 * right.m20,
        left.m20 * right.m01 + left.m21 * right.m11 + left.m22 * right.m21,
        left.m20 * right.m02 + left.m21 * right.m12 + left.m22 * right.m22
      );
    }
    static r_mat_mul(left, right) {
      return new Matrix3d(
        right.m00 * left.m00 + right.m01 * left.m10 + right.m02 * left.m20,
        right.m00 * left.m01 + right.m01 * left.m11 + right.m02 * left.m21,
        right.m00 * left.m02 + right.m01 * left.m12 + right.m02 * left.m22,
        right.m10 * left.m00 + right.m11 * left.m10 + right.m12 * left.m20,
        right.m10 * left.m01 + right.m11 * left.m11 + right.m12 * left.m21,
        right.m10 * left.m02 + right.m11 * left.m12 + right.m12 * left.m22,
        right.m20 * left.m00 + right.m21 * left.m10 + right.m22 * left.m20,
        right.m20 * left.m01 + right.m21 * left.m11 + right.m22 * left.m21,
        right.m20 * left.m02 + right.m21 * left.m12 + right.m22 * left.m22
      );
    }
    static build_transform_2d(position, scaling, rotation) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      return new Matrix3d(
        cos * scaling.x,
        -sin * scaling.y,
        position.x,
        sin * scaling.x,
        cos * scaling.y,
        position.y,
        0.0,
        0.0,
        1.0
      );
    }
    static build_inv_transform_2d(position, scaling, rotation) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const sx = 1.0 / scaling.x;
      const sy = 1.0 / scaling.y;
      return new Matrix3d(
        cos * sx,
        sin * sx,
        -(position.x * cos + position.y * sin) * sx,
        -sin * sy,
        cos * sy,
        -(-position.x * sin + position.y * cos) * sy,
        0.0,
        0.0,
        1.0
      );
    }
    multiply_by_point(point) {
      return new Vector2d(
        this.m00 * point.x + this.m01 * point.y + this.m02,
        this.m10 * point.x + this.m11 * point.y + this.m12
      );
    }
    multiply_by_direction(point) {
      return new Vector2d(
        this.m00 * point.x + this.m01 * point.y,
        this.m10 * point.x + this.m11 * point.y
      );
    }
    toString() {
      return (
        "{" +
        `\n\t"m00": ${this.m00}, "m01": ${this.m01}, "m02": ${this.m02},` +
        `\n\t"m10": ${this.m10}, "m11": ${this.m11}, "m12": ${this.m12},` +
        `\n\t"m20": ${this.m20}, "m21": ${this.m21}, "m22": ${this.m22},\n` +
        "}"
      );
    }
}