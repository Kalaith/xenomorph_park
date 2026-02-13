import { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export interface HistoricalScenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  year: string;
  location: string;
  difficulty: "Story" | "Challenging" | "Nightmare";
  duration: string; // Estimated playtime
  objectives: HistoricalObjective[];
  initialSetup: {
    mode: "building" | "horror";
    resources: {
      credits: number;
      power: number;
      research: number;
      visitors: number;
    };
    predefinedFacilities?: Array<{
      name: string;
      position: { row: number; col: number };
    }>;
    predefinedXenomorphs?: Array<{
      species: string;
      position: { row: number; col: number };
    }>;
  };
  storyElements: {
    briefing: string;
    midGameEvent?: string;
    conclusion: string;
  };
  historicalAccuracy: string;
  rewards: {
    credits?: number;
    research?: number;
    unlockedContent?: string[];
    achievements?: string[];
  };
}

export interface HistoricalObjective {
  id: string;
  description: string;
  type:
    | "survival"
    | "discovery"
    | "containment"
    | "evacuation"
    | "investigation";
  target?: number | string;
  timeLimit?: number; // in game hours
  completed: boolean;
  required: boolean;
  storyContext: string;
}

const historicalScenarios: HistoricalScenario[] = [
  {
    id: "nostromo_encounter",
    name: "The Nostromo Incident",
    subtitle: "First Contact",
    description:
      "Experience the horror that started it all. The commercial towing vessel Nostromo has encountered something unprecedented.",
    year: "2122",
    location: "USCSS Nostromo, Deep Space",
    difficulty: "Story",
    duration: "45-60 minutes",
    objectives: [
      {
        id: "investigate_signal",
        description: "Investigate the mysterious signal on LV-426",
        type: "investigation",
        completed: false,
        required: true,
        storyContext:
          "Company Special Order 937 requires investigation of any signal of intelligent origin",
      },
      {
        id: "first_contact",
        description: "Discover the alien lifeform",
        type: "discovery",
        completed: false,
        required: true,
        storyContext:
          "The derelict ship contains something beyond human understanding",
      },
      {
        id: "contain_specimen",
        description: "Attempt to contain the organism",
        type: "containment",
        completed: false,
        required: false,
        storyContext:
          "Science Officer Ash has strict orders regarding the creature",
      },
      {
        id: "survive_hunt",
        description: "Survive the creature's hunt",
        type: "survival",
        target: 3,
        timeLimit: 72,
        completed: false,
        required: true,
        storyContext:
          "The perfect organism adapts and hunts with lethal efficiency",
      },
      {
        id: "escape_nostromo",
        description: "Reach the escape shuttle",
        type: "evacuation",
        completed: false,
        required: true,
        storyContext: "The Nostromo's self-destruct has been activated",
      },
    ],
    initialSetup: {
      mode: "horror",
      resources: { credits: 0, power: 5, research: 0, visitors: 0 },
      predefinedFacilities: [
        { name: "Life Support Core", position: { row: 5, col: 5 } },
        { name: "Emergency Systems", position: { row: 5, col: 7 } },
      ],
      predefinedXenomorphs: [
        { species: "Drone", position: { row: 8, col: 6 } },
      ],
    },
    storyElements: {
      briefing:
        "The USCSS Nostromo, a commercial towing vessel, has been awakened from hypersleep by MOTHER to investigate a signal of unknown origin. What the crew discovers will change humanity's understanding of life in the universe forever.",
      midGameEvent:
        "The facehugger has successfully implanted its embryo. The chestburster has emerged and grown into a fully mature xenomorph. It now hunts the remaining crew through the ship's corridors.",
      conclusion:
        "One way or another, this nightmare ends here. The Nostromo's fate is sealed, but perhaps someone will survive to warn others of the terror that lurks in the darkness between the stars.",
    },
    historicalAccuracy:
      'Recreates the events of the 1979 film "Alien" directed by Ridley Scott, following the crew\'s first encounter with the xenomorph species.',
    rewards: {
      research: 500,
      unlockedContent: ["Nostromo Archive Data", "Early Xenomorph Research"],
      achievements: ["First Contact", "Sole Survivor"],
    },
  },

  {
    id: "hadleys_hope_colony",
    name: "The Fall of Hadley's Hope",
    subtitle: "Colony Lost",
    description:
      "Manage the terraforming colony of Hadley's Hope as it faces an overwhelming xenomorph infestation.",
    year: "2179",
    location: "Hadley's Hope, LV-426 (Acheron)",
    difficulty: "Challenging",
    duration: "90-120 minutes",
    objectives: [
      {
        id: "establish_colony",
        description: "Build a functioning terraforming colony",
        type: "containment",
        target: 15,
        completed: false,
        required: true,
        storyContext:
          "Hadley's Hope was humanity's first successful terraforming operation",
      },
      {
        id: "discover_derelict",
        description: "Investigate the alien derelict ship",
        type: "investigation",
        completed: false,
        required: true,
        storyContext:
          "The Jorden family has discovered something in the restricted zone",
      },
      {
        id: "first_infestation",
        description: "Contain the initial xenomorph outbreak",
        type: "containment",
        target: 5,
        timeLimit: 48,
        completed: false,
        required: false,
        storyContext:
          "The facehugger attack on the Jorden family was just the beginning",
      },
      {
        id: "colony_defense",
        description: "Defend the colony from the hive",
        type: "survival",
        target: 10,
        timeLimit: 120,
        completed: false,
        required: true,
        storyContext:
          "The xenomorphs have built a massive hive beneath the atmospheric processor",
      },
      {
        id: "final_evacuation",
        description: "Evacuate all survivors",
        type: "evacuation",
        completed: false,
        required: true,
        storyContext:
          "The atmospheric processor is going critical - nuclear explosion imminent",
      },
    ],
    initialSetup: {
      mode: "building",
      resources: { credits: 50000, power: 100, research: 1000, visitors: 158 },
      predefinedFacilities: [
        { name: "Atmospheric Processor", position: { row: 10, col: 10 } },
        { name: "Visitor Center", position: { row: 5, col: 5 } },
        { name: "Medical Bay", position: { row: 5, col: 7 } },
        { name: "Communications Array", position: { row: 3, col: 5 } },
      ],
    },
    storyElements: {
      briefing:
        "Hadley's Hope represents humanity's triumph over hostile worlds. The terraforming operation has been successful for decades, supporting 158 colonists. But when contact is lost, something terrible has awakened.",
      midGameEvent:
        "The infestation has spread throughout the colony. The atmospheric processor has been compromised, and its nuclear core is becoming unstable. You have limited time before a catastrophic explosion.",
      conclusion:
        "Hadley's Hope is lost, but the data gathered here will be crucial for humanity's survival. The xenomorph threat is now fully understood - and it is far worse than anyone imagined.",
    },
    historicalAccuracy:
      'Based on the events of "Aliens" (1986), depicting the fall of the LV-426 colony and the discovery of the xenomorph hive.',
    rewards: {
      credits: 25000,
      research: 2000,
      unlockedContent: [
        "Colonial Marine Arsenal",
        "Atmospheric Processor Technology",
        "Hive Architecture Data",
      ],
      achievements: [
        "Colony Administrator",
        "Xenomorph Researcher",
        "Nuclear Survivor",
      ],
    },
  },

  {
    id: "fiorina_prison",
    name: "Fiorina 161 Outbreak",
    subtitle: "No Weapons, No Technology, No Hope",
    description:
      "Survive an infestation on a maximum-security prison planet with minimal resources and no weapons.",
    year: "2179",
    location: "Fiorina 161 Correctional Facility",
    difficulty: "Nightmare",
    duration: "60-90 minutes",
    objectives: [
      {
        id: "crash_survival",
        description: "Survive the emergency landing",
        type: "survival",
        completed: false,
        required: true,
        storyContext:
          "The EEV escape pod has crash-landed on the prison planet",
      },
      {
        id: "locate_survivors",
        description: "Find other crash survivors",
        type: "investigation",
        target: 2,
        completed: false,
        required: true,
        storyContext: "Multiple stasis tubes were aboard the escape pod",
      },
      {
        id: "contain_infection",
        description: "Prevent the facehugger from spreading",
        type: "containment",
        timeLimit: 24,
        completed: false,
        required: false,
        storyContext:
          "A facehugger was aboard the escape pod - someone has been infected",
      },
      {
        id: "improvised_weapons",
        description: "Create makeshift weapons and traps",
        type: "survival",
        target: 5,
        completed: false,
        required: true,
        storyContext:
          "The prison has no weapons - everything must be improvised from industrial equipment",
      },
      {
        id: "alien_hunt",
        description: "Hunt the xenomorph through the facility",
        type: "survival",
        target: 1,
        timeLimit: 72,
        completed: false,
        required: true,
        storyContext:
          "The dragon-born xenomorph is hunting through the prison's industrial maze",
      },
      {
        id: "ultimate_sacrifice",
        description: "Stop the Company from acquiring the specimen",
        type: "survival",
        completed: false,
        required: true,
        storyContext:
          "Weyland-Yutani will stop at nothing to obtain a live xenomorph",
      },
    ],
    initialSetup: {
      mode: "horror",
      resources: { credits: 0, power: 3, research: 0, visitors: 0 },
      predefinedFacilities: [
        { name: "Medical Bay", position: { row: 4, col: 4 } },
        { name: "Life Support Core", position: { row: 6, col: 6 } },
      ],
      predefinedXenomorphs: [
        { species: "Runner", position: { row: 10, col: 8 } },
      ],
    },
    storyElements: {
      briefing:
        "Fiorina 161 is a maximum-security prison for the worst criminals in known space. The facility has no weapons, no technology, and no escape. When death arrives from the stars, there is nowhere to run.",
      midGameEvent:
        "The alien has claimed multiple victims and grown to full size. The inmates must work together with their former enemies to survive. Industrial equipment becomes weapons, and the foundry becomes a battlefield.",
      conclusion:
        "Some sacrifices transcend personal survival. The xenomorph threat ends here, but the cost is everything. The Company's plans are thwarted, but at the ultimate price.",
    },
    historicalAccuracy:
      'Recreates the events of "Alien³" (1992), focusing on survival horror in a resource-scarce environment.',
    rewards: {
      research: 1500,
      unlockedContent: [
        "Prison Industrial Equipment",
        "Improvised Weapons Data",
        "Runner Xenomorph Analysis",
      ],
      achievements: [
        "Prison Survivor",
        "Improvised Arsenal",
        "Ultimate Sacrifice",
      ],
    },
  },

  {
    id: "usm_auriga",
    name: "The Auriga Incident",
    subtitle: "Resurrection",
    description:
      "Experience the horror of military xenomorph breeding experiments aboard a deep space research vessel.",
    year: "2381",
    location: "USM Auriga, Deep Space",
    difficulty: "Challenging",
    duration: "75-90 minutes",
    objectives: [
      {
        id: "establish_research",
        description: "Set up military xenomorph research program",
        type: "containment",
        target: 8,
        completed: false,
        required: true,
        storyContext:
          "The United Systems Military is conducting classified xenomorph research",
      },
      {
        id: "clone_experiments",
        description: "Conduct genetic cloning experiments",
        type: "discovery",
        target: 5,
        completed: false,
        required: true,
        storyContext:
          "Ripley's DNA contains the key to controlling the xenomorph species",
      },
      {
        id: "hybrid_creation",
        description: "Witness the creation of the hybrid",
        type: "discovery",
        completed: false,
        required: true,
        storyContext: "The queen has given birth to something unprecedented",
      },
      {
        id: "containment_failure",
        description: "Survive the massive containment breach",
        type: "survival",
        target: 15,
        timeLimit: 48,
        completed: false,
        required: true,
        storyContext:
          "The xenomorphs have learned to use acid to escape their cells",
      },
      {
        id: "ship_crash",
        description: "Reach the escape pods before Earth impact",
        type: "evacuation",
        timeLimit: 24,
        completed: false,
        required: true,
        storyContext: "The Auriga is on a collision course with Earth",
      },
    ],
    initialSetup: {
      mode: "building",
      resources: { credits: 75000, power: 120, research: 5000, visitors: 0 },
      predefinedFacilities: [
        { name: "Corporate Laboratory", position: { row: 6, col: 6 } },
        { name: "Genetic Sequencer", position: { row: 6, col: 8 } },
        { name: "Containment Unit", position: { row: 8, col: 6 } },
        { name: "Medical Bay", position: { row: 4, col: 6 } },
      ],
      predefinedXenomorphs: [
        { species: "Queen", position: { row: 8, col: 8 } },
        { species: "Warrior", position: { row: 9, col: 7 } },
        { species: "Warrior", position: { row: 7, col: 9 } },
      ],
    },
    storyElements: {
      briefing:
        "Two hundred years after Ripley's sacrifice, humanity has not learned its lesson. The United Systems Military believes they can control and weaponize the perfect organism. They are wrong.",
      midGameEvent:
        "The xenomorphs have demonstrated intelligence far beyond previous observations. They used their acid blood to burn through containment, and the queen has given birth to a human-xenomorph hybrid.",
      conclusion:
        "The Auriga experiment ends in catastrophe, but valuable data has been obtained. The hybrid represents a new evolutionary path - one that threatens everything we understand about the species.",
    },
    historicalAccuracy:
      'Based on "Alien: Resurrection" (1997), exploring themes of genetic manipulation and military xenomorph research.',
    rewards: {
      credits: 50000,
      research: 7500,
      unlockedContent: [
        "Military Research Protocols",
        "Cloning Technology",
        "Hybrid Xenomorph Data",
      ],
      achievements: [
        "Military Researcher",
        "Genetic Engineer",
        "Earth Defender",
      ],
    },
  },

  {
    id: "weyland_origins",
    name: "Prometheus Expedition",
    subtitle: "Engineers",
    description:
      "Discover the origins of humanity and encounter the creators of the xenomorph species.",
    year: "2093",
    location: "LV-223, Zeta Reticuli System",
    difficulty: "Story",
    duration: "60-75 minutes",
    objectives: [
      {
        id: "archaeological_discovery",
        description: "Analyze ancient cave paintings and star maps",
        type: "investigation",
        target: 5,
        completed: false,
        required: true,
        storyContext: "Ancient civilizations left messages pointing to LV-223",
      },
      {
        id: "engineer_facility",
        description: "Explore the Engineer installation",
        type: "investigation",
        completed: false,
        required: true,
        storyContext:
          "The Engineers left behind advanced technology and biological weapons",
      },
      {
        id: "black_goo_analysis",
        description: "Study the mysterious black substance",
        type: "discovery",
        target: 3,
        completed: false,
        required: true,
        storyContext:
          "The Engineers created a bioweapon of unimaginable potential",
      },
      {
        id: "meet_engineer",
        description: "Make contact with the last Engineer",
        type: "discovery",
        completed: false,
        required: true,
        storyContext:
          "One Engineer remains in stasis, waiting for over 2000 years",
      },
      {
        id: "escape_deacon",
        description: "Survive the emergence of the Deacon",
        type: "survival",
        completed: false,
        required: true,
        storyContext: "The trilobite creature has infected the Engineer",
      },
    ],
    initialSetup: {
      mode: "building",
      resources: { credits: 100000, power: 150, research: 10000, visitors: 0 },
      predefinedFacilities: [
        { name: "Research Lab", position: { row: 5, col: 5 } },
        { name: "Medical Bay", position: { row: 5, col: 7 } },
        { name: "Communications Array", position: { row: 3, col: 6 } },
      ],
    },
    storyElements: {
      briefing:
        "The Prometheus expedition represents humanity's first journey to meet our creators. Armed with ancient star maps and cutting-edge technology, we seek answers to the ultimate questions: Who are we? Where do we come from?",
      midGameEvent:
        "The Engineers are not the benevolent creators we hoped to find. They planned to destroy humanity with a biological weapon so terrible it defies comprehension. The black goo creates horrors beyond imagination.",
      conclusion:
        "We came seeking gods and found devils. The Engineers created us, but they also created our destruction. The xenomorph is not just an alien species - it is a weapon designed to erase all life.",
    },
    historicalAccuracy:
      'Prequel events from "Prometheus" (2012), exploring the origins of humanity and the xenomorph species.',
    rewards: {
      credits: 100000,
      research: 15000,
      unlockedContent: [
        "Engineer Technology",
        "Black Goo Research",
        "Ancient Star Maps",
        "Proto-Xenomorph Data",
      ],
      achievements: [
        "Archaeological Discovery",
        "First Contact with Engineers",
        "Origin Seeker",
      ],
    },
  },
];

