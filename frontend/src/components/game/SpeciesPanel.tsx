import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { xenomorphSpecies } from '../../data/gameData';
import { dangerLevelColors } from '../../constants/gameConstants';
import { XenomorphSpecies } from '../../types';
import { GeneticModification } from './GeneticModification';
import { Button } from '../ui/Button';

export function SpeciesPanel() {
  const { selectedSpecies, selectSpecies, research } = useGameStore();
  const [isGeneticModificationOpen, setIsGeneticModificationOpen] = useState(false);

  const handleSpeciesSelect = (species: XenomorphSpecies) => {
    if (selectedSpecies?.name === species.name) {
      selectSpecies(null);
    } else {
      selectSpecies(species);
    }
  };

  const isResearched = (species: XenomorphSpecies) => {
    return research.completed.includes(species.name);
  };

  const isAvailable = (species: XenomorphSpecies) => {
    return research.available?.includes(species.name) || false;
  };

  const getDangerLevelColor = (level: number) => {
    return dangerLevelColors[level as keyof typeof dangerLevelColors] || 'text-red-600';
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-green-400 font-bold text-lg glow">Xenomorph Species</h3>
        <Button
          variant="outline"
          onClick={() => setIsGeneticModificationOpen(true)}
          className="text-sm"
          title="Open Genetic Modification Laboratory"
        >
          🧬 Gene Lab
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {xenomorphSpecies.map((species) => {
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
                ${isSelected
                  ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/20'
                  : 'border-slate-600 hover:border-slate-500'
                }
                ${!canPlace ? 'opacity-30' : 'hover:bg-slate-800/50'}
              `}
              disabled={!canPlace}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-400 font-semibold">{species.name}</span>
                <div className="text-right text-sm">
                  <div className={`${getDangerLevelColor(species.dangerLevel)}`}>
                    ⚠️ Danger: {species.dangerLevel}
                  </div>
                  <div className="text-yellow-400">
                    🔬 {species.researchCost}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-2">{species.description}</p>
              <div className="flex flex-wrap gap-1">
                {species.specialAbilities.map((ability, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-slate-700 rounded text-xs text-green-300"
                  >
                    {ability}
                  </span>
                ))}
              </div>
              {!researched && (
                <div className="mt-2 text-red-400 text-xs">
                  🔒 Research Required
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Genetic Modification Modal */}
      <GeneticModification
        isOpen={isGeneticModificationOpen}
        onClose={() => setIsGeneticModificationOpen(false)}
      />
    </div>
  );
}
