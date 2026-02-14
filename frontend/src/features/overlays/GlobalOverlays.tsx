import { ReactNode } from 'react';
import { AchievementSystem } from '../../components/game/AchievementSystem';
import { CampaignMode } from '../../components/game/CampaignMode';
import { CampaignObjectiveTracker } from '../../components/game/CampaignObjectiveTracker';
import { CampaignStatistics } from '../../components/game/CampaignStatistics';
import { FacilityUpgrade } from '../../components/game/FacilityUpgrade';
import { GeneticModification } from '../../components/game/GeneticModification';
import { HistoricalScenarios } from '../../components/game/HistoricalScenarios';
import { ResearchTreeView } from '../../components/game/ResearchTreeView';
import { KeyboardShortcuts } from '../../components/ui/KeyboardShortcuts';
import { TouchControls } from '../../components/ui/MobileOptimization';
import { NotificationSystem } from '../../components/ui/NotificationSystem';
import { SettingsModal } from '../../components/ui/SettingsModal';
import { PlacedFacility } from '../../types';

interface GlobalOverlaysProps {
  modals: {
    showCampaign: boolean;
    setShowCampaign: (show: boolean) => void;
    showCampaignStats: boolean;
    setShowCampaignStats: (show: boolean) => void;
    showHistorical: boolean;
    setShowHistorical: (show: boolean) => void;
    showAchievements: boolean;
    setShowAchievements: (show: boolean) => void;
    showResearchTree: boolean;
    setShowResearchTree: (show: boolean) => void;
    showGeneticLab: boolean;
    setShowGeneticLab: (show: boolean) => void;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
  };
  selectedFacilityForUpgrade: PlacedFacility | null;
  onCloseFacilityUpgrade: () => void;
  activeCrisis: unknown;
  CrisisModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => ReactNode;
  FloatingTextComponent: () => ReactNode;
  ParticleSystemComponent: () => ReactNode;
  TutorialComponent: () => ReactNode;
  CampaignEventModal: () => ReactNode;
  isCampaignActive: boolean;
  isMobile: boolean;
  onMobileMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMobileAction: () => void;
  onMobileSecondaryAction: () => void;
}

export function GlobalOverlays({
  modals,
  selectedFacilityForUpgrade,
  onCloseFacilityUpgrade,
  activeCrisis,
  CrisisModal,
  FloatingTextComponent,
  ParticleSystemComponent,
  TutorialComponent,
  CampaignEventModal,
  isCampaignActive,
  isMobile,
  onMobileMove,
  onMobileAction,
  onMobileSecondaryAction,
}: GlobalOverlaysProps) {
  return (
    <>
      <KeyboardShortcuts />
      <NotificationSystem position="top-right" />

      <SettingsModal isOpen={modals.showSettings} onClose={() => modals.setShowSettings(false)} />
      <ResearchTreeView
        isOpen={modals.showResearchTree}
        onClose={() => modals.setShowResearchTree(false)}
      />
      <AchievementSystem
        isOpen={modals.showAchievements}
        onClose={() => modals.setShowAchievements(false)}
      />
      <CampaignMode isOpen={modals.showCampaign} onClose={() => modals.setShowCampaign(false)} />
      <HistoricalScenarios
        isOpen={modals.showHistorical}
        onClose={() => modals.setShowHistorical(false)}
      />
      <CampaignStatistics
        isOpen={modals.showCampaignStats}
        onClose={() => modals.setShowCampaignStats(false)}
      />
      <GeneticModification
        isOpen={modals.showGeneticLab}
        onClose={() => modals.setShowGeneticLab(false)}
      />
      <FacilityUpgrade
        isOpen={!!selectedFacilityForUpgrade}
        facility={selectedFacilityForUpgrade}
        onClose={onCloseFacilityUpgrade}
      />
      <CrisisModal isOpen={!!activeCrisis} onClose={() => {}} />

      <FloatingTextComponent />
      <ParticleSystemComponent />
      <TutorialComponent />
      <CampaignObjectiveTracker isActive={isCampaignActive} />
      <CampaignEventModal />

      {isMobile && (
        <TouchControls
          onMove={onMobileMove}
          onAction={onMobileAction}
          onSecondaryAction={onMobileSecondaryAction}
        />
      )}
    </>
  );
}
