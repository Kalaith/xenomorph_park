import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AnimatedProgressBar } from '../ui/VisualFeedback';
import { XenomorphSpecies } from '../../types';

interface ResearchNode {
  id: string;
  species: XenomorphSpecies;
  x: number;
  y: number;
  prerequisites: string[];
  unlocks: string[];
}

interface ResearchTreeProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEARCH_NODES: ResearchNode[] = [
  {
    id: 'Drone',
    species: {
      name: 'Drone',
      description: 'Basic worker xenomorph, birthed from human hosts',
      dangerLevel: 3,
      containmentDifficulty: 2,
      researchCost: 0, // Starting species
      foodRequirement: 'Low',
      specialAbilities: ['Hive construction', 'Basic hunting']
    },
    x: 50,
    y: 300,
    prerequisites: [],
    unlocks: ['Warrior', 'Runner']
  },
  {
    id: 'Warrior',
    species: {
      name: 'Warrior',
      description: 'Combat-focused xenomorph with ridged skull',
      dangerLevel: 4,
      containmentDifficulty: 3,
      researchCost: 250,
      foodRequirement: 'Medium',
      specialAbilities: ['Pack hunting', 'Stealth tactics']
    },
    x: 200,
    y: 200,
    prerequisites: ['Drone'],
    unlocks: ['Praetorian']
  },
  {
    id: 'Runner',
    species: {
      name: 'Runner',
      description: 'Quadrupedal xenomorph birthed from animal hosts',
      dangerLevel: 4,
      containmentDifficulty: 4,
      researchCost: 300,
      foodRequirement: 'Medium',
      specialAbilities: ['High speed', 'Wall climbing']
    },
    x: 200,
    y: 400,
    prerequisites: ['Drone'],
    unlocks: ['Predalien']
  },
  {
    id: 'Praetorian',
    species: {
      name: 'Praetorian',
      description: 'Large defensive xenomorph protecting the queen',
      dangerLevel: 5,
      containmentDifficulty: 5,
      researchCost: 500,
      foodRequirement: 'High',
      specialAbilities: ['Heavy armor', 'Area denial']
    },
    x: 350,
    y: 150,
    prerequisites: ['Warrior'],
    unlocks: ['Queen']
  },
  {
    id: 'Predalien',
    species: {
      name: 'Predalien',
      description: 'Rare hybrid born from Predator host',
      dangerLevel: 6,
      containmentDifficulty: 6,
      researchCost: 1000,
      foodRequirement: 'Very High',
      specialAbilities: ['Royal jelly production', 'Advanced intelligence']
    },
    x: 350,
    y: 450,
    prerequisites: ['Runner'],
    unlocks: ['Queen']
  },
  {
    id: 'Queen',
    species: {
      name: 'Queen',
      description: 'The ultimate xenomorph matriarch capable of laying eggs',
      dangerLevel: 8,
      containmentDifficulty: 8,
      researchCost: 2000,
      foodRequirement: 'Very High',
      specialAbilities: ['Egg laying', 'Hive mind control', 'Massive size', 'Acid spray']
    },
    x: 500,
    y: 300,
    prerequisites: ['Praetorian', 'Predalien'],
    unlocks: []
  }
];

