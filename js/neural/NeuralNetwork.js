import { NEURAL_NETWORK } from "../config/constants.js";

export default class NeuralNetwork {
  isToMutate = true;
  constructor(
    inputSize = NEURAL_NETWORK.INPUT_SIZE,
    hiddenLayers = NEURAL_NETWORK.HIDDEN_LAYERS,
    outputSize = NEURAL_NETWORK.OUTPUT_SIZE
  ) {
    this.layers = [inputSize, ...hiddenLayers, outputSize];
    this.weights = [];
    this.bias = [];
    this.activations = [];
    this.deltas = [];
    this.learningRate = NEURAL_NETWORK.LEARNING_RATE;

    this._initialize();
  }

  _initialize() {
    this.weights = [];
    this.bias = [];

    for (let layerIdx = 1; layerIdx < this.layers.length; layerIdx++) {
      const layerWeights = [];
      const layerBias = [];
      const currentLayerSize = this.layers[layerIdx];
      const previousLayerSize = this.layers[layerIdx - 1];

      for (let neuron = 0; neuron < currentLayerSize; neuron++) {
        const neuronWeights = [];
        for (let input = 0; input < previousLayerSize; input++) {
          // Inicialização Xavier/Glorot
          neuronWeights.push(Math.random() * 2 - 1);
        }
        layerWeights.push(neuronWeights);
        layerBias.push(Math.random() * 2 - 1);
      }

      this.weights.push(layerWeights);
      this.bias.push(layerBias);
    }
  }

  // ========================================================================
  // Funções de Ativação
  // ========================================================================

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  sigmoidDerivative(y) {
    return y * (1 - y);
  }


  forward(input) {
    this.activations = [];
    this.activations[0] = input;

    for (let layerIdx = 1; layerIdx < this.layers.length; layerIdx++) {
      const currentLayerActivations = [];
      const currentLayerSize = this.layers[layerIdx];

      for (let neuron = 0; neuron < currentLayerSize; neuron++) {
        let sum = this.bias[layerIdx - 1][neuron];

        for (
          let prevNeuron = 0;
          prevNeuron < this.layers[layerIdx - 1];
          prevNeuron++
        ) {
          sum +=
            this.weights[layerIdx - 1][neuron][prevNeuron] *
            this.activations[layerIdx - 1][prevNeuron];
        }

        currentLayerActivations.push(this.sigmoid(sum));
      }

      this.activations[layerIdx] = currentLayerActivations;
    }

    return this.activations[this.layers.length - 1];
  }

  backward(target) {
    const lastLayerIdx = this.layers.length - 1;
    this.deltas = [];
    this.deltas[lastLayerIdx] = [];

    for (let neuron = 0; neuron < this.layers[lastLayerIdx]; neuron++) {
      const output = this.activations[lastLayerIdx][neuron];
      const expected = target[neuron];
      this.deltas[lastLayerIdx][neuron] =
        (output - expected) * this.sigmoidDerivative(output);
    }

    for (let layerIdx = lastLayerIdx - 1; layerIdx > 0; layerIdx--) {
      this.deltas[layerIdx] = [];

      for (let neuron = 0; neuron < this.layers[layerIdx]; neuron++) {
        let error = 0;

        for (
          let nextNeuron = 0;
          nextNeuron < this.layers[layerIdx + 1];
          nextNeuron++
        ) {
          error +=
            this.weights[layerIdx][nextNeuron][neuron] *
            this.deltas[layerIdx + 1][nextNeuron];
        }

        this.deltas[layerIdx][neuron] =
          error * this.sigmoidDerivative(this.activations[layerIdx][neuron]);
      }
    }

    for (let layerIdx = 1; layerIdx < this.layers.length; layerIdx++) {
      for (let neuron = 0; neuron < this.layers[layerIdx]; neuron++) {
        for (
          let prevNeuron = 0;
          prevNeuron < this.layers[layerIdx - 1];
          prevNeuron++
        ) {
          this.weights[layerIdx - 1][neuron][prevNeuron] -=
            this.learningRate *
            this.deltas[layerIdx][neuron] *
            this.activations[layerIdx - 1][prevNeuron];
        }
        this.bias[layerIdx - 1][neuron] -=
          this.learningRate * this.deltas[layerIdx][neuron];
      }
    }
  }

  train(inputs, targets, epochs = 1000) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let sample = 0; sample < inputs.length; sample++) {
        this.forward(inputs[sample]);
        this.backward(targets[sample]);
      }
    }
  }

  load(data) {
    if (!data || !data.weights) {
      this._initialize();
      return;
    }
    this.weights = data.weights;
    this.bias = data.bias;
    this.layers = data.layers;
  }

  export() {
    return {
      weights: this.weights,
      bias: this.bias,
      layers: this.layers,
    };
  }

  perturbWeights(sigma = NEURAL_NETWORK.MUTATION_RATE, mutationChance = 0.1) {
    for (let layer = 0; layer < this.weights.length; layer++) {
      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        for (
          let weight = 0;
          weight < this.weights[layer][neuron].length;
          weight++
        ) {
          if (Math.random() < mutationChance) {
            this.weights[layer][neuron][weight] += randomGaussian(0, sigma);
          }
        }
      }
    }

    for (let layer = 0; layer < this.bias.length; layer++) {
      for (let neuron = 0; neuron < this.bias[layer].length; neuron++) {
        if (Math.random() < mutationChance) {
          this.bias[layer][neuron] += randomGaussian(0, sigma);
        }
      }
    }
  }

  static argmax(output) {
    let maxIdx = 0;
    let maxVal = output[0];

    for (let i = 1; i < output.length; i++) {
      if (output[i] > maxVal) {
        maxVal = output[i];
        maxIdx = i;
      }
    }

    return maxIdx;
  }
}

function randomGaussian(mean = 0, stdDev = 1) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return (
    mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  );
}
