/**
 * @fileoverview Classe base para corpos físicos na simulação
 * @module entities/Body
 */

import { BODY_DEFAULTS, PHYSICS, SIMULATION } from "../config/constants.js";
import {
  calculateGravitationalForce,
  checkCircleCollision,
  resolveElasticCollision,
  isTooFar,
} from "../core/Physics.js";

export default class Body {
  constructor(config) {
    this.position = { ...config.position };
    this.velocity = config.velocity ? { ...config.velocity } : { x: 0, y: 0 };
    this.acceleration = config.acceleration
      ? { ...config.acceleration }
      : { x: 0, y: 0 };
    this.force = { x: 0, y: 0 };
    this.scale = { ...config.scale };
    this.model = config.model || BODY_DEFAULTS.MODEL;
    this.color = config.color || BODY_DEFAULTS.COLOR;
    this.mass = config.mass ?? BODY_DEFAULTS.MASS;
    this.name = "circle";
    this.isTouched = false;
    this.isFar = false;
    this.elasticConstant = PHYSICS.ELASTIC_CONSTANT;
    this.trail = [];
    this.trail.push({ position: { x: this.position.x, y: this.position.y } });
    this._ctx = null;
  }

  resetForce() {
    this.force.x = 0;
    this.force.y = 0;
  }

  addForce(force) {
    this.force.x += force.x;
    this.force.y += force.y;
  }

  update(other) {
    this.resetForce();
    this.applyGravitation(other);
    this.handleCollision(other);
    this._recordPosition();
  }

  applyGravitation(other) {
    if (other.name === "rocket") return;

    const collision = checkCircleCollision(this, other);
    if (collision.distance === 0) return;

    const force = calculateGravitationalForce(this, other);

    if (collision.distance >= collision.minDist) {
      this.addForce(force);
    }
  }

  handleCollision(other) {
    if (this.name !== "rocket" || other.name !== "circle") return;

    const collision = checkCircleCollision(this, other);
    if (collision.colliding) {
      const result = resolveElasticCollision(this, other, collision);
      if (result.bodyATouched) this.isTouched = true;
    }
  }

  applyPhysics() {
    if (this.name === "circle") return;

    this.acceleration.x += this.force.x / this.mass;
    this.acceleration.y += this.force.y / this.mass;

    this.velocity.x += this.acceleration.x * PHYSICS.TIME_STEP;
    this.velocity.y += this.acceleration.y * PHYSICS.TIME_STEP;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.force.x = 0;
    this.force.y = 0;
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  _recordPosition() {
    this.trail.push({
      position: { x: this.position.x, y: this.position.y },
    });

    if (this.trail.length > SIMULATION.TRAIL_MAX_LENGTH) {
      this.trail = this.trail.slice(2);
    }
  }

  drawTrail(ctx) {
    if (this.trail.length < 2) return;

    ctx.beginPath();
    for (let i = 1; i < this.trail.length; i++) {
      const prev = this.trail[i - 1].position;
      const curr = this.trail[i].position;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
    }
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.stroke();
  }

  draw(ctx) {
    this._ctx = ctx;
    ctx.globalAlpha = 1;

    ctx.fillStyle = this.color;

    if (this.model === "rect") {
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.scale.w,
        this.scale.h,
      );
    } else {
      ctx.beginPath();
      ctx.shadowBlur = 40;
      ctx.shadowColor = this.color;
      ctx.arc(this.position.x, this.position.y, this.scale.r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
}
