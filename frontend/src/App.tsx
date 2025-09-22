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

function App() {
  const { mode } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showResearchTree, setShowResearchTree] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedFacilityForUpgrade, setSelectedFacilityForUpgrade] = useState(null);
  
  const { activeCrisis, checkForCrisis, CrisisModal } = useCrisisManager();
  
  // Game loop and accessibility hooks
  useGameLoop();
  const [highContrast] = useHighContrastMode();
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

  return (
    <ParticleProvider value={{ triggerContainmentBreach, triggerExplosion, triggerSparks, triggerSmoke }}>
      <FloatingTextProvider value={{ addResourceChange, addFloatingText }}>
        <WeatherSystem>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400">
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
          <div className="absolute top-0 right-0 flex gap-2">
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
          </div>
        </WeatherSystem>
      </FloatingTextProvider>
    </ParticleProvider>
  );
}

export default App;
