import { useGameStore } from '../../stores/gameStore';
import { Button } from '../ui/Button';

export function GameControls() {
  const { mode, paused, togglePause, setMode, reset } = useGameStore();

  const handleModeSwitch = () => {
    setMode(mode === 'building' ? 'horror' : 'building');
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4 mb-4">
      <h3 className="text-green-400 font-bold text-lg mb-4 glow">Game Controls</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={handleModeSwitch}
          className="flex items-center gap-2"
        >
          {mode === 'building' ? (
            <>
              🎮 Switch to Horror Mode
            </>
          ) : (
            <>
              🏗️ Return to Building
            </>
          )}
        </Button>
        
        <Button
          variant="secondary"
          onClick={togglePause}
          className="flex items-center gap-2"
        >
          {paused ? (
            <>
              ▶️ Resume
            </>
          ) : (
            <>
              ⏸️ Pause
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
              reset();
            }
          }}
          className="flex items-center gap-2"
        >
          🔄 Reset Game
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-green-400 font-semibold">Current Mode:</span>
          <span className={`px-2 py-1 rounded ${
            mode === 'building' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
          }`}>
            {mode === 'building' ? '🏗️ Building' : '🎯 Horror Survival'}
          </span>
          {paused && (
            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">
              ⏸️ Paused
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
