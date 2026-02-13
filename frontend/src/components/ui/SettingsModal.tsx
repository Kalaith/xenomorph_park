import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useGameStore } from "../../stores/gameStore";
import { saveManager } from "../../utils/saveManager";

interface GameSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  gridSize: "small" | "medium" | "large";
  animations: boolean;
  soundEffects: boolean;
  notifications: boolean;
  theme: "dark" | "light" | "high-contrast";
  language: "en" | "es" | "fr" | "de";
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings: GameSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  gridSize: "medium",
  animations: true,
  soundEffects: true,
  notifications: true,
  theme: "dark",
  language: "en",
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<
    "game" | "display" | "audio" | "saves"
  >("game");
  const { addStatusMessage, loadGame } = useGameStore();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("xenomorph-park-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem(
      "xenomorph-park-settings",
      JSON.stringify(newSettings),
    );
    addStatusMessage("Settings saved", "success");
  };

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    if (confirm("Reset all settings to default values?")) {
      saveSettings(defaultSettings);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "xenomorph-park-settings.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveSettings({ ...defaultSettings, ...imported });
        addStatusMessage("Settings imported successfully", "success");
      } catch {
        addStatusMessage("Failed to import settings", "error");
      }
    };
    reader.readAsText(file);
  };

  const getAllSaves = () => saveManager.getAllSaves();
  const storageInfo = saveManager.getStorageUsage();

  const tabs = [
    { id: "game" as const, label: "🎮 Game", icon: "🎮" },
    { id: "display" as const, label: "🖥️ Display", icon: "🖥️" },
    { id: "audio" as const, label: "🔊 Audio", icon: "🔊" },
    { id: "saves" as const, label: "💾 Saves", icon: "💾" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Game Settings">
      <div className="min-h-[500px]">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-600 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Game Settings Tab */}
        {activeTab === "game" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Gameplay</h3>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Auto Save</label>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) =>
                    handleSettingChange("autoSave", e.target.checked)
                  }
                  className="w-4 h-4 text-green-400 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">
                  Auto Save Interval (seconds)
                </label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) =>
                    handleSettingChange(
                      "autoSaveInterval",
                      parseInt(e.target.value),
                    )
                  }
                  className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1"
                  disabled={!settings.autoSave}
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Grid Size</label>
                <select
                  value={settings.gridSize}
                  onChange={(e) =>
                    handleSettingChange(
                      "gridSize",
                      e.target.value as GameSettings["gridSize"],
                    )
                  }
                  className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1"
                >
                  <option value="small">Small (6x6)</option>
                  <option value="medium">Medium (8x8)</option>
                  <option value="large">Large (10x10)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange(
                      "language",
                      e.target.value as GameSettings["language"],
                    )
                  }
                  className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Display Settings Tab */}
        {activeTab === "display" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Visual</h3>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    handleSettingChange(
                      "theme",
                      e.target.value as GameSettings["theme"],
                    )
                  }
                  className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Animations</label>
                <input
                  type="checkbox"
                  checked={settings.animations}
                  onChange={(e) =>
                    handleSettingChange("animations", e.target.checked)
                  }
                  className="w-4 h-4 text-green-400 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange("notifications", e.target.checked)
                  }
                  className="w-4 h-4 text-green-400 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audio Settings Tab */}
        {activeTab === "audio" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Sound</h3>

              <div className="flex items-center justify-between">
                <label className="text-slate-300">Sound Effects</label>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) =>
                    handleSettingChange("soundEffects", e.target.checked)
                  }
                  className="w-4 h-4 text-green-400 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
                />
              </div>

              <div className="text-sm text-slate-400">
                <p>🔊 Sound system integration coming soon</p>
                <p>
                  This will include ambient sounds, UI feedback, and alert
                  sounds
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Management Tab */}
        {activeTab === "saves" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">
                Save Management
              </h3>

              <div className="bg-slate-800 rounded p-3">
                <p className="text-sm text-slate-300 mb-2">Storage Usage</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(storageInfo.percentage, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {(storageInfo.used / 1024).toFixed(1)}KB /{" "}
                  {(storageInfo.available / 1024).toFixed(0)}KB
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Available Save Slots ({getAllSaves().length})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {getAllSaves().map((save) => (
                    <div
                      key={save.id}
                      className="flex items-center justify-between bg-slate-800 rounded p-2"
                    >
                      <div>
                        <p className="text-sm text-slate-300">{save.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(save.data.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadGame(save.id)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveManager.exportSave(save.id)}
                        >
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (confirm(`Delete save "${save.name}"?`)) {
                              saveManager.deleteSave(save.id);
                            }
                          }}
                        >
                          ❌
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => saveManager.cleanupOldSaves()}
                >
                  🧹 Cleanup Old Saves
                </Button>
                <Button variant="outline" onClick={exportSettings}>
                  📤 Export Settings
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                  <Button variant="outline" as="span">
                    📥 Import Settings
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-600">
          <Button variant="outline" onClick={resetSettings}>
            🔄 Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
