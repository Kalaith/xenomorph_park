import { useGameStore } from "../stores/gameStore";
import type { GameState } from "../types";
import type { CampaignScenario } from "../components/game/CampaignMode";

export interface CampaignEvent {
  id: string;
  name: string;
  description: string;
  storyText: string;
  triggerCondition: EventTrigger;
  choices: EventChoice[];
  oneTime: boolean;
  priority: "low" | "medium" | "high" | "critical";
  scenarioId?: string;
}

export interface EventTrigger {
  type: "time" | "resource" | "facility" | "species" | "random" | "objective";
  condition: Record<string, any>;
  probability?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  description: string;
  consequences: EventConsequence[];
  requirements?: EventRequirement[];
  disabled?: boolean;
}

export interface EventConsequence {
  type: "resource" | "facility" | "species" | "story" | "objective" | "crisis";
  effect: Record<string, any>;
  description: string;
}

export interface EventRequirement {
  type: "resource" | "facility" | "research" | "species";
  condition: Record<string, any>;
}

class CampaignEventManager {
  private static instance: CampaignEventManager;
  private activeEvents: string[] = [];
  private triggeredEvents: string[] = [];
  private eventQueue: CampaignEvent[] = [];
  private lastEventCheck: number = 0;
  private readonly EVENT_CHECK_INTERVAL = 30000; // 30 seconds

  public static getInstance(): CampaignEventManager {
    if (!CampaignEventManager.instance) {
      CampaignEventManager.instance = new CampaignEventManager();
    }
    return CampaignEventManager.instance;
  }

