import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';

export interface Biome {
  id: string;
  name: string;
  description: string;
  environment: {
    temperature: 'frozen' | 'cold' | 'temperate' | 'hot' | 'scorching';
    atmosphere: 'vacuum' | 'thin' | 'breathable' | 'toxic' | 'corrosive';
    gravity: 'zero' | 'low' | 'standard' | 'high' | 'extreme';
    radiation: 'none' | 'low' | 'moderate' | 'high' | 'lethal';
  };
  effects: {
    facilityEfficiency: number; // 0.5 - 2.0 multiplier
    containmentDifficulty: number; // -3 to +3 modifier
    visitorComfort: number; // 0.1 - 1.0 multiplier
    researchSpeed: number; // 0.5 - 1.5 multiplier
    specialEffects?: string[];
  };
  nativeSpecies: string[]; // Species that thrive in this biome
  hazards: BiomeHazard[];
  visualTheme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundFilter: string;
    particles?: 'dust' | 'snow' | 'sparks' | 'spores' | 'ash';
  };
}

export interface BiomeHazard {
  name: string;
  frequency: number; // 0-1 probability per day
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  description: string;
  effects: {
    damageToFacilities?: number;
    visitorEvacuation?: number;
    powerDrain?: number;
    researchLoss?: number;
  };
}

