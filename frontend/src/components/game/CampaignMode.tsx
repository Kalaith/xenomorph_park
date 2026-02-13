import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface CampaignScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'Tutorial' | 'Easy' | 'Medium' | 'Hard' | 'Nightmare';
  biome: string;
  objectives: CampaignObjective[];
  initialResources: {
    credits: number;
    power: number;
    research: number;
    visitors: number;
  };
  restrictions?: {
    maxFacilities?: number;
    forbiddenSpecies?: string[];
    timeLimit?: number; // in game days
    noResearchLabs?: boolean;
  };
  rewards: {
    credits?: number;
    research?: number;
    unlockedSpecies?: string[];
    unlockedFacilities?: string[];
  };
  unlockRequirements?: string[]; // Previous scenario IDs
}

export interface CampaignObjective {
  id: string;
  description: string;
  type: 'revenue' | 'visitors' | 'species' | 'survival' | 'research' | 'facility' | 'time';
  target: number | string;
  completed: boolean;
  required: boolean; // Must complete to win scenario
}

const campaignScenarios: CampaignScenario[] = [
  {
    id: 'tutorial_first_park',
    name: 'Your First Xenomorph Park',
    description: 'Learn the basics of park management by building your first small-scale xenomorph exhibition.',
    difficulty: 'Tutorial',
    biome: 'earth_colony',
    objectives: [
      { id: 'build_power', description: 'Build a Power Generator', type: 'facility', target: 'Power Generator', completed: false, required: true },
      { id: 'build_research', description: 'Build a Research Lab', type: 'facility', target: 'Research Lab', completed: false, required: true },
      { id: 'build_visitor', description: 'Build a Visitor Center', type: 'facility', target: 'Visitor Center', completed: false, required: true },
      { id: 'first_drone', description: 'Research and place a Drone', type: 'species', target: 'Drone', completed: false, required: true },
      { id: 'first_revenue', description: 'Earn 2000 credits total', type: 'revenue', target: 2000, completed: false, required: true },
      { id: 'visitor_satisfaction', description: 'Maintain 20+ visitors', type: 'visitors', target: 20, completed: false, required: false },
      { id: 'survive_days', description: 'Survive 3 days without major incidents', type: 'time', target: 3, completed: false, required: true }
    ],
    initialResources: { credits: 8000, power: 25, research: 150, visitors: 5 },
    rewards: { credits: 3000, research: 750, unlockedSpecies: ['Warrior'], unlockedFacilities: ['Security Station'] }
  },
  {
    id: 'corporate_expansion',
    name: 'Corporate Expansion',
    description: 'Weyland-Yutani has approved expansion. Build a larger facility and attract more dangerous specimens.',
    difficulty: 'Easy',
    biome: 'earth_colony',
    objectives: [
      { id: 'security_station', description: 'Build a Security Station', type: 'facility', target: 'Security Station', completed: false, required: true },
      { id: 'containment_units', description: 'Build 2 Containment Units', type: 'facility', target: 2, completed: false, required: true },
      { id: 'multiple_species', description: 'House 3 different species simultaneously', type: 'species', target: 3, completed: false, required: true },
      { id: 'research_warrior', description: 'Research Warrior xenomorph', type: 'research', target: 'Warrior', completed: false, required: true },
      { id: 'visitor_capacity', description: 'Accommodate 75+ visitors', type: 'visitors', target: 75, completed: false, required: true },
      { id: 'profit_margin', description: 'Achieve 1000 daily profit', type: 'revenue', target: 1000, completed: false, required: true },
      { id: 'zero_incidents', description: 'Operate 7 days without containment breaches', type: 'time', target: 7, completed: false, required: false }
    ],
    initialResources: { credits: 15000, power: 40, research: 300, visitors: 15 },
    restrictions: { maxFacilities: 12 },
    unlockRequirements: ['tutorial_first_park'],
    rewards: { credits: 8000, research: 1500, unlockedSpecies: ['Runner', 'Spitter'], unlockedFacilities: ['Medical Bay', 'Cafeteria'] }
  },
  {
    id: 'hadleys_hope',
    name: "Hadley's Hope Recreation",
    description: 'Recreate the infamous Hadley\'s Hope colony. Manage a research station while studying aggressive specimens.',
    difficulty: 'Medium',
    biome: 'lv_426',
    objectives: [
      { id: 'atmospheric_processor', description: 'Build an Atmospheric Processor', type: 'facility', target: 'Atmospheric Processor', completed: false, required: true },
      { id: 'research_facility', description: 'Establish advanced research capabilities', type: 'research', target: 3000, completed: false, required: true },
      { id: 'contain_warriors', description: 'Successfully contain 3 different warrior-class species', type: 'species', target: 3, completed: false, required: true },
      { id: 'weather_survival', description: 'Survive 3 atmospheric storm events', type: 'survival', target: 3, completed: false, required: true },
      { id: 'colony_population', description: 'Support 100+ colonist simulation', type: 'visitors', target: 100, completed: false, required: true },
      { id: 'terraforming_success', description: 'Operate for 15 days with stable conditions', type: 'time', target: 15, completed: false, required: true },
      { id: 'perfect_safety', description: 'Zero colonist casualties', type: 'survival', target: 0, completed: false, required: false }
    ],
    initialResources: { credits: 25000, power: 60, research: 800, visitors: 50 },
    restrictions: { maxFacilities: 18, timeLimit: 25, forbiddenSpecies: ['Queen', 'Empress'] },
    unlockRequirements: ['corporate_expansion'],
    rewards: { credits: 15000, research: 3000, unlockedSpecies: ['Praetorian', 'Lurker'], unlockedFacilities: ['Atmospheric Processor', 'Observatory'] }
  },
  {
    id: 'nostromo_incident',
    name: 'The Nostromo Incident',
    description: 'A survival horror scenario. Your ship has been compromised. Survive and contain the threat.',
    difficulty: 'Hard',
    biome: 'space_station',
    objectives: [
      { id: 'survive_alien', description: 'Survive alien encounter', type: 'survival', target: 1, completed: false, required: true },
      { id: 'repair_systems', description: 'Repair critical systems', type: 'facility', target: 'Life Support', completed: false, required: true },
      { id: 'evacuate', description: 'Reach escape pods', type: 'survival', target: 1, completed: false, required: true }
    ],
    initialResources: { credits: 0, power: 10, research: 0, visitors: 0 },
    restrictions: { forbiddenSpecies: ['Queen', 'Praetorian'], timeLimit: 3 },
    unlockRequirements: ['hadleys_hope'],
    rewards: { credits: 15000, research: 3000, unlockedSpecies: ['Neomorph'], unlockedFacilities: ['Emergency Systems'] }
  },
  {
    id: 'weyland_yutani_exhibition',
    name: 'Weyland-Yutani Grand Exhibition',
    description: 'Corporate demands a massive exhibition showcasing all species. Spare no expense, but maintain perfect security.',
    difficulty: 'Hard',
    biome: 'earth_colony',
    objectives: [
      { id: 'all_species', description: 'Display all available species', type: 'species', target: 10, completed: false, required: true },
      { id: 'massive_revenue', description: 'Generate 50,000 total revenue', type: 'revenue', target: 50000, completed: false, required: true },
      { id: 'vip_visitors', description: 'Accommodate 200+ visitors', type: 'visitors', target: 200, completed: false, required: true },
      { id: 'perfect_record', description: 'Zero visitor casualties', type: 'survival', target: 0, completed: false, required: true }
    ],
    initialResources: { credits: 50000, power: 100, research: 5000, visitors: 50 },
    unlockRequirements: ['nostromo_incident'],
    rewards: { credits: 100000, research: 10000, unlockedFacilities: ['Executive Suite', 'Corporate Laboratory'] }
  },
  {
    id: 'alien_homeworld',
    name: 'Alien Homeworld Expedition',
    description: 'Establish a research outpost on the xenomorph homeworld. Face unknown species and hostile environment.',
    difficulty: 'Nightmare',
    biome: 'xenomorph_prime',
    objectives: [
      { id: 'establish_base', description: 'Build 20 facilities', type: 'facility', target: 20, completed: false, required: true },
      { id: 'discover_species', description: 'Discover 5 new species', type: 'research', target: 5, completed: false, required: true },
      { id: 'survive_waves', description: 'Survive 5 alien attack waves', type: 'survival', target: 5, completed: false, required: true },
      { id: 'genetic_mastery', description: 'Create 10 genetic modifications', type: 'research', target: 10, completed: false, required: true }
    ],
    initialResources: { credits: 25000, power: 50, research: 2000, visitors: 0 },
    restrictions: { forbiddenSpecies: [], timeLimit: 50 },
    unlockRequirements: ['weyland_yutani_exhibition'],
    rewards: { credits: 200000, research: 20000, unlockedSpecies: ['Alpha Xenomorph', 'Empress'], unlockedFacilities: ['Xenomorph Shrine', 'Hive Mind Interface'] }
  }
];