  private getCampaignEvents(): CampaignEvent[] {
    return [
      // Universal Events
      {
        id: "power_shortage",
        name: "Power Grid Malfunction",
        description: "A critical power shortage threatens park operations",
        storyText:
          "Sparks fly from the main power grid as warning lights flash across the control room. The automated systems are struggling to maintain containment fields. Emergency power will only last so long.",
        triggerCondition: {
          type: "facility",
          condition: { minFacilities: 5, powerConsumption: 80 },
          probability: 0.15,
        },
        choices: [
          {
            id: "emergency_power",
            text: "Activate Emergency Generators",
            description: "Use backup power to maintain systems (-2000 credits)",
            consequences: [
              {
                type: "resource",
                effect: { credits: -2000 },
                description: "Emergency power systems engaged",
              },
            ],
            requirements: [{ type: "resource", condition: { credits: 2000 } }],
          },
          {
            id: "shutdown_systems",
            text: "Shutdown Non-Essential Systems",
            description: "Reduce power consumption but risk containment issues",
            consequences: [
              {
                type: "crisis",
                effect: { type: "containment_risk", severity: 0.3 },
                description: "Increased containment instability",
              },
            ],
          },
          {
            id: "reroute_power",
            text: "Reroute Power Systems",
            description: "Technical solution requiring research expertise",
            consequences: [
              {
                type: "resource",
                effect: { research: 500 },
                description: "Gained insights from power management",
              },
            ],
            requirements: [
              {
                type: "research",
                condition: { completed: ["Advanced Power Systems"] },
              },
            ],
          },
        ],
        oneTime: false,
        priority: "high",
      },

      {
        id: "visitor_incident",
        name: "Visitor Safety Concern",
        description:
          "A group of visitors reports concerning behavior from specimens",
        storyText:
          "A family on the observation deck points excitedly at the containment area, but their guide looks concerned. One of the xenomorphs is displaying unusual aggressive posturing toward the viewing window.",
        triggerCondition: {
          type: "resource",
          condition: { visitors: 100 },
          probability: 0.1,
        },
        choices: [
          {
            id: "increase_security",
            text: "Deploy Additional Security",
            description:
              "Station more guards at viewing areas (-500 credits/day)",
            consequences: [
              {
                type: "resource",
                effect: { dailyExpenses: 500, safety: 20 },
                description: "Enhanced security protocols active",
              },
            ],
          },
          {
            id: "transparency_tour",
            text: "Offer Educational Tour",
            description: "Explain xenomorph behavior to reassure visitors",
            consequences: [
              {
                type: "resource",
                effect: { reputation: 10, visitors: 20 },
                description: "Visitors appreciate transparency",
              },
            ],
          },
          {
            id: "implement_barriers",
            text: "Install Reinforced Barriers",
            description:
              "Upgrade viewing areas for better safety (-3000 credits)",
            consequences: [
              {
                type: "resource",
                effect: { credits: -3000, safety: 50 },
                description: "Permanent safety improvements installed",
              },
            ],
            requirements: [{ type: "resource", condition: { credits: 3000 } }],
          },
        ],
        oneTime: false,
        priority: "medium",
      },

      {
        id: "corporate_inspection",
        name: "Corporate Inspection",
        description:
          "Weyland-Yutani executives arrive for an unannounced inspection",
        storyText:
          "A sleek corporate shuttle lands at the facility. Executives in pristine suits emerge, their faces unreadable as they approach with clipboards and scanning devices. This inspection could determine the future of your operation.",
        triggerCondition: {
          type: "time",
          condition: { day: 15 },
          probability: 0.8,
        },
        choices: [
          {
            id: "showcase_specimens",
            text: "Highlight Prize Specimens",
            description: "Show off your most impressive xenomorphs",
            consequences: [
              {
                type: "resource",
                effect: { reputation: 30, funding: 5000 },
                description: "Executives impressed with specimens",
              },
            ],
            requirements: [{ type: "species", condition: { minSpecies: 3 } }],
          },
          {
            id: "demonstrate_safety",
            text: "Emphasize Safety Protocols",
            description: "Focus on your containment and safety measures",
            consequences: [
              {
                type: "resource",
                effect: { safety: 40, funding: 2000 },
                description: "Safety protocols meet corporate standards",
              },
            ],
            requirements: [
              { type: "facility", condition: { hasType: "Security Station" } },
            ],
          },
          {
            id: "financial_presentation",
            text: "Present Financial Success",
            description: "Show profit margins and visitor satisfaction",
            consequences: [
              {
                type: "resource",
                effect: { funding: 10000 },
                description: "Corporate pleased with profitability",
              },
            ],
            requirements: [
              {
                type: "resource",
                condition: { credits: 20000, visitors: 500 },
              },
            ],
          },
        ],
        oneTime: true,
        priority: "high",
      },

      // Scenario-Specific Events
      {
        id: "hadleys_hope_storm",
        name: "Atmospheric Storm Warning",
        description: "Severe weather approaching Hadley's Hope",
        storyText:
          "The weather monitoring station crackles with urgent warnings. A massive atmospheric storm is bearing down on the colony. The winds could reach 200 mph, and the electrical activity might interfere with containment systems.",
        triggerCondition: {
          type: "time",
          condition: { day: 8 },
          probability: 1.0,
        },
        scenarioId: "hadleys_hope",
        choices: [
          {
            id: "storm_shelter",
            text: "Prepare Storm Shelters",
            description: "Secure all personnel and equipment",
            consequences: [
              {
                type: "resource",
                effect: { credits: -1000, safety: 30 },
                description: "Colony secured against storm",
              },
            ],
          },
          {
            id: "maintain_operations",
            text: "Maintain Critical Operations",
            description: "Keep essential systems running during storm",
            consequences: [
              {
                type: "crisis",
                effect: { type: "equipment_damage", severity: 0.4 },
                description: "Storm damages some equipment",
              },
              {
                type: "resource",
                effect: { research: 300 },
                description: "Gathered valuable storm data",
              },
            ],
          },
        ],
        oneTime: true,
        priority: "critical",
      },

      {
        id: "alien_homeworld_migration",
        name: "Native Xenomorph Migration",
        description: "Wild xenomorphs are migrating through the area",
        storyText:
          "Seismic sensors detect movement in the deep caves. A massive migration of native xenomorphs is passing through the area. They seem curious about your facility but maintain their distance... for now.",
        triggerCondition: {
          type: "time",
          condition: { day: 12 },
          probability: 1.0,
        },
        scenarioId: "alien_homeworld",
        choices: [
          {
            id: "peaceful_contact",
            text: "Attempt Peaceful Contact",
            description: "Try to communicate with the native species",
            consequences: [
              {
                type: "species",
                effect: { unlock: "Native Xenomorph Variant" },
                description: "Peaceful contact successful",
              },
              {
                type: "resource",
                effect: { research: 1000 },
                description: "Learned about native behavior",
              },
            ],
          },
          {
            id: "defensive_position",
            text: "Take Defensive Position",
            description: "Secure the facility and wait for them to pass",
            consequences: [
              {
                type: "resource",
                effect: { safety: 20 },
                description: "No incidents during migration",
              },
            ],
          },
          {
            id: "capture_attempt",
            text: "Attempt to Capture Specimens",
            description: "Try to capture some natives for study",
            consequences: [
              {
                type: "crisis",
                effect: { type: "aggressive_response", severity: 0.6 },
                description: "Native xenomorphs become hostile",
              },
              {
                type: "species",
                effect: { capture: "Hostile Native Xenomorph" },
                description: "Captured a specimen but angered the hive",
              },
            ],
          },
        ],
        oneTime: true,
        priority: "critical",
      },

      {
        id: "research_breakthrough",
        name: "Scientific Breakthrough",
        description: "Your research team makes an unexpected discovery",
        storyText:
          'Dr. Chen bursts into the control room, her eyes bright with excitement. "You need to see this," she says, pulling up holographic displays. "We\'ve discovered something in the xenomorph genetic structure that could change everything."',
        triggerCondition: {
          type: "resource",
          condition: { research: 2000 },
          probability: 0.2,
        },
        choices: [
          {
            id: "publish_findings",
            text: "Publish Research Findings",
            description:
              "Share discovery with scientific community (+reputation)",
            consequences: [
              {
                type: "resource",
                effect: { reputation: 50, funding: 3000 },
                description: "Scientific community recognizes your work",
              },
            ],
          },
          {
            id: "classified_research",
            text: "Keep Research Classified",
            description: "Maintain secrecy for competitive advantage",
            consequences: [
              {
                type: "resource",
                effect: { research: 1000 },
                description: "Continued private research yields more insights",
              },
            ],
          },
          {
            id: "corporate_partnership",
            text: "Partner with Corporation",
            description: "Share findings with Weyland-Yutani for funding",
            consequences: [
              {
                type: "resource",
                effect: { funding: 10000 },
                description: "Major corporate funding secured",
              },
              {
                type: "story",
                effect: { flag: "corporate_partnership" },
                description: "Corporate oversight increases",
              },
            ],
          },
        ],
        oneTime: false,
        priority: "medium",
      },
    ];
  }

