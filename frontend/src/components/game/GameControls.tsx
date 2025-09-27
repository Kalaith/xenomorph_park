import { useGameStore } from '../../stores/gameStore';
import { Button } from '../ui/Button';

export function GameControls() {
  const { paused, togglePause, undo, redo, canUndo, canRedo } = useGameStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={togglePause}
        className="text-sm px-3 py-1"
        title={paused ? 'Resume Game' : 'Pause Game'}
      >
        {paused ? '▶️' : '⏸️'}
      </Button>

      <Button
        variant="outline"
        onClick={undo}
        disabled={!canUndo()}
        className="text-sm px-2 py-1"
        title="Undo last action (Ctrl+Z)"
      >
        ↶
      </Button>

      <Button
        variant="outline"
        onClick={redo}
        disabled={!canRedo()}
        className="text-sm px-2 py-1"
        title="Redo last action (Ctrl+Y)"
      >
        ↷
      </Button>
    </div>
  );
}