import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONSTANTS } from '../../constants/gameConstants';
import { GridPosition } from '../../types';
import { ContextMenu } from '../ui/ContextMenu';
import { Tooltip, TooltipContent } from '../ui/Tooltip';
import { useFloatingTextContext } from '../../contexts/FloatingTextContext';

export function GameGrid() {
  const {
    facilities,
    xenomorphs,
    selectedFacility,
    selectedSpecies,
    placeFacility,
    placeXenomorph,
    removeFacility,
    removeXenomorph,
    addStatusMessage
  } = useGameStore();

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{type: 'facility' | 'xenomorph', data: any} | null>(null);
  const [dragPreview, setDragPreview] = useState<GridPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    target: { type: 'facility' | 'xenomorph'; data: any } | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
  });

  // Grid helper state
  const [showGridHelpers, setShowGridHelpers] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<GridPosition | null>(null);

  // Camera controls state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const gridWidth = GAME_CONSTANTS.GRID_WIDTH;
  const gridHeight = GAME_CONSTANTS.GRID_HEIGHT;

  // Floating text for visual feedback
  const { addResourceChange, addFloatingText } = useFloatingTextContext();

  // Camera controls
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(MAX_ZOOM, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(MIN_ZOOM, prev - 0.25));
  };

  const handleResetCamera = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomToFit = () => {
    if (!gridRef.current) return;

    const container = gridRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate optimal zoom to fit the grid within the container
    const cellSize = 48; // w-12 h-12 = 48px
    const gapSize = 2; // gap-0.5 = 2px
    const padding = 16; // p-2 = 8px on each side = 16px total

    const gridTotalWidth = (gridWidth * cellSize) + ((gridWidth - 1) * gapSize) + padding;
    const gridTotalHeight = (gridHeight * cellSize) + ((gridHeight - 1) * gapSize) + padding;

    const scaleX = (containerRect.width * 0.9) / gridTotalWidth;
    const scaleY = (containerRect.height * 0.9) / gridTotalHeight;
    const optimalZoom = Math.min(scaleX, scaleY, MAX_ZOOM);

    setZoomLevel(Math.max(MIN_ZOOM, optimalZoom));
    setPanOffset({ x: 0, y: 0 });
  };

  // Wheel zoom disabled - use manual zoom controls only

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left click
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      e.stopPropagation();
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Get grid position from mouse coordinates (accounting for zoom and pan)
  const getGridPosition = useCallback((clientX: number, clientY: number): GridPosition | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();

    // Account for zoom and pan - transform coordinates back to grid space
    const container = gridRef.current.parentElement;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const x = (clientX - containerRect.left - panOffset.x) / zoomLevel;
    const y = (clientY - containerRect.top - panOffset.y) / zoomLevel;

    // Cell size is fixed at 48px (12 * 4 from w-12 h-12) plus 2px gap
    const cellSize = 48;
    const gapSize = 2;
    const gridPadding = 8; // p-2 = 8px padding

    const col = Math.floor((x - gridPadding) / (cellSize + gapSize));
    const row = Math.floor((y - gridPadding) / (cellSize + gapSize));

    if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
      return { row, col };
    }

    return null;
  }, [gridWidth, gridHeight, zoomLevel, panOffset]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'facility' | 'xenomorph', data: any) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ type, data });
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const position = getGridPosition(e.clientX, e.clientY);
    if (position && !isPositionOccupied(position.row, position.col)) {
      setDragPreview(position);
    } else {
      setDragPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const position = getGridPosition(e.clientX, e.clientY);

    if (position && draggedItem && !isPositionOccupied(position.row, position.col)) {
      if (draggedItem.type === 'facility') {
        placeFacility(draggedItem.data, position);
      } else if (draggedItem.type === 'xenomorph') {
        placeXenomorph(draggedItem.data, position);
      }
    }

    setDraggedItem(null);
    setDragPreview(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragPreview(null);
    setIsDragging(false);
  };

  const isPositionOccupied = (row: number, col: number) => {
    return facilities.some(f => f.position.row === row && f.position.col === col) ||
           xenomorphs.some(x => x.position.row === row && x.position.col === col);
  };

  // Grid helper functions
  const showAlignmentLines = (row: number, col: number) => {
    if (!showGridHelpers || (!selectedFacility && !selectedSpecies)) return false;

    // Show alignment lines when hovering over cells adjacent to existing items
    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    return adjacentPositions.some(pos =>
      pos.row >= 0 && pos.row < gridHeight &&
      pos.col >= 0 && pos.col < gridWidth &&
      isPositionOccupied(pos.row, pos.col)
    );
  };

  const getGridLineClasses = (row: number, col: number) => {
    if (!showGridHelpers || !hoveredCell || (!selectedFacility && !selectedSpecies)) return '';

    let classes = '';

    // Show row alignment
    if (hoveredCell.row === row) {
      classes += ' bg-green-400/5 ';
    }

    // Show column alignment
    if (hoveredCell.col === col) {
      classes += ' bg-green-400/5 ';
    }

    return classes;
  };

  const handleCellClick = (row: number, col: number) => {
    const position: GridPosition = { row, col };

    if (selectedFacility) {
      placeFacility(selectedFacility, position);

      // Show simple floating text
      addFloatingText(
        `${selectedFacility.name} Built! (-$${selectedFacility.cost})`,
        { x: window.innerWidth / 2, y: 100 },
        'text-green-400',
        1500,
        'sm'
      );
    } else if (selectedSpecies) {
      placeXenomorph(selectedSpecies, position);

      // Show simple floating text
      addFloatingText(
        `${selectedSpecies.name} Placed!`,
        { x: window.innerWidth / 2, y: 100 },
        'text-red-400',
        1500,
        'sm'
      );
    }
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();

    const cellContent = getCellContent(row, col);
    if (cellContent.type === 'empty') {
      setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, target: null });
      return;
    }

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      target: {
        type: cellContent.type as 'facility' | 'xenomorph',
        data: cellContent.content,
      },
    });
  };

  const getContextMenuItems = () => {
    if (!contextMenu.target) return [];

    const { type, data } = contextMenu.target;

    if (type === 'facility') {
      return [
        {
          id: 'inspect',
          label: 'Inspect Facility',
          icon: '🔍',
          action: () => {
            addStatusMessage(`Inspecting ${data.name}`, 'info');
          },
        },
        {
          id: 'upgrade',
          label: 'Upgrade Facility',
          icon: '⬆️',
          action: () => {
            addStatusMessage(`Upgrade feature coming soon for ${data.name}`, 'info');
          },
          disabled: true,
        },
        {
          id: 'move',
          label: 'Move Facility',
          icon: '🚚',
          action: () => {
            addStatusMessage(`Drag to move ${data.name}`, 'info');
          },
        },
        {
          id: 'remove',
          label: 'Remove Facility',
          icon: '🗑️',
          action: () => {
            if (confirm(`Remove ${data.name}? You'll get 50% refund.`)) {
              const refund = Math.floor(data.cost * 0.5);
              removeFacility(data.id);
              addStatusMessage(`${data.name} removed`, 'success');

              // Show floating text for refund
              addFloatingText(
                `${data.name} Removed (+$${refund})`,
                { x: window.innerWidth / 2, y: 100 },
                'text-orange-400',
                1500,
                'sm'
              );
            }
          },
          destructive: true,
        },
      ];
    } else if (type === 'xenomorph') {
      return [
        {
          id: 'inspect',
          label: 'Inspect Xenomorph',
          icon: '🔍',
          action: () => {
            addStatusMessage(`Inspecting ${data.species.name}`, 'info');
          },
        },
        {
          id: 'move',
          label: 'Move Xenomorph',
          icon: '🚚',
          action: () => {
            addStatusMessage(`Drag to move ${data.species.name}`, 'info');
          },
        },
        {
          id: 'contain',
          label: 'Increase Containment',
          icon: '🔒',
          action: () => {
            addStatusMessage(`Containment upgrade coming soon`, 'info');
          },
          disabled: true,
        },
        {
          id: 'remove',
          label: 'Remove Xenomorph',
          icon: '🗑️',
          action: () => {
            if (confirm(`Remove ${data.species.name}?`)) {
              removeXenomorph(data.id);
              addStatusMessage(`${data.species.name} removed`, 'success');
            }
          },
          destructive: true,
        },
      ];
    }

    return [];
  };

  const getFacilityTooltipContent = (facility: any) => {
    const stats = [
      { label: 'Cost', value: `$${facility.cost}`, color: 'text-yellow-400' },
      { label: 'Power Required', value: `${facility.powerRequirement}`, color: 'text-blue-400' },
      { label: 'Position', value: `(${facility.position.row}, ${facility.position.col})` },
    ];

    if (facility.name === 'Power Generator') {
      stats.push({ label: 'Power Generated', value: '+10', color: 'text-green-400' });
    }

    const actions = [
      { label: 'Right-click for options', shortcut: 'Right Click' },
      { label: 'Drag to move' },
    ];

    return (
      <TooltipContent
        title={facility.name}
        description={facility.description}
        stats={stats}
        actions={actions}
      />
    );
  };

  const getXenomorphTooltipContent = (xenomorph: any) => {
    const stats = [
      { label: 'Species', value: xenomorph.species.name, color: 'text-red-400' },
      { label: 'Containment Level', value: `${xenomorph.containmentLevel}/10`, color: 'text-orange-400' },
      { label: 'Difficulty', value: `${xenomorph.species.containmentDifficulty}/10`, color: 'text-red-400' },
      { label: 'Position', value: `(${xenomorph.position.row}, ${xenomorph.position.col})` },
    ];

    const actions = [
      { label: 'Right-click for options', shortcut: 'Right Click' },
      { label: 'Drag to move' },
    ];

    return (
      <TooltipContent
        title={`${xenomorph.species.name} Xenomorph`}
        description={xenomorph.species.description}
        stats={stats}
        actions={actions}
      />
    );
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
        const isPreview = dragPreview && dragPreview.row === row && dragPreview.col === col;
        const showPlacementPreview = (selectedFacility || selectedSpecies) && !isOccupied;
        const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
        const showAlignment = showAlignmentLines(row, col);
        const gridLineClasses = getGridLineClasses(row, col);

        cells.push(
          <button
            key={`${row}-${col}`}
            onClick={() => handleCellClick(row, col)}
            onContextMenu={(e) => handleRightClick(e, row, col)}
            onMouseEnter={() => setHoveredCell({ row, col })}
            onMouseLeave={() => setHoveredCell(null)}
            className={`
              w-12 h-12 border border-slate-600 transition-all duration-200 text-base relative
              ${isOccupied
                ? 'bg-slate-700 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 hover:border-green-400/50'
              }
              ${showPlacementPreview
                ? 'hover:bg-green-400/20 cursor-pointer'
                : ''
              }
              ${isPreview
                ? 'bg-green-400/30 border-green-400 ring-1 ring-green-400/50'
                : ''
              }
              ${isHovered && showPlacementPreview
                ? 'ring-2 ring-green-400/30 border-green-400/70'
                : ''
              }
              ${showAlignment && showPlacementPreview
                ? 'border-blue-400/50'
                : ''
              }
              ${gridLineClasses}
            `}
            disabled={isOccupied && !contextMenu.isOpen}
          >
            {/* Regular content */}
            {cellContent.type === 'facility' && cellContent.content && 'name' in cellContent.content && (
              <Tooltip
                content={getFacilityTooltipContent(cellContent.content)}
                rich={true}
                position="auto"
                delay={300}
              >
                <span
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'facility', cellContent.content)}
                  className="cursor-move block"
                >
                  {getFacilityIcon(cellContent.content.name)}
                </span>
              </Tooltip>
            )}
            {cellContent.type === 'xenomorph' && cellContent.content && 'species' in cellContent.content && (
              <Tooltip
                content={getXenomorphTooltipContent(cellContent.content)}
                rich={true}
                position="auto"
                delay={300}
              >
                <span
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'xenomorph', cellContent.content)}
                  className="cursor-move block"
                >
                  {getSpeciesIcon(cellContent.content.species.name)}
                </span>
              </Tooltip>
            )}

            {/* Drag preview content */}
            {isPreview && draggedItem && (
              <span className="opacity-70 animate-pulse">
                {draggedItem.type === 'facility'
                  ? getFacilityIcon(draggedItem.data.name)
                  : getSpeciesIcon(draggedItem.data.species?.name || draggedItem.data.name)
                }
              </span>
            )}

            {/* Grid snap indicators */}
            {showPlacementPreview && !isPreview && (
              <div className="absolute inset-0 bg-green-400/10 border border-green-400/30 rounded-sm pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-400/50 rounded-full"></div>
              </div>
            )}
          </button>
        );
      }
    }

    return cells;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-green-400/20">
        <h3 className="text-green-400 font-bold text-lg glow">Park Layout</h3>
        <div className="flex items-center gap-2">
          {/* Camera Controls */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              className="text-xs px-2 py-1 rounded transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out (Use zoom buttons - scroll wheel disabled)"
            >
              🔍➖
            </button>
            <span className="text-xs text-slate-400 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              className="text-xs px-2 py-1 rounded transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In (Use zoom buttons - scroll wheel disabled)"
            >
              🔍➕
            </button>
            <button
              onClick={handleResetCamera}
              className="text-xs px-2 py-1 rounded transition-colors hover:bg-slate-700"
              title="Reset Camera (100% zoom, center view)"
            >
              🎯
            </button>
            <button
              onClick={handleZoomToFit}
              className="text-xs px-2 py-1 rounded transition-colors hover:bg-slate-700"
              title="Fit grid to screen"
            >
              📐
            </button>
          </div>

          <button
            onClick={() => setShowGridHelpers(!showGridHelpers)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showGridHelpers
                ? 'bg-green-400/20 text-green-400 border border-green-400/50'
                : 'bg-slate-700 text-slate-400 border border-slate-600'
            }`}
            title="Toggle grid alignment helpers"
          >
            📐 Grid Helpers
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden bg-slate-800 relative"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={(e) => {
          // Prevent wheel events from affecting zoom or page scroll
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handlePanStart(e);
        }}
        onMouseMove={(e) => {
          e.stopPropagation();
          handlePanMove(e);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlePanEnd();
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          handlePanEnd();
        }}
      >
        <div
          ref={gridRef}
          className={`grid gap-0.5 w-fit bg-slate-700 p-2 rounded transition-transform duration-100 ${
            isDragging ? 'ring-2 ring-green-400/50' : ''
          }`}
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
            gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
            margin: 'auto'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        >
          {renderGrid()}
        </div>
      </div>
      <div className="px-4 py-2 border-t border-green-400/20 bg-slate-900/50">
        {selectedFacility && (
          <p className="text-green-400 text-sm">
            📍 Click on the grid to place: {selectedFacility.name}
          </p>
        )}
        {selectedSpecies && (
          <p className="text-green-400 text-sm">
            📍 Click on the grid to place: {selectedSpecies.name}
          </p>
        )}
        {!selectedFacility && !selectedSpecies && !isDragging && (
          <p className="text-slate-400 text-sm">
            Select a facility or species from the tabs below to place on the grid
          </p>
        )}
        {isDragging && (
          <p className="text-blue-400 animate-pulse text-sm">
            🚀 Dragging... Drop on a free cell to place
          </p>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={getContextMenuItems()}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, target: null })}
      />
    </div>
  );
}
