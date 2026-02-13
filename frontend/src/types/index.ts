import { ReactNode } from 'react';

// Undo/Redo types
export interface GameAction {
  type: 'PLACE_FACILITY' | 'PLACE_XENOMORPH' | 'REMOVE_FACILITY' | 'REMOVE_XENOMORPH' | 'MODIFY_RESOURCES';
  timestamp: number;
  data: unknown;
  previousState?: Partial<GameState>;
}

export interface UndoRedoState {
  history: GameAction[];
  currentIndex: number;
  maxHistorySize: number;
}

// Core game types
export interface GameState {
  paused: boolean;
  day: number;
  hour: number;
  tick: number;
  resources: Resources;
  facilities: PlacedFacility[];
  xenomorphs: PlacedXenomorph[];
  selectedFacility: FacilityDefinition | null;
  selectedSpecies: XenomorphSpecies | null;
  research: ResearchState;
  economics: EconomicsState;
  undoRedo: UndoRedoState;
}

export interface Resources {
  credits: number;
  power: number;
  maxPower: number;
  research: number;
  security: SecurityLevel;
  visitors: number;
  maxVisitors: number;
  dailyRevenue: number;
  dailyExpenses: number;
}

export type SecurityLevel = 'Low' | 'Medium' | 'High' | 'Maximum';

export interface PlacedFacility {
  id: string;
  name: string;
  position: GridPosition;
  cost: number;
  powerRequirement: number;
  description: string;
}

export interface PlacedXenomorph {
  id: string;
  species: XenomorphSpecies;
  position: GridPosition;
  containmentLevel: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface ResearchState {
  completed: string[];
  inProgress: string | null;
  points: number;
  available: string[];
  researchTree: {
    [nodeId: string]: {
      completed: boolean;
      inProgress: boolean;
      progress: number;
      startedAt?: number;
    };
  };
}


export interface EconomicsState {
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
  visitorSatisfaction: number;
  attractionValue: number;
  lastDayProfit: number;
}

// Game definition types
export interface XenomorphSpecies {
  name: string;
  description: string;
  dangerLevel: number;
  containmentDifficulty: number;
  researchCost: number;
  foodRequirement: FoodRequirement;
  specialAbilities: string[];
}

export type FoodRequirement = 'Low' | 'Medium' | 'High' | 'Very High';

export interface FacilityDefinition {
  name: string;
  cost: number;
  powerRequirement: number;
  description: string;
}

export interface Weapon {
  name: string;
  damage: number;
  ammoCapacity: number;
  rateOfFire: RateOfFire;
  special: string;
}

export type RateOfFire = 'Low' | 'Medium' | 'High' | 'Very High';

export interface CrisisEvent {
  name: string;
  probability: number;
  severity: Severity;
  description: string;
  responseOptions: string[];
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface GridConfig {
  width: number;
  height: number;
}

export interface GridCell {
  position: GridPosition;
  occupied: boolean;
  content: PlacedFacility | PlacedXenomorph | null;
  type: 'empty' | 'facility' | 'xenomorph';
}

// UI types
export interface ButtonVariant {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface StatusMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

// Store types
export interface GameStore extends GameState {
  // Actions
  togglePause: () => void;
  updateResources: (resources: Partial<Resources>) => void;
  placeFacility: (facility: FacilityDefinition, position: GridPosition) => void;
  placeXenomorph: (species: XenomorphSpecies, position: GridPosition) => void;
  removeFacility: (facilityId: string) => void;
  removeXenomorph: (xenomorphId: string) => void;
  selectFacility: (facility: FacilityDefinition | null) => void;
  selectSpecies: (species: XenomorphSpecies | null) => void;
  startResearch: (species: string) => void;
  completeResearch: (species: string) => void;
  addStatusMessage: (message: string, type: StatusMessage['type']) => void;

  // Game mechanics actions
  gameTick: () => void;
  processEconomics: () => void;
  updateTime: () => void;

  // Research tree actions
  startResearchNode: (nodeId: string) => void;
  completeResearchNode: (nodeId: string) => void;
  updateResearchProgress: () => void;

  // Undo/Redo actions
  addToHistory: (action: GameAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Save/Load actions
  saveGame: (slotId: string, name?: string) => boolean;
  loadGame: (slotId: string) => boolean;
  quickSave: () => boolean;
  quickLoad: () => boolean;

  reset: () => void;
}
