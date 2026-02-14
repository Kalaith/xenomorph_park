import { useState } from 'react';
import { ResourceCounter } from './components/game/ResourceCounter';
import { SmartResourceDisplay } from './components/ui/SmartResourceDisplay';
import { TimeDisplay } from './components/game/TimeDisplay';
import { FacilityPanel } from './components/game/FacilityPanel';
import { GroupedFacilityPanel } from './components/game/GroupedFacilityPanel';
import { SpeciesPanel } from './components/game/SpeciesPanel';
import { GroupedSpeciesPanel } from './components/game/GroupedSpeciesPanel';
import { GameGrid } from './components/game/GameGrid';
import { GameControls } from './components/game/GameControls';
import { useMainToolbar } from './components/ui/useMainToolbar';
import { ResourceTrends } from './components/game/ResourceTrends';
import { useCrisisManager } from './components/game/useCrisisManager';
import { SkipNavigation, ScreenReaderAnnouncement } from './components/ui/AccessibilityFeatures';
import { useHighContrastMode, useReducedMotion } from './components/ui/useAccessibilityPreferences';
import { AnimatedBackground } from './components/ui/AdvancedAnimations';
import { useGameLoop } from './hooks/useGameLoop';
import { useFloatingText } from './components/ui/useFloatingText';
import { FloatingTextProvider } from './contexts/FloatingTextContext';
import { useParticles } from './components/ui/useParticles';
import { ParticleProvider } from './contexts/ParticleContext';
import { useTutorial } from './components/game/useTutorial';
import { BiomeSystem, BiomeDisplay } from './components/game/BiomeSystem';
import { useCampaignEvents } from './components/game/useCampaignEvents';
import { SwipeGesture } from './components/ui/MobileOptimization';
import { PlacedFacility } from './types';
import { AppShell } from './layout/AppShell';
import { TopBar } from './layout/TopBar';
import { SidebarNav, NavigationItem, NavigationSectionId } from './layout/SidebarNav';
import { ContentFrame } from './layout/ContentFrame';
import { OperationsPage } from './features/operations/OperationsPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { SpeciesPage } from './features/species/SpeciesPage';
import { FacilitiesPage } from './features/facilities/FacilitiesPage';
import { ResearchPage } from './features/research/ResearchPage';
import { CampaignPage } from './features/campaign/CampaignPage';
import { SystemPage } from './features/system/SystemPage';
import { GlobalOverlays } from './features/overlays/GlobalOverlays';

const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Reports', description: 'Resource trends, status reports, and summaries' },
  { id: 'operations', label: 'Operations', description: 'Grid, placement, and active controls' },
  { id: 'species', label: 'Species', description: 'Species roster and containment data' },
  { id: 'facilities', label: 'Facilities', description: 'Buildings, upgrades, and maintenance' },
  { id: 'research', label: 'Research', description: 'Research tree and genetic programs' },
  { id: 'campaign', label: 'Campaign', description: 'Campaign progression and scenarios' },
  { id: 'system', label: 'System', description: 'Settings, controls, and accessibility' },
];