const BIOMES: Record<string, Biome> = {
  earth_colony: {
    id: 'earth_colony',
    name: 'Earth Colony',
    description: 'Standard human colony with controlled atmosphere and familiar conditions.',
    environment: {
      temperature: 'temperate',
      atmosphere: 'breathable',
      gravity: 'standard',
      radiation: 'none',
    },
    effects: {
      facilityEfficiency: 1.0,
      containmentDifficulty: 0,
      visitorComfort: 1.0,
      researchSpeed: 1.0,
    },
    nativeSpecies: ['Drone', 'Warrior'],
    hazards: [
      {
        name: 'System Malfunction',
        frequency: 0.1,
        severity: 'minor',
        description: 'Minor technical issues with colony systems',
        effects: { powerDrain: 5 },
      },
    ],
    visualTheme: {
      primaryColor: '#00ff41',
      secondaryColor: '#0066cc',
      backgroundFilter: 'brightness(1) contrast(1)',
      particles: 'dust',
    },
  },

  lv_426: {
    id: 'lv_426',
    name: 'LV-426 (Acheron)',
    description: 'Hostile moon with violent atmospheric storms and industrial ruins.',
    environment: {
      temperature: 'cold',
      atmosphere: 'toxic',
      gravity: 'low',
      radiation: 'moderate',
    },
    effects: {
      facilityEfficiency: 0.8,
      containmentDifficulty: 2,
      visitorComfort: 0.3,
      researchSpeed: 1.2,
      specialEffects: ['Atmospheric storms double containment difficulty during weather events'],
    },
    nativeSpecies: ['Warrior', 'Runner', 'Queen'],
    hazards: [
      {
        name: 'Atmospheric Storm',
        frequency: 0.3,
        severity: 'severe',
        description: 'Violent winds and electrical storms wreak havoc',
        effects: {
          damageToFacilities: 20,
          powerDrain: 15,
          visitorEvacuation: 50,
        },
      },
      {
        name: 'Acid Rain',
        frequency: 0.2,
        severity: 'moderate',
        description: 'Corrosive precipitation damages exposed systems',
        effects: { damageToFacilities: 10 },
      },
    ],
    visualTheme: {
      primaryColor: '#ff6600',
      secondaryColor: '#990000',
      backgroundFilter: 'brightness(0.6) contrast(1.3) hue-rotate(20deg)',
      particles: 'ash',
    },
  },

  space_station: {
    id: 'space_station',
    name: 'Deep Space Station',
    description: 'Isolated research station in the void of space with artificial gravity.',
    environment: {
      temperature: 'cold',
      atmosphere: 'breathable',
      gravity: 'low',
      radiation: 'high',
    },
    effects: {
      facilityEfficiency: 0.9,
      containmentDifficulty: 1,
      visitorComfort: 0.7,
      researchSpeed: 1.3,
      specialEffects: ['Zero visitor influx', 'Enhanced research capabilities'],
    },
    nativeSpecies: ['Void Xenomorph', 'Synthetic Xenomorph'],
    hazards: [
      {
        name: 'Hull Breach',
        frequency: 0.15,
        severity: 'catastrophic',
        description: 'Micrometorite impact compromises station integrity',
        effects: {
          damageToFacilities: 50,
          visitorEvacuation: 100,
          powerDrain: 30,
        },
      },
      {
        name: 'Solar Flare',
        frequency: 0.25,
        severity: 'moderate',
        description: 'Radiation surge affects electronic systems',
        effects: { powerDrain: 20, researchLoss: 10 },
      },
    ],
    visualTheme: {
      primaryColor: '#00ccff',
      secondaryColor: '#6600cc',
      backgroundFilter: 'brightness(0.4) contrast(1.5) hue-rotate(240deg)',
      particles: 'sparks',
    },
  },

  xenomorph_prime: {
    id: 'xenomorph_prime',
    name: 'Xenomorph Homeworld',
    description: 'The alien homeworld with biomechanical hive structures and hostile ecosystem.',
    environment: {
      temperature: 'hot',
      atmosphere: 'toxic',
      gravity: 'high',
      radiation: 'high',
    },
    effects: {
      facilityEfficiency: 0.6,
      containmentDifficulty: -2,
      visitorComfort: 0.1,
      researchSpeed: 2.0,
      specialEffects: [
        'Xenomorphs are easier to contain',
        'Massive research bonuses',
        'No human visitors',
      ],
    },
    nativeSpecies: ['Alpha Xenomorph', 'Empress', 'Berserker Xenomorph', 'Stalker Xenomorph'],
    hazards: [
      {
        name: 'Hive Uprising',
        frequency: 0.4,
        severity: 'catastrophic',
        description: 'Native xenomorphs attack the facility',
        effects: { damageToFacilities: 75, powerDrain: 50 },
      },
      {
        name: 'Biomass Infestation',
        frequency: 0.3,
        severity: 'severe',
        description: 'Alien organisms infiltrate facility systems',
        effects: { damageToFacilities: 30, researchLoss: 25 },
      },
    ],
    visualTheme: {
      primaryColor: '#ff0040',
      secondaryColor: '#330066',
      backgroundFilter: 'brightness(0.3) contrast(2) saturate(1.5) hue-rotate(300deg)',
      particles: 'spores',
    },
  },

  volcanic_world: {
    id: 'volcanic_world',
    name: 'Volcanic World',
    description: 'Molten landscape with extreme heat and geological instability.',
    environment: {
      temperature: 'scorching',
      atmosphere: 'toxic',
      gravity: 'standard',
      radiation: 'moderate',
    },
    effects: {
      facilityEfficiency: 0.7,
      containmentDifficulty: 1,
      visitorComfort: 0.2,
      researchSpeed: 1.1,
      specialEffects: ['Pyro species thrive here', 'Geothermal power generation'],
    },
    nativeSpecies: ['Pyro Xenomorph', 'Boiler'],
    hazards: [
      {
        name: 'Volcanic Eruption',
        frequency: 0.2,
        severity: 'catastrophic',
        description: 'Massive lava flow threatens the facility',
        effects: {
          damageToFacilities: 60,
          visitorEvacuation: 100,
          powerDrain: 25,
        },
      },
      {
        name: 'Seismic Activity',
        frequency: 0.35,
        severity: 'moderate',
        description: 'Earthquakes damage facility foundations',
        effects: { damageToFacilities: 15 },
      },
    ],
    visualTheme: {
      primaryColor: '#ff6600',
      secondaryColor: '#cc0000',
      backgroundFilter: 'brightness(0.8) contrast(1.4) saturate(1.8) hue-rotate(15deg)',
      particles: 'ash',
    },
  },

  ice_world: {
    id: 'ice_world',
    name: 'Frozen Wasteland',
    description: 'Sub-zero planet with perpetual winter and ice storms.',
    environment: {
      temperature: 'frozen',
      atmosphere: 'thin',
      gravity: 'standard',
      radiation: 'low',
    },
    effects: {
      facilityEfficiency: 0.8,
      containmentDifficulty: 0,
      visitorComfort: 0.4,
      researchSpeed: 0.9,
      specialEffects: ['Cryo species gain bonuses', 'Reduced power costs for cooling'],
    },
    nativeSpecies: ['Cryo Xenomorph'],
    hazards: [
      {
        name: 'Blizzard',
        frequency: 0.4,
        severity: 'moderate',
        description: 'Severe ice storms reduce visibility and mobility',
        effects: { visitorEvacuation: 30, powerDrain: 10 },
      },
      {
        name: 'Ice Quake',
        frequency: 0.15,
        severity: 'severe',
        description: 'Shifting ice sheets damage surface structures',
        effects: { damageToFacilities: 25 },
      },
    ],
    visualTheme: {
      primaryColor: '#00ffff',
      secondaryColor: '#0066ff',
      backgroundFilter: 'brightness(1.2) contrast(1.1) saturate(0.7) hue-rotate(180deg)',
      particles: 'snow',
    },
  },

  aquatic_world: {
    id: 'aquatic_world',
    name: 'Ocean World',
    description: 'Water-covered planet with underwater facilities and marine ecosystems.',
    environment: {
      temperature: 'temperate',
      atmosphere: 'breathable',
      gravity: 'standard',
      radiation: 'none',
    },
    effects: {
      facilityEfficiency: 0.9,
      containmentDifficulty: -1,
      visitorComfort: 0.8,
      researchSpeed: 1.2,
      specialEffects: ['Aquatic species thrive here', 'Unique underwater viewing experiences'],
    },
    nativeSpecies: ['Aqua Xenomorph'],
    hazards: [
      {
        name: 'Tidal Wave',
        frequency: 0.1,
        severity: 'severe',
        description: 'Massive wave surge floods surface facilities',
        effects: { damageToFacilities: 40, visitorEvacuation: 75 },
      },
      {
        name: 'Pressure Breach',
        frequency: 0.2,
        severity: 'moderate',
        description: 'Underwater facility hull integrity compromised',
        effects: { damageToFacilities: 20, powerDrain: 15 },
      },
    ],
    visualTheme: {
      primaryColor: '#0099cc',
      secondaryColor: '#006699',
      backgroundFilter: 'brightness(0.9) contrast(1.2) saturate(1.3) hue-rotate(200deg)',
      particles: 'dust',
    },
  },
};

