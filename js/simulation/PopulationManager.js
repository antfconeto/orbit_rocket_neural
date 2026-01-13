import {
  SIMULATION,
  ROCKET,
  BODY_DEFAULTS,
  GENETICS,
  SPAWN,
} from "../config/constants.js";
import Body from "../entities/Body.js";
import Rocket from "../entities/Rocket.js";
import Storage from "../storage/Storage.js";

export default class PopulationManager {
  constructor(populationSize = SIMULATION.POPULATION_SIZE) {
    this.populationSize = populationSize;
    this.aliveRockets = [];
    this.deadRockets = [];
    this.centralBody = null;
    this.epoch = 0;
    this.averageFitness = 0;
    this.currentSpawnRange = null;
  }

  initialize() {
    this._createCentralBody();
    this._createRockets();
    this.deadRockets = [];
    this.epoch = 0;
  }

  _createCentralBody() {
    this.centralBody = new Body({
      model: "circle",
      scale: { r: BODY_DEFAULTS.RADIUS },
      color: BODY_DEFAULTS.COLOR,
      mass: BODY_DEFAULTS.MASS,
      position: { ...BODY_DEFAULTS.POSITION },
      velocity: { x: 0, y: 0 },
    });
  }

  _createRockets() {
    this.aliveRockets = [];
    const centerX = BODY_DEFAULTS.POSITION.x;
    const centerY = BODY_DEFAULTS.POSITION.y;

    // Sorteia aleatoriamente um range de spawn
    const randomIndex = Math.floor(Math.random() * SPAWN.RANGES.length);
    this.currentSpawnRange = SPAWN.RANGES[randomIndex];
    const minDist = this.currentSpawnRange.minDist;
    const maxDist = this.currentSpawnRange.maxDist;

    for (let i = 0; i < this.populationSize; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = minDist + Math.random() * (maxDist - minDist);

      const rocket = new Rocket({
        position: {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        },
        scale: { r: ROCKET.RADIUS },
        velocity: { x: 0, y: 0 },
        mass: ROCKET.MASS,
        color: ROCKET.COLOR,
        model: "circle",
      });

      this.aliveRockets.push(rocket);
    }
  }

  getAllBodies() {
    return [this.centralBody, ...this.aliveRockets];
  }

  getLastRocket() {
    if (this.aliveRockets.length > 0) {
      return this.aliveRockets[this.aliveRockets.length - 1];
    }
    return null;
  }

  update() {
    for (const rocket of this.aliveRockets) {
      rocket.update(this.centralBody);
    }
  }

  removeDeadRockets() {
    const stillAlive = [];

    for (const rocket of this.aliveRockets) {
      if (rocket.isDead()) {
        this.deadRockets.push(rocket);
      } else {
        stillAlive.push(rocket);
      }
    }

    this.aliveRockets = stillAlive;
  }

  shouldEndEpoch(tickCount) {
    return (
      this.aliveRockets.length === 0 ||
      tickCount > SIMULATION.MAX_TICKS_PER_EPOCH
    );
  }

  _updateAverageFitness() {
    const allRockets = [...this.aliveRockets, ...this.deadRockets];
    if (allRockets.length > 0) {
      const totalFitness = allRockets.reduce((sum, r) => sum + r.fitness, 0);
      this.averageFitness = totalFitness / allRockets.length;
    }
  }

  saveBest() {
    const allRockets = [...this.aliveRockets, ...this.deadRockets];

    if (allRockets.length === 0) return;

    allRockets.sort((a, b) => b.fitness - a.fitness);

    const topCount = Math.max(
      1,
      Math.floor(allRockets.length * GENETICS.TOP_PERCENTAGE)
    );

    let existingTop = Storage.loadTopRockets();
    if (!Array.isArray(existingTop)) existingTop = [];
    existingTop = existingTop.filter((r) => r !== null && r !== undefined);

    const newRockets = [];
    for (let i = 0; i < topCount; i++) {
      newRockets.push(allRockets[i].export());
    }
    const combined = [...existingTop, ...newRockets].filter((r) => r !== null);
    combined.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
    const finalTop = combined.slice(0, topCount);

    const bestOld = existingTop.length > 0 ? existingTop[0]?.fitness || 0 : 0;
    const bestNew = finalTop.length > 0 ? finalTop[0]?.fitness || 0 : 0;

    if (bestNew > bestOld) {
      console.log(
        `🚀 Época ${this.epoch} - MELHORIA! Best fitness: ${bestOld.toFixed(
          1
        )} → ${bestNew.toFixed(1)}`
      );
    } else {
      console.log(
        `📊 Época ${this.epoch} - Best fitness: ${bestNew.toFixed(
          1
        )} (sem melhoria)`
      );
    }

    Storage.saveTopRockets(finalTop);
    this._updateAverageFitness();
  }

  startNewEpoch() {
    this.saveBest();
    this._createCentralBody();
    this._createRockets();
    this.deadRockets = [];
    this.epoch++;
  }

  getStats() {
    const allRockets = [...this.aliveRockets, ...this.deadRockets];
    let bestOrbits = 0;
    let bestTtl = 0;
    let bestFitness = 0;

    for (const rocket of allRockets) {
      if (rocket.orbits > bestOrbits) {
        bestOrbits = rocket.orbits;
      }
      if (rocket.ttl > bestTtl) {
        bestTtl = rocket.ttl;
      }
      if (rocket.fitness > bestFitness) {
        bestFitness = rocket.fitness;
      }
    }

    return {
      epoch: this.epoch,
      alive: this.aliveRockets.length,
      dead: this.deadRockets.length,
      total: this.populationSize,
      bestOrbits: bestOrbits,
      bestTtl: bestTtl,
      bestFitness: bestFitness,
      spawnRange: this.currentSpawnRange
        ? `${this.currentSpawnRange.minDist}-${this.currentSpawnRange.maxDist}`
        : "N/A",
      avgFitness: this.averageFitness.toFixed(1),
    };
  }
}
