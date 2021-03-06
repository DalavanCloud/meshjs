import Vector from "../math/vector.js";
import Rectangle from "./rectangle.js";
import Color from "../color/color.js";
import Shape from "./shape.js";

export default class Circle extends Shape {
  constructor(x, y_r, r) {
    super();

    if (x instanceof Vector) {
      this._center = x;
      r = y_r;
    } else {
      this._center = new Vector(x, y_r);
    }

    this._radius = r;
  }

  get center() {
    return this._center;
  }

  set center(vector) {
    this._center = vector;
  }

  draw(context) {
    if (context === undefined) {
      console.log("Circle.draw(context) : context is undefined.");
    }

    context.beginPath();
    context.arc(this._center.x, this._center.y, this._radius, 0, Math.PI * 2);

    if (this._fillColor !== undefined) {
      context.fillStyle =
        this._fillColor === undefined ? undefined : this._fillColor.toCSS();
      context.fill();
    }

    if (this._lineWidth && this._strokeColor !== undefined) {
      context.lineWidth = this._lineWidth;
      context.strokeStyle =
        this._strokeColor === undefined ? undefined : this._strokeColor.toCSS();
      context.stroke();
    }
  }

  //todo: remove this once we impliment full svg support
  toSVG() {
    //note, we dont use rgba for colors, but use hex amd exlpicit opacity
    //in order to maintain support with illustrator
    return `<circle cx="${this._center.x}" cy="${this._center.y}"
				r="${this._radius}" stroke="${this._strokeColor.toHex()}"
				fill-opacity="${this._fillColor.alpha}"
				stroke-opacity="${this._strokeColor.alpha}"
				fill="${this._fillColor.toHex()}" stroke-width="${this._lineWidth}"/>`;
  }

  get bounds() {
    let out = new Rectangle();
    out.x = this._center.x - this._radius;
    out.y = this._center.y - this._radius;
    out.width = this._radius * 2 + this._lineWidth;
    out.height = this._radius * 2 + this._lineWidth;

    return out;
  }

  containsPoint(vector) {
    return this._center.distance(vector) < this._radius;
  }

  set radius(radius) {
    this._radius = radius;
  }

  get radius() {
    return this._radius;
  }
}
