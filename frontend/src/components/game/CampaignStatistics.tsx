import { useState, useEffect } from 'react';
import { campaignRewardManager } from '../../utils/campaignRewards';
import { campaignEventManager } from '../../utils/campaignEvents';

interface CampaignStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignStatistics({ isOpen, onClose }: CampaignStatisticsProps) {
  const [statistics, setStatistics] = useState<any>({});
  const [achievements, setAchievements] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState<'overview' | 'scenarios' | 'achievements' | 'performance'>('overview');

  useEffect(() => {
    if (isOpen) {
      loadStatistics();
    }
  }, [isOpen]);

  const loadStatistics = () => {
    const stats = campaignRewardManager.getStatistics();
    const achievementsList = campaignRewardManager.getAchievements();
    const completionRate = campaignRewardManager.getCompletionRate();

    setStatistics(stats);
    setAchievements(achievementsList);
    setCompletionData({
      completionRate,
      totalScenarios: 6,
      completedScenarios: Math.round((completionRate / 100) * 6)
    });
  };

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || milliseconds === Infinity) return 'N/A';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getScenarioNames = (): Record<string, string> => {
    return {
      'tutorial_first_park': 'Tutorial: First Park',
      'hadleys_hope': 'Hadley\'s Hope Colony',
      'alien_homeworld': 'Alien Homeworld',
      'space_station': 'Research Station Omega',
      'corporate_facility': 'Corporate Facility',
      'final_showdown': 'The Final Showdown'
    };
  };

  const getPerformanceRating = (): string => {
    const { perfectRuns, scenariosCompleted } = statistics;

    if (perfectRuns >= 3) return 'Legendary';
    if (perfectRuns >= 2) return 'Master';
    if (scenariosCompleted >= 4) return 'Expert';
    if (scenariosCompleted >= 2) return 'Skilled';
    if (scenariosCompleted >= 1) return 'Novice';
    return 'Rookie';
  };

  const getPerformanceColor = (rating: string): string => {
    switch (rating) {
      case 'Legendary': return 'text-purple-400';
      case 'Master': return 'text-orange-400';
      case 'Expert': return 'text-blue-400';
      case 'Skilled': return 'text-green-400';
      case 'Novice': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-green-400 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Campaign Statistics</h2>
              <p className="text-slate-400">Your performance across all campaign scenarios</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'performance', label: 'Performance', icon: '⚡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-green-400/20 text-green-400 border border-green-400'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-green-400">
                    {completionData.completedScenarios}/{completionData.totalScenarios}
                  </div>
                  <div className="text-sm text-slate-400">Scenarios Completed</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionData.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(getPerformanceRating())}`}>
                    {getPerformanceRating()}
                  </div>
                  <div className="text-sm text-slate-400">Performance Rating</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {achievements.length}
                  </div>
                  <div className="text-sm text-slate-400">Achievements Earned</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl mb-2">⏱️</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatTime(statistics.fastestCompletion)}
                  </div>
                  <div className="text-sm text-slate-400">Best Time</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <span>📈</span>
                    Gameplay Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scenarios Attempted:</span>
                      <span className="text-slate-200">{statistics.scenariosAttempted || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Perfect Runs:</span>
                      <span className="text-green-400">{statistics.perfectRuns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Objectives:</span>
                      <span className="text-slate-200">{statistics.totalObjectivesCompleted || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facilities Built:</span>
                      <span className="text-slate-200">{formatNumber(statistics.facilitiesBuilt || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Species Contained:</span>
                      <span className="text-slate-200">{formatNumber(statistics.speciesContained || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crises Handled:</span>
                      <span className="text-slate-200">{formatNumber(statistics.crisisesHandled || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <span>🎮</span>
                    Recent Activity
                  </h3>
                  <div className="space-y-3 text-sm">
                    {achievements.slice(-5).reverse().map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded">
                        <span className="text-yellow-400">🏆</span>
                        <div>
                          <div className="text-slate-200">{achievement.name}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(achievement.dateUnlocked).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <div className="text-slate-500 text-center py-4">
                        No achievements yet. Complete scenarios to earn achievements!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'scenarios' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-200">Scenario Progress</h3>
              <div className="grid gap-4">
                {Object.entries(getScenarioNames()).map(([id, name]) => {
                  const isCompleted = campaignRewardManager.getCompletedScenarios().includes(id);
                  const bestTime = campaignRewardManager.getBestCompletionTimes()[id];

                  return (
                    <div key={id} className={`p-4 rounded-lg border ${
                      isCompleted
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-600'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {isCompleted ? '✅' : '⏳'}
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-200">{name}</h4>
                            <p className="text-sm text-slate-400">
                              {isCompleted ? 'Completed' : 'Not completed'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {bestTime && (
                            <div className="text-blue-400 font-mono">
                              {formatTime(bestTime)}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">Best Time</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-200">Achievement Gallery</h3>
              {achievements.length > 0 ? (
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🏆</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-400">{achievement.name}</h4>
                          <p className="text-slate-400 text-sm mb-2">{achievement.description}</p>
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Unlocked by: {getScenarioNames()[achievement.unlockedBy] || achievement.unlockedBy}</span>
                            <span>{new Date(achievement.dateUnlocked).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="text-xl text-slate-400 mb-2">No Achievements Yet</h4>
                  <p className="text-slate-500">Complete campaign scenarios to unlock achievements!</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-200">Performance Analysis</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <h4 className="font-semibold text-slate-200 mb-4">Efficiency Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Completion Rate</span>
                        <span className="text-green-400">{completionData.completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${completionData.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Perfect Run Rate</span>
                        <span className="text-purple-400">
                          {statistics.scenariosCompleted > 0
                            ? ((statistics.perfectRuns / statistics.scenariosCompleted) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-400 h-2 rounded-full"
                          style={{
                            width: `${statistics.scenariosCompleted > 0
                              ? (statistics.perfectRuns / statistics.scenariosCompleted) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Tips */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <h4 className="font-semibold text-slate-200 mb-4">Performance Tips</h4>
                  <div className="space-y-3 text-sm">
                    {completionData.completionRate < 50 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                        <div className="text-blue-400 font-medium">🎯 Focus on Objectives</div>
                        <div className="text-slate-400">Complete more scenarios to improve your rating</div>
                      </div>
                    )}

                    {statistics.perfectRuns === 0 && statistics.scenariosCompleted > 0 && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                        <div className="text-purple-400 font-medium">💎 Aim for Perfect Runs</div>
                        <div className="text-slate-400">Complete all optional objectives for better ratings</div>
                      </div>
                    )}

                    {statistics.fastestCompletion === Infinity && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                        <div className="text-yellow-400 font-medium">⚡ Speed Challenge</div>
                        <div className="text-slate-400">Try completing scenarios faster for better times</div>
                      </div>
                    )}

                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <div className="text-green-400 font-medium">📊 Track Progress</div>
                      <div className="text-slate-400">Use this dashboard to monitor your improvement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Campaign Statistics Dashboard</span>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all campaign progress? This cannot be undone.')) {
                  campaignRewardManager.resetProgress();
                  campaignEventManager.clearEventHistory();
                  loadStatistics();
                }
              }}
              className="px-3 py-1 text-red-400 hover:text-red-300 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
            >
              Reset Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}