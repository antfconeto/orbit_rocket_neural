import { PHYSICS } from "../config/constants.js";

export function calculateGravitationalForce(bodyA, bodyB) {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distanceSquared = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSquared);

  if (distance === 0) {
    return { x: 0, y: 0 };
  }

  const forceMagnitude =
    (PHYSICS.GRAVITATIONAL_CONSTANT * (bodyA.mass * bodyB.mass)) /
    distanceSquared;

  return {
    x: forceMagnitude * (dx / distance),
    y: forceMagnitude * (dy / distance),
  };
}

export function checkCircleCollision(bodyA, bodyB) {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDist = (bodyA.scale.r || 0) + (bodyB.scale.r || 0);

  return {
    colliding: distance < minDist,
    distance,
    dx,
    dy,
    minDist,
  };
}

export function isTooFar(bodyA, bodyB, maxDistance = PHYSICS.MAX_DISTANCE) {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance > maxDistance;
}

export function resolveElasticCollision(bodyA, bodyB, collisionData) {
  const { distance, dx, dy, minDist } = collisionData;

  if (distance === 0) return { bodyATouched: false, bodyBTouched: false };

  const overlap = minDist - distance;
  const angle = Math.atan2(dy, dx);


  bodyA.position.x -= Math.cos(angle) * overlap;
  bodyA.position.y -= Math.sin(angle) * overlap;

  const nx = dx / distance;
  const ny = dy / distance;

  const kx = bodyA.velocity.x - bodyB.velocity.x;
  const ky = bodyA.velocity.y - bodyB.velocity.y;
  const relativeVelocity = kx * nx + ky * ny;

  if (relativeVelocity <= 0) {
    return { bodyATouched: true, bodyBTouched: false };
  }


  const impulse =
    -(1 + PHYSICS.ELASTIC_CONSTANT) * relativeVelocity * bodyA.mass;

  bodyA.velocity.x += (impulse / bodyA.mass) * nx;
  bodyA.velocity.y += (impulse / bodyA.mass) * ny;

  return { bodyATouched: true, bodyBTouched: false };
}