interface BiomeSystemProps {
  children: React.ReactNode;
}

// Compact biome display for header
export function BiomeDisplay() {
  const [currentBiome] = useState<Biome>(BIOMES.earth_colony);

  return (
    <div className="bg-slate-800/50 border border-slate-600/50 rounded px-3 py-2 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-green-400 font-semibold">🌍 {currentBiome.name}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <span>🌡️ {currentBiome.environment.temperature}</span>
        <span>🌫️ {currentBiome.environment.atmosphere}</span>
        <span>⚖️ {currentBiome.environment.gravity}G</span>
        <span>☢️ {currentBiome.environment.radiation}</span>
      </div>
      {currentBiome.nativeSpecies.length > 0 && (
        <div className="border-t border-slate-600/50 pt-1 mt-1">
          <span className="text-slate-400">Species: </span>
          <span className="text-green-400">{currentBiome.nativeSpecies.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

export function BiomeSystem({ children }: BiomeSystemProps) {
  const [currentBiome, setCurrentBiome] = useState<Biome>(BIOMES.earth_colony);
  const { day, hour } = useGameStore();

  // Get current biome from campaign scenario or default
  useEffect(() => {
    const currentScenario = localStorage.getItem('current-campaign-scenario');
    if (currentScenario) {
      const scenario = JSON.parse(currentScenario);
      const biome = BIOMES[scenario.biome] || BIOMES.earth_colony;
      setCurrentBiome(biome);
    }
  }, []);

  // Process biome hazards
  useEffect(() => {
    const checkHazards = () => {
      currentBiome.hazards.forEach(hazard => {
        if (Math.random() < hazard.frequency / 24) {
          // Convert daily frequency to hourly
          triggerHazard(hazard);
        }
      });
    };

    checkHazards();
  }, [hour, day, currentBiome]);

  const triggerHazard = (hazard: BiomeHazard) => {
    const { addStatusMessage, updateResources, resources } = useGameStore.getState();

    addStatusMessage(`Biome Hazard: ${hazard.name} - ${hazard.description}`, 'warning');

    // Apply hazard effects
    if (hazard.effects.powerDrain) {
      updateResources({
        power: Math.max(0, resources.power - hazard.effects.powerDrain),
      });
    }

    if (hazard.effects.visitorEvacuation) {
      updateResources({
        visitors: Math.max(
          0,
          resources.visitors -
            Math.floor((resources.visitors * hazard.effects.visitorEvacuation) / 100)
        ),
      });
    }

    // Additional effects could be implemented here
    console.log(`Biome hazard triggered: ${hazard.name} (${hazard.severity})`);
  };

  const getBiomeEffectDescription = () => {
    const effects = [];

    if (currentBiome.effects.facilityEfficiency !== 1.0) {
      const percent = Math.round((currentBiome.effects.facilityEfficiency - 1) * 100);
      effects.push(`Facility efficiency ${percent > 0 ? '+' : ''}${percent}%`);
    }

    if (currentBiome.effects.containmentDifficulty !== 0) {
      const sign = currentBiome.effects.containmentDifficulty > 0 ? '+' : '';
      effects.push(`Containment difficulty ${sign}${currentBiome.effects.containmentDifficulty}`);
    }

    if (currentBiome.effects.visitorComfort !== 1.0) {
      const percent = Math.round((currentBiome.effects.visitorComfort - 1) * 100);
      effects.push(`Visitor comfort ${percent > 0 ? '+' : ''}${percent}%`);
    }

    if (currentBiome.effects.researchSpeed !== 1.0) {
      const percent = Math.round((currentBiome.effects.researchSpeed - 1) * 100);
      effects.push(`Research speed ${percent > 0 ? '+' : ''}${percent}%`);
    }

    return effects;
  };
  void getBiomeEffectDescription;

  return (
    <div className="relative">
      {/* Biome Information Display - Moved to header */}
      {/* <div className="fixed top-20 right-4 z-50 bg-slate-900/90 border border-slate-600 rounded-lg p-3 text-sm max-w-sm">
        <div className="text-green-400 font-semibold mb-1 flex items-center gap-2">
          🌍 {currentBiome.name}
        </div>
        <div className="text-slate-300 text-xs mb-2">
          {currentBiome.description}
        </div>

        <div className="space-y-1 text-xs">
          <div className="text-slate-400">Environment:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>🌡️ {currentBiome.environment.temperature}</span>
            <span>🌫️ {currentBiome.environment.atmosphere}</span>
            <span>⚖️ {currentBiome.environment.gravity}G</span>
            <span>☢️ {currentBiome.environment.radiation}</span>
          </div>

          {getBiomeEffectDescription().length > 0 && (
            <div className="border-t border-slate-600 pt-1 mt-1">
              <div className="text-slate-400 mb-1">Effects:</div>
              {getBiomeEffectDescription().map((effect, index) => (
                <div key={index} className="text-yellow-400 text-xs">• {effect}</div>
              ))}
            </div>
          )}

          {currentBiome.nativeSpecies.length > 0 && (
            <div className="border-t border-slate-600 pt-1 mt-1">
              <div className="text-slate-400 mb-1">Native Species:</div>
              <div className="text-green-400 text-xs">
                {currentBiome.nativeSpecies.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div> */}

      {/* Biome visual overlays disabled to keep scene brightness stable */}
      <div>{children}</div>
    </div>
  );
}

