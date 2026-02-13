import { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { xenomorphSpecies } from "../../data/gameData";
import { dangerLevelColors } from "../../constants/gameConstants";
import { XenomorphSpecies } from "../../types";
import { CollapsiblePanel } from "../ui/CollapsiblePanel";
import { Button } from "../ui/Button";

type SpeciesCategory =
  | "basic"
  | "combat"
  | "specialized"
  | "hybrid"
  | "environmental";
type SortMode = "category" | "danger" | "research" | "availability";

interface SpeciesGroup {
  category: SpeciesCategory;
  name: string;
  icon: string;
  description: string;
  species: XenomorphSpecies[];
}

export function GroupedSpeciesPanel() {
  const { selectedSpecies, selectSpecies, research } = useGameStore();
  const [sortMode, setSortMode] = useState<SortMode>("category");
  const [filterResearched, setFilterResearched] = useState(false);

  const isResearched = (species: XenomorphSpecies) => {
    return research.completed.includes(species.name);
  };

  const isAvailable = (species: XenomorphSpecies) => {
    return research.available?.includes(species.name) || false;
  };

  const categorizeSpecies = (species: XenomorphSpecies): SpeciesCategory => {
    // Basic lifecycle species
    if (["Drone", "Facehugger", "Chestburster"].includes(species.name)) {
      return "basic";
    }

    // Combat-oriented species
    if (
      ["Warrior", "Praetorian", "Crusher", "Berserker Xenomorph"].includes(
        species.name,
      )
    ) {
      return "combat";
    }

    // Environmental variants
    if (
      [
        "Aqua Xenomorph",
        "Cryo Xenomorph",
        "Pyro Xenomorph",
        "Void Xenomorph",
      ].includes(species.name)
    ) {
      return "environmental";
    }

    // Hybrid/engineered species
    if (
      [
        "Predalien",
        "Xeno-Engineer",
        "Synthetic Xenomorph",
        "Nano Xenomorph",
      ].includes(species.name)
    ) {
      return "hybrid";
    }

    // Specialized/advanced species
    return "specialized";
  };

  const groupSpecies = (): SpeciesGroup[] => {
    const groups: SpeciesGroup[] = [
      {
        category: "basic",
        name: "Basic Lifecycle",
        icon: "🥚",
        description: "Fundamental xenomorph forms",
        species: [],
      },
      {
        category: "combat",
        name: "Combat Variants",
        icon: "⚔️",
        description: "Aggressive and defensive specialists",
        species: [],
      },
      {
        category: "specialized",
        name: "Specialized Forms",
        icon: "🎯",
        description: "Unique adaptations and abilities",
        species: [],
      },
      {
        category: "environmental",
        name: "Environmental",
        icon: "🌍",
        description: "Climate-adapted variants",
        species: [],
      },
      {
        category: "hybrid",
        name: "Hybrid & Engineered",
        icon: "🧬",
        description: "Advanced genetic combinations",
        species: [],
      },
    ];

    // Categorize all species
    xenomorphSpecies.forEach((species) => {
      const category = categorizeSpecies(species);
      const group = groups.find((g) => g.category === category);
      if (group) {
        group.species.push(species);
      }
    });

    // Sort species within each group
    groups.forEach((group) => {
      group.species.sort((a, b) => {
        if (sortMode === "danger") return a.dangerLevel - b.dangerLevel;
        if (sortMode === "research") return a.researchCost - b.researchCost;
        if (sortMode === "availability") {
          const aAvailable = isResearched(a) || isAvailable(a);
          const bAvailable = isResearched(b) || isAvailable(b);
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Filter empty groups and apply research filter
    return groups
      .filter((group) => group.species.length > 0)
      .map((group) => ({
        ...group,
        species: filterResearched
          ? group.species.filter((s) => isResearched(s) || isAvailable(s))
          : group.species,
      }))
      .filter((group) => group.species.length > 0);
  };

  const handleSpeciesSelect = (species: XenomorphSpecies) => {
    if (selectedSpecies?.name === species.name) {
      selectSpecies(null);
    } else {
      selectSpecies(species);
    }
  };

  const getDangerLevelColor = (level: number) => {
    return (
      dangerLevelColors[level as keyof typeof dangerLevelColors] ||
      "text-red-600"
    );
  };

  const groups = groupSpecies();
  const totalAvailable = xenomorphSpecies.filter(
    (s) => isResearched(s) || isAvailable(s),
  ).length;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-green-400 font-bold text-lg glow">
            Xenomorph Species ({totalAvailable}/{xenomorphSpecies.length})
          </h3>
          <div className="flex gap-1">
            <Button
              variant={filterResearched ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterResearched(!filterResearched)}
              className="text-xs"
            >
              🔓 Available Only
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-1">
          <span className="text-slate-400 text-xs mr-2">Sort by:</span>
          {[
            { mode: "category" as SortMode, label: "Category", icon: "📁" },
            { mode: "danger" as SortMode, label: "Danger", icon: "⚠️" },
            {
              mode: "research" as SortMode,
              label: "Research Cost",
              icon: "🔬",
            },
            {
              mode: "availability" as SortMode,
              label: "Available First",
              icon: "🔓",
            },
          ].map(({ mode, label, icon }) => (
            <Button
              key={mode}
              variant={sortMode === mode ? "primary" : "outline"}
              size="sm"
              onClick={() => setSortMode(mode)}
              className="text-xs flex items-center gap-1"
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Species Groups */}
      {groups.map((group) => (
        <CollapsiblePanel
          key={group.category}
          title={group.name}
          icon={group.icon}
          badge={group.species.length}
          defaultExpanded={
            group.category === "basic" ||
            group.species.some((s) => isResearched(s) || isAvailable(s))
          }
          actions={[
            {
              label: "Quick Select",
              icon: "⚡",
              onClick: () => {
                // Select first available species in group
                const availableSpecies = group.species.find(
                  (s) => isResearched(s) || isAvailable(s),
                );
                if (availableSpecies) {
                  selectSpecies(availableSpecies);
                }
              },
              variant: "outline",
            },
          ]}
        >
          <div className="mt-3">
            <p className="text-slate-400 text-sm mb-3">{group.description}</p>
            <div className="grid grid-cols-1 gap-2">
              {group.species.map((species) => {
                const isSelected = selectedSpecies?.name === species.name;
                const researched = isResearched(species);
                const available = isAvailable(species);
                const canPlace = researched || available;

                return (
                  <button
                    key={species.name}
                    onClick={() => handleSpeciesSelect(species)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all duration-200
                      ${
                        isSelected
                          ? "border-green-400 bg-green-400/20 shadow-lg shadow-green-400/20"
                          : "border-slate-600 hover:border-slate-500"
                      }
                      ${!canPlace ? "opacity-30" : "hover:bg-slate-800/50"}
                    `}
                    disabled={!canPlace}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-semibold">
                          {species.name}
                        </span>
                        {researched && (
                          <span className="text-green-400 text-xs">✅</span>
                        )}
                        {available && !researched && (
                          <span className="text-yellow-400 text-xs">🔓</span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div
                          className={`${getDangerLevelColor(species.dangerLevel)}`}
                        >
                          ⚠️ {species.dangerLevel}
                        </div>
                        <div className="text-yellow-400 text-xs">
                          🔬 {species.researchCost}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      {species.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {species.specialAbilities
                        .slice(0, 2)
                        .map((ability, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 rounded text-xs text-green-300"
                          >
                            {ability}
                          </span>
                        ))}
                      {species.specialAbilities.length > 2 && (
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                          +{species.specialAbilities.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsiblePanel>
      ))}
    </div>
  );
}
