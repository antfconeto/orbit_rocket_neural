import { CANVAS } from "../config/constants.js";
import NeuralNetworkVisualizer from "../visualization/NeuralNetworkVisualizer.js";

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;

    // Generate star positions once
    this.stars = [];
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5, // Random size between 0.5 and 2
      });
    }

    const visWidth = 300;
    const visHeight = 350;
    this.nnVisualizer = new NeuralNetworkVisualizer(
      this.ctx,
      this.canvas.width - visWidth - 100,
      this.canvas.height - visHeight - 100,
      visWidth,
      visHeight
    );
  }

  clear() {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
    this.ctx.fillStyle = "rgba(4, 4, 29, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBodies(bodies, drawTrails = true) {
    for (const body of bodies) {
      if (drawTrails) {
        body.drawTrail(this.ctx);
      }
      body.draw(this.ctx);
    }
  }

  drawStarts(){
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "white";
    for (const star of this.stars) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      this.ctx.fill();
      this.ctx.closePath();
    }
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
  }

  drawUI(stats) {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "white";

    this.ctx.fillText(`Tick: ${stats.score}`, 10, 55);
    this.ctx.fillText(`Spawn: ${stats.spawnRange || "N/A"}px`, 10, 80);
    this.ctx.fillText(`Alive: ${stats.alive}`, 10, 105);
    this.ctx.fillText(`Best Orbits: ${stats.bestOrbits || 0}`, 10, 130);
  }

  drawNeuralNetwork(rocket) {
    this.nnVisualizer.draw(rocket);
  }

  drawMessage(message) {
    this.ctx.font = "32px Arial";
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

    const textWidth = this.ctx.measureText(message).width;
    const x = (this.canvas.width - textWidth) / 2;
    const y = this.canvas.height / 2;

    this.ctx.fillText(message, x, y);
  }

  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
