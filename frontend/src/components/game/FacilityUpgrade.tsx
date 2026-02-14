import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AnimatedProgressBar, PulseEffect } from '../ui/VisualFeedback';
import { PlacedFacility } from '../../types';

interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  requirements: string[];
  benefits: {
    powerEfficiency?: number;
    capacity?: number;
    security?: number;
    research?: number;
    income?: number;
    maintenance?: number;
  };
  icon: string;
}

interface FacilityUpgradeProps {
  isOpen: boolean;
  facility: PlacedFacility | null;
  onClose: () => void;
}

const upgradeDefinitions: Record<string, UpgradeDefinition[]> = {
  'Research Lab': [
    {
      id: 'advanced_equipment',
      name: 'Advanced Equipment',
      description: 'Install cutting-edge research equipment for faster analysis',
      cost: 2000,
      requirements: [],
      benefits: { research: 50 },
      icon: '🔬',
    },
    {
      id: 'ai_assistant',
      name: 'AI Research Assistant',
      description: 'Deploy AI systems to accelerate research processes',
      cost: 5000,
      requirements: ['advanced_equipment'],
      benefits: { research: 100 },
      icon: '🤖',
    },
    {
      id: 'xenobiology_wing',
      name: 'Xenobiology Wing',
      description: 'Specialized wing for advanced xenomorph studies',
      cost: 10000,
      requirements: ['ai_assistant'],
      benefits: { research: 200, capacity: 1 },
      icon: '🧬',
    },
  ],
  'Containment Unit': [
    {
      id: 'reinforced_walls',
      name: 'Reinforced Walls',
      description: 'Strengthen containment with military-grade materials',
      cost: 1500,
      requirements: [],
      benefits: { security: 25 },
      icon: '🛡️',
    },
    {
      id: 'backup_power',
      name: 'Backup Power System',
      description: 'Independent power source for critical containment',
      cost: 3000,
      requirements: ['reinforced_walls'],
      benefits: { powerEfficiency: 20, security: 25 },
      icon: '🔋',
    },
    {
      id: 'neural_dampener',
      name: 'Neural Dampening Field',
      description: 'Psychic suppression system for advanced species',
      cost: 8000,
      requirements: ['backup_power'],
      benefits: { security: 50, capacity: 2 },
      icon: '🧠',
    },
  ],
  'Visitor Center': [
    {
      id: 'gift_shop',
      name: 'Gift Shop Expansion',
      description: 'Larger retail space for increased merchandise sales',
      cost: 1000,
      requirements: [],
      benefits: { income: 30 },
      icon: '🛍️',
    },
    {
      id: 'vip_lounge',
      name: 'VIP Lounge',
      description: 'Exclusive area for premium visitors',
      cost: 3500,
      requirements: ['gift_shop'],
      benefits: { income: 75, capacity: 1 },
      icon: '💎',
    },
    {
      id: 'interactive_exhibit',
      name: 'Interactive Exhibits',
      description: 'Hands-on displays and virtual reality experiences',
      cost: 7000,
      requirements: ['vip_lounge'],
      benefits: { income: 150, capacity: 2 },
      icon: '🎮',
    },
  ],
  'Security Station': [
    {
      id: 'weapon_cache',
      name: 'Weapon Cache',
      description: 'Expanded armory with advanced weaponry',
      cost: 2500,
      requirements: [],
      benefits: { security: 40 },
      icon: '🔫',
    },
    {
      id: 'surveillance_network',
      name: 'Surveillance Network',
      description: 'Facility-wide monitoring and early warning system',
      cost: 4000,
      requirements: ['weapon_cache'],
      benefits: { security: 30, powerEfficiency: -10 },
      icon: '📹',
    },
    {
      id: 'marine_barracks',
      name: 'Colonial Marine Barracks',
      description: 'Permanent military presence with elite forces',
      cost: 12000,
      requirements: ['surveillance_network'],
      benefits: { security: 100, maintenance: 50 },
      icon: '🎖️',
    },
  ],
  'Power Generator': [
    {
      id: 'efficiency_upgrade',
      name: 'Efficiency Upgrade',
      description: 'Improve fuel efficiency and reduce waste',
      cost: 1800,
      requirements: [],
      benefits: { powerEfficiency: 25, maintenance: -20 },
      icon: '⚡',
    },
    {
      id: 'fusion_core',
      name: 'Fusion Core',
      description: 'Replace with fusion technology for massive output',
      cost: 6000,
      requirements: ['efficiency_upgrade'],
      benefits: { powerEfficiency: 100, maintenance: -50 },
      icon: '☢️',
    },
    {
      id: 'redundant_systems',
      name: 'Redundant Systems',
      description: 'Multiple backup systems prevent power failures',
      cost: 9000,
      requirements: ['fusion_core'],
      benefits: { powerEfficiency: 50, security: 30 },
      icon: '🔄',
    },
  ],
  Hatchery: [
    {
      id: 'climate_control',
      name: 'Climate Control',
      description: 'Precise environmental controls for optimal breeding',
      cost: 2200,
      requirements: [],
      benefits: { capacity: 1, powerEfficiency: -15 },
      icon: '🌡️',
    },
    {
      id: 'genetic_lab',
      name: 'Genetic Laboratory',
      description: 'Facilities for genetic manipulation and enhancement',
      cost: 5500,
      requirements: ['climate_control'],
      benefits: { research: 75, capacity: 1 },
      icon: '🧪',
    },
    {
      id: 'queen_chamber',
      name: 'Queen Chamber',
      description: 'Specialized facility capable of housing a queen',
      cost: 15000,
      requirements: ['genetic_lab'],
      benefits: { capacity: 3, security: -25, research: 150 },
      icon: '👑',
    },
  ],
};

