import { NEURAL_NETWORK, ACTIONS } from "../config/constants.js";

export default class NeuralNetworkVisualizer {
  neuron = {
    width: 26,
    height: 16,
  };
  constructor(ctx, x, y, width, height) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Labels para inputs e outputs
    this.inputLabels = [
      "posX",
      "posY",
      "accX",
      "accY",
      "velX",
      "velY",
      "forceX",
      "forceY",
      "targetX",
      "targetY",
      "dx",
      "dy",
      "dist",
      "fuel",
    ];
    this.outputLabels = ["UP", "DOWN", "RIGHT", "LEFT", "NONE"];
  }

  draw(rocket) {
    if (!rocket || !rocket.brain) return;

    const brain = rocket.brain;
    const activations = brain.activations || [];
    const layers = brain.layers;
    const weights = brain.weights;

    if (!layers || layers.length === 0) return;

    this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
    this.ctx.fillStyle = "#ffffffff";
    this.ctx.font = "14px Arial";
    this.ctx.fillText("Neural Network - Last Rocket", this.x + 10, this.y + 20);

    const layerPositions = this._calculateLayerPositions(layers);

    this._drawConnections(layerPositions, weights, activations);

    this._drawNeurons(layerPositions, activations, layers);

    this._drawLabels(layerPositions, layers);
  }

  _calculateLayerPositions(layers) {
    const positions = [];
    const padding = 40;
    const usableWidth = this.width - padding * 2;
    const usableHeight = this.height - padding * 2;

    const layerSpacing = usableWidth / (layers.length - 1);

    for (let l = 0; l < layers.length; l++) {
      const layerNeurons = [];
      const neuronCount = layers[l];
      const maxNeuronsToShow = Math.min(neuronCount, 14);
      const neuronSpacing = usableHeight / (maxNeuronsToShow + 1);

      for (let n = 0; n < maxNeuronsToShow; n++) {
        layerNeurons.push({
          x: this.x + padding + l * layerSpacing,
          y: this.y + padding + (n + 1) * neuronSpacing,
          index: n,
        });
      }
      positions.push(layerNeurons);
    }

    return positions;
  }

  _drawConnections(positions, weights, activations) {
    if (!weights) return;

    for (let l = 0; l < positions.length - 1; l++) {
      const currentLayer = positions[l];
      const nextLayer = positions[l + 1];
      const layerWeights = weights[l];

      if (!layerWeights) continue;

      for (let i = 0; i < currentLayer.length; i++) {
        for (let j = 0; j < nextLayer.length; j++) {
          if (!layerWeights[j] || layerWeights[j][i] === undefined) continue;

          const weight = layerWeights[j][i];
          let rawActivation = activations[l] ? activations[l][i] : 0;
          if (typeof rawActivation !== "number" || isNaN(rawActivation)) {
            rawActivation = 0;
          }
          const activation = Math.max(0, Math.min(1, rawActivation));

          const intensity = Math.abs(weight) * activation;
          const alpha = Math.min(1, intensity * 2);
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = "rgba(255, 255, 255, 1)";
          if (weight > 0) {
            this.ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
          } else {
            this.ctx.strokeStyle = `rgba(255, 255, 255, 0.0)`;
          }

          this.ctx.lineWidth = Math.max(0.5, Math.abs(weight) * 2);
          this.ctx.beginPath();
          this.ctx.moveTo(
            currentLayer[i].x + this.neuron.width,
            currentLayer[i].y + this.neuron.height / 2,
          );
          this.ctx.lineTo(
            nextLayer[j].x,
            nextLayer[j].y + this.neuron.height / 2,
          );
          this.ctx.stroke();
        }
      }
    }
  }

  _drawNeurons(positions, activations, layers) {
    for (let l = 0; l < positions.length; l++) {
      const layer = positions[l];

      for (let n = 0; n < layer.length; n++) {
        const neuron = layer[n];

        let rawActivation = activations[l] ? activations[l][n] : 0;
        if (typeof rawActivation !== "number" || isNaN(rawActivation)) {
          rawActivation = 0;
        }
        const activation = Math.max(0, Math.min(1, rawActivation));

        this.ctx.fillStyle = `rgba(255, 255, 255, 1)`;

        let fillRectPercent =
          activation * 100 < 0
            ? 0
            : activation * 100 > 100
              ? 100
              : activation * 100;
        this.ctx.beginPath();
        this.ctx.rect(
          neuron.x,
          neuron.y,
          (this.neuron.width * fillRectPercent) / 100,
          this.neuron.height,
        );
        this.ctx.fill();
        this.ctx.strokeStyle = "#ffffffff";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.rect(
          neuron.x,
          neuron.y,
          this.neuron.width,
          this.neuron.height,
        );
        this.ctx.stroke();
      }
    }
  }

  _drawLabels(positions, layers) {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
    this.ctx.font = "9px Arial";
    this.ctx.fillStyle = "#ffffffff";

    const inputLayer = positions[0];
    for (let i = 0; i < inputLayer.length && i < this.inputLabels.length; i++) {
      this.ctx.fillText(
        this.inputLabels[i],
        inputLayer[i].x - 35,
        inputLayer[i].y + 3,
      );
    }

    const outputLayer = positions[positions.length - 1];
    for (
      let i = 0;
      i < outputLayer.length && i < this.outputLabels.length;
      i++
    ) {
      this.ctx.fillText(
        this.outputLabels[i],
        outputLayer[i].x + 12,
        outputLayer[i].y + 3,
      );
    }
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";
    this.ctx.fillStyle = "#ffffffff";
    this.ctx.font = "10px Arial";
    for (let l = 0; l < positions.length; l++) {
      const label =
        l === 0
          ? "Input"
          : l === positions.length - 1
            ? "Output"
            : `Hidden ${l}`;
      this.ctx.fillText(
        label,
        positions[l][0].x - 15,
        this.y + this.height - 10,
      );
    }
  }
}
