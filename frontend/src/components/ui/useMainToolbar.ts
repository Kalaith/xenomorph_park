import { useState } from 'react';

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
      id: 'help',
      label: 'Help',
      icon: '?',
      items: [
        {
          id: 'tutorial',
          label: 'Tutorial',
          icon: '\u{1F4DA}',
          onClick: () => startTutorial?.(),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '\u2699\uFE0F',
          onClick: () => setShowSettings(true),
        },
      ],
    },
  ];

  return {
    groups,
    modals: {
      showCampaign,
      setShowCampaign,
      showCampaignStats,
      setShowCampaignStats,
      showHistorical,
      setShowHistorical,
      showAchievements,
      setShowAchievements,
      showResearchTree,
      setShowResearchTree,
      showGeneticLab,
      setShowGeneticLab,
      showSettings,
      setShowSettings,
    },
  };
}
