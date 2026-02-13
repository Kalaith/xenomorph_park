import { GameState } from '../types';
import { CampaignScenario } from '../components/game/CampaignMode';

export interface CampaignSaveData {
  id: string;
  scenarioId: string;
  scenarioName: string;
  saveDate: number;
  gameState: GameState;
  objectives: {
    [objectiveId: string]: {
      completed: boolean;
      progress: number;
      completedAt?: number;
    };
  };
  sessionData: {
    startTime: number;
    elapsedTime: number;
    facilitiesBuilt: number;
    speciesContained: number;
    crisisesHandled: number;
    checkpoints: CampaignCheckpoint[];
  };
  metadata: {
    difficulty: string;
    biome: string;
    playerNotes?: string;
  };
}

export interface CampaignCheckpoint {
  id: string;
  timestamp: number;
  gameState: Partial<GameState>;
  objectiveProgress: { [objectiveId: string]: number };
  description: string;
  automatic: boolean; // true for auto-saves, false for manual
}

class CampaignSaveManager {
  private static instance: CampaignSaveManager;
  private readonly MAX_SAVES_PER_SCENARIO = 5;
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private autoSaveTimer: NodeJS.Timeout | null = null;

  public static getInstance(): CampaignSaveManager {
    if (!CampaignSaveManager.instance) {
      CampaignSaveManager.instance = new CampaignSaveManager();
    }
    return CampaignSaveManager.instance;
  }

  private getStorageKey(scenarioId: string): string {
    return `xenomorph-park-campaign-saves-${scenarioId}`;
  }

  private getQuickSaveKey(scenarioId: string): string {
    return `xenomorph-park-campaign-quicksave-${scenarioId}`;
  }

  public startCampaignSession(scenario: CampaignScenario, gameState: GameState): void {
    // Initialize session tracking
    const sessionData = {
      startTime: Date.now(),
      elapsedTime: 0,
      facilitiesBuilt: 0,
      speciesContained: 0,
      crisisesHandled: 0,
      checkpoints: []
    };

    // Store current session info
    localStorage.setItem('current-campaign-session', JSON.stringify({
      scenarioId: scenario.id,
      sessionData
    }));

    // Start auto-save timer
    this.startAutoSave(scenario.id);

    // Create initial checkpoint
    this.createCheckpoint(scenario.id, gameState, 'Campaign started', true);
  }

  public endCampaignSession(): void {
    // Stop auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    // Clear session data
    localStorage.removeItem('current-campaign-session');
  }