  public checkForEvents(gameState: GameState): CampaignEvent | null {
    const now = Date.now();
    if (now - this.lastEventCheck < this.EVENT_CHECK_INTERVAL) {
      return null;
    }

    this.lastEventCheck = now;
    const events = this.getCampaignEvents();
    const currentScenario = this.getCurrentScenario();

    // Filter events based on scenario and conditions
    const availableEvents = events.filter((event) => {
      // Check if event is one-time and already triggered
      if (event.oneTime && this.triggeredEvents.includes(event.id)) {
        return false;
      }

      // Check scenario specificity
      if (
        event.scenarioId &&
        (!currentScenario || currentScenario.id !== event.scenarioId)
      ) {
        return false;
      }

      // Check trigger conditions
      return this.checkTriggerCondition(event.triggerCondition, gameState);
    });

    if (availableEvents.length === 0) return null;

    // Sort by priority and select one
    availableEvents.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // For events with probability, check random chance
    for (const event of availableEvents) {
      if (event.triggerCondition.probability) {
        if (Math.random() < event.triggerCondition.probability) {
          return event;
        }
      } else {
        return event;
      }
    }

    return null;
  }

  private checkTriggerCondition(
    trigger: EventTrigger,
    gameState: GameState,
  ): boolean {
    switch (trigger.type) {
      case "time":
        return gameState.day >= (trigger.condition as { day: number }).day;

      case "resource":
        return Object.entries(
          trigger.condition as Record<string, number>,
        ).every(([resource, value]) => {
          const current =
            (gameState.resources as unknown as Record<string, number>)[
              resource
            ] ?? 0;
          return current >= value;
        });

      case "facility":
        if ((trigger.condition as { minFacilities?: number }).minFacilities) {
          return (
            gameState.facilities.length >=
            (trigger.condition as { minFacilities: number }).minFacilities
          );
        }
        if ((trigger.condition as { hasType?: string }).hasType) {
          return gameState.facilities.some(
            (f) =>
              f.name === (trigger.condition as { hasType: string }).hasType,
          );
        }
        return false;

      case "species":
        if ((trigger.condition as { minSpecies?: number }).minSpecies) {
          const uniqueSpecies = new Set(
            gameState.xenomorphs.map((x) => x.species.name),
          );
          return (
            uniqueSpecies.size >=
            (trigger.condition as { minSpecies: number }).minSpecies
          );
        }
        return false;

      case "random":
        return Math.random() < (trigger.probability || 0.1);

      case "objective": {
        const progress = localStorage.getItem("campaign-objective-progress");
        if (!progress) return false;
        const completedObjectives = JSON.parse(progress) as unknown;
        if (!Array.isArray(completedObjectives)) return false;
        return completedObjectives.includes(
          (trigger.condition as { objectiveId: string }).objectiveId,
        );
      }

      default:
        return false;
    }
  }

