import { useState } from 'react';
import { xenomorphSpecies } from '../../data/gameData';
import { dangerLevelColors } from '../../constants/gameConstants';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { XenomorphSpecies } from '../../types';

type SpeciesCategory = 'basic' | 'combat' | 'specialized' | 'hybrid' | 'environmental';
type SortMode = 'category' | 'danger' | 'research' | 'availability';

interface SpeciesGroup {
  category: SpeciesCategory;
  name: string;
  icon: string;
  description: string;
  species: XenomorphSpecies[];
}

export function GroupedSpeciesPanel() {
  const { selectedSpecies, selectSpecies, research } = useGameStore();
  const [sortMode, setSortMode] = useState<SortMode>('category');
  const [filterResearched, setFilterResearched] = useState(false);

  const isResearched = (species: XenomorphSpecies) => research.completed.includes(species.name);

  const isAvailable = (species: XenomorphSpecies) => research.available?.includes(species.name) || false;

  const categorizeSpecies = (species: XenomorphSpecies): SpeciesCategory => {
    if (['Drone', 'Facehugger', 'Chestburster'].includes(species.name)) {
      return 'basic';
    }

    if (['Warrior', 'Praetorian', 'Crusher', 'Berserker Xenomorph'].includes(species.name)) {
      return 'combat';
    }

    if (
      ['Aqua Xenomorph', 'Cryo Xenomorph', 'Pyro Xenomorph', 'Void Xenomorph'].includes(
        species.name
      )
    ) {
      return 'environmental';
    }

    if (
      ['Predalien', 'Xeno-Engineer', 'Synthetic Xenomorph', 'Nano Xenomorph'].includes(species.name)
    ) {
      return 'hybrid';
    }

    return 'specialized';
  };

  const groupSpecies = (): SpeciesGroup[] => {
    const groups: SpeciesGroup[] = [
      {
        category: 'basic',
        name: 'Basic Lifecycle',
        icon: 'BSC',
        description: 'Fundamental xenomorph forms.',
        species: [],
      },
      {
        category: 'combat',
        name: 'Combat Variants',
        icon: 'CMB',
        description: 'Aggressive and defensive specialists.',
        species: [],
      },
      {
        category: 'specialized',
        name: 'Specialized Forms',
        icon: 'SPC',
        description: 'Unique adaptations and abilities.',
        species: [],
      },
      {
        category: 'environmental',
        name: 'Environmental',
        icon: 'ENV',
        description: 'Climate-adapted variants.',
        species: [],
      },
      {
        category: 'hybrid',
        name: 'Hybrid and Engineered',
        icon: 'HYB',
        description: 'Advanced genetic combinations.',
        species: [],
      },
    ];

    xenomorphSpecies.forEach(species => {
      const category = categorizeSpecies(species);
      const group = groups.find(item => item.category === category);
      if (group) {
        group.species.push(species);
      }
    });

    groups.forEach(group => {
      group.species.sort((a, b) => {
        if (sortMode === 'danger') return a.dangerLevel - b.dangerLevel;
        if (sortMode === 'research') return a.researchCost - b.researchCost;
        if (sortMode === 'availability') {
          const aAvailable = isResearched(a) || isAvailable(a);
          const bAvailable = isResearched(b) || isAvailable(b);
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
        }
        return a.name.localeCompare(b.name);
      });
    });

    return groups
      .filter(group => group.species.length > 0)
      .map(group => ({
        ...group,
        species: filterResearched
          ? group.species.filter(species => isResearched(species) || isAvailable(species))
          : group.species,
      }))
      .filter(group => group.species.length > 0);
  };

  const handleSpeciesSelect = (species: XenomorphSpecies) => {
    if (selectedSpecies?.name === species.name) {
      selectSpecies(null);
      return;
    }
    selectSpecies(species);
  };

  const getDangerLevelColor = (level: number) => {
    return dangerLevelColors[level as keyof typeof dangerLevelColors] || 'text-red-600';
  };

  const groups = groupSpecies();
  const totalAvailable = xenomorphSpecies.filter(species => isResearched(species) || isAvailable(species)).length;

  return (
    <div className="space-y-3">
      <div className="panel p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="section-title text-lg">
            Xenomorph Species ({totalAvailable}/{xenomorphSpecies.length})
          </h3>
          <Button
            variant={filterResearched ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilterResearched(value => !value)}
            className="border-slate-500 text-xs"
          >
            Available Only
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="mr-2 text-xs text-slate-400">Sort by:</span>
          {[
            { mode: 'category' as SortMode, label: 'Category' },
            { mode: 'danger' as SortMode, label: 'Danger' },
            { mode: 'research' as SortMode, label: 'Research Cost' },
            { mode: 'availability' as SortMode, label: 'Available First' },
          ].map(({ mode, label }) => (
            <Button
              key={mode}
              variant={sortMode === mode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSortMode(mode)}
              className="border-slate-500 text-xs"
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      {groups.map(group => (
        <CollapsiblePanel
          key={group.category}
          title={group.name}
          icon={group.icon}
          badge={group.species.length}
          defaultExpanded={
            group.category === 'basic' || group.species.some(species => isResearched(species) || isAvailable(species))
          }
          actions={[
            {
              label: 'Quick Select',
              icon: 'Go',
              onClick: () => {
                const availableSpecies = group.species.find(
                  species => isResearched(species) || isAvailable(species)
                );
                if (availableSpecies) {
                  selectSpecies(availableSpecies);
                }
              },
              variant: 'outline',
            },
          ]}
        >
          <div className="mt-3">
            <p className="mb-3 text-sm text-slate-400">{group.description}</p>
            <div className="grid grid-cols-1 gap-2">
              {group.species.map(species => {
                const isSelected = selectedSpecies?.name === species.name;
                const researched = isResearched(species);
                const available = isAvailable(species);
                const canPlace = researched || available;

                return (
                  <button
                    key={species.name}
                    onClick={() => handleSpeciesSelect(species)}
                    className={`rounded-lg border p-3 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'border-emerald-300/70 bg-emerald-300/10'
                        : 'border-slate-600/80 hover:border-slate-500'
                    } ${!canPlace ? 'opacity-40' : 'hover:bg-slate-800/50'}`}
                    disabled={!canPlace}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{species.name}</span>
                        {researched && <span className="text-xs text-emerald-300">Researched</span>}
                        {available && !researched && (
                          <span className="text-xs text-amber-300">Available</span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className={getDangerLevelColor(species.dangerLevel)}>
                          Danger {species.dangerLevel}
                        </div>
                        <div className="text-xs text-slate-300">Research {species.researchCost}</div>
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-slate-300">{species.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {species.specialAbilities.slice(0, 2).map(ability => (
                        <span
                          key={ability}
                          className="rounded bg-slate-700/80 px-2 py-1 text-xs text-slate-200"
                        >
                          {ability}
                        </span>
                      ))}
                      {species.specialAbilities.length > 2 && (
                        <span className="rounded bg-slate-700/80 px-2 py-1 text-xs text-slate-400">
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
