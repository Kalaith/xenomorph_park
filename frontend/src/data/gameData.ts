import { XenomorphSpecies, FacilityDefinition, Weapon, CrisisEvent } from '../types';

export const xenomorphSpecies: XenomorphSpecies[] = [
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
  },
  {
    name: "Queen",
    description: "The ultimate xenomorph matriarch capable of laying eggs",
    dangerLevel: 8,
    containmentDifficulty: 8,
    researchCost: 2000,
    foodRequirement: "Very High",
    specialAbilities: ["Egg laying", "Hive mind control", "Massive size", "Acid spray"]
  },
  {
    name: "Facehugger",
    description: "Spider-like parasite that implants embryos in hosts",
    dangerLevel: 2,
    containmentDifficulty: 9,
    researchCost: 150,
    foodRequirement: "Low",
    specialAbilities: ["Host implantation", "Extreme agility", "Acidic blood"]
  },
  {
    name: "Chestburster",
    description: "Juvenile form that emerges from infected hosts",
    dangerLevel: 1,
    containmentDifficulty: 7,
    researchCost: 75,
    foodRequirement: "Low",
    specialAbilities: ["Rapid growth", "Host dependency", "Small size advantage"]
  },
  {
    name: "Crusher",
    description: "Heavily armored xenomorph bred for demolition",
    dangerLevel: 7,
    containmentDifficulty: 6,
    researchCost: 1500,
    foodRequirement: "High",
    specialAbilities: ["Battering ram skull", "Extreme durability", "Structure destruction"]
  },
  {
    name: "Spitter",
    description: "Long-range acid projectile specialist",
    dangerLevel: 5,
    containmentDifficulty: 4,
    researchCost: 800,
    foodRequirement: "Medium",
    specialAbilities: ["Acid projectiles", "Ranged combat", "Corrosive attacks"]
  },
  {
    name: "Lurker",
    description: "Ceiling-dwelling ambush predator",
    dangerLevel: 4,
    containmentDifficulty: 5,
    researchCost: 600,
    foodRequirement: "Medium",
    specialAbilities: ["Ceiling traversal", "Ambush tactics", "Silent movement"]
  },
  {
    name: "Boiler",
    description: "Volatile xenomorph that explodes when threatened",
    dangerLevel: 6,
    containmentDifficulty: 7,
    researchCost: 1200,
    foodRequirement: "High",
    specialAbilities: ["Explosive death", "Chemical warfare", "Area damage"]
  },
  {
    name: "Neomorph",
    description: "Evolved strain with enhanced regeneration",
    dangerLevel: 5,
    containmentDifficulty: 5,
    researchCost: 900,
    foodRequirement: "Medium",
    specialAbilities: ["Rapid healing", "Evolutionary adaptation", "Genetic instability"]
  },
  {
    name: "Deacon",
    description: "Ancient variant with unique physiology",
    dangerLevel: 7,
    containmentDifficulty: 8,
    researchCost: 1800,
    foodRequirement: "High",
    specialAbilities: ["Pharyngeal jaw", "Ancient genetics", "Aggressive behavior"]
  },
  // Advanced Campaign Species
  {
    name: "Alpha Xenomorph",
    description: "Elite prime specimen with enhanced combat capabilities",
    dangerLevel: 9,
    containmentDifficulty: 9,
    researchCost: 5000,
    foodRequirement: "Very High",
    specialAbilities: ["Pack leadership", "Enhanced intelligence", "Tactical coordination", "Extreme aggression"]
  },
  {
    name: "Empress",
    description: "Super-Queen capable of producing multiple egg sacs simultaneously",
    dangerLevel: 10,
    containmentDifficulty: 10,
    researchCost: 10000,
    foodRequirement: "Very High",
    specialAbilities: ["Mass egg production", "Telepathic hive control", "Gigantic size", "Acid flood"]
  },
  // Environmental Variants
  {
    name: "Aqua Xenomorph",
    description: "Aquatic adaptation with enhanced swimming capabilities",
    dangerLevel: 4,
    containmentDifficulty: 6,
    researchCost: 700,
    foodRequirement: "Medium",
    specialAbilities: ["Underwater breathing", "Hydrolic pressure resistance", "Aquatic stealth"]
  },
  {
    name: "Cryo Xenomorph",
    description: "Cold-adapted variant with ice-based attacks",
    dangerLevel: 5,
    containmentDifficulty: 4,
    researchCost: 800,
    foodRequirement: "Low",
    specialAbilities: ["Freeze breath", "Cold immunity", "Ice armor formation"]
  },
  {
    name: "Pyro Xenomorph",
    description: "Heat-adapted variant with incendiary capabilities",
    dangerLevel: 6,
    containmentDifficulty: 7,
    researchCost: 950,
    foodRequirement: "High",
    specialAbilities: ["Fire immunity", "Molten acid", "Heat generation"]
  },
  {
    name: "Void Xenomorph",
    description: "Space-adapted variant capable of surviving in vacuum",
    dangerLevel: 5,
    containmentDifficulty: 8,
    researchCost: 1100,
    foodRequirement: "Low",
    specialAbilities: ["Vacuum survival", "Zero-G mobility", "Solar energy absorption"]
  },
  // Hybrid Species
  {
    name: "Xeno-Engineer",
    description: "Hybrid created from Engineer host with advanced technology integration",
    dangerLevel: 8,
    containmentDifficulty: 9,
    researchCost: 3000,
    foodRequirement: "Very High",
    specialAbilities: ["Technology manipulation", "Bio-mechanical interface", "Ancient knowledge"]
  },
  {
    name: "Synthetic Xenomorph",
    description: "Cybernetic enhancement with mechanical components",
    dangerLevel: 7,
    containmentDifficulty: 5,
    researchCost: 2500,
    foodRequirement: "Medium",
    specialAbilities: ["EMP immunity", "Enhanced durability", "Digital interface"]
  },
  // Microscopic & Parasitic
  {
    name: "Nano Xenomorph",
    description: "Microscopic swarm variant that can infiltrate systems",
    dangerLevel: 3,
    containmentDifficulty: 10,
    researchCost: 1500,
    foodRequirement: "Low",
    specialAbilities: ["System infiltration", "Molecular reconstruction", "Swarm intelligence"]
  },
  {
    name: "Parasitic Xenomorph",
    description: "Internal parasite that controls host behavior",
    dangerLevel: 4,
    containmentDifficulty: 9,
    researchCost: 1300,
    foodRequirement: "Low",
    specialAbilities: ["Host control", "Memory access", "Neural manipulation"]
  },
  // Specialized Combat Variants
  {
    name: "Berserker Xenomorph",
    description: "Rage-enhanced variant with overwhelming aggression",
    dangerLevel: 8,
    containmentDifficulty: 6,
    researchCost: 2200,
    foodRequirement: "Very High",
    specialAbilities: ["Berserk mode", "Pain immunity", "Frenzy attacks"]
  },
  {
    name: "Stalker Xenomorph",
    description: "Stealth specialist with advanced camouflage",
    dangerLevel: 6,
    containmentDifficulty: 8,
    researchCost: 1600,
    foodRequirement: "Medium",
    specialAbilities: ["Active camouflage", "Pheromone masking", "Perfect mimicry"]
  },
  {
    name: "Guardian Xenomorph",
    description: "Defensive specialist with energy shield generation",
    dangerLevel: 5,
    containmentDifficulty: 4,
    researchCost: 1400,
    foodRequirement: "High",
    specialAbilities: ["Energy shields", "Barrier generation", "Protective instincts"]
  }
];