export function ResearchTree({ isOpen, onClose }: ResearchTreeProps) {
  const { 
    research, 
    resources, 
    startResearch, 
    completeResearch,
    updateResources,
    addStatusMessage 
  } = useGameStore();

  const [selectedNode, setSelectedNode] = useState<ResearchNode | null>(null);
  const [researchProgress, setResearchProgress] = useState<Record<string, number>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Research progress simulation
  useEffect(() => {
    if (!research.inProgress) return;

    const interval = setInterval(() => {
      setResearchProgress(prev => {
        const current = prev[research.inProgress!] || 0;
        const newProgress = current + Math.random() * 5 + 2; // 2-7% per second
        
        if (newProgress >= 100) {
          completeResearch(research.inProgress!);
          addStatusMessage(`Research completed: ${research.inProgress}!`, 'success');
          return { ...prev, [research.inProgress!]: 100 };
        }
        
        return { ...prev, [research.inProgress!]: newProgress };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [research.inProgress, completeResearch, addStatusMessage]);

  const getNodeStatus = (node: ResearchNode) => {
    if (research.completed.includes(node.id)) return 'completed';
    if (research.inProgress === node.id) return 'in-progress';
    
    // Check if prerequisites are met
    const prereqsMet = node.prerequisites.every(prereq => 
      research.completed.includes(prereq)
    );
    
    if (prereqsMet) return 'available';
    return 'locked';
  };

  const getNodeColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          fill: '#10b981',
          stroke: '#059669',
          text: '#ffffff'
        };
      case 'in-progress':
        return {
          fill: '#3b82f6',
          stroke: '#2563eb',
          text: '#ffffff'
        };
      case 'available':
        return {
          fill: '#1f2937',
          stroke: '#10b981',
          text: '#10b981'
        };
      default: // locked
        return {
          fill: '#374151',
          stroke: '#6b7280',
          text: '#9ca3af'
        };
    }
  };

  const canStartResearch = (node: ResearchNode) => {
    const status = getNodeStatus(node);
    return status === 'available' && 
           !research.inProgress && 
           resources.research >= node.species.researchCost;
  };

  const handleNodeClick = (node: ResearchNode) => {
    setSelectedNode(node);
  };

  const handleStartResearch = (node: ResearchNode) => {
    if (!canStartResearch(node)) return;

    updateResources({ research: resources.research - node.species.researchCost });
    startResearch(node.id);
    setResearchProgress(prev => ({ ...prev, [node.id]: 0 }));
    addStatusMessage(`Started researching ${node.species.name}`, 'info');
    setSelectedNode(null);
  };

  const renderConnections = () => {
    return RESEARCH_NODES.map(node => 
      node.unlocks.map(unlock => {
        const targetNode = RESEARCH_NODES.find(n => n.id === unlock);
        if (!targetNode) return null;

        const sourceStatus = getNodeStatus(node);
        const isActive = sourceStatus === 'completed' || sourceStatus === 'in-progress';

        return (
          <line
            key={`${node.id}-${unlock}`}
            x1={node.x + 40}
            y1={node.y + 40}
            x2={targetNode.x + 40}
            y2={targetNode.y + 40}
            stroke={isActive ? '#10b981' : '#6b7280'}
            strokeWidth="2"
            strokeDasharray={isActive ? '0' : '5,5'}
            className="transition-all duration-300"
          />
        );
      })
    ).filter(Boolean);
  };

  const renderNodes = () => {
    return RESEARCH_NODES.map(node => {
      const status = getNodeStatus(node);
      const colors = getNodeColors(status);
      const progress = researchProgress[node.id] || 0;
      const isHovered = hoveredNode === node.id;

      return (
        <g key={node.id}>
          {/* Node circle */}
          <circle
            cx={node.x + 40}
            cy={node.y + 40}
            r={isHovered ? 42 : 40}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="3"
            className="cursor-pointer transition-all duration-200"
            onClick={() => handleNodeClick(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
          
          {/* Progress ring for in-progress research */}
          {status === 'in-progress' && (
            <circle
              cx={node.x + 40}
              cy={node.y + 40}
              r={35}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray={`${(progress / 100) * 220} 220`}
              strokeLinecap="round"
              transform={`rotate(-90 ${node.x + 40} ${node.y + 40})`}
              className="transition-all duration-300"
            />
          )}
          
          {/* Species icon */}
          <text
            x={node.x + 40}
            y={node.y + 35}
            textAnchor="middle"
            fill={colors.text}
            fontSize="20"
            className="pointer-events-none select-none"
          >
            {getSpeciesIcon(node.species.name)}
          </text>
          
          {/* Species name */}
          <text
            x={node.x + 40}
            y={node.y + 52}
            textAnchor="middle"
            fill={colors.text}
            fontSize="10"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {node.species.name}
          </text>
          
          {/* Research cost */}
          {status === 'available' && (
            <text
              x={node.x + 40}
              y={node.y + 100}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="10"
              className="pointer-events-none select-none"
            >
              🔬 {node.species.researchCost}
            </text>
          )}
          
          {/* Progress percentage */}
          {status === 'in-progress' && (
            <text
              x={node.x + 40}
              y={node.y + 100}
              textAnchor="middle"
              fill="#3b82f6"
              fontSize="12"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {Math.floor(progress)}%
            </text>
          )}
          
          {/* Completion checkmark */}
          {status === 'completed' && (
            <text
              x={node.x + 40}
              y={node.y + 100}
              textAnchor="middle"
              fill="#10b981"
              fontSize="16"
              className="pointer-events-none select-none"
            >
              ✓
            </text>
          )}
        </g>
      );
    });
  };

  const getSpeciesIcon = (speciesName: string) => {
    const icons: Record<string, string> = {
      'Drone': '👾',
      'Warrior': '👹',
      'Runner': '🐺',
      'Praetorian': '🦖',
      'Predalien': '👑',
      'Queen': '👸'
    };
    return icons[speciesName] || '👾';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔬 Research Tree">
      <div className="min-h-[600px]">
        {/* Research Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded p-3">
            <div className="text-sm text-slate-400">Research Points</div>
            <div className="text-xl font-bold text-blue-400">
              {resources.research}
            </div>
          </div>
          <div className="bg-slate-800 rounded p-3">
            <div className="text-sm text-slate-400">Completed</div>
            <div className="text-xl font-bold text-green-400">
              {research.completed.length}
            </div>
          </div>
          <div className="bg-slate-800 rounded p-3">
            <div className="text-sm text-slate-400">In Progress</div>
            <div className="text-xl font-bold text-yellow-400">
              {research.inProgress || 'None'}
            </div>
          </div>
        </div>

        {/* Research Tree Visualization */}
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <h3 className="text-green-400 font-bold mb-4">Species Research Tree</h3>
          <div className="overflow-auto">
            <svg
              ref={svgRef}
              width="600"
              height="600"
              viewBox="0 0 600 600"
              className="border border-slate-600 rounded bg-slate-800"
            >
              {renderConnections()}
              {renderNodes()}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-700 border border-green-400"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span>Locked</span>
          </div>
        </div>

        {/* Current Research Progress */}
        {research.inProgress && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h4 className="text-blue-400 font-semibold mb-2">
              Researching: {research.inProgress}
            </h4>
            <AnimatedProgressBar
              value={researchProgress[research.inProgress] || 0}
              max={100}
              color="blue"
              label="Progress"
              showPercentage={true}
            />
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getSpeciesIcon(selectedNode.species.name)}</span>
              <div>
                <h4 className="text-green-400 font-bold text-lg">
                  {selectedNode.species.name}
                </h4>
                <p className="text-slate-400 text-sm">
                  {selectedNode.species.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-slate-400">Danger Level</div>
                <div className="text-red-400 font-semibold">
                  {selectedNode.species.dangerLevel}/10
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Containment Difficulty</div>
                <div className="text-yellow-400 font-semibold">
                  {selectedNode.species.containmentDifficulty}/10
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Food Requirement</div>
                <div className="text-blue-400 font-semibold">
                  {selectedNode.species.foodRequirement}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Research Cost</div>
                <div className="text-purple-400 font-semibold">
                  🔬 {selectedNode.species.researchCost}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Special Abilities</div>
              <div className="flex flex-wrap gap-2">
                {selectedNode.species.specialAbilities.map((ability, index) => (
                  <span
                    key={index}
                    className="bg-slate-700 text-green-400 px-2 py-1 rounded text-xs"
                  >
                    {ability}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleStartResearch(selectedNode)}
                disabled={!canStartResearch(selectedNode)}
              >
                {canStartResearch(selectedNode) ? 'Start Research' : 'Cannot Research'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedNode(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}