import {
  ROCKET,
  ACTIONS,
  NEURAL_NETWORK,
  FITNESS,
  PHYSICS,
} from "../config/constants.js";
import Body from "./Body.js";
import NeuralNetwork from "../neural/NeuralNetwork.js";
import Storage from "../storage/Storage.js";

export default class Rocket extends Body {
  constructor(config) {
    super({
      position: config.position,
      velocity: config.velocity || { x: 0, y: 0 },
      scale: config.scale || { r: ROCKET.RADIUS },
      model: config.model || "circle",
      color: config.color || ROCKET.COLOR,
      mass: config.mass ?? ROCKET.MASS,
    });

    this.name = "rocket";
    this.ttl = 0;
    this.orbits = 0;
    this.totalAngle = 0;
    this.lastAngle = null;
    this.fuel = ROCKET.FUEL;
    this.fitness = 0; // Novo: fitness acumulado
    this.brain = new NeuralNetwork();
    this._loadBrain();
    this.brain.perturbWeights(NEURAL_NETWORK.MUTATION_RATE);
  }

  _loadBrain() {
    const topRockets = Storage.loadTopRockets();
    if (topRockets && topRockets.length > 0) {
      const randomIndex = Math.floor(Math.random() * topRockets.length);
      this.brain.load(topRockets[randomIndex]);
    }
  }

  applyAction(actionIndex) {
    if (this.fuel <= 0) return;

    const thrust = ROCKET.THRUST_FORCE;
    let consumed = false;

    switch (actionIndex) {
      case ACTIONS.UP:
        this.addForce({ x: 0, y: -thrust });
        consumed = true;
        break;
      case ACTIONS.DOWN:
        this.addForce({ x: 0, y: thrust });
        consumed = true;
        break;
      case ACTIONS.RIGHT:
        this.addForce({ x: thrust, y: 0 });
        consumed = true;
        break;
      case ACTIONS.LEFT:
        this.addForce({ x: -thrust, y: 0 });
        consumed = true;
        break;
      case ACTIONS.NONE:
      default:
        break;
    }

    if (consumed) {
      this.fuel -= ROCKET.FUEL_CONSUMPTION;
    }
  }

  think(target) {
    const inputs = this._prepareInputs(target);
    const outputs = this.brain.forward(inputs);
    const actionIndex = NeuralNetwork.argmax(outputs);
    this.applyAction(actionIndex);
  }

  _prepareInputs(target) {
    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = PHYSICS.MAX_DISTANCE;


    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);


    const radialX = distance > 0 ? dx / distance : 0;
    const radialY = distance > 0 ? dy / distance : 0;
    const tangentX = -radialY; 
    const tangentY = radialX;

    const radialVelocity =
      this.velocity.x * radialX + this.velocity.y * radialY;
    const tangentVelocity =
      this.velocity.x * tangentX + this.velocity.y * tangentY;

    return [
      dx / maxDist, 
      dy / maxDist, 
      distance / maxDist, 
      radialVelocity * 100, 
      tangentVelocity * 100,
      this.velocity.x * 100,
      this.velocity.y * 100,
      this.acceleration.x * 1000,
      this.acceleration.y * 1000,
      this.force.x * 10000,
      this.force.y * 10000,
      this.fuel / ROCKET.FUEL,
    ];
  }

  update(target) {
    this.applyGravitation(target);
    this.handleCollision(target);
    this.applyPhysics();
    this.think(target);
    this._updatettl();
    this._trackOrbit(target);
    this._updateFitness(target);
    this._recordPosition();
  }

  _trackOrbit(target) {
    const dx = this.position.x - target.position.x;
    const dy = this.position.y - target.position.y;
    const currentAngle = Math.atan2(dy, dx);

    if (this.lastAngle !== null) {
      let deltaAngle = currentAngle - this.lastAngle;

      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      this.totalAngle += deltaAngle;
    }

    this.lastAngle = currentAngle;
  }

  _updateFitness(target) {
    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const proximityReward = FITNESS.PROXIMITY_WEIGHT / Math.max(distance, 10);

    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed > 0.0001 && distance > 0) {
      const radialX = (this.position.x - target.position.x) / distance;
      const radialY = (this.position.y - target.position.y) / distance;
      const tangentX = -radialY;
      const tangentY = radialX;

      const velNormX = this.velocity.x / speed;
      const velNormY = this.velocity.y / speed;
      const tangentAlign = Math.abs(tangentX * velNormX + tangentY * velNormY);

      this.fitness += tangentAlign * FITNESS.TANGENT_ALIGN_WEIGHT;
    }

    this.fitness += FITNESS.TIME_ALIVE_WEIGHT;

    const newOrbits = Math.floor(Math.abs(this.totalAngle) / (2 * Math.PI));
    if (newOrbits > this.orbits) {
      this.fitness += FITNESS.ORBIT_BONUS * (newOrbits - this.orbits);
      this.orbits = newOrbits;
    }

    if (distance > FITNESS.PENALTY_THRESHOLD) {
      const excess = distance - FITNESS.PENALTY_THRESHOLD;
      this.fitness -= excess * FITNESS.DISTANCE_PENALTY;
    }

    this.fitness += proximityReward;
  }

  _updatettl() {
    this.ttl++;
  }

  isDead() {
    return this.isTouched || this.isFar;
  }

  export() {
    return {
      ttl: this.ttl,
      orbits: this.orbits,
      fitness: this.fitness,
      ...this.brain.export(),
    };
  }
}