export function FacilityUpgrade({ isOpen, facility, onClose }: FacilityUpgradeProps) {
  const { updateResources, resources, addStatusMessage } = useGameStore();
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeDefinition | null>(null);
  const [installedUpgrades, setInstalledUpgrades] = useState<Record<string, string[]>>({});

  if (!facility) return null;

  const availableUpgrades = upgradeDefinitions[facility.name] || [];
  const facilityUpgrades = installedUpgrades[facility.id] || [];

  const canInstallUpgrade = (upgrade: UpgradeDefinition): boolean => {
    // Check if already installed
    if (facilityUpgrades.includes(upgrade.id)) return false;

    // Check if can afford
    if (resources.credits < upgrade.cost) return false;

    // Check requirements
    return upgrade.requirements.every(req => facilityUpgrades.includes(req));
  };

  const getUpgradeStatus = (
    upgrade: UpgradeDefinition
  ): 'available' | 'installed' | 'locked' | 'expensive' => {
    if (facilityUpgrades.includes(upgrade.id)) return 'installed';
    if (resources.credits < upgrade.cost) return 'expensive';
    if (!upgrade.requirements.every(req => facilityUpgrades.includes(req))) return 'locked';
    return 'available';
  };

  const handleInstallUpgrade = (upgrade: UpgradeDefinition) => {
    if (!canInstallUpgrade(upgrade)) return;

    // Deduct cost
    updateResources({ credits: resources.credits - upgrade.cost });

    // Add to installed upgrades
    setInstalledUpgrades(prev => ({
      ...prev,
      [facility.id]: [...(prev[facility.id] || []), upgrade.id],
    }));

    // Apply benefits (would need store integration for permanent effects)
    const benefits = Object.entries(upgrade.benefits)
      .map(([key, value]) => `${key}: ${value > 0 ? '+' : ''}${value}`)
      .join(', ');

    addStatusMessage(`Upgrade installed: ${upgrade.name} (${benefits})`, 'success');

    setSelectedUpgrade(null);
  };

  const calculateTotalBenefits = () => {
    const totalBenefits = facilityUpgrades.reduce(
      (total, upgradeId) => {
        const upgrade = availableUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return total;

        Object.entries(upgrade.benefits).forEach(([key, value]) => {
          total[key] = (total[key] || 0) + value;
        });

        return total;
      },
      {} as Record<string, number>
    );

    return totalBenefits;
  };

  const totalBenefits = calculateTotalBenefits();
  const totalUpgradeCost = facilityUpgrades.reduce((total, upgradeId) => {
    const upgrade = availableUpgrades.find(u => u.id === upgradeId);
    return total + (upgrade?.cost || 0);
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🔧 Upgrade ${facility.name}`}>
      <div className="space-y-6">
        {/* Facility Summary */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h3 className="text-green-400 font-bold text-lg">{facility.name}</h3>
              <p className="text-slate-400 text-sm">{facility.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Original Cost: </span>
              <span className="text-yellow-400">💰 {facility.cost}</span>
            </div>
            <div>
              <span className="text-slate-400">Power Usage: </span>
              <span className="text-blue-400">⚡ {facility.powerRequirement}</span>
            </div>
            <div>
              <span className="text-slate-400">Upgrades Installed: </span>
              <span className="text-green-400">{facilityUpgrades.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Total Investment: </span>
              <span className="text-purple-400">💰 {facility.cost + totalUpgradeCost}</span>
            </div>
          </div>

          {/* Current Benefits */}
          {Object.keys(totalBenefits).length > 0 && (
            <div className="mt-4">
              <h4 className="text-green-400 font-semibold mb-2">Current Upgrade Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(totalBenefits).map(([benefit, value]) => (
                  <span
                    key={benefit}
                    className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs"
                  >
                    {benefit}: {value > 0 ? '+' : ''}
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Available Upgrades */}
        <div className="space-y-4">
          <h3 className="text-green-400 font-bold text-lg">Available Upgrades</h3>

          {availableUpgrades.map(upgrade => {
            const status = getUpgradeStatus(upgrade);
            const isSelected = selectedUpgrade?.id === upgrade.id;

            return (
              <PulseEffect key={upgrade.id} pulse={isSelected} color="green">
                <div
                  className={`
                    border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${
                      status === 'installed'
                        ? 'border-green-400 bg-green-400/20'
                        : status === 'available'
                          ? 'border-slate-600 bg-slate-800 hover:border-green-400/50'
                          : status === 'expensive'
                            ? 'border-yellow-400/50 bg-yellow-400/10'
                            : 'border-slate-600 bg-slate-700 opacity-50'
                    }
                    ${isSelected ? 'border-green-400 bg-green-400/10' : ''}
                  `}
                  onClick={() => (status === 'available' ? setSelectedUpgrade(upgrade) : null)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-300">{upgrade.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">💰 {upgrade.cost}</span>
                          {status === 'installed' && (
                            <span className="text-green-400">✓ Installed</span>
                          )}
                          {status === 'expensive' && (
                            <span className="text-yellow-400">💸 Too Expensive</span>
                          )}
                          {status === 'locked' && <span className="text-red-400">🔒 Locked</span>}
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mb-3">{upgrade.description}</p>

                      {/* Requirements */}
                      {upgrade.requirements.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-slate-500">Requires: </span>
                          {upgrade.requirements.map(req => {
                            const reqUpgrade = availableUpgrades.find(u => u.id === req);
                            const isReqMet = facilityUpgrades.includes(req);
                            return (
                              <span
                                key={req}
                                className={`text-xs px-1 py-0.5 rounded mr-1 ${
                                  isReqMet
                                    ? 'bg-green-400/20 text-green-400'
                                    : 'bg-red-400/20 text-red-400'
                                }`}
                              >
                                {reqUpgrade?.name || req}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(upgrade.benefits).map(([benefit, value]) => (
                          <span
                            key={benefit}
                            className="bg-blue-400/20 text-blue-400 px-2 py-1 rounded text-xs"
                          >
                            {benefit}: {value > 0 ? '+' : ''}
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </PulseEffect>
            );
          })}
        </div>

        {/* Upgrade Details */}
        {selectedUpgrade && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-3">
              Confirm Upgrade: {selectedUpgrade.name}
            </h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-slate-400">Cost: </span>
                <span className="text-yellow-400">💰 {selectedUpgrade.cost}</span>
              </div>
              <div>
                <span className="text-slate-400">Remaining Credits: </span>
                <span className="text-yellow-400">
                  💰 {resources.credits - selectedUpgrade.cost}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleInstallUpgrade(selectedUpgrade)}
                disabled={!canInstallUpgrade(selectedUpgrade)}
              >
                Install Upgrade
              </Button>
              <Button variant="outline" onClick={() => setSelectedUpgrade(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upgrade Tree Progress */}
        {availableUpgrades.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-3">Upgrade Progress</h4>
            <AnimatedProgressBar
              value={facilityUpgrades.length}
              max={availableUpgrades.length}
              color="green"
              label={`${facilityUpgrades.length} / ${availableUpgrades.length} upgrades installed`}
              showPercentage={true}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
