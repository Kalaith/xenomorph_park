import { useGameStore } from "../stores/gameStore";
import { CampaignScenario } from "../components/game/CampaignMode";

export interface CampaignUnlock {
  id: string;
  type: "species" | "facility" | "achievement" | "technology";
  name: string;
  description: string;
  unlockedBy: string; // scenario ID
  dateUnlocked: number;
}

export interface CampaignProgress {
  completedScenarios: string[];
  totalPlayTime: number;
  bestCompletionTimes: Record<string, number>;
  totalRewardsEarned: {
    credits: number;
    research: number;
  };
  unlocks: CampaignUnlock[];
  statistics: CampaignStatistics;
}

export interface CampaignStatistics {
  scenariosCompleted: number;
  scenariosAttempted: number;
  totalObjectivesCompleted: number;
  perfectRuns: number; // scenarios completed with all optional objectives
  fastestCompletion: number; // shortest scenario completion time
  longestRun: number; // longest survival time
  facilitiesBuilt: number;
  speciesContained: number;
  crisisesHandled: number;
}

class CampaignRewardManager {
  private static instance: CampaignRewardManager;

  public static getInstance(): CampaignRewardManager {
    if (!CampaignRewardManager.instance) {
      CampaignRewardManager.instance = new CampaignRewardManager();
    }
    return CampaignRewardManager.instance;
  }

