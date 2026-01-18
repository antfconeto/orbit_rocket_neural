import PopulationManager from "./PopulationManager.js";
import Renderer from "./Renderer.js";

export default class Simulation {
  constructor(canvas) {
    this.renderer = new Renderer(canvas);

    this.population = new PopulationManager();

    this.tickCount = 0;

    this.isRunning = false;

    this._animationId = null;
  }

  init() {
    this.population.initialize();
    this.tickCount = 0;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this._loop();
  }

  stop() {
    this.isRunning = false;
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  _loop() {
    if (!this.isRunning) return;

    this._update();
    this._render();

    this._animationId = requestAnimationFrame(() => this._loop());
  }

  _update() {
    if (this.population.shouldEndEpoch(this.tickCount)) {
      this._startNewEpoch();
      return;
    }
    this.population.update();

    this.population.removeDeadRockets();

    this.tickCount++;
  }

  _render() {
    this.renderer.clear();
    this.renderer.drawStarts();
    const bodies = this.population.getAllBodies();
    this.renderer.drawBodies(bodies);
    const stats = this.population.getStats();
    this.renderer.drawUI({
      score: this.tickCount,
      epoch: stats.epoch,
      alive: stats.alive,
      bestOrbits: stats.bestOrbits,
      bestTtl: stats.bestTtl,
    });

    const lastRocket = this.population.getLastRocket();
    if (lastRocket) {
      this.renderer.drawNeuralNetwork(lastRocket);
    }
  }

  _startNewEpoch() {
    this.population.startNewEpoch();
    this.tickCount = 0;
  }

  getStats() {
    return {
      tickCount: this.tickCount,
      isRunning: this.isRunning,
      ...this.population.getStats(),
    };
  }
}
