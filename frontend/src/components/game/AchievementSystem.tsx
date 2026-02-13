import { useState, useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../../stores/gameStore";
import { Modal } from "../ui/Modal";
import { AnimatedProgressBar, PulseEffect } from "../ui/VisualFeedback";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "building" | "research" | "survival" | "management" | "special";
  difficulty: "easy" | "medium" | "hard" | "legendary";
  points: number;
  hidden: boolean;
  requirements: {
    type:
      | "facility_count"
      | "research_complete"
      | "xenomorph_count"
      | "credits"
      | "visitors"
      | "days_survived"
      | "custom";
    target: number | string;
    condition?: string;
  };
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
}

interface AchievementToastProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
}

interface AchievementSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACHIEVEMENTS: Achievement[] = [
  // Building Achievements
  {
    id: "first_facility",
    name: "Foundation",
    description: "Build your first facility",
    icon: "🏗️",
    category: "building",
    difficulty: "easy",
    points: 10,
    hidden: false,
    requirements: { type: "facility_count", target: 1 },
    unlocked: false,
  },
  {
    id: "facility_master",
    name: "Facility Master",
    description: "Build 10 facilities",
    icon: "🏭",
    category: "building",
    difficulty: "medium",
    points: 50,
    hidden: false,
    requirements: { type: "facility_count", target: 10 },
    unlocked: false,
  },
  {
    id: "metropolis",
    name: "Metropolis",
    description: "Build 25 facilities",
    icon: "🏙️",
    category: "building",
    difficulty: "hard",
    points: 150,
    hidden: false,
    requirements: { type: "facility_count", target: 25 },
    unlocked: false,
  },

  // Research Achievements
  {
    id: "first_research",
    name: "Mad Scientist",
    description: "Complete your first xenomorph research",
    icon: "🔬",
    category: "research",
    difficulty: "easy",
    points: 25,
    hidden: false,
    requirements: { type: "research_complete", target: 1 },
    unlocked: false,
  },
  {
    id: "xenobiologist",
    name: "Xenobiologist",
    description: "Complete research on 3 different species",
    icon: "🧬",
    category: "research",
    difficulty: "medium",
    points: 75,
    hidden: false,
    requirements: { type: "research_complete", target: 3 },
    unlocked: false,
  },
  {
    id: "queen_researcher",
    name: "Royal Studies",
    description: "Complete research on the Queen xenomorph",
    icon: "👑",
    category: "research",
    difficulty: "legendary",
    points: 300,
    hidden: true,
    requirements: { type: "custom", target: "queen_researched" },
    unlocked: false,
  },

  // Management Achievements
  {
    id: "millionaire",
    name: "Millionaire",
    description: "Accumulate 1,000,000 credits",
    icon: "💰",
    category: "management",
    difficulty: "hard",
    points: 200,
    hidden: false,
    requirements: { type: "credits", target: 1000000 },
    unlocked: false,
  },
  {
    id: "popular_park",
    name: "Popular Park",
    description: "Attract 500 visitors",
    icon: "👥",
    category: "management",
    difficulty: "medium",
    points: 100,
    hidden: false,
    requirements: { type: "visitors", target: 500 },
    unlocked: false,
  },
  {
    id: "tourist_trap",
    name: "Tourist Trap",
    description: "Attract 1000 visitors",
    icon: "🎢",
    category: "management",
    difficulty: "hard",
    points: 250,
    hidden: false,
    requirements: { type: "visitors", target: 1000 },
    unlocked: false,
  },

  // Survival Achievements
  {
    id: "survivor",
    name: "Survivor",
    description: "Survive 30 days",
    icon: "📅",
    category: "survival",
    difficulty: "medium",
    points: 100,
    hidden: false,
    requirements: { type: "days_survived", target: 30 },
    unlocked: false,
  },
  {
    id: "veteran",
    name: "Veteran Manager",
    description: "Survive 100 days",
    icon: "🎖️",
    category: "survival",
    difficulty: "hard",
    points: 300,
    hidden: false,
    requirements: { type: "days_survived", target: 100 },
    unlocked: false,
  },

  // Special Achievements
  {
    id: "xenomorph_whisperer",
    name: "Xenomorph Whisperer",
    description: "House 20 xenomorphs simultaneously",
    icon: "👾",
    category: "special",
    difficulty: "hard",
    points: 200,
    hidden: false,
    requirements: { type: "xenomorph_count", target: 20 },
    unlocked: false,
  },
  {
    id: "perfect_storm",
    name: "Perfect Storm",
    description: "Survive a Critical severity crisis event",
    icon: "🌪️",
    category: "special",
    difficulty: "legendary",
    points: 500,
    hidden: true,
    requirements: { type: "custom", target: "critical_crisis_survived" },
    unlocked: false,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Unlock all other achievements",
    icon: "🏆",
    category: "special",
    difficulty: "legendary",
    points: 1000,
    hidden: true,
    requirements: { type: "custom", target: "all_achievements" },
    unlocked: false,
  },
];

