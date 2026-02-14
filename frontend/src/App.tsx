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
import { SmartToolbar, useMainToolbar } from './components/ui/SmartToolbar';
import { NotificationSystem } from './components/ui/NotificationSystem';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { SettingsModal } from './components/ui/SettingsModal';
import { ResearchTreeView } from './components/game/ResearchTreeView';
import { AchievementSystem } from './components/game/AchievementSystem';
import { ResourceTrends } from './components/game/ResourceTrends';
import { FacilityUpgrade } from './components/game/FacilityUpgrade';
import { useCrisisManager } from './components/game/CrisisEventModal';
import {
  SkipNavigation,
  ScreenReaderAnnouncement,
  useHighContrastMode,
  useReducedMotion,
} from './components/ui/AccessibilityFeatures';
import { AnimatedBackground } from './components/ui/AdvancedAnimations';
import { useGameLoop } from './hooks/useGameLoop';
import { useFloatingText } from './components/ui/FloatingText';
import { FloatingTextProvider } from './contexts/FloatingTextContext';
import { useParticles } from './components/ui/ParticleSystem';
import { ParticleProvider } from './contexts/ParticleContext';
import { WeatherSystem } from './components/game/WeatherSystem';
import { useTutorial } from './components/game/TutorialMode';
import { CampaignMode } from './components/game/CampaignMode';
import { BiomeSystem, BiomeDisplay } from './components/game/BiomeSystem';
import { HistoricalScenarios } from './components/game/HistoricalScenarios';
import { CampaignObjectiveTracker } from './components/game/CampaignObjectiveTracker';
import { useCampaignEvents } from './components/game/CampaignEventModal';
import { CampaignStatistics } from './components/game/CampaignStatistics';
import { GeneticModification } from './components/game/GeneticModification';
import { TouchControls, SwipeGesture } from './components/ui/MobileOptimization';

