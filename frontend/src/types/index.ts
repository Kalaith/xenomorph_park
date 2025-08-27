import { ReactNode } from 'react';

// Core game types
export interface GameState {
  mode: 'building' | 'horror';
  paused: boolean;
  day: number;
  resources: Resources;
  facilities: PlacedFacility[];
  xenomorphs: PlacedXenomorph[];
  selectedFacility: FacilityDefinition | null;
  selectedSpecies: XenomorphSpecies | null;
  research: ResearchState;
  horror: HorrorState;
}

export interface Resources {
  credits: number;
  power: number;
  maxPower: number;
  research: number;
  security: SecurityLevel;
  visitors: number;
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
}

export interface HorrorState {
  health: number;
  ammo: number;
  maxAmmo: number;
  weapon: string;
  objectives: string[];
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
  setMode: (mode: 'building' | 'horror') => void;
  togglePause: () => void;
  updateResources: (resources: Partial<Resources>) => void;
  placeFacility: (facility: FacilityDefinition, position: GridPosition) => void;
  placeXenomorph: (species: XenomorphSpecies, position: GridPosition) => void;
  selectFacility: (facility: FacilityDefinition | null) => void;
  selectSpecies: (species: XenomorphSpecies | null) => void;
  startResearch: (species: string) => void;
  completeResearch: (species: string) => void;
  updateHorrorState: (state: Partial<HorrorState>) => void;
  addStatusMessage: (message: string, type: StatusMessage['type']) => void;
  reset: () => void;
}
