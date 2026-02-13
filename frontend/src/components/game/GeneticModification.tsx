import { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { xenomorphSpecies } from "../../data/gameData";
import { XenomorphSpecies } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Tooltip } from "../ui/Tooltip";

interface GeneticTrait {
  id: string;
  name: string;
  description: string;
  type: "physical" | "behavioral" | "special";
  cost: number;
  effect: {
    dangerLevel?: number;
    containmentDifficulty?: number;
    foodRequirement?: number;
    specialAbilities?: string[];
  };
}

const geneticTraits: GeneticTrait[] = [
  {
    id: "enhanced_carapace",
    name: "Enhanced Carapace",
    description:
      "Reinforced exoskeleton increases durability but makes containment harder",
    type: "physical",
    cost: 500,
    effect: {
      dangerLevel: 1,
      containmentDifficulty: 2,
      specialAbilities: ["Armor Plating"],
    },
  },
  {
    id: "improved_agility",
    name: "Improved Agility",
    description: "Enhanced muscle fibers increase speed and escape potential",
    type: "physical",
    cost: 300,
    effect: {
      dangerLevel: 1,
      containmentDifficulty: 1,
      specialAbilities: ["Rapid Movement"],
    },
  },
  {
    id: "acid_resistance",
    name: "Acid Resistance",
    description:
      "Modified cellular structure provides resistance to acidic environments",
    type: "special",
    cost: 400,
    effect: {
      specialAbilities: ["Acid Immunity"],
    },
  },
  {
    id: "pheromone_control",
    name: "Pheromone Control",
    description: "Enhanced communication abilities for pack coordination",
    type: "behavioral",
    cost: 600,
    effect: {
      dangerLevel: 2,
      specialAbilities: ["Pack Leader", "Coordinated Attacks"],
    },
  },
  {
    id: "stealth_adaptation",
    name: "Stealth Adaptation",
    description: "Adaptive camouflage makes detection extremely difficult",
    type: "special",
    cost: 800,
    effect: {
      dangerLevel: 2,
      containmentDifficulty: 3,
      specialAbilities: ["Camouflage", "Silent Movement"],
    },
  },
  {
    id: "regeneration",
    name: "Rapid Regeneration",
    description: "Enhanced healing factor but requires more food",
    type: "physical",
    cost: 700,
    effect: {
      foodRequirement: 1,
      specialAbilities: ["Self-Healing"],
    },
  },
];