interface CampaignModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignMode({ isOpen, onClose }: CampaignModeProps) {
  const [selectedScenario, setSelectedScenario] = useState<CampaignScenario | null>(null);
  const [completedScenarios] = useState<string[]>(() => {
    const saved = localStorage.getItem('xenomorph-park-campaign-progress');
    return saved ? JSON.parse(saved) : [];
  });

  const isScenarioUnlocked = (scenario: CampaignScenario) => {
    if (!scenario.unlockRequirements) return true;
    return scenario.unlockRequirements.every(req => completedScenarios.includes(req));
  };

  const getDifficultyColor = (difficulty: CampaignScenario['difficulty']) => {
    switch (difficulty) {
      case 'Tutorial': return 'text-green-400';
      case 'Easy': return 'text-blue-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      case 'Nightmare': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getDifficultyIcon = (difficulty: CampaignScenario['difficulty']) => {
    switch (difficulty) {
      case 'Tutorial': return '📚';
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      case 'Nightmare': return '💀';
      default: return '⚫';
    }
  };

  const getBiomeIcon = (biome: string) => {
    const icons: Record<string, string> = {
      earth_colony: '🌍',
      lv_426: '🌑',
      space_station: '🚀',
      xenomorph_prime: '👾',
      research_facility: '🔬',
      mining_station: '⛏️'
    };
    return icons[biome] || '🌌';
  };

  const startScenario = (scenario: CampaignScenario) => {
    if (!isScenarioUnlocked(scenario)) return;

    // Initialize game state with scenario parameters
    const { reset, updateResources } = useGameStore.getState();

    // Reset the game
    reset();

    // Apply scenario starting resources
    updateResources(scenario.initialResources);

    // Store current scenario in localStorage for objective tracking
    localStorage.setItem('current-campaign-scenario', JSON.stringify(scenario));

    onClose();
  };

  const ScenarioCard = ({ scenario }: { scenario: CampaignScenario }) => {
    const isUnlocked = isScenarioUnlocked(scenario);
    const isCompleted = completedScenarios.includes(scenario.id);

    return (
      <div
        className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${isUnlocked
            ? isCompleted
              ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20'
              : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-green-400'
            : 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed'
          }
          ${selectedScenario?.id === scenario.id ? 'ring-2 ring-green-400' : ''}
        `}
        onClick={() => isUnlocked && setSelectedScenario(scenario)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getBiomeIcon(scenario.biome)}</span>
            <div>
              <h3 className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-slate-200'}`}>
                {scenario.name}
                {isCompleted && ' ✅'}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={getDifficultyColor(scenario.difficulty)}>
                  {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty}
                </span>
              </div>
            </div>
          </div>
          {!isUnlocked && <span className="text-slate-500 text-sm">🔒 Locked</span>}
        </div>

        <p className="text-slate-300 text-sm mb-3 leading-relaxed">
          {scenario.description}
        </p>

        <div className="space-y-2">
          <div className="text-xs text-slate-400">
            <strong>Objectives:</strong> {scenario.objectives.filter(obj => obj.required).length} required, {scenario.objectives.filter(obj => !obj.required).length} optional
          </div>

          {scenario.restrictions && (
            <div className="text-xs text-red-400">
              <strong>Restrictions:</strong>
              {scenario.restrictions.timeLimit && ` ${scenario.restrictions.timeLimit} day limit`}
              {scenario.restrictions.maxFacilities && ` Max ${scenario.restrictions.maxFacilities} facilities`}
              {scenario.restrictions.noResearchLabs && ` No research labs`}
            </div>
          )}

          <div className="text-xs text-green-400">
            <strong>Rewards:</strong>
            {scenario.rewards.credits && ` ${scenario.rewards.credits} 💰`}
            {scenario.rewards.research && ` ${scenario.rewards.research} 🔬`}
            {scenario.rewards.unlockedSpecies && ` +${scenario.rewards.unlockedSpecies.length} species`}
            {scenario.rewards.unlockedFacilities && ` +${scenario.rewards.unlockedFacilities.length} facilities`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Campaign Mode">
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Progress Overview */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
          <h4 className="text-green-400 font-semibold mb-2">Campaign Progress</h4>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-400">Completed:</span>
              <span className="text-green-400 ml-2">{completedScenarios.length}/{campaignScenarios.length}</span>
            </div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedScenarios.length / campaignScenarios.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scenario List */}
        <div className="grid grid-cols-1 gap-4">
          {campaignScenarios.map(scenario => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-green-400">
            <h4 className="text-green-400 font-semibold mb-3">Mission Briefing: {selectedScenario.name}</h4>

            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-slate-300">Starting Resources:</strong>
                <div className="mt-1 flex gap-4 text-xs">
                  <span>💰 {selectedScenario.initialResources.credits}</span>
                  <span>⚡ {selectedScenario.initialResources.power}</span>
                  <span>🔬 {selectedScenario.initialResources.research}</span>
                  <span>👥 {selectedScenario.initialResources.visitors}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-300">Mission Objectives:</strong>
                <div className="mt-1 space-y-1">
                  {selectedScenario.objectives.map(objective => (
                    <div key={objective.id} className="flex items-center gap-2 text-xs">
                      <span className={objective.required ? 'text-red-400' : 'text-blue-400'}>
                        {objective.required ? '🔴' : '🔵'}
                      </span>
                      <span className="text-slate-300">{objective.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {selectedScenario && isScenarioUnlocked(selectedScenario) && (
            <Button
              variant="primary"
              onClick={() => startScenario(selectedScenario)}
              className="flex-1"
            >
              🚀 Start Mission
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
