import { useGameStore } from '../../stores/gameStore';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { GridPosition } from '../../types';

export function GameGrid() {
  const { 
    facilities, 
    xenomorphs, 
    selectedFacility, 
    selectedSpecies, 
    placeFacility, 
    placeXenomorph 
  } = useGameStore();

  const gridWidth = GAME_CONSTANTS.GRID_WIDTH;
  const gridHeight = GAME_CONSTANTS.GRID_HEIGHT;

  const handleCellClick = (row: number, col: number) => {
    const position: GridPosition = { row, col };
    
    if (selectedFacility) {
      placeFacility(selectedFacility, position);
    } else if (selectedSpecies) {
      placeXenomorph(selectedSpecies, position);
    }
  };

  const getCellContent = (row: number, col: number) => {
    const facility = facilities.find(f => f.position.row === row && f.position.col === col);
    const xenomorph = xenomorphs.find(x => x.position.row === row && x.position.col === col);
    
    if (facility) {
      return { type: 'facility', content: facility };
    }
    if (xenomorph) {
      return { type: 'xenomorph', content: xenomorph };
    }
    return { type: 'empty', content: null };
  };

  const getFacilityIcon = (facilityName: string) => {
    const icons: Record<string, string> = {
      'Research Lab': '🔬',
      'Hatchery': '🥚',
      'Containment Unit': '🏢',
      'Visitor Center': '🏛️',
      'Security Station': '🛡️',
      'Power Generator': '⚡',
    };
    return icons[facilityName] || '🏗️';
  };

  const getSpeciesIcon = (speciesName: string) => {
    const icons: Record<string, string> = {
      'Drone': '👾',
      'Warrior': '👹',
      'Runner': '🐺',
      'Praetorian': '🦖',
      'Predalien': '👑',
      'Queen': '👸',
      'Facehugger': '🕷️',
      'Chestburster': '🐛',
      'Crusher': '🦏',
      'Spitter': '🐍',
      'Lurker': '🦎',
      'Boiler': '💥',
      'Neomorph': '🧬',
      'Deacon': '👺',
    };
    return icons[speciesName] || '👾';
  };

  const renderGrid = () => {
    const cells = [];
    
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const cellContent = getCellContent(row, col);
        const isOccupied = cellContent.type !== 'empty';
        
        cells.push(
          <button
            key={`${row}-${col}`}
            onClick={() => handleCellClick(row, col)}
            className={`
              w-8 h-8 border border-slate-600 transition-all duration-200 text-xs
              ${isOccupied 
                ? 'bg-slate-700 cursor-default' 
                : 'bg-slate-800 hover:bg-slate-700 hover:border-green-400/50'
              }
              ${(selectedFacility || selectedSpecies) && !isOccupied 
                ? 'hover:bg-green-400/20 cursor-pointer' 
                : ''
              }
            `}
            disabled={isOccupied}
          >
            {cellContent.type === 'facility' && cellContent.content && 'name' in cellContent.content && (
              <span title={cellContent.content.name}>
                {getFacilityIcon(cellContent.content.name)}
              </span>
            )}
            {cellContent.type === 'xenomorph' && cellContent.content && 'species' in cellContent.content && (
              <span title={cellContent.content.species.name}>
                {getSpeciesIcon(cellContent.content.species.name)}
              </span>
            )}
          </button>
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4">
      <h3 className="text-green-400 font-bold text-lg mb-4 glow">Park Layout</h3>
      <div 
        className="grid gap-0.5 mx-auto w-fit bg-slate-700 p-2 rounded"
        style={{ 
          gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
          gridTemplateRows: `repeat(${gridHeight}, 1fr)`
        }}
      >
        {renderGrid()}
      </div>
      <div className="mt-4 text-sm text-slate-400">
        {selectedFacility && (
          <p className="text-green-400">
            📍 Click on the grid to place: {selectedFacility.name}
          </p>
        )}
        {selectedSpecies && (
          <p className="text-green-400">
            📍 Click on the grid to place: {selectedSpecies.name}
          </p>
        )}
        {!selectedFacility && !selectedSpecies && (
          <p>Select a facility or species to place on the grid</p>
        )}
      </div>
    </div>
  );
}