  private startAutoSave(scenarioId: string): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.autoSave(scenarioId);
    }, this.AUTO_SAVE_INTERVAL);
  }

  private autoSave(scenarioId: string): void {
    try {
      // Get current game state (this would need to be passed from the game)
      const currentState = this.getCurrentGameState();
      if (currentState) {
        this.quickSave(scenarioId, currentState, 'Auto-save');
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }

  private getCurrentGameState(): GameState | null {
    // This would integrate with the game store to get current state
    // For now, we'll return null as a placeholder
    // In a real implementation, this would use useGameStore.getState()
    return null;
  }

  public saveCampaign(
    scenarioId: string,
    gameState: GameState,
    objectives: CampaignSaveData['objectives'],
    playerNotes?: string
  ): boolean {
    try {
      const scenario = this.getCurrentScenario();
      if (!scenario) return false;

      const sessionData = this.getCurrentSessionData();

      const saveData: CampaignSaveData = {
        id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        scenarioId,
        scenarioName: scenario.name,
        saveDate: Date.now(),
        gameState: { ...gameState },
        objectives: { ...objectives },
        sessionData: { ...sessionData },
        metadata: {
          difficulty: scenario.difficulty,
          biome: scenario.biome,
          playerNotes
        }
      };

      // Get existing saves
      const existingSaves = this.getCampaignSaves(scenarioId);

      // Add new save
      existingSaves.push(saveData);

      // Keep only the most recent saves
      const trimmedSaves = existingSaves
        .sort((a, b) => b.saveDate - a.saveDate)
        .slice(0, this.MAX_SAVES_PER_SCENARIO);

      // Save to localStorage
      localStorage.setItem(this.getStorageKey(scenarioId), JSON.stringify(trimmedSaves));

      return true;
    } catch (error) {
      console.error('Failed to save campaign:', error);
      return false;
    }
  }

  public loadCampaign(saveId: string, scenarioId: string): CampaignSaveData | null {
    try {
      const saves = this.getCampaignSaves(scenarioId);
      return saves.find(save => save.id === saveId) || null;
    } catch (error) {
      console.error('Failed to load campaign:', error);
      return null;
    }
  }

  public quickSave(scenarioId: string, gameState: GameState, description?: string): boolean {
    try {
      const scenario = this.getCurrentScenario();
      if (!scenario) return false;

      const objectives = this.getCurrentObjectiveProgress();
      const sessionData = this.getCurrentSessionData();

      const saveData: CampaignSaveData = {
        id: `quicksave_${Date.now()}`,
        scenarioId,
        scenarioName: scenario.name,
        saveDate: Date.now(),
        gameState: { ...gameState },
        objectives: { ...objectives },
        sessionData: { ...sessionData },
        metadata: {
          difficulty: scenario.difficulty,
          biome: scenario.biome,
          playerNotes: description || 'Quick save'
        }
      };

      localStorage.setItem(this.getQuickSaveKey(scenarioId), JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to quick save:', error);
      return false;
    }
  }

  public quickLoad(scenarioId: string): CampaignSaveData | null {
    try {
      const saveData = localStorage.getItem(this.getQuickSaveKey(scenarioId));
      return saveData ? JSON.parse(saveData) : null;
    } catch (error) {
      console.error('Failed to quick load:', error);
      return null;
    }
  }

  public getCampaignSaves(scenarioId: string): CampaignSaveData[] {
    try {
      const savesData = localStorage.getItem(this.getStorageKey(scenarioId));
      return savesData ? JSON.parse(savesData) : [];
    } catch (error) {
      console.error('Failed to get campaign saves:', error);
      return [];
    }
  }

  public deleteCampaignSave(saveId: string, scenarioId: string): boolean {
    try {
      const saves = this.getCampaignSaves(scenarioId);
      const filteredSaves = saves.filter(save => save.id !== saveId);

      localStorage.setItem(this.getStorageKey(scenarioId), JSON.stringify(filteredSaves));
      return true;
    } catch (error) {
      console.error('Failed to delete campaign save:', error);
      return false;
    }
  }

  public createCheckpoint(
    scenarioId: string,
    gameState: GameState,
    description: string,
    automatic: boolean = false
  ): void {
    try {
      const sessionString = localStorage.getItem('current-campaign-session');
      if (!sessionString) return;

      const sessionInfo = JSON.parse(sessionString);
      const objectives = this.getCurrentObjectiveProgress();

      const checkpoint: CampaignCheckpoint = {
        id: `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        gameState: {
          day: gameState.day,
          hour: gameState.hour,
          resources: { ...gameState.resources },
          facilities: [...gameState.facilities],
          xenomorphs: [...gameState.xenomorphs]
        },
        objectiveProgress: { ...objectives },
        description,
        automatic
      };

      sessionInfo.sessionData.checkpoints.push(checkpoint);

      // Keep only the last 10 checkpoints
      if (sessionInfo.sessionData.checkpoints.length > 10) {
        sessionInfo.sessionData.checkpoints = sessionInfo.sessionData.checkpoints.slice(-10);
      }

      localStorage.setItem('current-campaign-session', JSON.stringify(sessionInfo));
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    }
  }

  public getCheckpoints(scenarioId: string): CampaignCheckpoint[] {
    try {
      const sessionString = localStorage.getItem('current-campaign-session');
      if (!sessionString) return [];

      const sessionInfo = JSON.parse(sessionString);
      if (sessionInfo.scenarioId !== scenarioId) return [];

      return sessionInfo.sessionData.checkpoints || [];
    } catch (error) {
      console.error('Failed to get checkpoints:', error);
      return [];
    }
  }

  public restoreCheckpoint(checkpointId: string): CampaignCheckpoint | null {
    try {
      const sessionString = localStorage.getItem('current-campaign-session');
      if (!sessionString) return null;

      const sessionInfo = JSON.parse(sessionString);
      const checkpoint = sessionInfo.sessionData.checkpoints.find(
        (cp: CampaignCheckpoint) => cp.id === checkpointId
      );

      return checkpoint || null;
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      return null;
    }
  }

  private getCurrentScenario(): CampaignScenario | null {
    try {
      const scenarioData = localStorage.getItem('current-campaign-scenario');
      return scenarioData ? (JSON.parse(scenarioData) as CampaignScenario) : null;
    } catch {
      return null;
    }
  }

  private getCurrentObjectiveProgress(): CampaignSaveData['objectives'] {
    try {
      const progressData = localStorage.getItem('campaign-objective-progress');
      return progressData ? (JSON.parse(progressData) as CampaignSaveData['objectives']) : {};
    } catch {
      return {};
    }
  }

  private getCurrentSessionData(): CampaignSaveData['sessionData'] {
    try {
      const sessionString = localStorage.getItem('current-campaign-session');
      if (!sessionString) {
        return {
          startTime: Date.now(),
          elapsedTime: 0,
          facilitiesBuilt: 0,
          speciesContained: 0,
          crisisesHandled: 0,
          checkpoints: []
        };
      }

      const sessionInfo = JSON.parse(sessionString);
      return sessionInfo.sessionData;
    } catch {
      return {
        startTime: Date.now(),
        elapsedTime: 0,
        facilitiesBuilt: 0,
        speciesContained: 0,
        crisisesHandled: 0,
        checkpoints: []
      };
    }
  }

  public updateSessionStats(stats: {
    facilitiesBuilt?: number;
    speciesContained?: number;
    crisisesHandled?: number;
  }): void {
    try {
      const sessionString = localStorage.getItem('current-campaign-session');
      if (!sessionString) return;

      const sessionInfo = JSON.parse(sessionString);

      if (stats.facilitiesBuilt !== undefined) {
        sessionInfo.sessionData.facilitiesBuilt += stats.facilitiesBuilt;
      }

      if (stats.speciesContained !== undefined) {
        sessionInfo.sessionData.speciesContained += stats.speciesContained;
      }

      if (stats.crisisesHandled !== undefined) {
        sessionInfo.sessionData.crisisesHandled += stats.crisisesHandled;
      }

      // Update elapsed time
      sessionInfo.sessionData.elapsedTime = Date.now() - sessionInfo.sessionData.startTime;

      localStorage.setItem('current-campaign-session', JSON.stringify(sessionInfo));
    } catch (error) {
      console.error('Failed to update session stats:', error);
    }
  }

  public exportCampaignProgress(): string {
    try {
      const allData = {
        campaignProgress: localStorage.getItem('xenomorph-park-campaign-full-progress'),
        scenarios: Object.keys(localStorage)
          .filter(key => key.startsWith('xenomorph-park-campaign-saves-'))
          .reduce((acc, key) => {
            acc[key] = localStorage.getItem(key);
            return acc;
          }, {} as Record<string, string | null>)
      };

      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export campaign progress:', error);
      return '';
    }
  }

  public importCampaignProgress(data: string): boolean {
    try {
      const importData = JSON.parse(data);

      if (importData.campaignProgress) {
        localStorage.setItem('xenomorph-park-campaign-full-progress', importData.campaignProgress);
      }

      if (importData.scenarios) {
        Object.entries(importData.scenarios).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to import campaign progress:', error);
      return false;
    }
  }

  public clearAllCampaignData(): void {
    // Clear all campaign-related localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith('xenomorph-park-campaign-'))
      .forEach(key => localStorage.removeItem(key));

    // Stop auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

export const campaignSaveManager = CampaignSaveManager.getInstance();