  private getProgress(): CampaignProgress {
    const saved = localStorage.getItem("xenomorph-park-campaign-full-progress");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      completedScenarios: [],
      totalPlayTime: 0,
      bestCompletionTimes: {},
      totalRewardsEarned: { credits: 0, research: 0 },
      unlocks: [],
      statistics: {
        scenariosCompleted: 0,
        scenariosAttempted: 0,
        totalObjectivesCompleted: 0,
        perfectRuns: 0,
        fastestCompletion: Infinity,
        longestRun: 0,
        facilitiesBuilt: 0,
        speciesContained: 0,
        crisisesHandled: 0,
      },
    };
  }

  private saveProgress(progress: CampaignProgress): void {
    localStorage.setItem(
      "xenomorph-park-campaign-full-progress",
      JSON.stringify(progress),
    );
  }

  public completeScenario(
    scenario: CampaignScenario,
    completionTime: number,
    objectivesCompleted: number,
    totalObjectives: number,
    isPerfectRun: boolean,
  ): void {
    const progress = this.getProgress();
    const gameStore = useGameStore.getState();

    // Add to completed scenarios if not already there
    if (!progress.completedScenarios.includes(scenario.id)) {
      progress.completedScenarios.push(scenario.id);
      progress.statistics.scenariosCompleted++;
    }

    // Track best completion time
    if (
      !progress.bestCompletionTimes[scenario.id] ||
      completionTime < progress.bestCompletionTimes[scenario.id]
    ) {
      progress.bestCompletionTimes[scenario.id] = completionTime;
    }

    // Update statistics
    progress.statistics.totalObjectivesCompleted += objectivesCompleted;

    if (isPerfectRun) {
      progress.statistics.perfectRuns++;
    }

    if (completionTime < progress.statistics.fastestCompletion) {
      progress.statistics.fastestCompletion = completionTime;
    }

    // Apply rewards
    if (scenario.rewards.credits) {
      progress.totalRewardsEarned.credits += scenario.rewards.credits;
      gameStore.updateResources({
        credits: gameStore.resources.credits + scenario.rewards.credits,
      });
    }

    if (scenario.rewards.research) {
      progress.totalRewardsEarned.research += scenario.rewards.research;
      gameStore.updateResources({
        research: gameStore.resources.research + scenario.rewards.research,
      });
    }

    // Process unlocks
    this.processUnlocks(scenario, progress);

    // Save progress
    this.saveProgress(progress);

    // Trigger unlock notifications
    this.notifyUnlocks(scenario);
  }

  private processUnlocks(
    scenario: CampaignScenario,
    progress: CampaignProgress,
  ): void {
    const gameStore = useGameStore.getState();

    // Unlock species
    if (scenario.rewards.unlockedSpecies) {
      scenario.rewards.unlockedSpecies.forEach((speciesName) => {
        // Add to research completed if not already there
        if (!gameStore.research.completed.includes(speciesName)) {
          gameStore.research.completed.push(speciesName);
        }

        // Create unlock record
        const unlock: CampaignUnlock = {
          id: `species_${speciesName.toLowerCase().replace(/\s+/g, "_")}`,
          type: "species",
          name: speciesName,
          description: `Unlocked ${speciesName} xenomorph species`,
          unlockedBy: scenario.id,
          dateUnlocked: Date.now(),
        };

        // Add if not already unlocked
        if (!progress.unlocks.some((u) => u.id === unlock.id)) {
          progress.unlocks.push(unlock);
        }
      });
    }

    // Unlock facilities
    if (scenario.rewards.unlockedFacilities) {
      scenario.rewards.unlockedFacilities.forEach((facilityName) => {
        const unlock: CampaignUnlock = {
          id: `facility_${facilityName.toLowerCase().replace(/\s+/g, "_")}`,
          type: "facility",
          name: facilityName,
          description: `Unlocked ${facilityName} facility`,
          unlockedBy: scenario.id,
          dateUnlocked: Date.now(),
        };

        if (!progress.unlocks.some((u) => u.id === unlock.id)) {
          progress.unlocks.push(unlock);
        }
      });
    }

    // Create achievement unlocks
    this.createAchievementUnlocks(scenario, progress);
  }

  private createAchievementUnlocks(
    scenario: CampaignScenario,
    progress: CampaignProgress,
  ): void {
    const achievements: CampaignUnlock[] = [];

    // Scenario-specific achievements
    switch (scenario.id) {
      case "tutorial_first_park":
        achievements.push({
          id: "achievement_first_park_manager",
          type: "achievement",
          name: "Park Manager",
          description: "Successfully completed your first xenomorph park",
          unlockedBy: scenario.id,
          dateUnlocked: Date.now(),
        });
        break;

      case "hadleys_hope":
        achievements.push({
          id: "achievement_terraformer",
          type: "achievement",
          name: "Terraformer",
          description: "Successfully managed Hadley's Hope colony operations",
          unlockedBy: scenario.id,
          dateUnlocked: Date.now(),
        });
        break;

      case "alien_homeworld":
        achievements.push({
          id: "achievement_xenomorph_expert",
          type: "achievement",
          name: "Xenomorph Expert",
          description: "Survived on the alien homeworld",
          unlockedBy: scenario.id,
          dateUnlocked: Date.now(),
        });
        break;
    }

    // Milestone achievements
    if (progress.completedScenarios.length === 3) {
      achievements.push({
        id: "achievement_experienced_manager",
        type: "achievement",
        name: "Experienced Manager",
        description: "Completed 3 campaign scenarios",
        unlockedBy: scenario.id,
        dateUnlocked: Date.now(),
      });
    }

    if (progress.completedScenarios.length === 6) {
      achievements.push({
        id: "achievement_campaign_master",
        type: "achievement",
        name: "Campaign Master",
        description: "Completed all campaign scenarios",
        unlockedBy: scenario.id,
        dateUnlocked: Date.now(),
      });
    }

    // Add new achievements
    achievements.forEach((achievement) => {
      if (!progress.unlocks.some((u) => u.id === achievement.id)) {
        progress.unlocks.push(achievement);
      }
    });
  }

  private notifyUnlocks(scenario: CampaignScenario): void {
    const gameStore = useGameStore.getState();

    // Notify species unlocks
    if (scenario.rewards.unlockedSpecies) {
      scenario.rewards.unlockedSpecies.forEach((species) => {
        gameStore.addStatusMessage(
          `🧬 Species Unlocked: ${species}`,
          "success",
        );
      });
    }

    // Notify facility unlocks
    if (scenario.rewards.unlockedFacilities) {
      scenario.rewards.unlockedFacilities.forEach((facility) => {
        gameStore.addStatusMessage(
          `🏗️ Facility Unlocked: ${facility}`,
          "success",
        );
      });
    }
  }

  public getUnlockedSpecies(): string[] {
    const progress = this.getProgress();
    return progress.unlocks
      .filter((unlock) => unlock.type === "species")
      .map((unlock) => unlock.name);
  }

  public getUnlockedFacilities(): string[] {
    const progress = this.getProgress();
    return progress.unlocks
      .filter((unlock) => unlock.type === "facility")
      .map((unlock) => unlock.name);
  }

  public isSpeciesUnlocked(speciesName: string): boolean {
    return this.getUnlockedSpecies().includes(speciesName);
  }

  public isFacilityUnlocked(facilityName: string): boolean {
    return this.getUnlockedFacilities().includes(facilityName);
  }

  public getAchievements(): CampaignUnlock[] {
    const progress = this.getProgress();
    return progress.unlocks.filter((unlock) => unlock.type === "achievement");
  }

  public getStatistics(): CampaignStatistics {
    return this.getProgress().statistics;
  }

  public getCompletionRate(): number {
    const progress = this.getProgress();
    const totalScenarios = 6; // Update this if more scenarios are added
    return (progress.completedScenarios.length / totalScenarios) * 100;
  }

  public startScenario(scenarioId: string): void {
    void scenarioId;
    const progress = this.getProgress();
    progress.statistics.scenariosAttempted++;
    this.saveProgress(progress);

    // Store start time for this session
    localStorage.setItem("campaign-session-start", Date.now().toString());
  }

  public updateSessionStats(
    facilitiesBuilt: number,
    speciesContained: number,
  ): void {
    const progress = this.getProgress();
    progress.statistics.facilitiesBuilt += facilitiesBuilt;
    progress.statistics.speciesContained += speciesContained;
    this.saveProgress(progress);
  }

  public resetProgress(): void {
    localStorage.removeItem("xenomorph-park-campaign-full-progress");
    localStorage.removeItem("xenomorph-park-campaign-progress");
  }
}

export const campaignRewardManager = CampaignRewardManager.getInstance();