function AchievementToast({
  achievement,
  isVisible,
  onClose,
}: AchievementToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-auto">
      <PulseEffect pulse={true} color="yellow">
        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400 rounded-lg p-4 backdrop-blur-sm shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{achievement.icon}</span>
            <div className="flex-1">
              <div className="text-yellow-400 font-bold text-lg">
                Achievement Unlocked!
              </div>
              <div className="text-slate-300 font-semibold">
                {achievement.name}
              </div>
              <div className="text-slate-400 text-sm">
                {achievement.description}
              </div>
              <div className="text-yellow-400 text-sm mt-1">
                +{achievement.points} points
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </PulseEffect>
    </div>
  );
}

export function AchievementSystem({ isOpen, onClose }: AchievementSystemProps) {
  const { facilities, research, resources, xenomorphs, day } = useGameStore();

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    // Load persisted achievements or use defaults
    try {
      const saved = localStorage.getItem("xenomorph-park-achievements");
      if (saved) {
        const parsedAchievements = JSON.parse(saved);
        // Merge with ACHIEVEMENTS to handle any new achievements added
        return ACHIEVEMENTS.map((defaultAchievement) => {
          const savedAchievement = parsedAchievements.find(
            (a: Achievement) => a.id === defaultAchievement.id,
          );
          return savedAchievement
            ? { ...defaultAchievement, ...savedAchievement }
            : defaultAchievement;
        });
      }
    } catch (error) {
      console.warn("Failed to load achievements from localStorage:", error);
    }
    return ACHIEVEMENTS;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);
  const processingRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Achievement checking logic
  const checkAchievements = useCallback(() => {
    if (processingRef.current) return;

    processingRef.current = true;
    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.unlocked) return achievement;

        let currentProgress = 0;
        let shouldUnlock = false;

        switch (achievement.requirements.type) {
          case "facility_count":
            currentProgress = facilities.length;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "research_complete":
            currentProgress = research.completed.length;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "xenomorph_count":
            currentProgress = xenomorphs.length;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "credits":
            currentProgress = resources.credits;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "visitors":
            currentProgress = resources.visitors;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "days_survived":
            currentProgress = day;
            shouldUnlock =
              currentProgress >= Number(achievement.requirements.target);
            break;

          case "custom":
            // Handle special achievements
            switch (achievement.requirements.target) {
              case "queen_researched":
                shouldUnlock = research.completed.includes("Queen");
                break;
              case "all_achievements": {
                const otherAchievements = prev.filter(
                  (a) => a.id !== "completionist",
                );
                shouldUnlock = otherAchievements.every((a) => a.unlocked);
                break;
              }
              // Add more custom achievements as needed
            }
            break;
        }

        if (shouldUnlock && !achievement.unlocked) {
          // Trigger achievement unlock
          const unlockedAchievement = {
            ...achievement,
            unlocked: true,
            unlockedAt: Date.now(),
            progress:
              typeof achievement.requirements.target === "number"
                ? achievement.requirements.target
                : 100,
          };

          setNewAchievement(unlockedAchievement);
          setShowToast(true);

          return unlockedAchievement;
        }

        return {
          ...achievement,
          progress: currentProgress,
        };
      }),
    );

    // Reset processing flag after a delay
    setTimeout(() => {
      processingRef.current = false;
    }, 500);
  }, [facilities, research, xenomorphs, resources, day]);

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "xenomorph-park-achievements",
        JSON.stringify(achievements),
      );
    } catch (error) {
      console.warn("Failed to save achievements to localStorage:", error);
    }
  }, [achievements]);

  // Check achievements periodically with heavy throttling
  useEffect(() => {
    // Skip initial load to prevent triggering achievements on fresh start
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const intervalId = setInterval(() => {
      if (!processingRef.current) {
        checkAchievements();
      }
    }, 10000); // Only check every 10 seconds

    return () => clearInterval(intervalId);
  }, [checkAchievements]);

  // Also check when significant milestones are reached
  useEffect(() => {
    if (initialLoadRef.current) return;

    const significantChanges =
      (facilities.length > 0 && facilities.length % 5 === 0) || // Every 5 facilities
      (research.completed.length > 0 && research.completed.length % 3 === 0) || // Every 3 research
      (day > 1 && day % 10 === 0); // Every 10 days

    if (significantChanges) {
      const timeoutId = setTimeout(() => {
        checkAchievements();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [facilities.length, research.completed.length, day, checkAchievements]);

  const categories = [
    "all",
    "building",
    "research",
    "management",
    "survival",
    "special",
  ];

  const getDifficultyColor = (difficulty: Achievement["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-orange-400";
      case "legendary":
        return "text-purple-400";
    }
  };

  const getDifficultyStars = (difficulty: Achievement["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "⭐";
      case "medium":
        return "⭐⭐";
      case "hard":
        return "⭐⭐⭐";
      case "legendary":
        return "⭐⭐⭐⭐";
    }
  };

  const filteredAchievements = achievements
    .filter((achievement) => {
      if (selectedCategory === "all") return true;
      return achievement.category === selectedCategory;
    })
    .filter((achievement) => {
      // Hide hidden achievements unless unlocked
      return !achievement.hidden || achievement.unlocked;
    });

  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="🏆 Achievements">
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {unlockedCount}
              </div>
              <div className="text-sm text-slate-400">Unlocked</div>
            </div>
            <div className="bg-slate-800 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {totalPoints}
              </div>
              <div className="text-sm text-slate-400">Points</div>
            </div>
            <div className="bg-slate-800 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatedProgressBar
            value={unlockedCount}
            max={achievements.length}
            color="yellow"
            label={`Achievement Progress: ${unlockedCount}/${achievements.length}`}
            showPercentage={true}
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 rounded text-sm transition-colors
                  ${
                    selectedCategory === category
                      ? "bg-green-400 text-black"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Achievement List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  border-2 rounded-lg p-4 transition-all duration-200
                  ${
                    achievement.unlocked
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-slate-600 bg-slate-800"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-2xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}
                  >
                    {achievement.unlocked ? achievement.icon : "🔒"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`font-bold ${achievement.unlocked ? "text-yellow-400" : "text-slate-400"}`}
                      >
                        {achievement.unlocked ? achievement.name : "???"}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={getDifficultyColor(achievement.difficulty)}
                        >
                          {getDifficultyStars(achievement.difficulty)}
                        </span>
                        <span className="text-yellow-400 text-sm">
                          {achievement.points}pts
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-sm mb-3 ${achievement.unlocked ? "text-slate-300" : "text-slate-500"}`}
                    >
                      {achievement.unlocked
                        ? achievement.description
                        : "Hidden achievement - complete requirements to reveal"}
                    </p>

                    {/* Progress for non-custom achievements */}
                    {!achievement.unlocked &&
                      achievement.requirements.type !== "custom" &&
                      achievement.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Progress</span>
                            <span>
                              {achievement.progress} /{" "}
                              {achievement.requirements.target}
                            </span>
                          </div>
                          <AnimatedProgressBar
                            value={achievement.progress}
                            max={
                              typeof achievement.requirements.target ===
                              "number"
                                ? achievement.requirements.target
                                : 100
                            }
                            color="blue"
                            showPercentage={false}
                          />
                        </div>
                      )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-slate-400">
                        Unlocked:{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No achievements found in this category.
            </div>
          )}
        </div>
      </Modal>

      {/* Achievement Toast */}
      {newAchievement && (
        <AchievementToast
          achievement={newAchievement}
          isVisible={showToast}
          onClose={() => {
            setShowToast(false);
            setTimeout(() => setNewAchievement(null), 500);
          }}
        />
      )}
    </>
  );
}
