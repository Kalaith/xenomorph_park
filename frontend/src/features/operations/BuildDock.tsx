import { useMemo, useState } from 'react';
import { facilityDefinitions, xenomorphSpecies } from '../../data/gameData';
import { useGameStore } from '../../stores/gameStore';
import { FacilityDefinition, XenomorphSpecies } from '../../types';

type BuildTab = 'facilities' | 'species';

type Category<T> = {
  id: string;
  label: string;
  items: T[];
};

const facilityCategoryLabels = [
  { id: 'essential', label: 'Essential' },
  { id: 'research', label: 'Research' },
  { id: 'security', label: 'Security' },
  { id: 'visitor', label: 'Visitor' },
  { id: 'environmental', label: 'Environment' },
  { id: 'advanced', label: 'Advanced' },
] as const;

const speciesCategoryLabels = [
  { id: 'basic', label: 'Basic' },
  { id: 'combat', label: 'Combat' },
  { id: 'specialized', label: 'Specialized' },
  { id: 'environmental', label: 'Environment' },
  { id: 'hybrid', label: 'Hybrid' },
] as const;

interface BuildDockProps {
  hidden: boolean;
  onToggleHidden: () => void;
}

function categorizeFacility(facility: FacilityDefinition): string {
  const name = facility.name.toLowerCase();
  if (['visitor center', 'power generator', 'containment unit'].some(keyword => name.includes(keyword))) {
    return 'essential';
  }
  if (['research', 'laboratory', 'genetic', 'sequencer'].some(keyword => name.includes(keyword))) {
    return 'research';
  }
  if (['security', 'defense', 'bunker', 'quarantine', 'emergency'].some(keyword => name.includes(keyword))) {
    return 'security';
  }
  if (['visitor', 'executive', 'cafeteria', 'medical bay'].some(keyword => name.includes(keyword))) {
    return 'visitor';
  }
  if (['cryo', 'thermal', 'aquatic', 'atmospheric', 'zero-g'].some(keyword => name.includes(keyword))) {
    return 'environmental';
  }
  return 'advanced';
}

function categorizeSpecies(species: XenomorphSpecies): string {
  if (['Drone', 'Facehugger', 'Chestburster'].includes(species.name)) {
    return 'basic';
  }
  if (['Warrior', 'Praetorian', 'Crusher', 'Berserker Xenomorph'].includes(species.name)) {
    return 'combat';
  }
  if (['Aqua Xenomorph', 'Cryo Xenomorph', 'Pyro Xenomorph', 'Void Xenomorph'].includes(species.name)) {
    return 'environmental';
  }
  if (['Predalien', 'Xeno-Engineer', 'Synthetic Xenomorph', 'Nano Xenomorph'].includes(species.name)) {
    return 'hybrid';
  }
  return 'specialized';
}

function moveIndex(current: number, direction: -1 | 1, size: number): number {
  if (size <= 0) return 0;
  const next = current + direction;
  if (next < 0) return size - 1;
  if (next >= size) return 0;
  return next;
}

