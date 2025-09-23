import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GridPosition } from '../../types';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { PulseEffect, ShakeEffect, useFloatingNumbers } from '../ui/VisualFeedback';
import { useKeyboardShortcut } from '../ui/KeyboardShortcuts';

interface PlayerState {
  position: GridPosition;
  health: number;
  ammo: number;
  facing: 'north' | 'south' | 'east' | 'west';
  isReloading: boolean;
  hasFlashlight: boolean;
  flashlightBattery: number;
}

interface XenomorphAI {
  id: string;
  position: GridPosition;
  species: string;
  health: number;
  aggression: number;
  detectionRange: number;
  isHunting: boolean;
  lastSeenPlayer?: GridPosition;
  moveTimer: number;
}

interface GameObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  position?: GridPosition;
}

export function HorrorMode() {
  const { 
    updateHorrorState, 
    horror, 
    facilities, 
    xenomorphs,
    addStatusMessage 
  } = useGameStore();

  const [player, setPlayer] = useState<PlayerState>({
    position: { row: 0, col: 0 },
    health: 100,
    ammo: 95,
    facing: 'north',
    isReloading: false,
    hasFlashlight: true,
    flashlightBattery: 100
  });

  const [aiXenomorphs, setAiXenomorphs] = useState<XenomorphAI[]>([]);
  const [objectives, setObjectives] = useState<GameObjective[]>([
    {
      id: 'power',
      title: 'Restore Main Power',
      description: 'Reach the power generator and restore facility power',
      completed: false,
      required: true,
      position: { row: 7, col: 7 }
    },
    {
      id: 'evacuate',
      title: 'Evacuate Survivors',
      description: 'Find and evacuate 3 remaining civilians',
      completed: false,
      required: true
    },
    {
      id: 'eliminate',
      title: 'Eliminate Threats',
      description: 'Neutralize all hostile xenomorphs',
      completed: false,
      required: false
    }
  ]);

  const [gameState, setGameState] = useState<'playing' | 'paused' | 'game-over' | 'victory'>('playing');
  const [showInventory, setShowInventory] = useState(false);
  const [alertLevel, setAlertLevel] = useState<'green' | 'yellow' | 'red'>('yellow');
  const [lastDamageTime, setLastDamageTime] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { addFloatingNumber, FloatingNumbersRenderer } = useFloatingNumbers();

  // Initialize AI xenomorphs from placed xenomorphs
  useEffect(() => {
    const initialAI = xenomorphs.map(x => ({
      id: x.id,
      position: x.position,
      species: x.species.name,
      health: 100,
      aggression: x.species.dangerLevel * 20,
      detectionRange: x.species.dangerLevel + 2,
      isHunting: false,
      moveTimer: 0
    }));
    setAiXenomorphs(initialAI);
  }, [xenomorphs]);

  // Game loop for AI and systems
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      // Update AI xenomorphs
      setAiXenomorphs(prev => prev.map(updateXenomorphAI));
      
      // Drain flashlight battery
      if (player.hasFlashlight && player.flashlightBattery > 0) {
        setPlayer(prev => ({
          ...prev,
          flashlightBattery: Math.max(0, prev.flashlightBattery - 0.1)
        }));
      }

      // Check objectives
      checkObjectives();
      
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, player, objectives]);

  const updateXenomorphAI = useCallback((xenomorph: XenomorphAI): XenomorphAI => {
    const distanceToPlayer = Math.abs(xenomorph.position.row - player.position.row) + 
                             Math.abs(xenomorph.position.col - player.position.col);
    
    const newXenomorph = { ...xenomorph };
    
    // Detection logic
    if (distanceToPlayer <= xenomorph.detectionRange && !xenomorph.isHunting) {
      newXenomorph.isHunting = true;
      newXenomorph.lastSeenPlayer = player.position;
      addStatusMessage(`⚠️ ${xenomorph.species} detected you!`, 'warning');
      setAlertLevel('red');
    }

    // Movement logic
    newXenomorph.moveTimer += 1;
    if (newXenomorph.moveTimer >= (xenomorph.isHunting ? 2 : 4)) {
      newXenomorph.moveTimer = 0;
      
      if (xenomorph.isHunting && xenomorph.lastSeenPlayer) {
        // Move towards last seen player position
        const targetRow = xenomorph.lastSeenPlayer.row;
        const targetCol = xenomorph.lastSeenPlayer.col;
        
        if (xenomorph.position.row < targetRow) newXenomorph.position.row++;
        else if (xenomorph.position.row > targetRow) newXenomorph.position.row--;
        
        if (xenomorph.position.col < targetCol) newXenomorph.position.col++;
        else if (xenomorph.position.col > targetCol) newXenomorph.position.col--;
      } else {
        // Random movement
        const directions = [
          { row: -1, col: 0 }, { row: 1, col: 0 },
          { row: 0, col: -1 }, { row: 0, col: 1 }
        ];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newRow = Math.max(0, Math.min(GAME_CONSTANTS.GRID_HEIGHT - 1, 
                                          xenomorph.position.row + randomDir.row));
        const newCol = Math.max(0, Math.min(GAME_CONSTANTS.GRID_WIDTH - 1, 
                                          xenomorph.position.col + randomDir.col));
        
        newXenomorph.position = { row: newRow, col: newCol };
      }
    }

    // Attack if adjacent to player
    if (distanceToPlayer === 1) {
      attackPlayer(xenomorph);
    }

    return newXenomorph;
  }, [player.position]);

  const attackPlayer = useCallback((xenomorph: XenomorphAI) => {
    const now = Date.now();
    if (now - lastDamageTime < 2000) return; // 2 second cooldown

    const damage = Math.floor(Math.random() * 20) + 10;
    setPlayer(prev => ({
      ...prev,
      health: Math.max(0, prev.health - damage)
    }));

    setLastDamageTime(now);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    addFloatingNumber(-damage, 
      player.position.col * 32 + 100, 
      player.position.row * 32 + 100, 
      'damage'
    );

    addStatusMessage(`${xenomorph.species} attacked! -${damage} health`, 'error');

    if (player.health - damage <= 0) {
      setGameState('game-over');
      addStatusMessage('💀 Game Over! You have been eliminated.', 'error');
    }
  }, [player.position, lastDamageTime, addFloatingNumber, addStatusMessage]);

  const movePlayer = useCallback((direction: 'north' | 'south' | 'east' | 'west') => {
    if (gameState !== 'playing' || player.isReloading) return;

    const directions = {
      north: { row: -1, col: 0 },
      south: { row: 1, col: 0 },
      east: { row: 0, col: 1 },
      west: { row: 0, col: -1 }
    };

    const delta = directions[direction];
    const newRow = Math.max(0, Math.min(GAME_CONSTANTS.GRID_HEIGHT - 1, 
                                       player.position.row + delta.row));
    const newCol = Math.max(0, Math.min(GAME_CONSTANTS.GRID_WIDTH - 1, 
                                       player.position.col + delta.col));

    // Check for obstacles (facilities)
    const isBlocked = facilities.some(f => f.position.row === newRow && f.position.col === newCol);
    if (isBlocked) {
      addStatusMessage('Path blocked by facility', 'warning');
      return;
    }

    setPlayer(prev => ({
      ...prev,
      position: { row: newRow, col: newCol },
      facing: direction
    }));
  }, [gameState, player.isReloading, facilities, addStatusMessage]);

  const shootWeapon = useCallback(() => {
    if (gameState !== 'playing' || player.isReloading || player.ammo <= 0) return;

    const facingDirections = {
      north: { row: -1, col: 0 },
      south: { row: 1, col: 0 },
      east: { row: 0, col: 1 },
      west: { row: 0, col: -1 }
    };

    const direction = facingDirections[player.facing];
    const targetRow = player.position.row + direction.row;
    const targetCol = player.position.col + direction.col;

    // Check if xenomorph is in target position
    const targetXenomorph = aiXenomorphs.find(x => 
      x.position.row === targetRow && x.position.col === targetCol
    );

    setPlayer(prev => ({
      ...prev,
      ammo: prev.ammo - 1
    }));

    if (targetXenomorph) {
      const damage = Math.floor(Math.random() * 30) + 20;
      setAiXenomorphs(prev => prev.map(x => 
        x.id === targetXenomorph.id 
          ? { ...x, health: Math.max(0, x.health - damage) }
          : x
      ).filter(x => x.health > 0));

      addFloatingNumber(-damage, 
        targetCol * 32 + 100, 
        targetRow * 32 + 100, 
        'damage'
      );

      addStatusMessage(`Hit ${targetXenomorph.species} for ${damage} damage!`, 'success');
    } else {
      addStatusMessage('Shot missed!', 'warning');
    }

    if (player.ammo - 1 <= 0) {
      reload();
    }
  }, [gameState, player, aiXenomorphs, addFloatingNumber, addStatusMessage]);

  const reload = useCallback(() => {
    if (player.isReloading) return;

    setPlayer(prev => ({ ...prev, isReloading: true }));
    addStatusMessage('Reloading...', 'info');

    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        ammo: 95,
        isReloading: false
      }));
      addStatusMessage('Reload complete', 'success');
    }, 3000);
  }, [player.isReloading, addStatusMessage]);

  const checkObjectives = useCallback(() => {
    setObjectives(prev => prev.map(obj => {
      if (obj.completed) return obj;

      switch (obj.id) {
        case 'power':
          if (obj.position && 
              player.position.row === obj.position.row && 
              player.position.col === obj.position.col) {
            addStatusMessage('✅ Main power restored!', 'success');
            return { ...obj, completed: true };
          }
          break;
        case 'eliminate':
          if (aiXenomorphs.length === 0) {
            addStatusMessage('✅ All threats eliminated!', 'success');
            return { ...obj, completed: true };
          }
          break;
      }
      return obj;
    }));

    // Check victory condition
    const requiredObjectives = objectives.filter(o => o.required);
    const completedRequired = requiredObjectives.filter(o => o.completed);
    
    if (completedRequired.length === requiredObjectives.length && gameState === 'playing') {
      setGameState('victory');
      addStatusMessage('🎉 Mission Complete! You survived!', 'success');
    }
  }, [player.position, aiXenomorphs, objectives, gameState, addStatusMessage]);

  // Keyboard controls
  useKeyboardShortcut('w', () => movePlayer('north'), { enabled: gameState === 'playing' });
  useKeyboardShortcut('s', () => movePlayer('south'), { enabled: gameState === 'playing' });
  useKeyboardShortcut('a', () => movePlayer('west'), { enabled: gameState === 'playing' });
  useKeyboardShortcut('d', () => movePlayer('east'), { enabled: gameState === 'playing' });
  useKeyboardShortcut('f', shootWeapon, { enabled: gameState === 'playing' });
  useKeyboardShortcut('r', reload, { enabled: gameState === 'playing' });
  useKeyboardShortcut('i', () => setShowInventory(!showInventory), { enabled: gameState === 'playing' });

  const renderGrid = () => {
    const cells = [];
    
    for (let row = 0; row < GAME_CONSTANTS.GRID_HEIGHT; row++) {
      for (let col = 0; col < GAME_CONSTANTS.GRID_WIDTH; col++) {
        const isPlayer = player.position.row === row && player.position.col === col;
        const facility = facilities.find(f => f.position.row === row && f.position.col === col);
        const xenomorph = aiXenomorphs.find(x => x.position.row === row && x.position.col === col);
        const objective = objectives.find(o => o.position?.row === row && o.position?.col === col);
        
        // Calculate visibility (flashlight range)
        const distance = Math.abs(row - player.position.row) + Math.abs(col - player.position.col);
        const isVisible = player.hasFlashlight && player.flashlightBattery > 0 ? 
                         distance <= 3 : distance <= 1;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`
              w-8 h-8 border border-slate-600 relative text-xs flex items-center justify-center
              transition-all duration-200
              ${isVisible ? 'bg-slate-800' : 'bg-black'}
              ${isPlayer ? 'ring-2 ring-green-400' : ''}
              ${objective && !objective.completed ? 'ring-2 ring-yellow-400' : ''}
            `}
          >
            {isVisible && (
              <>
                {isPlayer && (
                  <span className="text-green-400 font-bold">
                    {player.facing === 'north' ? '↑' : 
                     player.facing === 'south' ? '↓' :
                     player.facing === 'east' ? '→' : '←'}
                  </span>
                )}
                {facility && !isPlayer && (
                  <span className="text-blue-400">🏢</span>
                )}
                {xenomorph && !isPlayer && (
                  <PulseEffect pulse={xenomorph.isHunting} color="red">
                    <span className="text-red-400">👾</span>
                  </PulseEffect>
                )}
                {objective && !objective.completed && !isPlayer && (
                  <span className="text-yellow-400">⚡</span>
                )}
              </>
            )}
          </div>
        );
      }
    }
    
    return cells;
  };

  return (
    <ShakeEffect shake={isShaking}>
      <div className="space-y-4">
        {/* Alert Level */}
        <div className={`
          text-center p-2 rounded font-bold
          ${alertLevel === 'green' ? 'bg-green-400/20 text-green-400' :
            alertLevel === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
            'bg-red-400/20 text-red-400'}
        `}>
          🚨 ALERT LEVEL: {alertLevel.toUpperCase()}
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-900/80 border border-green-400/30 rounded p-2">
            <div className="text-green-400 font-semibold">Health</div>
            <div className={`text-lg ${player.health < 30 ? 'text-red-400' : 'text-green-400'}`}>
              {player.health}%
            </div>
          </div>
          <div className="bg-slate-900/80 border border-green-400/30 rounded p-2">
            <div className="text-green-400 font-semibold">Ammo</div>
            <div className={`text-lg ${player.ammo < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
              {player.ammo}/95
            </div>
          </div>
          <div className="bg-slate-900/80 border border-green-400/30 rounded p-2">
            <div className="text-green-400 font-semibold">Flashlight</div>
            <div className={`text-lg ${player.flashlightBattery < 20 ? 'text-red-400' : 'text-green-400'}`}>
              {Math.floor(player.flashlightBattery)}%
            </div>
          </div>
          <div className="bg-slate-900/80 border border-green-400/30 rounded p-2">
            <div className="text-green-400 font-semibold">Threats</div>
            <div className="text-lg text-red-400">
              {aiXenomorphs.length}
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold text-lg mb-4">Facility Layout</h3>
          <div 
            className="grid gap-0.5 mx-auto w-fit bg-slate-700 p-2 rounded"
            style={{ 
              gridTemplateColumns: `repeat(${GAME_CONSTANTS.GRID_WIDTH}, 1fr)`,
              gridTemplateRows: `repeat(${GAME_CONSTANTS.GRID_HEIGHT}, 1fr)`
            }}
          >
            {renderGrid()}
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold text-lg mb-4">Objectives</h3>
          <div className="space-y-2">
            {objectives.map(obj => (
              <div key={obj.id} className={`
                flex items-center gap-3 p-2 rounded
                ${obj.completed ? 'bg-green-400/20' : 'bg-slate-800'}
              `}>
                <span className={obj.completed ? 'text-green-400' : 'text-yellow-400'}>
                  {obj.completed ? '✅' : '📍'}
                </span>
                <div>
                  <div className={`font-semibold ${obj.completed ? 'text-green-400' : 'text-slate-300'}`}>
                    {obj.title}
                  </div>
                  <div className="text-sm text-slate-400">
                    {obj.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Help */}
        <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold text-lg mb-4">Controls</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-300">Movement: <kbd className="bg-slate-700 px-1 rounded">WASD</kbd></div>
              <div className="text-slate-300">Shoot: <kbd className="bg-slate-700 px-1 rounded">F</kbd></div>
            </div>
            <div>
              <div className="text-slate-300">Reload: <kbd className="bg-slate-700 px-1 rounded">R</kbd></div>
              <div className="text-slate-300">Inventory: <kbd className="bg-slate-700 px-1 rounded">I</kbd></div>
            </div>
          </div>
        </div>

        {/* Game Over/Victory Screen */}
        {(gameState === 'game-over' || gameState === 'victory') && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className={`
              bg-slate-900 border rounded-lg p-8 text-center max-w-md
              ${gameState === 'victory' ? 'border-green-400' : 'border-red-400'}
            `}>
              <h2 className={`text-2xl font-bold mb-4 ${
                gameState === 'victory' ? 'text-green-400' : 'text-red-400'
              }`}>
                {gameState === 'victory' ? '🎉 Mission Complete!' : '💀 Game Over'}
              </h2>
              <p className="text-slate-300 mb-6">
                {gameState === 'victory' 
                  ? 'You successfully completed all objectives and survived the horror!'
                  : 'You were eliminated by the xenomorph threat. Better luck next time!'
                }
              </p>
              <button
                onClick={() => {
                  setGameState('playing');
                  setPlayer({
                    position: { row: 0, col: 0 },
                    health: 100,
                    ammo: 95,
                    facing: 'north',
                    isReloading: false,
                    hasFlashlight: true,
                    flashlightBattery: 100
                  });
                  setObjectives(prev => prev.map(o => ({ ...o, completed: false })));
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
              >
                Restart Mission
              </button>
            </div>
          </div>
        )}

        <FloatingNumbersRenderer />
      </div>
    </ShakeEffect>
  );
}