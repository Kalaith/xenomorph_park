import { useGameStore } from './stores/gameStore';
import { ResourceCounter } from './components/game/ResourceCounter';
import { FacilityPanel } from './components/game/FacilityPanel';
import { SpeciesPanel } from './components/game/SpeciesPanel';
import { GameGrid } from './components/game/GameGrid';
import { GameControls } from './components/game/GameControls';

function App() {
  const { mode } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 glow mb-2">
            XENOMORPH PARK
          </h1>
          <p className="text-slate-400 text-lg">
            Building & Survival Simulation
          </p>
        </header>

        {/* Resource Dashboard */}
        <ResourceCounter />

        {/* Game Controls */}
        <GameControls />

        {mode === 'building' ? (
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
        ) : (
          <div className="text-center py-20">
            <div className="bg-slate-900/80 border border-red-400/30 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-red-400 mb-4 glow">
                🚨 HORROR MODE
              </h2>
              <p className="text-slate-300 mb-6">
                Horror survival mode is under development. A containment breach has occurred and you must survive!
              </p>
              <div className="space-y-4">
                <div className="bg-red-900/30 border border-red-400/30 rounded p-4 text-left">
                  <h3 className="text-red-400 font-semibold mb-2">Objectives:</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• Restore power to main grid</li>
                    <li>• Evacuate remaining civilians</li>
                    <li>• Eliminate xenomorph threats</li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 border border-slate-600 rounded p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Health:</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Ammo:</span>
                    <span className="text-yellow-400">95/95</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Weapon:</span>
                    <span className="text-blue-400">M41A Pulse Rifle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Xenomorph Park © 2025 - WebHatchery Project</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