interface HistoricalScenariosProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoricalScenarios({
  isOpen,
  onClose,
}: HistoricalScenariosProps) {
  const [selectedScenario, setSelectedScenario] =
    useState<HistoricalScenario | null>(null);
  const [completedScenarios] = useState<string[]>(() => {
    const saved = localStorage.getItem("xenomorph-park-historical-progress");
    return saved ? JSON.parse(saved) : [];
  });

  const getDifficultyColor = (difficulty: HistoricalScenario["difficulty"]) => {
    switch (difficulty) {
      case "Story":
        return "text-blue-400";
      case "Challenging":
        return "text-yellow-400";
      case "Nightmare":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getDifficultyIcon = (difficulty: HistoricalScenario["difficulty"]) => {
    switch (difficulty) {
      case "Story":
        return "📖";
      case "Challenging":
        return "⚔️";
      case "Nightmare":
        return "💀";
      default:
        return "❓";
    }
  };

  const startScenario = (scenario: HistoricalScenario) => {
    // Initialize game state with scenario parameters
    const { reset, updateResources, setMode } = useGameStore.getState();

    // Reset the game
    reset();

    // Apply scenario starting resources and mode
    updateResources(scenario.initialSetup.resources);
    setMode(scenario.initialSetup.mode);

    // Store current scenario in localStorage for objective tracking
    localStorage.setItem(
      "current-historical-scenario",
      JSON.stringify(scenario),
    );

    onClose();
  };

  const ScenarioCard = ({ scenario }: { scenario: HistoricalScenario }) => {
    const isCompleted = completedScenarios.includes(scenario.id);

    return (
      <div
        className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${
            isCompleted
              ? "border-green-500 bg-green-500/10 hover:bg-green-500/20"
              : "border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-green-400"
          }
          ${selectedScenario?.id === scenario.id ? "ring-2 ring-green-400" : ""}
        `}
        onClick={() => setSelectedScenario(scenario)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3
              className={`font-semibold text-lg ${isCompleted ? "text-green-400" : "text-slate-200"}`}
            >
              {scenario.name}
              {isCompleted && " ✅"}
            </h3>
            <div className="text-sm text-slate-400">{scenario.subtitle}</div>
            <div className="flex items-center gap-4 text-sm mt-1">
              <span className={getDifficultyColor(scenario.difficulty)}>
                {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty}
              </span>
              <span className="text-slate-500">🕐 {scenario.duration}</span>
              <span className="text-blue-400">📅 {scenario.year}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-3 leading-relaxed">
          {scenario.description}
        </p>

        <div className="text-xs text-slate-400 mb-2">
          <strong>Location:</strong> {scenario.location}
        </div>

        <div className="space-y-1 text-xs">
          <div className="text-slate-400">
            <strong>Objectives:</strong>{" "}
            {scenario.objectives.filter((obj) => obj.required).length} required,{" "}
            {scenario.objectives.filter((obj) => !obj.required).length} optional
          </div>

          <div className="text-green-400">
            <strong>Rewards:</strong>
            {scenario.rewards.credits && ` ${scenario.rewards.credits} 💰`}
            {scenario.rewards.research && ` ${scenario.rewards.research} 🔬`}
            {scenario.rewards.unlockedContent &&
              ` +${scenario.rewards.unlockedContent.length} archives`}
            {scenario.rewards.achievements &&
              ` +${scenario.rewards.achievements.length} achievements`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historical Scenarios">
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Progress Overview */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
          <h4 className="text-green-400 font-semibold mb-2">
            Historical Archive Progress
          </h4>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-400">Completed:</span>
              <span className="text-green-400 ml-2">
                {completedScenarios.length}/{historicalScenarios.length}
              </span>
            </div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedScenarios.length / historicalScenarios.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Scenario List */}
        <div className="grid grid-cols-1 gap-4">
          {historicalScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-green-400">
            <h4 className="text-green-400 font-semibold mb-3">
              Historical Briefing: {selectedScenario.name}
            </h4>

            <div className="space-y-3 text-sm">
              <div className="text-slate-300 leading-relaxed">
                {selectedScenario.storyElements.briefing}
              </div>

              <div>
                <strong className="text-slate-300">Mission Parameters:</strong>
                <div className="mt-1 space-y-1">
                  {selectedScenario.objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={
                          objective.required ? "text-red-400" : "text-blue-400"
                        }
                      >
                        {objective.required ? "🔴" : "🔵"}
                      </span>
                      <span className="text-slate-300">
                        {objective.description}
                      </span>
                      {objective.timeLimit && (
                        <span className="text-yellow-400">
                          ({objective.timeLimit}h limit)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                <strong>Historical Context:</strong>{" "}
                {selectedScenario.historicalAccuracy}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {selectedScenario && (
            <Button
              variant="primary"
              onClick={() => startScenario(selectedScenario)}
              className="flex-1"
            >
              📜 Begin Historical Scenario
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close Archive
          </Button>
        </div>
      </div>
    </Modal>
  );
}
