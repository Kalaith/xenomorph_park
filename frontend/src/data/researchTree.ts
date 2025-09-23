export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'biology' | 'containment' | 'combat' | 'breeding' | 'advanced';
  tier: number;
  icon: string;
  cost: {
    credits: number;
    research: number;
    time: number; // in game hours
  };
  prerequisites: string[]; // IDs of required nodes
  unlocks: {
    species?: string[];
    facilities?: string[];
    abilities?: string[];
    bonuses?: {
      type: 'income' | 'security' | 'capacity' | 'efficiency';
      value: number;
      description: string;
    }[];
  };
  position: { x: number; y: number }; // For UI layout
  completed: boolean;
  inProgress: boolean;
  available: boolean;
  progress: number; // 0-100
}

export const RESEARCH_TREE: ResearchNode[] = [
  // TIER 1 - Basic Research
  {
    id: 'xenobiology_basics',
    name: 'Xenobiology Basics',
    description: 'Fundamental understanding of xenomorph physiology and behavior',
    category: 'basic',
    tier: 1,
    icon: '🔬',
    cost: { credits: 1000, research: 50, time: 4 },
    prerequisites: [],
    unlocks: {
      species: ['Drone'],
      bonuses: [{
        type: 'efficiency',
        value: 10,
        description: '+10% research speed'
      }]
    },
    position: { x: 100, y: 100 },
    completed: false,
    inProgress: false,
    available: true,
    progress: 0
  },
  {
    id: 'basic_containment',
    name: 'Basic Containment',
    description: 'Essential containment protocols for docile xenomorphs',
    category: 'containment',
    tier: 1,
    icon: '🔒',
    cost: { credits: 800, research: 30, time: 3 },
    prerequisites: [],
    unlocks: {
      facilities: ['Basic Containment Unit'],
      bonuses: [{
        type: 'security',
        value: 15,
        description: '+15% containment effectiveness'
      }]
    },
    position: { x: 300, y: 100 },
    completed: false,
    inProgress: false,
    available: true,
    progress: 0
  },
  {
    id: 'visitor_safety',
    name: 'Visitor Safety Protocols',
    description: 'Safety measures and emergency procedures for park visitors',
    category: 'basic',
    tier: 1,
    icon: '🛡️',
    cost: { credits: 600, research: 25, time: 2 },
    prerequisites: [],
    unlocks: {
      bonuses: [{
        type: 'income',
        value: 20,
        description: '+20% visitor admission fees'
      }]
    },
    position: { x: 500, y: 100 },
    completed: false,
    inProgress: false,
    available: true,
    progress: 0
  },

  // TIER 2 - Intermediate Research
  {
    id: 'warrior_strain',
    name: 'Warrior Strain Analysis',
    description: 'Study of aggressive xenomorph variants and their combat adaptations',
    category: 'biology',
    tier: 2,
    icon: '⚔️',
    cost: { credits: 2500, research: 120, time: 8 },
    prerequisites: ['xenobiology_basics'],
    unlocks: {
      species: ['Warrior'],
      bonuses: [{
        type: 'security',
        value: 25,
        description: '+25% xenomorph threat assessment'
      }]
    },
    position: { x: 100, y: 250 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'quadrupedal_studies',
    name: 'Quadrupedal Adaptation',
    description: 'Research into animal-host xenomorph variants',
    category: 'biology',
    tier: 2,
    icon: '🐺',
    cost: { credits: 3000, research: 150, time: 10 },
    prerequisites: ['xenobiology_basics'],
    unlocks: {
      species: ['Runner'],
      bonuses: [{
        type: 'efficiency',
        value: 15,
        description: '+15% xenomorph movement tracking'
      }]
    },
    position: { x: 100, y: 400 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'reinforced_containment',
    name: 'Reinforced Containment',
    description: 'Advanced materials and designs for containing aggressive species',
    category: 'containment',
    tier: 2,
    icon: '🏢',
    cost: { credits: 4000, research: 100, time: 6 },
    prerequisites: ['basic_containment', 'warrior_strain'],
    unlocks: {
      facilities: ['Reinforced Containment Unit'],
      bonuses: [{
        type: 'security',
        value: 30,
        description: '+30% containment breach resistance'
      }]
    },
    position: { x: 300, y: 250 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'emergency_systems',
    name: 'Emergency Response Systems',
    description: 'Automated lockdown and evacuation protocols',
    category: 'containment',
    tier: 2,
    icon: '🚨',
    cost: { credits: 3500, research: 80, time: 5 },
    prerequisites: ['visitor_safety', 'basic_containment'],
    unlocks: {
      facilities: ['Emergency Command Center'],
      bonuses: [{
        type: 'security',
        value: 40,
        description: '+40% crisis response speed'
      }]
    },
    position: { x: 500, y: 250 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },

  // TIER 3 - Advanced Research
  {
    id: 'parasitic_lifecycle',
    name: 'Parasitic Lifecycle',
    description: 'Understanding facehugger behavior and chestburster development',
    category: 'breeding',
    tier: 3,
    icon: '🕷️',
    cost: { credits: 5000, research: 200, time: 12 },
    prerequisites: ['warrior_strain', 'quadrupedal_studies'],
    unlocks: {
      species: ['Facehugger', 'Chestburster'],
      facilities: ['Breeding Chamber'],
      bonuses: [{
        type: 'income',
        value: 50,
        description: '+50% breeding efficiency'
      }]
    },
    position: { x: 100, y: 550 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'praetorian_hierarchy',
    name: 'Praetorian Hierarchy',
    description: 'Study of xenomorph social structure and guardian castes',
    category: 'biology',
    tier: 3,
    icon: '👑',
    cost: { credits: 7500, research: 300, time: 15 },
    prerequisites: ['warrior_strain', 'reinforced_containment'],
    unlocks: {
      species: ['Praetorian'],
      bonuses: [{
        type: 'security',
        value: 35,
        description: '+35% hive management efficiency'
      }]
    },
    position: { x: 300, y: 400 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'combat_preparedness',
    name: 'Combat Preparedness',
    description: 'Military-grade equipment and defensive strategies',
    category: 'combat',
    tier: 3,
    icon: '🔫',
    cost: { credits: 6000, research: 180, time: 10 },
    prerequisites: ['emergency_systems', 'reinforced_containment'],
    unlocks: {
      facilities: ['Armory', 'Security Bunker'],
      bonuses: [{
        type: 'security',
        value: 60,
        description: '+60% marine deployment effectiveness'
      }]
    },
    position: { x: 500, y: 400 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },

  // TIER 4 - Expert Research
  {
    id: 'specialized_variants',
    name: 'Specialized Variants',
    description: 'Research into unique xenomorph adaptations and abilities',
    category: 'biology',
    tier: 4,
    icon: '🧬',
    cost: { credits: 10000, research: 400, time: 20 },
    prerequisites: ['parasitic_lifecycle', 'praetorian_hierarchy'],
    unlocks: {
      species: ['Crusher', 'Spitter', 'Lurker', 'Boiler'],
      bonuses: [{
        type: 'income',
        value: 75,
        description: '+75% rare specimen attraction value'
      }]
    },
    position: { x: 200, y: 700 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'maximum_security',
    name: 'Maximum Security Protocols',
    description: 'Ultimate containment measures for the most dangerous specimens',
    category: 'containment',
    tier: 4,
    icon: '🔐',
    cost: { credits: 12000, research: 350, time: 18 },
    prerequisites: ['praetorian_hierarchy', 'combat_preparedness'],
    unlocks: {
      facilities: ['Maximum Security Vault'],
      bonuses: [{
        type: 'security',
        value: 100,
        description: '+100% critical containment effectiveness'
      }]
    },
    position: { x: 400, y: 550 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },

  // TIER 5 - Legendary Research
  {
    id: 'evolutionary_genetics',
    name: 'Evolutionary Genetics',
    description: 'Advanced genetic manipulation and hybrid creation',
    category: 'advanced',
    tier: 5,
    icon: '🔬',
    cost: { credits: 20000, research: 600, time: 30 },
    prerequisites: ['specialized_variants', 'maximum_security'],
    unlocks: {
      species: ['Neomorph', 'Predalien'],
      facilities: ['Genetic Laboratory'],
      bonuses: [{
        type: 'efficiency',
        value: 100,
        description: '+100% research speed for all projects'
      }]
    },
    position: { x: 300, y: 850 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'queen_studies',
    name: 'Queen Xenomorph Studies',
    description: 'The ultimate research into the xenomorph matriarch',
    category: 'advanced',
    tier: 5,
    icon: '👸',
    cost: { credits: 50000, research: 1000, time: 50 },
    prerequisites: ['evolutionary_genetics'],
    unlocks: {
      species: ['Queen'],
      facilities: ['Royal Chamber'],
      bonuses: [
        {
          type: 'income',
          value: 200,
          description: '+200% park prestige and visitor attraction'
        },
        {
          type: 'capacity',
          value: 100,
          description: '+100% xenomorph housing capacity'
        }
      ]
    },
    position: { x: 300, y: 1000 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  },
  {
    id: 'ancient_origins',
    name: 'Ancient Origins',
    description: 'Uncover the mysteries of the xenomorph homeworld',
    category: 'advanced',
    tier: 5,
    icon: '🌌',
    cost: { credits: 30000, research: 800, time: 40 },
    prerequisites: ['evolutionary_genetics'],
    unlocks: {
      species: ['Deacon'],
      facilities: ['Archaeological Lab'],
      bonuses: [{
        type: 'efficiency',
        value: 150,
        description: '+150% unlock speed for ancient technologies'
      }]
    },
    position: { x: 100, y: 1000 },
    completed: false,
    inProgress: false,
    available: false,
    progress: 0
  }
];

export const RESEARCH_CATEGORIES = {
  basic: { name: 'Basic Research', color: 'text-green-400', bgColor: 'bg-green-400/20' },
  biology: { name: 'Biology', color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
  containment: { name: 'Containment', color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
  combat: { name: 'Combat', color: 'text-red-400', bgColor: 'bg-red-400/20' },
  breeding: { name: 'Breeding', color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  advanced: { name: 'Advanced', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' }
};

export function updateResearchAvailability(nodes: ResearchNode[]): ResearchNode[] {
  return nodes.map(node => {
    if (node.completed) {
      return { ...node, available: true };
    }

    const allPrereqsCompleted = node.prerequisites.every(prereqId =>
      nodes.find(n => n.id === prereqId)?.completed ?? false
    );

    return { ...node, available: allPrereqsCompleted };
  });
}