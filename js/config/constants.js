export const CANVAS = {
  WIDTH: 1400,
  HEIGHT: 800,
  BACKGROUND_COLOR: "#000000",
};

export const PHYSICS = {
  GRAVITATIONAL_CONSTANT: 0.1,
  ELASTIC_CONSTANT: 0.8,
  TIME_STEP: 100000,
  MAX_DISTANCE: 600,
};

export const FITNESS = {
  PROXIMITY_WEIGHT: 10.0,
  TANGENT_ALIGN_WEIGHT: 5.0,
  TIME_ALIVE_WEIGHT: 0.01,
  ORBIT_BONUS: 100.0,
  DISTANCE_PENALTY: 0.1,
  PENALTY_THRESHOLD: 400,
};

export const SPAWN = {
  RANGES: [
    { minDist: 400, maxDist: 600 },
    { minDist: 200, maxDist: 400 },
    { minDist: 100, maxDist: 200 },
  ],
};

export const BODY_DEFAULTS = {
  MODEL: "circle",
  COLOR: "#22c55e",
  MASS: 1,
  RADIUS: 10,
  POSITION: { x: 400, y: 400 },
  VELOCITY: { x: 0, y: 0 },
};

export const ROCKET = {
  MASS: 0.0001,
  RADIUS: 4,
  COLOR: "red",
  THRUST_FORCE: 0.000000001,
  SPAWN_AREA: { width: 800, height: 800 },
  FUEL: 500,
  FUEL_CONSUMPTION: 1,
};

export const NEURAL_NETWORK = {
  INPUT_SIZE: 12,
  HIDDEN_LAYERS: [8],
  OUTPUT_SIZE: 5,
  LEARNING_RATE: 0.1,
  MUTATION_RATE: 0.05,
};

export const SIMULATION = {
  POPULATION_SIZE: 100,
  MAX_TICKS_PER_EPOCH: 2000,
  TRAIL_MAX_LENGTH: 200,
};

export const STORAGE_KEYS = {
  TOP_ROCKETS: "topRockets",
};

export const GENETICS = {
  TOP_PERCENTAGE: 0.1,
};

export const ACTIONS = {
  UP: 0,
  DOWN: 1,
  RIGHT: 2,
  LEFT: 3,
  NONE: 4,
};