export function BuildDock({ hidden, onToggleHidden }: BuildDockProps) {
  const {
    resources,
    research,
    selectedFacility,
    selectedSpecies,
    selectFacility,
    selectSpecies,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<BuildTab>('facilities');
  const [facilityCategoryIndex, setFacilityCategoryIndex] = useState(0);
  const [speciesCategoryIndex, setSpeciesCategoryIndex] = useState(0);

  const facilityCategories = useMemo<Category<FacilityDefinition>[]>(() => {
    const grouped = facilityCategoryLabels.map(category => ({
      id: category.id,
      label: category.label,
      items: facilityDefinitions
        .filter(item => categorizeFacility(item) === category.id)
        .sort((a, b) => a.cost - b.cost),
    }));

    return grouped.filter(category => category.items.length > 0);
  }, []);

  const speciesCategories = useMemo<Category<XenomorphSpecies>[]>(() => {
    const grouped = speciesCategoryLabels.map(category => ({
      id: category.id,
      label: category.label,
      items: xenomorphSpecies
        .filter(item => categorizeSpecies(item) === category.id)
        .sort((a, b) => a.researchCost - b.researchCost),
    }));

    return grouped.filter(category => category.items.length > 0);
  }, []);

  const activeFacilityCategory = facilityCategories[facilityCategoryIndex];
  const activeSpeciesCategory = speciesCategories[speciesCategoryIndex];
  const activeCategoryLabel =
    activeTab === 'facilities' ? activeFacilityCategory?.label : activeSpeciesCategory?.label;
  const categoryPosition =
    activeTab === 'facilities'
      ? `${facilityCategoryIndex + 1}/${Math.max(facilityCategories.length, 1)}`
      : `${speciesCategoryIndex + 1}/${Math.max(speciesCategories.length, 1)}`;

  const handlePreviousCategory = () => {
    if (activeTab === 'facilities') {
      setFacilityCategoryIndex(index => moveIndex(index, -1, facilityCategories.length));
      return;
    }
    setSpeciesCategoryIndex(index => moveIndex(index, -1, speciesCategories.length));
  };

  const handleNextCategory = () => {
    if (activeTab === 'facilities') {
      setFacilityCategoryIndex(index => moveIndex(index, 1, facilityCategories.length));
      return;
    }
    setSpeciesCategoryIndex(index => moveIndex(index, 1, speciesCategories.length));
  };

  const canAffordFacility = (facility: FacilityDefinition) => {
    return resources.credits >= facility.cost && resources.power >= facility.powerRequirement;
  };

  const canUseSpecies = (species: XenomorphSpecies) => {
    return research.completed.includes(species.name) || research.available.includes(species.name);
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  if (hidden) {
    return (
      <div className="fixed bottom-3 right-3 z-40 sm:bottom-4 sm:right-4">
        <button
          type="button"
          onClick={onToggleHidden}
          className="rounded-md border border-slate-500 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg backdrop-blur"
        >
          Open Build Menu
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/90 bg-slate-950/95 p-2 backdrop-blur sm:p-3">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('facilities')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'facilities'
                  ? 'bg-emerald-300/15 text-emerald-300 border border-emerald-300/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-600'
              }`}
            >
              Facilities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('species')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'species'
                  ? 'bg-emerald-300/15 text-emerald-300 border border-emerald-300/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-600'
              }`}
            >
              Species
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleHidden}
            className="rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200"
          >
            Hide
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePreviousCategory}
            className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200"
          >
            Prev
          </button>

          <div className="min-w-0 flex-1 text-center text-xs text-slate-300">
            <span className="font-medium text-slate-100">{activeCategoryLabel ?? 'Category'}</span>{' '}
            <span className="text-slate-400">({categoryPosition})</span>
          </div>

          <button
            type="button"
            onClick={handleNextCategory}
            className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200"
          >
            Next
          </button>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {activeTab === 'facilities' &&
              activeFacilityCategory?.items.map(facility => {
                const affordable = canAffordFacility(facility);
                const isSelected = selectedFacility?.name === facility.name;

                return (
                  <button
                    key={facility.name}
                    type="button"
                    onClick={() => (isSelected ? selectFacility(null) : selectFacility(facility))}
                    disabled={!affordable}
                    className={`w-[180px] rounded border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? 'border-emerald-300/70 bg-emerald-300/10'
                        : 'border-slate-600 bg-slate-900/70'
                    } ${affordable ? 'hover:border-slate-400' : 'opacity-45 cursor-not-allowed'}`}
                  >
                    <div className="font-medium text-slate-100">{facility.name}</div>
                    <div className="mt-1 text-slate-400">Cost: {formatCompactNumber(facility.cost)}</div>
                    <div className="text-slate-400">Power: {facility.powerRequirement}</div>
                  </button>
                );
              })}

            {activeTab === 'species' &&
              activeSpeciesCategory?.items.map(species => {
                const usable = canUseSpecies(species);
                const isSelected = selectedSpecies?.name === species.name;

                return (
                  <button
                    key={species.name}
                    type="button"
                    onClick={() => (isSelected ? selectSpecies(null) : selectSpecies(species))}
                    disabled={!usable}
                    className={`w-[180px] rounded border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? 'border-emerald-300/70 bg-emerald-300/10'
                        : 'border-slate-600 bg-slate-900/70'
                    } ${usable ? 'hover:border-slate-400' : 'opacity-45 cursor-not-allowed'}`}
                  >
                    <div className="font-medium text-slate-100">{species.name}</div>
                    <div className="mt-1 text-slate-400">Danger: {species.dangerLevel}</div>
                    <div className="text-slate-400">Research: {formatCompactNumber(species.researchCost)}</div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
