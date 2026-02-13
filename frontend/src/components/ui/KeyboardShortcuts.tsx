import { useEffect, useCallback, useMemo } from "react";
import { useGameStore } from "../../stores/gameStore";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: "game" | "navigation" | "building";
}

export function KeyboardShortcuts() {
  const {
    togglePause,
    reset,
    quickSave,
    quickLoad,
    selectedFacility,
    selectedSpecies,
    selectFacility,
    selectSpecies,
    addStatusMessage,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGameStore();

  const showHelpDialog = useCallback((shortcutsToShow: KeyboardShortcut[]) => {
    const helpContent = shortcutsToShow.reduce(
      (acc, shortcut) => {
        if (!acc[shortcut.category]) {
          acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
      },
      {} as Record<string, KeyboardShortcut[]>,
    );

    const formatKey = (shortcut: KeyboardShortcut) => {
      const parts = [];
      if (shortcut.ctrlKey) parts.push("Ctrl");
      if (shortcut.shiftKey) parts.push("Shift");
      if (shortcut.altKey) parts.push("Alt");
      parts.push(shortcut.key === " " ? "Space" : shortcut.key.toUpperCase());
      return parts.join(" + ");
    };

    const helpText = Object.entries(helpContent)
      .map(([category, shortcuts]) => {
        const categoryName =
          category.charAt(0).toUpperCase() + category.slice(1);
        const shortcutList = shortcuts
          .map((s) => `  ${formatKey(s)} - ${s.description}`)
          .join("\n");
        return `${categoryName}:\n${shortcutList}`;
      })
      .join("\n\n");

    alert(`Keyboard Shortcuts:\n\n${helpText}`);
  }, []);

  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // Game Controls
      {
        key: " ",
        action: () => togglePause(),
        description: "Toggle Pause",
        category: "game",
      },
      {
        key: "r",
        ctrlKey: true,
        action: () => {
          if (confirm("Reset game? All progress will be lost.")) {
            reset();
          }
        },
        description: "Reset Game",
        category: "game",
      },

      // Save/Load
      {
        key: "s",
        ctrlKey: true,
        action: () => quickSave(),
        description: "Quick Save",
        category: "game",
      },
      {
        key: "l",
        ctrlKey: true,
        action: () => quickLoad(),
        description: "Quick Load",
        category: "game",
      },

      // Undo/Redo
      {
        key: "z",
        ctrlKey: true,
        action: () => {
          if (canUndo()) {
            undo();
            addStatusMessage("Action undone", "info");
          }
        },
        description: "Undo",
        category: "building",
      },
      {
        key: "y",
        ctrlKey: true,
        action: () => {
          if (canRedo()) {
            redo();
            addStatusMessage("Action redone", "info");
          }
        },
        description: "Redo",
        category: "building",
      },

      // Building Mode
      {
        key: "Escape",
        action: () => {
          if (selectedFacility || selectedSpecies) {
            selectFacility(null);
            selectSpecies(null);
            addStatusMessage("Selection cleared", "info");
          }
        },
        description: "Clear Selection",
        category: "building",
      },

      // Number keys for quick facility selection
      {
        key: "1",
        action: () => {
          // Will be implemented with facility quick select
          addStatusMessage(
            "Quick select: Research Lab (Not implemented)",
            "info",
          );
        },
        description: "Quick Select Research Lab",
        category: "building",
      },
      {
        key: "2",
        action: () => {
          addStatusMessage("Quick select: Hatchery (Not implemented)", "info");
        },
        description: "Quick Select Hatchery",
        category: "building",
      },
      {
        key: "3",
        action: () => {
          addStatusMessage(
            "Quick select: Containment Unit (Not implemented)",
            "info",
          );
        },
        description: "Quick Select Containment Unit",
        category: "building",
      },

      // Help
      {
        key: "h",
        action: () => showHelpDialog(shortcuts),
        description: "Show Help",
        category: "navigation",
      },
      {
        key: "?",
        shiftKey: true,
        action: () => showHelpDialog(shortcuts),
        description: "Show Help",
        category: "navigation",
      },
    ],
    [
      addStatusMessage,
      canRedo,
      canUndo,
      quickLoad,
      quickSave,
      redo,
      reset,
      selectFacility,
      selectSpecies,
      selectedFacility,
      selectedSpecies,
      showHelpDialog,
      togglePause,
      undo,
    ],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // This component doesn't render anything visible
  return null;
}

// Hook for components that want to register custom shortcuts
export function useKeyboardShortcut(
  key: string,
  action: () => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    enabled?: boolean;
  } = {},
) {
  const {
    enabled = true,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        action();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, action, enabled, ctrlKey, shiftKey, altKey]);
}
