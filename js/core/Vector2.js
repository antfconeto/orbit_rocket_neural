export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static fromObject(obj) {
        return new Vector2(obj.x || 0, obj.y || 0);
    }

    static zero() {
        return new Vector2(0, 0);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }


    toObject() {
        return { x: this.x, y: this.y };
    }


    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }


    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }


    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }


    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }


    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }


    distanceTo(v) {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }


    reset() {
        this.x = 0;
        this.y = 0;
        return this;
    }


    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }


    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}