function App() {
  const [selectedFacilityForUpgrade, setSelectedFacilityForUpgrade] = useState(null);
  const [useSmartUI, setUseSmartUI] = useState(true); // Toggle for new UI

  // Tutorial system
  const { startTutorial, TutorialComponent } = useTutorial();

  // Use the smart toolbar hook
  const { groups: toolbarGroups, modals } = useMainToolbar(startTutorial);

  const { activeCrisis, CrisisModal } = useCrisisManager();

  // Game loop and accessibility hooks
  useGameLoop();
  useHighContrastMode();
  const reducedMotion = useReducedMotion();

  // Floating text for visual feedback
  const { FloatingTextComponent, addResourceChange, addFloatingText } = useFloatingText();

  // Particle effects
  const {
    ParticleSystemComponent,
    triggerContainmentBreach,
    triggerExplosion,
    triggerSparks,
    triggerSmoke,
  } = useParticles();

  // Campaign events system
  const { CampaignEventModal } = useCampaignEvents();

  // Check if campaign is active
  const isCampaignActive = !!localStorage.getItem('current-campaign-scenario');

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Mobile interaction handlers
  const handleMobileMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Could be used for grid navigation or camera movement
    console.log(`Mobile move: ${direction}`);
  };

  const handleMobileAction = () => {
    // Primary action - could trigger building placement
    console.log('Mobile primary action');
  };

  const handleMobileSecondaryAction = () => {
    // Secondary action - could open context menu
    console.log('Mobile secondary action');
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
          <WeatherSystem>
            <SwipeGesture
              onSwipeLeft={() => isMobile && modals.setShowSettings(false)}
              onSwipeRight={() => isMobile && modals.setShowSettings(true)}
              className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400"
            >
              {/* Accessibility Features */}
              <SkipNavigation />

              {/* Animated Background */}
              {!reducedMotion && <AnimatedBackground />}

              {/* Screen Reader Announcements */}
              {activeCrisis && (
                <ScreenReaderAnnouncement
                  message={`Crisis event: ${activeCrisis.event.name}`}
                  priority="assertive"
                />
              )}

              {/* Unified Header Bar */}
              <header className="bg-slate-900/98 border-b border-green-400/30 sticky top-0 z-30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center gap-12">
                    {/* Primary: Game Identity - Prominent left section */}
                    <div className="flex items-center gap-4 bg-slate-800/30 rounded-lg px-4 py-2.5 border border-slate-700/50 shadow-sm">
                      <h1 className="text-xl font-bold text-green-400 glow tracking-wide">
                        XENOMORPH PARK
                      </h1>
                      <div className="px-3 py-1.5 bg-green-400/20 text-green-400 rounded-md text-sm font-medium border border-green-400/40 shadow-sm">
                        🏗️ Building Mode
                      </div>
                    </div>

                    {/* Secondary Information - Central grouped section */}
                    <div className="flex items-center gap-8 flex-1 justify-center">
                      {/* Game Status */}
                      <div className="bg-slate-800/20 rounded-lg px-4 py-2 border border-slate-700/30">
                        <TimeDisplay />
                      </div>

                      {/* Resources */}
                      <div className="bg-slate-800/20 rounded-lg px-4 py-2 border border-slate-700/30">
                        {useSmartUI ? <SmartResourceDisplay /> : <ResourceCounter />}
                      </div>

                      {/* Environment */}
                      <div className="bg-slate-800/20 rounded-lg px-3 py-2 border border-slate-700/30">
                        <BiomeDisplay />
                      </div>
                    </div>

                    {/* Tertiary: Actions - De-emphasized right section */}
                    <div className="flex items-center gap-2 bg-slate-800/15 rounded-lg px-3 py-2 border border-slate-700/20">
                      <GameControls />

                      <div className="w-px h-4 bg-slate-600/40 mx-2"></div>

                      <button
                        onClick={() => setUseSmartUI(!useSmartUI)}
                        className="p-2 text-slate-400 hover:text-green-400 transition-all duration-200 text-xs rounded hover:bg-slate-700/50 hover:scale-105"
                        title="Toggle UI Mode"
                      >
                        {useSmartUI ? '📋' : '🔧'}
                      </button>
                    </div>
                  </div>

                  {/* Mobile/Tablet Layout */}
                  <div className="lg:hidden space-y-3">
                    {/* Top Row: Identity + Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2 border border-slate-700/50">
                        <h1 className="text-lg font-bold text-green-400 glow">XENOMORPH PARK</h1>
                        <div className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs font-medium border border-green-400/40">
                          🏗️
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-800/15 rounded-lg px-2 py-2 border border-slate-700/20">
                        <GameControls />

                        <div className="w-px h-3 bg-slate-600/40 mx-1"></div>

                        <button
                          onClick={() => setUseSmartUI(!useSmartUI)}
                          className="p-1.5 text-slate-400 hover:text-green-400 transition-colors text-xs rounded hover:bg-slate-700/50"
                          title="Toggle UI Mode"
                        >
                          {useSmartUI ? '📋' : '🔧'}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Information */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="bg-slate-800/20 rounded-lg px-3 py-1.5 border border-slate-700/30 flex-shrink-0">
                        <TimeDisplay />
                      </div>

                      <div className="bg-slate-800/20 rounded-lg px-3 py-1.5 border border-slate-700/30 flex-1 min-w-0">
                        {useSmartUI ? <SmartResourceDisplay /> : <ResourceCounter />}
                      </div>

                      <div className="bg-slate-800/20 rounded-lg px-2 py-1.5 border border-slate-700/30 flex-shrink-0">
                        <BiomeDisplay />
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div id="main-content" className="max-w-7xl mx-auto px-4 py-6 relative z-10">
                {/* Smart Toolbar (if enabled) */}
                {useSmartUI && (
                  <div className="mb-6">
                    <SmartToolbar groups={toolbarGroups} />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Resource Trends */}
                  <ResourceTrends />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Facilities & Species */}
                    <div className="lg:col-span-1 space-y-4">
                      {useSmartUI ? (
                        <>
                          <GroupedFacilityPanel />
                          <GroupedSpeciesPanel />
                        </>
                      ) : (
                        <>
                          <FacilityPanel />
                          <SpeciesPanel />
                        </>
                      )}
                    </div>

                    {/* Right Panel - Game Grid */}
                    <div className="lg:col-span-2">
                      <GameGrid />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-slate-500 text-sm">
                  <p>Xenomorph Park © 2025 - WebHatchery Project</p>
                  <p className="mt-1 text-xs">
                    Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-300">H</kbd>{' '}
                    for keyboard shortcuts
                  </p>
                </footer>
              </div>

              {/* Global Components */}
              <KeyboardShortcuts />
              <NotificationSystem position="top-right" />
              <SettingsModal
                isOpen={modals.showSettings}
                onClose={() => modals.setShowSettings(false)}
              />
              <ResearchTreeView
                isOpen={modals.showResearchTree}
                onClose={() => modals.setShowResearchTree(false)}
              />
              <AchievementSystem
                isOpen={modals.showAchievements}
                onClose={() => modals.setShowAchievements(false)}
              />
              <CampaignMode
                isOpen={modals.showCampaign}
                onClose={() => modals.setShowCampaign(false)}
              />
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
                onClose={() => setSelectedFacilityForUpgrade(null)}
              />
              <CrisisModal isOpen={!!activeCrisis} onClose={() => {}} />

              {/* Floating Text for Visual Feedback */}
              <FloatingTextComponent />

              {/* Particle Effects */}
              <ParticleSystemComponent />

              {/* Tutorial System */}
              <TutorialComponent />

              {/* Campaign Objective Tracker */}
              <CampaignObjectiveTracker isActive={isCampaignActive} />

              {/* Campaign Events */}
              <CampaignEventModal />

              {/* Mobile Touch Controls */}
              {isMobile && (
                <TouchControls
                  onMove={handleMobileMove}
                  onAction={handleMobileAction}
                  onSecondaryAction={handleMobileSecondaryAction}
                />
              )}
            </SwipeGesture>
          </WeatherSystem>
        </BiomeSystem>
      </FloatingTextProvider>
    </ParticleProvider>
  );
}

export default App;
