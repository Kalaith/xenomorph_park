import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameStore, GameState, PlacedFacility, PlacedXenomorph } from '../types';
import { GAME_CONSTANTS } from '../constants/gameConstants';
import { DEFAULT_OBJECTIVES } from '../data/gameData';
import { saveManager } from '../utils/saveManager';

const initialState: GameState = {
  mode: 'building',
  paused: false,
  day: 1,
  resources: {
    credits: GAME_CONSTANTS.STARTING_CREDITS,
    power: GAME_CONSTANTS.STARTING_POWER,
    maxPower: GAME_CONSTANTS.STARTING_MAX_POWER,
    research: GAME_CONSTANTS.STARTING_RESEARCH,
    security: GAME_CONSTANTS.STARTING_SECURITY,
    visitors: GAME_CONSTANTS.STARTING_VISITORS,
  },
  facilities: [],
  xenomorphs: [],
  selectedFacility: null,
  selectedSpecies: null,
  research: {
    completed: ['Drone'], // Drone is available from start
    inProgress: null,
    points: 0,
  },
  horror: {
    health: GAME_CONSTANTS.STARTING_HEALTH,
    ammo: GAME_CONSTANTS.STARTING_AMMO,
    maxAmmo: GAME_CONSTANTS.MAX_AMMO,
    weapon: GAME_CONSTANTS.DEFAULT_WEAPON,
    objectives: [...DEFAULT_OBJECTIVES],
  },
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Mode management
        setMode: (mode) => set({ mode }),
        togglePause: () => set((state) => ({ paused: !state.paused })),

        // Resource management
        updateResources: (resources) =>
          set((state) => ({
            resources: { ...state.resources, ...resources },
          })),

        // Facility management
        placeFacility: (facility, position) => {
          const state = get();
          
          // Check if we have enough credits
          if (state.resources.credits < facility.cost) {
            // You might want to add a status message system here
            return;
          }

          // Check if position is available
          const isOccupied = state.facilities.some(
            (f) => f.position.row === position.row && f.position.col === position.col
          ) || state.xenomorphs.some(
            (x) => x.position.row === position.row && x.position.col === position.col
          );

          if (isOccupied) {
            return;
          }

          const newFacility: PlacedFacility = {
            id: `facility-${Date.now()}-${Math.random()}`,
            name: facility.name,
            position,
            cost: facility.cost,
            powerRequirement: facility.powerRequirement,
            description: facility.description,
          };

          // Calculate new max power if it's a power generator
          const powerIncrease = facility.name === 'Power Generator' ? 10 : 0;

          set((state) => ({
            facilities: [...state.facilities, newFacility],
            resources: {
              ...state.resources,
              credits: state.resources.credits - facility.cost,
              power: state.resources.power - facility.powerRequirement,
              maxPower: state.resources.maxPower + powerIncrease,
            },
            selectedFacility: null,
          }));
        },

        // Xenomorph management
        placeXenomorph: (species, position) => {
          const state = get();

          // Check if species is researched
          if (!state.research.completed.includes(species.name)) {
            return;
          }

          // Check if position is available
          const isOccupied = state.facilities.some(
            (f) => f.position.row === position.row && f.position.col === position.col
          ) || state.xenomorphs.some(
            (x) => x.position.row === position.row && x.position.col === position.col
          );

          if (isOccupied) {
            return;
          }

          const newXenomorph: PlacedXenomorph = {
            id: `xenomorph-${Date.now()}-${Math.random()}`,
            species,
            position,
            containmentLevel: species.containmentDifficulty,
          };

          set((state) => ({
            xenomorphs: [...state.xenomorphs, newXenomorph],
            selectedSpecies: null,
          }));
        },

        // Selection management
        selectFacility: (facility) =>
          set({ selectedFacility: facility, selectedSpecies: null }),
        selectSpecies: (species) =>
          set({ selectedSpecies: species, selectedFacility: null }),

        // Research management
        startResearch: (species) => {
          const state = get();
          if (state.research.inProgress || state.research.completed.includes(species)) {
            return;
          }

          set((state) => ({
            research: {
              ...state.research,
              inProgress: species,
            },
          }));
        },

        completeResearch: (species) =>
          set((state) => ({
            research: {
              ...state.research,
              completed: [...state.research.completed, species],
              inProgress: null,
            },
          })),

        // Horror mode management
        updateHorrorState: (horrorState) =>
          set((state) => ({
            horror: { ...state.horror, ...horrorState },
          })),

        // Status messages
        addStatusMessage: (message, type) => {
          // Use global notification system if available
          // @ts-ignore
          if (window.addNotification) {
            // @ts-ignore
            window.addNotification(message, type);
          } else {
            console.log(`${type.toUpperCase()}: ${message}`);
          }
        },

        // Save management
        saveGame: (slotId: string, name?: string) => {
          const state = get();
          const success = saveManager.saveGame(state, slotId, name);
          if (success) {
            state.addStatusMessage(`Game saved successfully${name ? ` as "${name}"` : ''}`, 'success');
          } else {
            state.addStatusMessage('Failed to save game', 'error');
          }
          return success;
        },

        loadGame: (slotId: string) => {
          const saveData = saveManager.loadGame(slotId);
          if (saveData) {
            set({ ...initialState, ...saveData.gameState });
            get().addStatusMessage('Game loaded successfully', 'success');
            return true;
          } else {
            get().addStatusMessage('Failed to load game', 'error');
            return false;
          }
        },

        quickSave: () => {
          const state = get();
          const success = saveManager.quickSave(state);
          if (success) {
            state.addStatusMessage('Quick save completed', 'success');
          } else {
            state.addStatusMessage('Quick save failed', 'error');
          }
          return success;
        },

        quickLoad: () => {
          const saveData = saveManager.quickLoad();
          if (saveData) {
            set({ ...initialState, ...saveData.gameState });
            get().addStatusMessage('Quick load completed', 'success');
            return true;
          } else {
            get().addStatusMessage('No quick save found', 'warning');
            return false;
          }
        },

        // Reset game
        reset: () => set(initialState),
      }),
      {
        name: 'xenomorph-park-game',
        partialize: (state) => ({
          // Only persist certain parts of the state
          day: state.day,
          resources: state.resources,
          facilities: state.facilities,
          xenomorphs: state.xenomorphs,
          research: state.research,
        }),
      }
    ),
    { name: 'xenomorph-park-store' }
  )
);
