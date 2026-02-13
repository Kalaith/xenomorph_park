
import { GameState } from "../types";

export interface SaveData {
  gameState: Partial<GameState>;
  timestamp: number;
  version: string;
  playTime: number;
}

export interface SaveSlot {
  id: string;
  name: string;
  data: SaveData;
  isAutoSave: boolean;
}

const saveKeyPrefix = "xenomorph-park-save";
const currentVersion = "1.0.0";
const maxSaveSlots = 5;
const autoSaveInterval = 30000; // 30 seconds

export class SaveManager {
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private playStartTime: number = Date.now();

  // Save game to specific slot
  saveGame(state: Partial<GameState>, slotId: string, name?: string): boolean {
    try {
      const playTime = this.getPlayTime();
      const saveData: SaveData = {
        gameState: state,
        timestamp: Date.now(),
        version: currentVersion,
        playTime,
      };

      const saveSlot: SaveSlot = {
        id: slotId,
        name: name || `Save ${new Date().toLocaleString()}`,
        data: saveData,
        isAutoSave: slotId === "autosave",
      };

      localStorage.setItem(
        `${saveKeyPrefix}-${slotId}`,
        JSON.stringify(saveSlot),
      );
      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      return false;
    }
  }

  // Load game from specific slot
  loadGame(slotId: string): SaveData | null {
    try {
      const saveDataString = localStorage.getItem(`${saveKeyPrefix}-${slotId}`);
      if (!saveDataString) return null;

      const saveSlot: SaveSlot = JSON.parse(saveDataString);

      // Version compatibility check
      if (saveSlot.data.version !== currentVersion) {
        console.warn(
          `Save version mismatch: ${saveSlot.data.version} vs ${currentVersion}`,
        );
        // Could implement migration logic here
      }

      this.playStartTime = Date.now() - saveSlot.data.playTime;
      return saveSlot.data;
    } catch (error) {
      console.error("Failed to load game:", error);
      return null;
    }
  }

  // Get all save slots
  getAllSaves(): SaveSlot[] {
    const saves: SaveSlot[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(saveKeyPrefix)) {
        try {
          const saveDataString = localStorage.getItem(key);
          if (saveDataString) {
            const saveSlot: SaveSlot = JSON.parse(saveDataString);
            saves.push(saveSlot);
          }
        } catch (error) {
          console.error(`Failed to parse save slot ${key}:`, error);
        }
      }
    }

    return saves.sort((a, b) => b.data.timestamp - a.data.timestamp);
  }

  // Delete save slot
  deleteSave(slotId: string): boolean {
    try {
      localStorage.removeItem(`${saveKeyPrefix}-${slotId}`);
      return true;
    } catch (error) {
      console.error("Failed to delete save:", error);
      return false;
    }
  }

  // Auto-save functionality
  startAutoSave(getGameState: () => Partial<GameState>): void {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.saveGame(getGameState(), "autosave", "Auto Save");
    }, autoSaveInterval);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Quick save/load
  quickSave(state: Partial<GameState>): boolean {
    return this.saveGame(state, "quicksave", "Quick Save");
  }

  quickLoad(): SaveData | null {
    return this.loadGame("quicksave");
  }

  // Export save data as JSON file
  exportSave(slotId: string): void {
    const saveSlot = this.getAllSaves().find((save) => save.id === slotId);
    if (!saveSlot) return;

    const dataStr = JSON.stringify(saveSlot, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `xenomorph-park-${saveSlot.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import save data from JSON file
  importSave(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveSlot: SaveSlot = JSON.parse(e.target?.result as string);

          // Generate new ID to avoid conflicts
          const newId = `imported-${Date.now()}`;
          saveSlot.id = newId;
          saveSlot.name = `Imported - ${saveSlot.name}`;

          localStorage.setItem(
            `${saveKeyPrefix}-${newId}`,
            JSON.stringify(saveSlot),
          );
          resolve(true);
        } catch (error) {
          console.error("Failed to import save:", error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }

  // Get current play time
  getPlayTime(): number {
    return Date.now() - this.playStartTime;
  }

  // Format play time for display
  formatPlayTime(playTime: number): string {
    const hours = Math.floor(playTime / 3600000);
    const minutes = Math.floor((playTime % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  // Storage management
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(saveKeyPrefix)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }

      // Estimate available space (most browsers allow ~5-10MB)
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Clean up old saves if storage is getting full
  cleanupOldSaves(): void {
    const saves = this.getAllSaves().filter((save) => !save.isAutoSave);
    if (saves.length > maxSaveSlots) {
      const toDelete = saves.slice(maxSaveSlots);
      toDelete.forEach((save) => this.deleteSave(save.id));
    }
  }
}

export const saveManager = new SaveManager();
