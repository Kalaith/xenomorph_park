import { useState } from 'react';
import { facilityDefinitions } from '../../data/gameData';
import { Button } from '../ui/Button';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { useGameStore } from '../../stores/gameStore';
import { FacilityDefinition } from '../../types';

type FacilityCategory =
  | 'essential'
  | 'research'
  | 'security'
  | 'visitor'
  | 'specialized'
  | 'environmental';

interface FacilityGroup {
  category: FacilityCategory;
  name: string;
  icon: string;
  description: string;
  facilities: FacilityDefinition[];
}

export function GroupedFacilityPanel() {
  const { selectedFacility, selectFacility, resources } = useGameStore();
  const [filterAffordable, setFilterAffordable] = useState(false);

  const categorizeFacility = (facility: FacilityDefinition): FacilityCategory => {
    const name = facility.name.toLowerCase();

    if (['visitor center', 'power generator', 'containment unit'].some(key => name.includes(key))) {
      return 'essential';
    }

    if (['research', 'laboratory', 'genetic', 'sequencer'].some(key => name.includes(key))) {
      return 'research';
    }

    if (
      ['security', 'defense', 'bunker', 'quarantine', 'emergency'].some(key => name.includes(key))
    ) {
      return 'security';
    }

    if (['visitor', 'executive', 'cafeteria', 'medical bay'].some(key => name.includes(key))) {
      return 'visitor';
    }

    if (['cryo', 'thermal', 'aquatic', 'atmospheric', 'zero-g'].some(key => name.includes(key))) {
      return 'environmental';
    }

    return 'specialized';
  };

  const canAfford = (facility: FacilityDefinition) => {
    return resources.credits >= facility.cost && resources.power >= facility.powerRequirement;
  };

  const groupFacilities = (): FacilityGroup[] => {
    const groups: FacilityGroup[] = [
      {
        category: 'essential',
        name: 'Essential Infrastructure',
        icon: 'INF',
        description: 'Core facilities needed for basic operations.',
        facilities: [],
      },
      {
        category: 'research',
        name: 'Research and Development',
        icon: 'RND',
        description: 'Scientific facilities for xenomorph study.',
        facilities: [],
      },
      {
        category: 'security',
        name: 'Security and Defense',
        icon: 'SEC',
        description: 'Containment and emergency response systems.',
        facilities: [],
      },
      {
        category: 'visitor',
        name: 'Visitor Services',
        icon: 'VIS',
        description: 'Guest amenities and comfort facilities.',
        facilities: [],
      },
      {
        category: 'environmental',
        name: 'Environmental Controls',
        icon: 'ENV',
        description: 'Climate and habitat management systems.',
        facilities: [],
      },
      {
        category: 'specialized',
        name: 'Advanced Systems',
        icon: 'ADV',
        description: 'Specialized high-tier facilities.',
        facilities: [],
      },
    ];

    facilityDefinitions.forEach(facility => {
      const category = categorizeFacility(facility);
      const group = groups.find(item => item.category === category);
      if (group) {
        group.facilities.push(facility);
      }
    });

    groups.forEach(group => {
      group.facilities.sort((a, b) => a.cost - b.cost);
      if (filterAffordable) {
        group.facilities = group.facilities.filter(facility => canAfford(facility));
      }
    });

    return groups.filter(group => group.facilities.length > 0);
  };

  const handleFacilitySelect = (facility: FacilityDefinition) => {
    if (selectedFacility?.name === facility.name) {
      selectFacility(null);
      return;
    }
    selectFacility(facility);
  };

  const formatCost = (cost: number) => {
    if (cost >= 1000000) return `${(cost / 1000000).toFixed(1)}M`;
    if (cost >= 1000) return `${(cost / 1000).toFixed(1)}K`;
    return cost.toString();
  };

  const groups = groupFacilities();
  const totalAffordable = facilityDefinitions.filter(facility => canAfford(facility)).length;

  return (
    <div className="space-y-3">
      <div className="panel p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="section-title text-lg">
            Facilities ({totalAffordable}/{facilityDefinitions.length} affordable)
          </h3>
          <Button
            variant={filterAffordable ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilterAffordable(value => !value)}
            className="border-slate-500 text-xs"
          >
            Affordable Only
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="panel-muted p-1 text-center">
            <div className="font-semibold text-slate-100">{formatCost(resources.credits)}</div>
            <div className="text-slate-400">Credits</div>
          </div>
          <div className="panel-muted p-1 text-center">
            <div className="font-semibold text-slate-100">
              {resources.power}/{resources.maxPower}
            </div>
            <div className="text-slate-400">Power</div>
          </div>
          <div className="panel-muted p-1 text-center">
            <div className="font-semibold text-slate-100">
              {Math.round((resources.power / resources.maxPower) * 100)}%
            </div>
            <div className="text-slate-400">Usage</div>
          </div>
        </div>
      </div>

      {groups.map(group => {
        const affordableCount = group.facilities.filter(facility => canAfford(facility)).length;
        const hasAffordable = affordableCount > 0;

        return (
          <CollapsiblePanel
            key={group.category}
            title={group.name}
            icon={group.icon}
            badge={`${affordableCount}/${group.facilities.length}`}
            defaultExpanded={group.category === 'essential' || hasAffordable}
            actions={[
              {
                label: 'Quick Build',
                icon: 'Go',
                onClick: () => {
                  const cheapest = group.facilities.find(facility => canAfford(facility));
                  if (cheapest) {
                    selectFacility(cheapest);
                  }
                },
                variant: hasAffordable ? 'secondary' : 'outline',
              },
            ]}
          >
            <div className="mt-3">
              <p className="mb-3 text-sm text-slate-400">{group.description}</p>
              <div className="grid grid-cols-1 gap-2">
                {group.facilities.map(facility => {
                  const isSelected = selectedFacility?.name === facility.name;
                  const affordable = canAfford(facility);

                  return (
                    <button
                      key={facility.name}
                      onClick={() => handleFacilitySelect(facility)}
                      className={`rounded-lg border p-3 text-left transition-colors duration-150 ${
                        isSelected
                          ? 'border-emerald-300/70 bg-emerald-300/10'
                          : 'border-slate-600/80 hover:border-slate-500'
                      } ${!affordable ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-800/50'}`}
                      disabled={!affordable}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{facility.name}</span>
                          {affordable && <span className="text-xs text-emerald-300">Ready</span>}
                        </div>
                        <div className="text-right text-sm">
                          <div className={affordable ? 'text-emerald-300' : 'text-red-300'}>
                            {formatCost(facility.cost)}
                          </div>
                          <div className="text-slate-300">{facility.powerRequirement} power</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">{facility.description}</p>

                      {facility.cost >= 50000 && (
                        <div className="mt-2 text-xs text-slate-400">
                          <span>ROI: High-end facility with advanced capabilities.</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CollapsiblePanel>
        );
      })}
    </div>
  );
}
