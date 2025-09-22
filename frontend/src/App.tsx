import { useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { ResourceCounter } from './components/game/ResourceCounter';
import { TimeDisplay } from './components/game/TimeDisplay';
import { FacilityPanel } from './components/game/FacilityPanel';
import { SpeciesPanel } from './components/game/SpeciesPanel';
import { GameGrid } from './components/game/GameGrid';
import { GameControls } from './components/game/GameControls';
import { NotificationSystem } from './components/ui/NotificationSystem';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { SettingsModal } from './components/ui/SettingsModal';
import { ResearchTreeView } from './components/game/ResearchTreeView';
import { AchievementSystem } from './components/game/AchievementSystem';
import { ResourceTrends } from './components/game/ResourceTrends';
import { FacilityUpgrade } from './components/game/FacilityUpgrade';
import { useCrisisManager } from './components/game/CrisisEventModal';
import { HorrorMode } from './components/game/HorrorMode';
import { SkipNavigation, ScreenReaderAnnouncement, useHighContrastMode, useReducedMotion } from './components/ui/AccessibilityFeatures';
import { AnimatedBackground } from './components/ui/AdvancedAnimations';
import { useGameLoop } from './hooks/useGameLoop';
import { useFloatingText } from './components/ui/FloatingText';
import { FloatingTextProvider } from './contexts/FloatingTextContext';
import { useParticles } from './components/ui/ParticleSystem';
import { ParticleProvider } from './contexts/ParticleContext';
import { WeatherSystem } from './components/game/WeatherSystem';
import { useTutorial } from './components/game/TutorialMode';
import { CampaignMode } from './components/game/CampaignMode';
import { BiomeSystem } from './components/game/BiomeSystem';
import { HistoricalScenarios } from './components/game/HistoricalScenarios';
import { CampaignObjectiveTracker } from './components/game/CampaignObjectiveTracker';
import { useCampaignEvents } from './components/game/CampaignEventModal';
import { CampaignStatistics } from './components/game/CampaignStatistics';
import { GeneticModification } from './components/game/GeneticModification';
import { TouchControls, SwipeGesture } from './components/ui/MobileOptimization';

function App() {
  const { mode } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showResearchTree, setShowResearchTree] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [showCampaignStats, setShowCampaignStats] = useState(false);
  const [showGeneticLab, setShowGeneticLab] = useState(false);
  const [selectedFacilityForUpgrade, setSelectedFacilityForUpgrade] = useState(null);
  
  const { activeCrisis, CrisisModal } = useCrisisManager();
  
  // Game loop and accessibility hooks
  useGameLoop();
  useHighContrastMode(); // This sets up high contrast but doesn't need to store the value
  const reducedMotion = useReducedMotion();

  // Floating text for visual feedback
  const { FloatingTextComponent, addResourceChange, addFloatingText } = useFloatingText();

  // Particle effects
  const {
    ParticleSystemComponent,
    triggerContainmentBreach,
    triggerExplosion,
    triggerSparks,
    triggerSmoke
  } = useParticles();

  // Tutorial system
  const { startTutorial, TutorialComponent } = useTutorial();

  // Campaign events system
  const { CampaignEventModal } = useCampaignEvents();

  // Check if campaign is active
  const isCampaignActive = !!localStorage.getItem('current-campaign-scenario');

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
    <ParticleProvider value={{ triggerContainmentBreach, triggerExplosion, triggerSparks, triggerSmoke }}>
      <FloatingTextProvider value={{ addResourceChange, addFloatingText }}>
        <BiomeSystem>
          <WeatherSystem>
            <SwipeGesture
              onSwipeLeft={() => isMobile && setShowSettings(false)}
              onSwipeRight={() => isMobile && setShowSettings(true)}
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
      
      <div id="main-content" className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-green-400 glow mb-2">
            XENOMORPH PARK
          </h1>
          <p className="text-slate-400 text-lg">
            Building & Survival Simulation
          </p>
          
          {/* Header Buttons */}
          <div className={`absolute top-0 right-0 ${isMobile ? 'flex flex-wrap gap-1 max-w-32' : 'flex gap-2'}`}>
            <button
              onClick={() => setShowCampaign(true)}
              className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
              title="Campaign Mode"
            >
              🚀
            </button>
            <button
              onClick={() => setShowCampaignStats(true)}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Campaign Statistics"
            >
              📊
            </button>
            <button
              onClick={() => setShowHistorical(true)}
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
              title="Historical Scenarios"
            >
              📜
            </button>
            <button
              onClick={startTutorial}
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              title="Tutorial"
            >
              📚
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
              title="Achievements"
            >
              🏆
            </button>
            <button
              onClick={() => setShowResearchTree(true)}
              className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
              title="Research Tree"
            >
              🔬
            </button>
            <button
              onClick={() => setShowGeneticLab(true)}
              className="p-2 text-slate-400 hover:text-pink-400 transition-colors"
              title="Genetic Laboratory"
            >
              🧬
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-green-400 transition-colors"
              title="Settings (H for help)"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Time and Resource Dashboard */}
        <TimeDisplay />
        <ResourceCounter />

        {/* Game Controls */}
        <GameControls />

        {mode === 'building' ? (
          <div className="space-y-6">
            {/* Resource Trends */}
            <ResourceTrends />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Facilities & Species */}
              <div className="lg:col-span-1 space-y-6">
                <FacilityPanel />
                <SpeciesPanel />
              </div>

              {/* Right Panel - Game Grid */}
              <div className="lg:col-span-2">
                <GameGrid />
              </div>
            </div>
          </div>
        ) : (
          <HorrorMode />
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Xenomorph Park © 2025 - WebHatchery Project</p>
          <p className="mt-1 text-xs">
            Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-300">H</kbd> for keyboard shortcuts
          </p>
        </footer>
      </div>

      {/* Global Components */}
      <KeyboardShortcuts />
      <NotificationSystem position="top-right" />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <ResearchTreeView
        isOpen={showResearchTree}
        onClose={() => setShowResearchTree(false)}
      />
      <AchievementSystem
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
      <CampaignMode
        isOpen={showCampaign}
        onClose={() => setShowCampaign(false)}
      />
      <HistoricalScenarios
        isOpen={showHistorical}
        onClose={() => setShowHistorical(false)}
      />
      <CampaignStatistics
        isOpen={showCampaignStats}
        onClose={() => setShowCampaignStats(false)}
      />
      <GeneticModification
        isOpen={showGeneticLab}
        onClose={() => setShowGeneticLab(false)}
      />
      <FacilityUpgrade
        isOpen={!!selectedFacilityForUpgrade}
        facility={selectedFacilityForUpgrade}
        onClose={() => setSelectedFacilityForUpgrade(null)}
      />
      <CrisisModal
        isOpen={!!activeCrisis}
        onClose={() => {}}
      />

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