interface GeneticModificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneticModification({
  isOpen,
  onClose,
}: GeneticModificationProps) {
  const { resources, research, addStatusMessage, updateResources } =
    useGameStore();
  const [selectedBaseSpecies, setSelectedBaseSpecies] =
    useState<XenomorphSpecies | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<GeneticTrait[]>([]);
  const [customName, setCustomName] = useState("");

  const availableSpecies = xenomorphSpecies.filter((species) =>
    research.completed.includes(species.name),
  );

  const totalCost = selectedTraits.reduce((sum, trait) => sum + trait.cost, 0);
  const baseResearchCost = selectedBaseSpecies?.researchCost || 0;
  const totalResearchCost = baseResearchCost + Math.floor(totalCost / 10);

  const canAfford =
    resources.credits >= totalCost && resources.research >= totalResearchCost;

  const handleTraitToggle = (trait: GeneticTrait) => {
    setSelectedTraits((prev) => {
      const isSelected = prev.find((t) => t.id === trait.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== trait.id);
      } else {
        return [...prev, trait];
      }
    });
  };

  const calculateModifiedSpecies = (): XenomorphSpecies | null => {
    if (!selectedBaseSpecies) return null;

    let dangerLevel = selectedBaseSpecies.dangerLevel;
    let containmentDifficulty = selectedBaseSpecies.containmentDifficulty;
    let foodRequirement = selectedBaseSpecies.foodRequirement;
    const specialAbilities = [...selectedBaseSpecies.specialAbilities];

    // Apply trait effects
    selectedTraits.forEach((trait) => {
      if (trait.effect.dangerLevel) {
        dangerLevel = Math.min(10, dangerLevel + trait.effect.dangerLevel);
      }
      if (trait.effect.containmentDifficulty) {
        containmentDifficulty = Math.min(
          10,
          containmentDifficulty + trait.effect.containmentDifficulty,
        );
      }
      if (trait.effect.foodRequirement) {
        const foodLevels: XenomorphSpecies["foodRequirement"][] = [
          "Low",
          "Medium",
          "High",
          "Very High",
        ];
        const currentIndex = foodLevels.indexOf(foodRequirement);
        const newIndex = Math.min(
          foodLevels.length - 1,
          currentIndex + trait.effect.foodRequirement,
        );
        foodRequirement = foodLevels[newIndex];
      }
      if (trait.effect.specialAbilities) {
        specialAbilities.push(...trait.effect.specialAbilities);
      }
    });

    return {
      name: customName || `Modified ${selectedBaseSpecies.name}`,
      description: `Genetically modified ${selectedBaseSpecies.name} with enhanced capabilities`,
      dangerLevel,
      containmentDifficulty,
      researchCost: totalResearchCost,
      foodRequirement,
      specialAbilities: [...new Set(specialAbilities)], // Remove duplicates
    };
  };

  const handleCreateSpecies = () => {
    if (!selectedBaseSpecies || selectedTraits.length === 0 || !canAfford)
      return;

    const newSpecies = calculateModifiedSpecies();
    if (!newSpecies) return;

    // Deduct costs
    updateResources({
      credits: resources.credits - totalCost,
      research: resources.research - totalResearchCost,
    });

    // Add to completed research
    research.completed.push(newSpecies.name);

    addStatusMessage(`Successfully created ${newSpecies.name}!`, "success");

    // Reset form
    setSelectedBaseSpecies(null);
    setSelectedTraits([]);
    setCustomName("");

    onClose();
  };

  const getTraitTypeColor = (type: GeneticTrait["type"]) => {
    switch (type) {
      case "physical":
        return "text-blue-400";
      case "behavioral":
        return "text-purple-400";
      case "special":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getTraitTypeIcon = (type: GeneticTrait["type"]) => {
    switch (type) {
      case "physical":
        return "💪";
      case "behavioral":
        return "🧠";
      case "special":
        return "✨";
      default:
        return "🔬";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Genetic Modification Laboratory"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Base Species Selection */}
        <div>
          <h4 className="text-green-400 font-semibold mb-3">
            Select Base Species
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {availableSpecies.map((species) => (
              <button
                key={species.name}
                onClick={() => setSelectedBaseSpecies(species)}
                className={`p-3 rounded border text-left transition-colors ${
                  selectedBaseSpecies?.name === species.name
                    ? "border-green-400 bg-green-400/20"
                    : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
                }`}
              >
                <div className="font-semibold text-green-400">
                  {species.name}
                </div>
                <div className="text-sm text-slate-400">
                  Danger: {species.dangerLevel} | Containment:{" "}
                  {species.containmentDifficulty}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Genetic Traits */}
        {selectedBaseSpecies && (
          <div>
            <h4 className="text-green-400 font-semibold mb-3">
              Available Genetic Modifications
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {geneticTraits.map((trait) => {
                const isSelected = selectedTraits.find(
                  (t) => t.id === trait.id,
                );
                const canAffordTrait = resources.credits >= trait.cost;

                return (
                  <Tooltip
                    key={trait.id}
                    content={
                      <div className="space-y-2">
                        <div className="font-semibold">{trait.name}</div>
                        <div className="text-sm">{trait.description}</div>
                        <div className="text-xs border-t border-slate-600 pt-2">
                          <div>
                            Cost: {trait.cost} 💰 +{" "}
                            {Math.floor(trait.cost / 10)} 🔬
                          </div>
                          <div className={getTraitTypeColor(trait.type)}>
                            Type: {getTraitTypeIcon(trait.type)} {trait.type}
                          </div>
                        </div>
                      </div>
                    }
                    rich={true}
                  >
                    <button
                      onClick={() => handleTraitToggle(trait)}
                      disabled={!canAffordTrait}
                      className={`w-full p-2 rounded border text-left transition-colors ${
                        isSelected
                          ? "border-green-400 bg-green-400/20"
                          : canAffordTrait
                            ? "border-slate-600 hover:border-slate-500 bg-slate-800/50"
                            : "border-slate-700 bg-slate-900/50 opacity-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm">
                            {getTraitTypeIcon(trait.type)} {trait.name}
                          </div>
                          <div
                            className={`text-xs ${getTraitTypeColor(trait.type)}`}
                          >
                            {trait.type}
                          </div>
                        </div>
                        <div className="text-xs text-yellow-400">
                          {trait.cost} 💰
                        </div>
                      </div>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Name Input */}
        {selectedBaseSpecies && selectedTraits.length > 0 && (
          <div>
            <h4 className="text-green-400 font-semibold mb-3">
              Custom Species Name
            </h4>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`Modified ${selectedBaseSpecies.name}`}
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
            />
          </div>
        )}

        {/* Preview */}
        {selectedBaseSpecies && selectedTraits.length > 0 && (
          <div>
            <h4 className="text-green-400 font-semibold mb-3">
              Species Preview
            </h4>
            {(() => {
              const preview = calculateModifiedSpecies();
              return preview ? (
                <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                  <div className="font-semibold text-green-400">
                    {preview.name}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    {preview.description}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      Danger Level:{" "}
                      <span className="text-red-400">
                        {preview.dangerLevel}
                      </span>
                    </div>
                    <div>
                      Containment:{" "}
                      <span className="text-orange-400">
                        {preview.containmentDifficulty}
                      </span>
                    </div>
                    <div>
                      Food:{" "}
                      <span className="text-blue-400">
                        {preview.foodRequirement}
                      </span>
                    </div>
                    <div>
                      Research Cost:{" "}
                      <span className="text-yellow-400">
                        {preview.researchCost}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-slate-400 mb-1">
                      Abilities:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {preview.specialAbilities.map((ability, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700 rounded text-xs text-green-300"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Cost Summary */}
        {selectedTraits.length > 0 && (
          <div className="bg-slate-800/30 p-3 rounded border border-slate-600">
            <h4 className="text-green-400 font-semibold mb-2">Total Cost</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Credits:</span>
                <span
                  className={
                    resources.credits >= totalCost
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {totalCost} 💰
                </span>
              </div>
              <div className="flex justify-between">
                <span>Research:</span>
                <span
                  className={
                    resources.research >= totalResearchCost
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {totalResearchCost} 🔬
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleCreateSpecies}
            disabled={
              !selectedBaseSpecies || selectedTraits.length === 0 || !canAfford
            }
            className="flex-1"
          >
            🧬 Create Modified Species
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {!canAfford && selectedTraits.length > 0 && (
          <div className="text-red-400 text-sm text-center">
            Insufficient resources for genetic modification
          </div>
        )}
      </div>
    </Modal>
  );
}
