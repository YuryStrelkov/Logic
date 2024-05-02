import {Vector2d} from "./vector2d.js"

export class RectBounds {
    #min_pt;
    #max_pt;
    /**
     *
     * @param {Vector2d} min
     * @param {Vector2d} max
     */
    constructor(min = null, max = null) {
      // TODO refactor...
      this.#min_pt =
        min == null
          ? new Vector2d(0, 0)
          : new Vector2d(Math.min(min.x, max.x), Math.min(min.y, max.y));
      this.#max_pt =
        max == null
          ? new Vector2d(
              Math.max(this.#min_pt.x, 1.0),
              Math.max(this.#min_pt.y, 1.0)
            )
          : new Vector2d(Math.max(min.x, max.x), Math.max(min.y, max.y));
    }
    get shape() {
      return new Vector2d(this.width, this.height);
    }
    get width() {
      return this.max.x - this.min.x;
    }
    get height() {
      return this.max.y - this.min.y;
    }
    get min() {
      return this.#min_pt;
    }
    get max() {
      return this.#max_pt;
    }
    get size() {
      return new Vector2d(this.max.x - this.min.x, this.max.y - this.min.y);
    }
    get center() {
      return new Vector2d(
        (this.max.x + this.min.x) * 0.5,
        (this.max.y + this.min.y) * 0.5
      );
    }
    set size(size) {
      const center = this.center;
      this.#setup(size, center);
    }
    set center(center) {
      const size = this.size;
      this.#setup(size, center);
    }
    #setup(size, center) {
      this.#min_pt = new Vector2d(
        center.x - size.x * 0.5,
        center.y - size.y * 0.5
      );
      this.#max_pt = new Vector2d(
        center.x + size.x * 0.5,
        center.y + size.y * 0.5
      );
    }
    #contains(point) {
      if (point.x < this.min.x) return false;
      if (point.x > this.max.x) return false;
      if (point.y < this.min.y) return false;
      if (point.y > this.max.y) return false;
      return true;
    }
    encapsulate(point) {
      this.#min_pt = Vector2d.min(this.#min_pt, point);
      this.#max_pt = Vector2d.max(this.#max_pt, point);
    }
    contains(point) {
      return this.#contains(point);
    }
    contains_rect(rect) {
      return this.#contains(rect.min) && this.#contains(rect.max);
    }
    intersect_rect(rect) {
      return this.#contains(rect.min) || this.#contains(rect.max);
    }
    distance(point) {
      const orig = this.center;
      const size = this.size;
      const x_l = point.x - (orig.x - size.x * 0.5);
      const x_r = point.x - (orig.x + size.x * 0.5);
      const y_l = point.y - (orig.y - size.y * 0.5);
      const y_r = point.y - (orig.y + size.y * 0.5);
      return Math.max(
        Math.max(Math.abs(y_l), Math.abs(y_r)) - size.y,
        Math.max(Math.abs(x_l), Math.abs(x_r)) - size.x
      );
    }
    get points() {
      const c = this.center;
      const s = this.size;
      return [
        new Vector2d(c.x - s.x * 0.5, c.y + s.y * 0.5),
        new Vector2d(c.x - s.x * 0.5, c.y - s.y * 0.5),
        new Vector2d(c.x + s.x * 0.5, c.y - s.y * 0.5),
        new Vector2d(c.x + s.x * 0.5, c.y + s.y * 0.5),
      ];
    }
    get edges() {
      const points = this.points;
      return [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]],
      ];
    }
    toString() {
      return `{\n\t"min": ${this.min},\n\t"max": ${this.max}\n}`;
    }
  }