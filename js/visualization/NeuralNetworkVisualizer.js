import { NEURAL_NETWORK, ACTIONS } from "../config/constants.js";

export default class NeuralNetworkVisualizer {
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
    this.outputLabels = ["UP", "DOWN", "RIGHT", "LEFT","NONE"];
  }

  draw(rocket) {
    if (!rocket || !rocket.brain) return;

    const brain = rocket.brain;
    const activations = brain.activations || [];
    const layers = brain.layers;
    const weights = brain.weights;

    if (!layers || layers.length === 0) return;


    this.ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);


    this.ctx.fillStyle = "#000000ff";
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
          const alpha = Math.min(0.8, intensity * 2);

          if (weight > 0) {
            this.ctx.strokeStyle = `rgba(100, 200, 100, ${alpha})`;
          } else {
            this.ctx.strokeStyle = `rgba(200, 100, 100, ${alpha})`;
          }

          this.ctx.lineWidth = Math.max(0.5, Math.abs(weight) * 2);
          this.ctx.beginPath();
          this.ctx.moveTo(currentLayer[i].x, currentLayer[i].y);
          this.ctx.lineTo(nextLayer[j].x, nextLayer[j].y);
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


        const baseRadius = 6;
        const radius = baseRadius + activation * 4;


        const green = Math.floor(100 + activation * 155);
        const blue = Math.floor(100 + activation * 155);


        this.ctx.fillStyle = `rgb(${Math.floor(
          50 + activation * 50
        )}, ${green}, ${blue})`;
        this.ctx.beginPath();
        this.ctx.arc(neuron.x, neuron.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Borda
        this.ctx.strokeStyle = "#000000ff";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }
  }

  _drawLabels(positions, layers) {
    this.ctx.font = "9px Arial";
    this.ctx.fillStyle = "#000000ff";

    const inputLayer = positions[0];
    for (let i = 0; i < inputLayer.length && i < this.inputLabels.length; i++) {
      this.ctx.fillText(
        this.inputLabels[i],
        inputLayer[i].x - 35,
        inputLayer[i].y + 3
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
        outputLayer[i].y + 3
      );
    }

    this.ctx.fillStyle = "#000000ff";
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
        this.y + this.height - 10
      );
    }
  }
}
