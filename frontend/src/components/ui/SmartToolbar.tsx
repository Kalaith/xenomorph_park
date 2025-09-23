import { useState, ReactNode } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Button } from './Button';

interface ToolbarGroup {
  id: string;
  label: string;
  icon: string;
  items: ToolbarItem[];
  badge?: number;
}

interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: number | string;
}

interface SmartToolbarProps {
  groups: ToolbarGroup[];
  className?: string;
}

export function SmartToolbar({ groups, className = '' }: SmartToolbarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    if (activeGroup === groupId) {
      setActiveGroup(null);
    } else {
      setActiveGroup(groupId);
    }
  };

  const toggleExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className={`bg-slate-900/95 border border-green-400/30 rounded-lg ${className}`}>
      {/* Main Toolbar */}
      <div className="flex items-center gap-1 p-2">
        {groups.map((group) => (
          <div key={group.id} className="relative">
            <Button
              variant={activeGroup === group.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleGroup(group.id)}
              className="relative flex items-center gap-2 min-w-[80px]"
            >
              <span className="text-lg">{group.icon}</span>
              <span className="hidden sm:inline text-xs">{group.label}</span>
              {group.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {group.badge}
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Dropdown Panel */}
      {activeGroup && (
        <div className="border-t border-green-400/30 p-3 bg-slate-800/50">
          {(() => {
            const group = groups.find(g => g.id === activeGroup);
            if (!group) return null;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {group.items.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      item.onClick();
                      setActiveGroup(null); // Close after selection
                    }}
                    disabled={item.disabled}
                    className="flex items-center justify-start gap-2 text-left"
                  >
                    <span>{item.icon}</span>
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-green-400/20 text-green-400 text-xs px-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Predefined toolbar configurations
export function useMainToolbar(startTutorial?: () => void) {
  const [showCampaign, setShowCampaign] = useState(false);
  const [showCampaignStats, setShowCampaignStats] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showResearchTree, setShowResearchTree] = useState(false);
  const [showGeneticLab, setShowGeneticLab] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const groups: ToolbarGroup[] = [
    {
      id: 'campaign',
      label: 'Campaign',
      icon: '🚀',
      items: [
        {
          id: 'campaign-mode',
          label: 'Campaign Mode',
          icon: '🚀',
          onClick: () => setShowCampaign(true)
        },
        {
          id: 'campaign-stats',
          label: 'Statistics',
          icon: '📊',
          onClick: () => setShowCampaignStats(true)
        },
        {
          id: 'historical',
          label: 'Historical Scenarios',
          icon: '📜',
          onClick: () => setShowHistorical(true)
        }
      ]
    },
    {
      id: 'research',
      label: 'Research',
      icon: '🔬',
      items: [
        {
          id: 'research-tree',
          label: 'Research Tree',
          icon: '🔬',
          onClick: () => setShowResearchTree(true)
        },
        {
          id: 'genetic-lab',
          label: 'Genetic Lab',
          icon: '🧬',
          onClick: () => setShowGeneticLab(true)
        }
      ]
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: '🏆',
      items: [
        {
          id: 'achievements',
          label: 'Achievements',
          icon: '🏆',
          onClick: () => setShowAchievements(true)
        }
      ]
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      items: [
        {
          id: 'tutorial',
          label: 'Tutorial',
          icon: '📚',
          onClick: () => startTutorial?.()
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          onClick: () => setShowSettings(true)
        }
      ]
    }
  ];

  return {
    groups,
    modals: {
      showCampaign, setShowCampaign,
      showCampaignStats, setShowCampaignStats,
      showHistorical, setShowHistorical,
      showAchievements, setShowAchievements,
      showResearchTree, setShowResearchTree,
      showGeneticLab, setShowGeneticLab,
      showSettings, setShowSettings
    }
  };
}