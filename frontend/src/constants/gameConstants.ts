export const GAME_CONSTANTS = {
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
  
  // Horror mode starting stats
  STARTING_HEALTH: 100,
  STARTING_AMMO: 95,
  MAX_AMMO: 95,
  DEFAULT_WEAPON: 'M41A Pulse Rifle',
  
  // Game mechanics
  RESEARCH_POINTS_PER_TICK: 1,
  VISITORS_PER_FACILITY: 10,
  POWER_CONSUMPTION_MULTIPLIER: 1.1,
  SECURITY_DEGRADATION_RATE: 0.1,
  
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

export const DANGER_LEVEL_COLORS = {
  1: 'text-green-400',
  2: 'text-green-400',
  3: 'text-yellow-400',
  4: 'text-yellow-400',
  5: 'text-red-400',
  6: 'text-red-600',
} as const;

export const SECURITY_COLORS = {
  Low: 'text-red-400',
  Medium: 'text-yellow-400',
  High: 'text-green-400',
  Maximum: 'text-blue-400',
} as const;

export const SEVERITY_COLORS = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
  Critical: 'text-red-600',
} as const;