function App() {
  const [selectedFacilityForUpgrade, setSelectedFacilityForUpgrade] = useState<PlacedFacility | null>(
    null
  );
  const [useSmartUI, setUseSmartUI] = useState(true);
  const [activeSection, setActiveSection] = useState<NavigationSectionId>('operations');

  const { startTutorial, TutorialComponent } = useTutorial();
  const { modals } = useMainToolbar(startTutorial);
  const { activeCrisis, CrisisModal } = useCrisisManager();

  useGameLoop();
  useHighContrastMode();
  const reducedMotion = useReducedMotion();

  const { FloatingTextComponent, addResourceChange, addFloatingText } = useFloatingText();

  const {
    ParticleSystemComponent,
    triggerContainmentBreach,
    triggerExplosion,
    triggerSparks,
    triggerSmoke,
  } = useParticles();

  const { CampaignEventModal } = useCampaignEvents();
  const isCampaignActive = !!localStorage.getItem('current-campaign-scenario');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const handleMobileMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log(`Mobile move: ${direction}`);
  };

  const handleMobileAction = () => {
    console.log('Mobile primary action');
  };

  const handleMobileSecondaryAction = () => {
    console.log('Mobile secondary action');
  };

  const toggleSmartUI = () => {
    setUseSmartUI(value => !value);
  };

  const operationsPage = <OperationsPage gameGrid={<GameGrid />} />;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPage resourceTrends={<ResourceTrends />} isCampaignActive={isCampaignActive} />;
      case 'operations':
        return operationsPage;
      case 'species':
        return <SpeciesPage speciesPanel={useSmartUI ? <GroupedSpeciesPanel /> : <SpeciesPanel />} />;
      case 'facilities':
        return (
          <FacilitiesPage facilityPanel={useSmartUI ? <GroupedFacilityPanel /> : <FacilityPanel />} />
        );
      case 'research':
        return (
          <ResearchPage
            onOpenResearchTree={() => modals.setShowResearchTree(true)}
            onOpenGeneticLab={() => modals.setShowGeneticLab(true)}
            onOpenAchievements={() => modals.setShowAchievements(true)}
          />
        );
      case 'campaign':
        return (
          <CampaignPage
            isCampaignActive={isCampaignActive}
            onOpenCampaign={() => modals.setShowCampaign(true)}
            onOpenHistoricalScenarios={() => modals.setShowHistorical(true)}
            onOpenCampaignStats={() => modals.setShowCampaignStats(true)}
          />
        );
      case 'system':
        return (
          <SystemPage
            useSmartUI={useSmartUI}
            onToggleSmartUI={toggleSmartUI}
            onOpenSettings={() => modals.setShowSettings(true)}
            onStartTutorial={startTutorial}
          />
        );
      default:
        return operationsPage;
    }
  };

  return (
    <ParticleProvider
      value={{
        triggerContainmentBreach,
        triggerExplosion,
        triggerSparks,
        triggerSmoke,
      }}
    >
      <FloatingTextProvider value={{ addResourceChange, addFloatingText }}>
        <BiomeSystem>
          <SwipeGesture
            onSwipeLeft={() => isMobile && modals.setShowSettings(false)}
            onSwipeRight={() => isMobile && modals.setShowSettings(true)}
            className="min-h-screen text-slate-100"
          >
            <SkipNavigation />
            {!reducedMotion && <AnimatedBackground />}

            {activeCrisis && (
              <ScreenReaderAnnouncement
                message={`Crisis event: ${activeCrisis.event.name}`}
                priority="assertive"
              />
            )}

            <AppShell
              topBar={
                <TopBar
                  title="Xenomorph Park"
                  modeLabel="Building"
                  useSmartUI={useSmartUI}
                  onToggleSmartUI={toggleSmartUI}
                  controls={<GameControls />}
                  timeDisplay={<TimeDisplay />}
                  resourceDisplay={useSmartUI ? <SmartResourceDisplay /> : <ResourceCounter />}
                  biomeDisplay={<BiomeDisplay />}
                />
              }
              sidebar={
                <SidebarNav
                  items={navigationItems}
                  activeSection={activeSection}
                  onSelectSection={setActiveSection}
                />
              }
            >
              <ContentFrame>
                {renderActiveSection()}
                <footer className="mt-10 border-t border-slate-700/70 pt-4 text-center text-sm text-slate-400">
                  <p>Xenomorph Park (c) 2025 - WebHatchery Project</p>
                  <p className="mt-1 text-xs">
                    Press <kbd className="rounded bg-slate-700 px-1 py-0.5 text-slate-200">H</kbd> for
                    keyboard shortcuts
                  </p>
                </footer>
              </ContentFrame>
            </AppShell>

            <GlobalOverlays
              modals={modals}
              selectedFacilityForUpgrade={selectedFacilityForUpgrade}
              onCloseFacilityUpgrade={() => setSelectedFacilityForUpgrade(null)}
              activeCrisis={activeCrisis}
              CrisisModal={CrisisModal}
              FloatingTextComponent={FloatingTextComponent}
              ParticleSystemComponent={ParticleSystemComponent}
              TutorialComponent={TutorialComponent}
              CampaignEventModal={CampaignEventModal}
              isCampaignActive={isCampaignActive}
              isMobile={isMobile}
              onMobileMove={handleMobileMove}
              onMobileAction={handleMobileAction}
              onMobileSecondaryAction={handleMobileSecondaryAction}
            />
          </SwipeGesture>
        </BiomeSystem>
      </FloatingTextProvider>
    </ParticleProvider>
  );
}

export default App;