  public triggerEvent(eventId: string): void {
    if (!this.triggeredEvents.includes(eventId)) {
      this.triggeredEvents.push(eventId);

      // Save triggered events
      localStorage.setItem(
        "campaign-triggered-events",
        JSON.stringify(this.triggeredEvents),
      );
    }
  }

  public applyEventChoice(event: CampaignEvent, choice: EventChoice): void {
    const gameStore = useGameStore.getState();

    choice.consequences.forEach((consequence) => {
      switch (consequence.type) {
        case "resource": {
          const resourceUpdates: Partial<GameState["resources"]> = {};
          Object.entries(consequence.effect as Record<string, number>).forEach(
            ([resource, value]) => {
              const currentValue =
                (gameStore.resources as unknown as Record<string, number>)[
                  resource
                ] ?? 0;
              (resourceUpdates as Record<string, number>)[resource] =
                currentValue + value;
            },
          );
          gameStore.updateResources(resourceUpdates);
          break;
        }

        case "species":
          if ((consequence.effect as { unlock?: string }).unlock) {
            const research = gameStore.research;
            const unlockId = (consequence.effect as { unlock: string }).unlock;
            if (!research.completed.includes(unlockId)) {
              research.completed.push(unlockId);
            }
          }
          break;

        case "story": {
          // Store story flags for future reference
          const storyFlags = JSON.parse(
            localStorage.getItem("campaign-story-flags") || "{}",
          );
          if ((consequence.effect as { flag?: string }).flag) {
            storyFlags[(consequence.effect as { flag: string }).flag] = true;
            localStorage.setItem(
              "campaign-story-flags",
              JSON.stringify(storyFlags),
            );
          }
          break;
        }

        case "crisis":
          // Trigger a crisis event
          gameStore.addStatusMessage(
            `⚠️ Crisis Event: ${consequence.description}`,
            "error",
          );
          break;
      }
    });

    // Mark event as triggered
    this.triggerEvent(event.id);

    // Add status message about the event outcome
    gameStore.addStatusMessage(
      `📖 ${event.name}: ${choice.description}`,
      "info",
    );
  }

  public isChoiceAvailable(choice: EventChoice, gameState: GameState): boolean {
    if (!choice.requirements) return true;

    return choice.requirements.every((req) => {
      switch (req.type) {
        case "resource":
          return Object.entries(req.condition as Record<string, number>).every(
            ([resource, value]) => {
              const current =
                (gameState.resources as unknown as Record<string, number>)[
                  resource
                ] ?? 0;
              return current >= value;
            },
          );

        case "facility":
          if ((req.condition as { hasType?: string }).hasType) {
            return gameState.facilities.some(
              (f) => f.name === (req.condition as { hasType: string }).hasType,
            );
          }
          return false;

        case "research":
          if ((req.condition as { completed?: string[] }).completed) {
            return (req.condition as { completed: string[] }).completed.every(
              (research: string) =>
                gameState.research.completed.includes(research),
            );
          }
          return false;

        case "species":
          if ((req.condition as { minSpecies?: number }).minSpecies) {
            const uniqueSpecies = new Set(
              gameState.xenomorphs.map((x) => x.species.name),
            );
            return (
              uniqueSpecies.size >=
              (req.condition as { minSpecies: number }).minSpecies
            );
          }
          return false;

        default:
          return false;
      }
    });
  }

  private getCurrentScenario(): CampaignScenario | null {
    try {
      const scenarioData = localStorage.getItem("current-campaign-scenario");
      return scenarioData
        ? (JSON.parse(scenarioData) as CampaignScenario)
        : null;
    } catch {
      return null;
    }
  }

  public getTriggeredEvents(): string[] {
    try {
      const events = localStorage.getItem("campaign-triggered-events");
      return events ? JSON.parse(events) : [];
    } catch {
      return [];
    }
  }

  public clearEventHistory(): void {
    this.triggeredEvents = [];
    this.activeEvents = [];
    localStorage.removeItem("campaign-triggered-events");
    localStorage.removeItem("campaign-story-flags");
  }

  public getStoryFlags(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem("campaign-story-flags") || "{}");
    } catch {
      return {};
    }
  }
}

export const campaignEventManager = CampaignEventManager.getInstance();
