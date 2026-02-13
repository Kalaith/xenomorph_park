import { useState, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import { CampaignScenario, CampaignObjective } from "./CampaignMode";

interface ObjectiveTrackerProps {
  isActive: boolean;
}

export function CampaignObjectiveTracker({ isActive }: ObjectiveTrackerProps) {
  const [currentScenario, setCurrentScenario] =
    useState<CampaignScenario | null>(null);
  const [objectives, setObjectives] = useState<CampaignObjective[]>([]);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [scenarioStartTime, setScenarioStartTime] = useState<number>(0);

  const { resources, facilities, xenomorphs, day, research, addStatusMessage } =
    useGameStore();

  // Load current scenario
  useEffect(() => {
    if (!isActive) return;

    const scenarioData = localStorage.getItem("current-campaign-scenario");
    if (scenarioData) {
      const scenario = JSON.parse(scenarioData);
      setCurrentScenario(scenario);
      setObjectives(scenario.objectives || []);

      const startTime = localStorage.getItem("campaign-start-time");
      setScenarioStartTime(startTime ? parseInt(startTime) : Date.now());

      if (!startTime) {
        localStorage.setItem("campaign-start-time", Date.now().toString());
      }
    }
  }, [isActive]);

  // Check objective completion
  useEffect(() => {
    if (!currentScenario || !isActive) return;

    const newCompletedObjectives: string[] = [];

    objectives.forEach((objective) => {
      if (completedObjectives.includes(objective.id)) {
        newCompletedObjectives.push(objective.id);
        return;
      }

      let isCompleted = false;

      switch (objective.type) {
        case "facility":
          if (typeof objective.target === "string") {
            // Specific facility type
            isCompleted = facilities.some((f) => f.name === objective.target);
          } else if (typeof objective.target === "number") {
            // Number of facilities
            isCompleted = facilities.length >= objective.target;
          }
          break;

        case "species":
          if (typeof objective.target === "string") {
            // Specific species
            isCompleted = xenomorphs.some(
              (x) => x.species.name === objective.target,
            );
          } else if (typeof objective.target === "number") {
            // Number of different species
            const uniqueSpecies = new Set(
              xenomorphs.map((x) => x.species.name),
            );
            isCompleted = uniqueSpecies.size >= objective.target;
          }
          break;

        case "revenue":
          if (typeof objective.target === "number") {
            // Check total credits or daily revenue
            isCompleted =
              resources.credits >= objective.target ||
              resources.dailyRevenue >= objective.target;
          }
          break;

        case "visitors":
          if (typeof objective.target === "number") {
            isCompleted = resources.visitors >= objective.target;
          }
          break;

        case "research":
          if (typeof objective.target === "string") {
            // Specific research completed
            isCompleted = research.completed.includes(objective.target);
          } else if (typeof objective.target === "number") {
            // Research points accumulated
            isCompleted = research.points >= objective.target;
          }
          break;

        case "time":
          if (typeof objective.target === "number") {
            // Days survived
            isCompleted = day >= objective.target;
          }
          break;

        case "survival":
          // This would be tracked by specific game events
          // For now, we'll use a simple check
          if (typeof objective.target === "number") {
            if (objective.target === 0) {
              // No incidents (this would need to be tracked separately)
              isCompleted = true; // Placeholder
            } else {
              // Survive X events (placeholder)
              isCompleted = day >= objective.target;
            }
          }
          break;
      }

      if (isCompleted && !completedObjectives.includes(objective.id)) {
        newCompletedObjectives.push(objective.id);

        // Trigger completion notification
        addStatusMessage(
          `✅ Objective Complete: ${objective.description}`,
          objective.required ? "success" : "info",
        );

        // Check if all required objectives are complete
        const allRequired = objectives.filter((obj) => obj.required);
        const completedRequired = allRequired.filter(
          (obj) =>
            newCompletedObjectives.includes(obj.id) ||
            completedObjectives.includes(obj.id),
        );

        if (completedRequired.length === allRequired.length) {
          // Scenario complete!
          completeScenario();
        }
      }
    });

    if (newCompletedObjectives.length > completedObjectives.length) {
      setCompletedObjectives(newCompletedObjectives);

      // Save progress
      localStorage.setItem(
        "campaign-objective-progress",
        JSON.stringify(newCompletedObjectives),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resources,
    facilities,
    xenomorphs,
    day,
    research,
    objectives,
    completedObjectives,
    currentScenario,
    isActive,
  ]);

  const completeScenario = () => {
    if (!currentScenario) return;

    // Mark scenario as completed
    const completedScenarios = JSON.parse(
      localStorage.getItem("xenomorph-park-campaign-progress") || "[]",
    );
    if (!completedScenarios.includes(currentScenario.id)) {
      completedScenarios.push(currentScenario.id);
      localStorage.setItem(
        "xenomorph-park-campaign-progress",
        JSON.stringify(completedScenarios),
      );
    }

    // Apply rewards
    applyScenarioRewards(currentScenario);

    // Show completion message
    addStatusMessage(
      `🎉 Campaign Scenario Complete: ${currentScenario.name}`,
      "success",
    );

    // Clear current scenario
    localStorage.removeItem("current-campaign-scenario");
    localStorage.removeItem("campaign-start-time");
    localStorage.removeItem("campaign-objective-progress");
  };

  const applyScenarioRewards = (scenario: CampaignScenario) => {
    const { updateResources } = useGameStore.getState();

    if (scenario.rewards.credits) {
      updateResources({
        credits: resources.credits + scenario.rewards.credits,
      });
      addStatusMessage(
        `Received ${scenario.rewards.credits} credits reward`,
        "success",
      );
    }

    if (scenario.rewards.research) {
      updateResources({
        research: resources.research + scenario.rewards.research,
      });
      addStatusMessage(
        `Received ${scenario.rewards.research} research points reward`,
        "success",
      );
    }

    // Unlock new species and facilities
    if (scenario.rewards.unlockedSpecies) {
      scenario.rewards.unlockedSpecies.forEach((species) => {
        if (!research.completed.includes(species)) {
          research.completed.push(species);
        }
      });
      addStatusMessage(
        `Unlocked ${scenario.rewards.unlockedSpecies.length} new species`,
        "success",
      );
    }
  };

  const getObjectiveProgress = (objective: CampaignObjective): number => {
    if (completedObjectives.includes(objective.id)) return 100;

    switch (objective.type) {
      case "revenue":
        if (typeof objective.target === "number") {
          return Math.min(100, (resources.credits / objective.target) * 100);
        }
        break;
      case "visitors":
        if (typeof objective.target === "number") {
          return Math.min(100, (resources.visitors / objective.target) * 100);
        }
        break;
      case "research":
        if (typeof objective.target === "number") {
          return Math.min(100, (research.points / objective.target) * 100);
        }
        break;
      case "time":
        if (typeof objective.target === "number") {
          return Math.min(100, (day / objective.target) * 100);
        }
        break;
      case "species":
        if (typeof objective.target === "number") {
          const uniqueSpecies = new Set(xenomorphs.map((x) => x.species.name));
          return Math.min(100, (uniqueSpecies.size / objective.target) * 100);
        }
        break;
    }
    return 0;
  };

  const getRemainingTime = (): string | null => {
    if (!currentScenario?.restrictions?.timeLimit) return null;

    const timeLimit = currentScenario.restrictions.timeLimit;
    const remaining = timeLimit - day;

    if (remaining <= 0) return "Time Up!";
    if (remaining === 1) return "1 day remaining";
    return `${remaining} days remaining`;
  };

  const getScenarioElapsedTime = (): string => {
    const elapsed = Date.now() - scenarioStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!isActive || !currentScenario) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-slate-900/95 border border-green-400 rounded-lg p-4 max-w-sm">
      <div className="text-green-400 font-bold mb-2 flex items-center gap-2">
        🎯 {currentScenario.name}
        <span className="text-xs bg-green-400/20 px-2 py-1 rounded">
          {currentScenario.difficulty}
        </span>
      </div>

      <div className="text-xs text-slate-400 mb-3 flex justify-between">
        <span>Elapsed: {getScenarioElapsedTime()}</span>
        {getRemainingTime() && (
          <span
            className={
              getRemainingTime()?.includes("Up")
                ? "text-red-400"
                : "text-yellow-400"
            }
          >
            {getRemainingTime()}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-300 mb-2">
          Objectives:
        </div>
        {objectives.map((objective) => {
          const isCompleted = completedObjectives.includes(objective.id);
          const progress = getObjectiveProgress(objective);

          return (
            <div key={objective.id} className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`text-xs ${
                    isCompleted
                      ? "text-green-400"
                      : objective.required
                        ? "text-red-400"
                        : "text-blue-400"
                  }`}
                >
                  {isCompleted ? "✅" : objective.required ? "🔴" : "🔵"}
                </span>
                <span
                  className={`flex-1 ${
                    isCompleted
                      ? "text-green-400 line-through"
                      : "text-slate-300"
                  }`}
                >
                  {objective.description}
                </span>
              </div>

              {!isCompleted && progress > 0 && (
                <div className="ml-4">
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div
                      className="bg-green-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round(progress)}% complete
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-3 pt-2 border-t border-slate-600 text-xs text-slate-400">
        <div className="grid grid-cols-2 gap-2">
          <div>Day: {day}</div>
          <div>Credits: {resources.credits}</div>
          <div>Facilities: {facilities.length}</div>
          <div>
            Species: {new Set(xenomorphs.map((x) => x.species.name)).size}
          </div>
        </div>
      </div>
    </div>
  );
}
