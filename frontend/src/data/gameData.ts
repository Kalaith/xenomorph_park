import { XenomorphSpecies, FacilityDefinition, Weapon, CrisisEvent } from '../types';

export const XENOMORPH_SPECIES: XenomorphSpecies[] = [
  {
    name: "Drone",
    description: "Basic worker xenomorph, birthed from human hosts",
    dangerLevel: 3,
    containmentDifficulty: 2,
    researchCost: 100,
    foodRequirement: "Low",
    specialAbilities: ["Hive construction", "Basic hunting"]
  },
  {
    name: "Warrior",
    description: "Combat-focused xenomorph with ridged skull",
    dangerLevel: 4,
    containmentDifficulty: 3,
    researchCost: 250,
    foodRequirement: "Medium",
    specialAbilities: ["Pack hunting", "Stealth tactics"]
  },
  {
    name: "Runner",
    description: "Quadrupedal xenomorph birthed from animal hosts",
    dangerLevel: 4,
    containmentDifficulty: 4,
    researchCost: 300,
    foodRequirement: "Medium",
    specialAbilities: ["High speed", "Wall climbing"]
  },
  {
    name: "Praetorian",
    description: "Large defensive xenomorph protecting the queen",
    dangerLevel: 5,
    containmentDifficulty: 5,
    researchCost: 500,
    foodRequirement: "High",
    specialAbilities: ["Heavy armor", "Area denial"]
  },
  {
    name: "Predalien",
    description: "Rare hybrid born from Predator host",
    dangerLevel: 6,
    containmentDifficulty: 6,
    researchCost: 1000,
    foodRequirement: "Very High",
    specialAbilities: ["Royal jelly production", "Advanced intelligence"]
  }
];

export const FACILITY_DEFINITIONS: FacilityDefinition[] = [
  {
    name: "Research Lab",
    cost: 5000,
    powerRequirement: 3,
    description: "Conduct xenomorph research and genetic studies"
  },
  {
    name: "Hatchery",
    cost: 8000,
    powerRequirement: 2,
    description: "Controlled breeding facility with ovomorphs"
  },
  {
    name: "Containment Unit",
    cost: 12000,
    powerRequirement: 5,
    description: "High-security xenomorph housing"
  },
  {
    name: "Visitor Center",
    cost: 3000,
    powerRequirement: 2,
    description: "Guest facilities and viewing areas"
  },
  {
    name: "Security Station",
    cost: 7000,
    powerRequirement: 4,
    description: "Colonial Marine deployment and monitoring"
  },
  {
    name: "Power Generator",
    cost: 4000,
    powerRequirement: 0,
    description: "Provides power to other facilities"
  }
];

export const WEAPONS: Weapon[] = [
  {
    name: "M41A Pulse Rifle",
    damage: 4,
    ammoCapacity: 95,
    rateOfFire: "High",
    special: "Grenade launcher attachment"
  },
  {
    name: "M37A2 Shotgun",
    damage: 6,
    ammoCapacity: 8,
    rateOfFire: "Medium",
    special: "High close-range damage"
  },
  {
    name: "M56 Smartgun",
    damage: 5,
    ammoCapacity: 500,
    rateOfFire: "Very High",
    special: "Auto-targeting system"
  }
];

export const CRISIS_EVENTS: CrisisEvent[] = [
  {
    name: "Containment Breach",
    probability: 0.3,
    severity: "Medium",
    description: "Single xenomorph escapes containment",
    responseOptions: ["Security lockdown", "Colonial Marine deployment", "Facility evacuation"]
  },
  {
    name: "Power Failure",
    probability: 0.2,
    severity: "High",
    description: "Main power grid failure, all containment at risk",
    responseOptions: ["Emergency power", "Immediate evacuation", "Manual lockdown"]
  },
  {
    name: "Hive Outbreak",
    probability: 0.1,
    severity: "Critical",
    description: "Multiple xenomorphs coordinate escape",
    responseOptions: ["Nuclear option", "Full marine assault", "Abandon facility"]
  }
];

export const DEFAULT_OBJECTIVES = [
  'Restore power to main grid',
  'Evacuate remaining civilians',
  'Eliminate xenomorph threats'
];