export const facilityDefinitions: FacilityDefinition[] = [
  // Basic Facilities
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
  },
  // Advanced Specialized Facilities
  {
    name: "Atmospheric Processor",
    cost: 25000,
    powerRequirement: 15,
    description: "Terraforming facility for environmental control and weather manipulation"
  },
  {
    name: "Corporate Laboratory",
    cost: 35000,
    powerRequirement: 12,
    description: "Advanced research facility with classified experimentation capabilities"
  },
  {
    name: "Executive Suite",
    cost: 15000,
    powerRequirement: 5,
    description: "Luxury accommodations for VIP visitors and corporate executives"
  },
  {
    name: "Emergency Systems",
    cost: 20000,
    powerRequirement: 8,
    description: "Backup life support and emergency containment protocols"
  },
  {
    name: "Xenomorph Shrine",
    cost: 50000,
    powerRequirement: 20,
    description: "Ancient alien structure that enhances xenomorph capabilities"
  },
  {
    name: "Hive Mind Interface",
    cost: 75000,
    powerRequirement: 25,
    description: "Experimental technology for communicating with the hive consciousness"
  },
  // Environmental Facilities
  {
    name: "Cryo Storage",
    cost: 18000,
    powerRequirement: 10,
    description: "Ultra-low temperature preservation for specimens and research"
  },
  {
    name: "Thermal Regulation",
    cost: 16000,
    powerRequirement: 8,
    description: "High-temperature environment for pyro-adapted species"
  },
  {
    name: "Aquatic Habitat",
    cost: 22000,
    powerRequirement: 12,
    description: "Underwater environment for aquatic xenomorph variants"
  },
  {
    name: "Zero-G Chamber",
    cost: 30000,
    powerRequirement: 15,
    description: "Anti-gravity facility for space-adapted species"
  },
  // Medical & Support
  {
    name: "Medical Bay",
    cost: 14000,
    powerRequirement: 6,
    description: "Advanced medical facility for treating injuries and infections"
  },
  {
    name: "Cafeteria",
    cost: 8000,
    powerRequirement: 4,
    description: "Dining facility that improves visitor satisfaction and dwell time"
  },
  {
    name: "Observatory",
    cost: 12000,
    powerRequirement: 5,
    description: "Astronomical monitoring station for tracking external threats"
  },
  {
    name: "Communications Array",
    cost: 10000,
    powerRequirement: 7,
    description: "Long-range communications and data transmission facility"
  },
  // Security & Defense
  {
    name: "Automated Defense Grid",
    cost: 28000,
    powerRequirement: 18,
    description: "AI-controlled defensive turrets and containment systems"
  },
  {
    name: "Quarantine Chamber",
    cost: 24000,
    powerRequirement: 10,
    description: "Isolation facility for contaminated personnel and specimens"
  },
  {
    name: "Bunker Complex",
    cost: 40000,
    powerRequirement: 12,
    description: "Underground shelter for emergency evacuation scenarios"
  },
  // Specialized Research
  {
    name: "Genetic Sequencer",
    cost: 45000,
    powerRequirement: 20,
    description: "Advanced DNA analysis and modification laboratory"
  },
  {
    name: "Biomechanical Workshop",
    cost: 32000,
    powerRequirement: 14,
    description: "Facility for creating synthetic-xenomorph hybrids"
  },
  {
    name: "Psionic Laboratory",
    cost: 60000,
    powerRequirement: 22,
    description: "Research facility for studying telepathic and psychic phenomena"
  },
  // Production & Manufacturing
  {
    name: "Weapons Factory",
    cost: 26000,
    powerRequirement: 16,
    description: "Manufacturing facility for advanced weaponry and equipment"
  },
  {
    name: "Synthetic Assembly",
    cost: 38000,
    powerRequirement: 18,
    description: "Production facility for android and robotic personnel"
  },
  {
    name: "Life Support Core",
    cost: 20000,
    powerRequirement: 8,
    description: "Central life support system for the entire facility"
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

export const crisisEvents: CrisisEvent[] = [
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

export const defaultObjectives = [
  'Restore power to main grid',
  'Evacuate remaining civilians',
  'Eliminate xenomorph threats'
];
