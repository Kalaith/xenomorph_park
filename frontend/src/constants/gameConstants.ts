export const gameConstants = {
  // Grid configuration
  GRID_WIDTH: 20,
  GRID_HEIGHT: 15,

  // Starting resources
  STARTING_CREDITS: 50000,
  STARTING_POWER: 10,
  STARTING_MAX_POWER: 10,
  STARTING_RESEARCH: 0,
  STARTING_SECURITY: 'High' as const,
  STARTING_VISITORS: 0,

  // Game mechanics
  RESEARCH_POINTS_PER_TICK: 1,
  VISITORS_PER_FACILITY: 10,
  POWER_CONSUMPTION_MULTIPLIER: 1.1,
  SECURITY_DEGRADATION_RATE: 0.1,

  // Economic mechanics
  BASE_ADMISSION_PRICE: 100,
  VISITOR_SPAWN_RATE: 3,
  MAX_VISITORS_PER_TICK: 8,
  FACILITY_MAINTENANCE_COST: 15,
  XENOMORPH_FOOD_COST: 35,

  // Time system
  HOURS_PER_DAY: 24,
  TICKS_PER_HOUR: 10,
  VISITOR_FLOW_MORNING: 0.3,
  VISITOR_FLOW_AFTERNOON: 1.0,
  VISITOR_FLOW_EVENING: 0.5,
  VISITOR_FLOW_NIGHT: 0.1,

  // Crisis probabilities
  BASE_CRISIS_PROBABILITY: 0.05,
  CRISIS_PROBABILITY_MULTIPLIER: 1.2,

  // Auto-save interval (milliseconds)
  AUTO_SAVE_INTERVAL: 30000,

  // Game loop interval (milliseconds)
  GAME_TICK_INTERVAL: 1000,

  // Animation durations
  ANIMATION_DURATION: 300,
  STATUS_MESSAGE_DURATION: 3000,
} as const;

export const dangerLevelColors = {
  1: 'text-green-400',
  2: 'text-green-400',
  3: 'text-yellow-400',
  4: 'text-yellow-400',
  5: 'text-red-400',
  6: 'text-red-600',
} as const;

export const securityColors = {
  Low: 'text-red-400',
  Medium: 'text-yellow-400',
  High: 'text-green-400',
  Maximum: 'text-blue-400',
} as const;

export const severityColors = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
  Critical: 'text-red-600',
} as const;
