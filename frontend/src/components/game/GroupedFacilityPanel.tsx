import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { FACILITY_DEFINITIONS } from '../../data/gameData';
import { FacilityDefinition } from '../../types';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { Button } from '../ui/Button';

type FacilityCategory = 'essential' | 'research' | 'security' | 'visitor' | 'specialized' | 'environmental';

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

    // Essential operations
    if (['visitor center', 'power generator', 'containment unit'].some(key => name.includes(key))) {
      return 'essential';
    }

    // Research facilities
    if (['research', 'laboratory', 'genetic', 'sequencer'].some(key => name.includes(key))) {
      return 'research';
    }

    // Security and safety
    if (['security', 'defense', 'bunker', 'quarantine', 'emergency'].some(key => name.includes(key))) {
      return 'security';
    }

    // Visitor amenities
    if (['visitor', 'executive', 'cafeteria', 'medical bay'].some(key => name.includes(key))) {
      return 'visitor';
    }

    // Environmental controls
    if (['cryo', 'thermal', 'aquatic', 'atmospheric', 'zero-g'].some(key => name.includes(key))) {
      return 'environmental';
    }

    // Specialized/advanced
    return 'specialized';
  };

  const groupFacilities = (): FacilityGroup[] => {
    const groups: FacilityGroup[] = [
      {
        category: 'essential',
        name: 'Essential Infrastructure',
        icon: '🏗️',
        description: 'Core facilities needed for basic operations',
        facilities: []
      },
      {
        category: 'research',
        name: 'Research & Development',
        icon: '🔬',
        description: 'Scientific facilities for xenomorph study',
        facilities: []
      },
      {
        category: 'security',
        name: 'Security & Defense',
        icon: '🛡️',
        description: 'Containment and emergency response systems',
        facilities: []
      },
      {
        category: 'visitor',
        name: 'Visitor Services',
        icon: '👥',
        description: 'Guest amenities and comfort facilities',
        facilities: []
      },
      {
        category: 'environmental',
        name: 'Environmental Controls',
        icon: '🌡️',
        description: 'Climate and habitat management systems',
        facilities: []
      },
      {
        category: 'specialized',
        name: 'Advanced Systems',
        icon: '⚙️',
        description: 'Cutting-edge specialized facilities',
        facilities: []
      }
    ];

    // Categorize all facilities
    FACILITY_DEFINITIONS.forEach(facility => {
      const category = categorizeFacility(facility);
      const group = groups.find(g => g.category === category);
      if (group) {
        group.facilities.push(facility);
      }
    });

    // Sort facilities within each group by cost
    groups.forEach(group => {
      group.facilities.sort((a, b) => a.cost - b.cost);
    });

    // Apply affordability filter
    if (filterAffordable) {
      groups.forEach(group => {
        group.facilities = group.facilities.filter(facility => canAfford(facility));
      });
    }

    // Filter out empty groups
    return groups.filter(group => group.facilities.length > 0);
  };

  const handleFacilitySelect = (facility: FacilityDefinition) => {
    if (selectedFacility?.name === facility.name) {
      selectFacility(null);
    } else {
      selectFacility(facility);
    }
  };

  const canAfford = (facility: FacilityDefinition) => {
    return resources.credits >= facility.cost && resources.power >= facility.powerRequirement;
  };

  const formatCost = (cost: number) => {
    if (cost >= 1000000) return `${(cost / 1000000).toFixed(1)}M`;
    if (cost >= 1000) return `${(cost / 1000).toFixed(1)}K`;
    return cost.toString();
  };

  const groups = groupFacilities();
  const totalAffordable = FACILITY_DEFINITIONS.filter(f => canAfford(f)).length;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-green-400 font-bold text-lg glow">
            Facilities ({totalAffordable}/{FACILITY_DEFINITIONS.length} affordable)
          </h3>
          <div className="flex gap-1">
            <Button
              variant={filterAffordable ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterAffordable(!filterAffordable)}
              className="text-xs"
            >
              💰 Affordable Only
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-1 bg-slate-800/30 rounded">
            <div className="text-green-400 font-bold">{formatCost(resources.credits)}</div>
            <div className="text-slate-400">Credits</div>
          </div>
          <div className="text-center p-1 bg-slate-800/30 rounded">
            <div className="text-yellow-400 font-bold">{resources.power}/{resources.maxPower}</div>
            <div className="text-slate-400">Power</div>
          </div>
          <div className="text-center p-1 bg-slate-800/30 rounded">
            <div className="text-blue-400 font-bold">{Math.round((resources.power / resources.maxPower) * 100)}%</div>
            <div className="text-slate-400">Usage</div>
          </div>
        </div>
      </div>

      {/* Facility Groups */}
      {groups.map((group) => {
        const affordableCount = group.facilities.filter(f => canAfford(f)).length;
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
                icon: '⚡',
                onClick: () => {
                  // Select cheapest affordable facility in group
                  const cheapest = group.facilities.find(f => canAfford(f));
                  if (cheapest) {
                    selectFacility(cheapest);
                  }
                },
                variant: hasAffordable ? 'primary' : 'outline'
              }
            ]}
          >
            <div className="mt-3">
              <p className="text-slate-400 text-sm mb-3">{group.description}</p>
              <div className="grid grid-cols-1 gap-2">
                {group.facilities.map((facility) => {
                  const isSelected = selectedFacility?.name === facility.name;
                  const affordable = canAfford(facility);

                  return (
                    <button
                      key={facility.name}
                      onClick={() => handleFacilitySelect(facility)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all duration-200
                        ${isSelected
                          ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/20'
                          : 'border-slate-600 hover:border-slate-500'
                        }
                        ${!affordable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'}
                      `}
                      disabled={!affordable}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-semibold">{facility.name}</span>
                          {affordable && <span className="text-green-400 text-xs">✅</span>}
                        </div>
                        <div className="text-right text-sm">
                          <div className={`${affordable ? 'text-green-400' : 'text-red-400'}`}>
                            💰 {formatCost(facility.cost)}
                          </div>
                          <div className="text-blue-400">
                            ⚡ {facility.powerRequirement}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">{facility.description}</p>

                      {/* Cost breakdown for expensive facilities */}
                      {facility.cost >= 50000 && (
                        <div className="mt-2 text-xs text-slate-400">
                          <span>ROI: High-end facility with advanced capabilities</span>
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