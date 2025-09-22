import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameStore, GameState, PlacedFacility, PlacedXenomorph } from '../types';
import { GAME_CONSTANTS } from '../constants/gameConstants';
import { DEFAULT_OBJECTIVES } from '../data/gameData';
import { RESEARCH_TREE } from '../data/researchTree';
import { saveManager } from '../utils/saveManager';

const initialState: GameState = {
  mode: 'building',
  paused: false,
  day: 1,
  hour: 9,
  tick: 0,
  resources: {
    credits: GAME_CONSTANTS.STARTING_CREDITS,
    power: GAME_CONSTANTS.STARTING_POWER,
    maxPower: GAME_CONSTANTS.STARTING_MAX_POWER,
    research: GAME_CONSTANTS.STARTING_RESEARCH,
    security: GAME_CONSTANTS.STARTING_SECURITY,
    visitors: GAME_CONSTANTS.STARTING_VISITORS,
    maxVisitors: 50,
    dailyRevenue: 0,
    dailyExpenses: 0,
  },
  facilities: [],
  xenomorphs: [],
  selectedFacility: null,
  selectedSpecies: null,
  research: {
    completed: [], // No research completed at start
    inProgress: null,
    points: 0,
    available: ['Drone'], // Drone is available from start but not "researched"
    researchTree: {}, // Research tree progress tracking
  },
  horror: {
    health: GAME_CONSTANTS.STARTING_HEALTH,
    ammo: GAME_CONSTANTS.STARTING_AMMO,
    maxAmmo: GAME_CONSTANTS.MAX_AMMO,
    weapon: GAME_CONSTANTS.DEFAULT_WEAPON,
    objectives: [...DEFAULT_OBJECTIVES],
  },
  economics: {
    totalRevenue: 0,
    totalExpenses: 0,
    profitMargin: 0,
    visitorSatisfaction: 0.5,
    attractionValue: 0,
    lastDayProfit: 0,
  },
  undoRedo: {
    history: [],
    currentIndex: -1,
    maxHistorySize: 50,
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

          // Store previous state for undo
          const previousState = {
            facilities: state.facilities,
            resources: state.resources,
          };

          const resourceChanges = {
            credits: state.resources.credits - facility.cost,
            power: state.resources.power - facility.powerRequirement,
            maxPower: state.resources.maxPower + powerIncrease,
          };

          // Add to history
          get().addToHistory({
            type: 'PLACE_FACILITY',
            timestamp: Date.now(),
            data: { facility: newFacility, resourceChanges },
            previousState,
          });

          set((state) => ({
            facilities: [...state.facilities, newFacility],
            resources: {
              ...state.resources,
              ...resourceChanges,
            },
            selectedFacility: null,
          }));
        },

        // Xenomorph management
        placeXenomorph: (species, position) => {
          const state = get();

          // Check if species is researched or available (handle undefined available array)
          const available = state.research.available || [];
          if (!state.research.completed.includes(species.name) && !available.includes(species.name)) {
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

          // Store previous state for undo
          const previousState = {
            xenomorphs: state.xenomorphs,
          };

          // Add to history
          get().addToHistory({
            type: 'PLACE_XENOMORPH',
            timestamp: Date.now(),
            data: { xenomorph: newXenomorph },
            previousState,
          });

          set((state) => ({
            xenomorphs: [...state.xenomorphs, newXenomorph],
            selectedSpecies: null,
          }));
        },

        // Remove facilities and xenomorphs
        removeFacility: (facilityId) => {
          const state = get();
          const facility = state.facilities.find(f => f.id === facilityId);
          if (!facility) return;

          // Store previous state for undo
          const previousState = {
            facilities: state.facilities,
            resources: state.resources,
          };

          // Calculate resource refund (partial)
          const refundAmount = Math.floor(facility.cost * 0.5); // 50% refund
          const powerReturn = facility.powerRequirement;
          const maxPowerDecrease = facility.name === 'Power Generator' ? 10 : 0;

          // Add to history
          get().addToHistory({
            type: 'REMOVE_FACILITY',
            timestamp: Date.now(),
            data: { facility, refund: refundAmount, powerReturn, maxPowerDecrease },
            previousState,
          });

          set((state) => ({
            facilities: state.facilities.filter(f => f.id !== facilityId),
            resources: {
              ...state.resources,
              credits: state.resources.credits + refundAmount,
              power: state.resources.power + powerReturn,
              maxPower: state.resources.maxPower - maxPowerDecrease,
            },
          }));
        },

        removeXenomorph: (xenomorphId) => {
          const state = get();
          const xenomorph = state.xenomorphs.find(x => x.id === xenomorphId);
          if (!xenomorph) return;

          // Store previous state for undo
          const previousState = {
            xenomorphs: state.xenomorphs,
          };

          // Add to history
          get().addToHistory({
            type: 'REMOVE_XENOMORPH',
            timestamp: Date.now(),
            data: { xenomorph },
            previousState,
          });

          set((state) => ({
            xenomorphs: state.xenomorphs.filter(x => x.id !== xenomorphId),
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
              available: state.research.available.filter(s => s !== species),
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

        // Game mechanics
        updateTime: () => set((state) => {
          let newTick = state.tick + 1;
          let newHour = state.hour;
          let newDay = state.day;

          if (newTick >= GAME_CONSTANTS.TICKS_PER_HOUR) {
            newTick = 0;
            newHour++;

            if (newHour >= GAME_CONSTANTS.HOURS_PER_DAY) {
              newHour = 0;
              newDay++;

              // Reset daily counters
              return {
                ...state,
                tick: newTick,
                hour: newHour,
                day: newDay,
                resources: {
                  ...state.resources,
                  dailyRevenue: 0,
                  dailyExpenses: 0,
                },
                economics: {
                  ...state.economics,
                  lastDayProfit: state.resources.dailyRevenue - state.resources.dailyExpenses,
                },
              };
            }
          }

          return { ...state, tick: newTick, hour: newHour, day: newDay };
        }),

        processEconomics: () => set((state) => {
          const visitorCenters = state.facilities.filter(f => f.name === 'Visitor Center').length;
          const totalAttractionValue = state.xenomorphs.reduce((sum, x) => sum + x.species.dangerLevel, 0);

          // Calculate visitor flow based on time of day
          let flowMultiplier: number = GAME_CONSTANTS.VISITOR_FLOW_NIGHT;
          if (state.hour >= 6 && state.hour < 12) flowMultiplier = GAME_CONSTANTS.VISITOR_FLOW_MORNING;
          else if (state.hour >= 12 && state.hour < 18) flowMultiplier = GAME_CONSTANTS.VISITOR_FLOW_AFTERNOON;
          else if (state.hour >= 18 && state.hour < 22) flowMultiplier = GAME_CONSTANTS.VISITOR_FLOW_EVENING;

          // Calculate new visitors
          const maxNewVisitors = Math.floor(GAME_CONSTANTS.MAX_VISITORS_PER_TICK * flowMultiplier);
          const baseVisitorCapacity = visitorCenters * GAME_CONSTANTS.VISITORS_PER_FACILITY + 10;
          const attractionBonus = Math.floor(totalAttractionValue * 0.5);
          const newVisitorCount = Math.min(
            state.resources.visitors + Math.random() * maxNewVisitors,
            baseVisitorCapacity + attractionBonus
          );

          // Calculate revenue
          const admissionRevenue = (newVisitorCount - state.resources.visitors) * GAME_CONSTANTS.BASE_ADMISSION_PRICE;
          const attractionRevenue = state.resources.visitors * totalAttractionValue * 0.1;
          const totalRevenue = admissionRevenue + attractionRevenue;

          // Calculate expenses
          const facilityMaintenance = state.facilities.length * GAME_CONSTANTS.FACILITY_MAINTENANCE_COST;
          const xenomorphFeeding = state.xenomorphs.length * GAME_CONSTANTS.XENOMORPH_FOOD_COST;
          const totalExpenses = facilityMaintenance + xenomorphFeeding;

          return {
            ...state,
            resources: {
              ...state.resources,
              visitors: Math.floor(newVisitorCount),
              maxVisitors: baseVisitorCapacity + attractionBonus,
              credits: state.resources.credits + totalRevenue - totalExpenses,
              dailyRevenue: state.resources.dailyRevenue + totalRevenue,
              dailyExpenses: state.resources.dailyExpenses + totalExpenses,
            },
            economics: {
              ...state.economics,
              totalRevenue: state.economics.totalRevenue + totalRevenue,
              totalExpenses: state.economics.totalExpenses + totalExpenses,
              attractionValue: totalAttractionValue,
              profitMargin: state.economics.totalRevenue > 0 ?
                ((state.economics.totalRevenue - state.economics.totalExpenses) / state.economics.totalRevenue) * 100 : 0,
            },
          };
        }),

        gameTick: () => {
          const state = get();
          if (!state.paused && state.mode === 'building') {
            state.updateTime();
            state.processEconomics();
            state.updateResearchProgress();
          }
        },

        // Research tree management
        startResearchNode: (nodeId) => set((state) => {
          // Use the imported research tree data to get costs
          const nodeData = RESEARCH_TREE.find((n: any) => n.id === nodeId);

          if (!nodeData) return state;

          const currentNodeState = state.research.researchTree[nodeId] || {
            completed: false,
            inProgress: false,
            progress: 0
          };

          // Check if we can afford it and it's available
          const canAfford = state.resources.credits >= nodeData.cost.credits &&
                           state.resources.research >= nodeData.cost.research;

          if (!currentNodeState.completed && !currentNodeState.inProgress && canAfford) {
            return {
              ...state,
              resources: {
                ...state.resources,
                credits: state.resources.credits - nodeData.cost.credits,
                research: state.resources.research - nodeData.cost.research,
              },
              research: {
                ...state.research,
                researchTree: {
                  ...state.research.researchTree,
                  [nodeId]: {
                    ...currentNodeState,
                    inProgress: true,
                    startedAt: Date.now(),
                  },
                },
              },
            };
          }
          return state;
        }),

        completeResearchNode: (nodeId) => set((state) => {
          const node = state.research.researchTree[nodeId];
          if (node && node.inProgress) {
            return {
              ...state,
              research: {
                ...state.research,
                researchTree: {
                  ...state.research.researchTree,
                  [nodeId]: {
                    ...node,
                    completed: true,
                    inProgress: false,
                    progress: 100,
                  },
                },
              },
            };
          }
          return state;
        }),

        updateResearchProgress: () => set((state) => {
          const updatedTree = { ...state.research.researchTree };
          let hasChanges = false;
          let newResearchPoints = state.research.points;

          // Generate research points from research labs
          const researchLabs = state.facilities.filter(f => f.name === 'Research Lab').length;
          newResearchPoints += researchLabs * GAME_CONSTANTS.RESEARCH_POINTS_PER_TICK;

          Object.entries(updatedTree).forEach(([nodeId, nodeData]) => {
            if (nodeData.inProgress && nodeData.startedAt) {
              const nodeConfig = RESEARCH_TREE.find((n: any) => n.id === nodeId);
              if (!nodeConfig) return;

              // Calculate progress based on time
              const timeElapsed = Date.now() - nodeData.startedAt;
              const hoursElapsed = timeElapsed / (1000 * 60 * 60); // Convert to hours
              const expectedProgress = (hoursElapsed / nodeConfig.cost.time) * 100;
              const newProgress = Math.min(100, expectedProgress);

              if (newProgress !== nodeData.progress) {
                updatedTree[nodeId] = { ...nodeData, progress: newProgress };
                hasChanges = true;

                // Auto-complete when reaching 100%
                if (newProgress >= 100) {
                  updatedTree[nodeId] = {
                    ...updatedTree[nodeId],
                    completed: true,
                    inProgress: false,
                  };

                  // Apply unlocks
                  if (nodeConfig.unlocks.species) {
                    nodeConfig.unlocks.species.forEach((species: string) => {
                      if (!state.research.completed.includes(species)) {
                        state.research.completed.push(species);
                      }
                    });
                  }
                }
              }
            }
          });

          if (hasChanges || newResearchPoints !== state.research.points) {
            return {
              ...state,
              research: {
                ...state.research,
                points: newResearchPoints,
                researchTree: updatedTree,
              },
            };
          }

          return state;
        }),

        // Undo/Redo functionality
        addToHistory: (action) => set((state) => {
          const newHistory = [...state.undoRedo.history];

          // Remove any actions after current index (when user made new action after undo)
          if (state.undoRedo.currentIndex < newHistory.length - 1) {
            newHistory.splice(state.undoRedo.currentIndex + 1);
          }

          // Add new action
          newHistory.push(action);

          // Limit history size
          if (newHistory.length > state.undoRedo.maxHistorySize) {
            newHistory.shift();
          }

          return {
            ...state,
            undoRedo: {
              ...state.undoRedo,
              history: newHistory,
              currentIndex: newHistory.length - 1,
            },
          };
        }),

        undo: () => set((state) => {
          if (state.undoRedo.currentIndex < 0) return state;

          const currentAction = state.undoRedo.history[state.undoRedo.currentIndex];
          if (!currentAction.previousState) return state;

          // Apply previous state
          const newState = {
            ...state,
            ...currentAction.previousState,
            undoRedo: {
              ...state.undoRedo,
              currentIndex: state.undoRedo.currentIndex - 1,
            },
          };

          return newState;
        }),

        redo: () => set((state) => {
          if (state.undoRedo.currentIndex >= state.undoRedo.history.length - 1) return state;

          const nextIndex = state.undoRedo.currentIndex + 1;
          const nextAction = state.undoRedo.history[nextIndex];

          // Reapply the action
          const newState = { ...state };

          if (nextAction.type === 'PLACE_FACILITY') {
            newState.facilities = [...state.facilities, nextAction.data.facility];
            newState.resources = { ...state.resources, ...nextAction.data.resourceChanges };
          } else if (nextAction.type === 'PLACE_XENOMORPH') {
            newState.xenomorphs = [...state.xenomorphs, nextAction.data.xenomorph];
          } else if (nextAction.type === 'REMOVE_FACILITY') {
            newState.facilities = state.facilities.filter(f => f.id !== nextAction.data.facility.id);
            newState.resources = {
              ...state.resources,
              credits: state.resources.credits + nextAction.data.refund,
              power: state.resources.power + nextAction.data.powerReturn,
              maxPower: state.resources.maxPower - nextAction.data.maxPowerDecrease,
            };
          } else if (nextAction.type === 'REMOVE_XENOMORPH') {
            newState.xenomorphs = state.xenomorphs.filter(x => x.id !== nextAction.data.xenomorph.id);
          }

          newState.undoRedo = {
            ...state.undoRedo,
            currentIndex: nextIndex,
          };

          return newState;
        }),

        canUndo: () => {
          const state = get();
          return state.undoRedo.currentIndex >= 0;
        },

        canRedo: () => {
          const state = get();
          return state.undoRedo.currentIndex < state.undoRedo.history.length - 1;
        },

        // Reset game
        reset: () => set(initialState),
      }),
      {
        name: 'xenomorph-park-game',
        version: 1,
        migrate: (persistedState: any, version) => {
          // Handle migration for research.available field
          if (persistedState && persistedState.research) {
            if (!persistedState.research.available) {
              persistedState.research.available = ['Drone'];
            }
            if (!persistedState.research.researchTree) {
              persistedState.research.researchTree = {};
            }
          }
          return persistedState;
        },
        partialize: (state) => ({
          // Only persist certain parts of the state
          day: state.day,
          hour: state.hour,
          tick: state.tick,
          resources: state.resources,
          facilities: state.facilities,
          xenomorphs: state.xenomorphs,
          research: {
            completed: state.research.completed,
            inProgress: state.research.inProgress,
            points: state.research.points,
            available: state.research.available,
            researchTree: state.research.researchTree,
          },
          economics: state.economics,
        }),
      }
    ),
    { name: 'xenomorph-park-store' }
  )
);
