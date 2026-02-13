import React, { useState, useRef } from "react";
import { useGameStore } from "../../stores/gameStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  researchTree,
  researchCategories,
  updateResearchAvailability,
  ResearchNode,
} from "../../data/researchTree";

interface ResearchTreeViewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResearchNodeComponentProps {
  node: ResearchNode;
  onNodeClick: (node: ResearchNode) => void;
}

function ResearchNodeComponent({
  node,
  onNodeClick,
}: ResearchNodeComponentProps) {
  const { research, resources } = useGameStore();

  const nodeState = research.researchTree[node.id] || {
    completed: false,
    inProgress: false,
    progress: 0,
  };

  const canAfford =
    resources.credits >= node.cost.credits &&
    resources.research >= node.cost.research;

  const isClickable =
    node.available &&
    !nodeState.completed &&
    !nodeState.inProgress &&
    canAfford;

  const getNodeStatus = () => {
    if (nodeState.completed) return "completed";
    if (nodeState.inProgress) return "in-progress";
    if (!node.available) return "locked";
    if (!canAfford) return "unaffordable";
    return "available";
  };

  const getNodeColor = () => {
    const status = getNodeStatus();
    switch (status) {
      case "completed":
        return "border-green-400 bg-green-400/20 text-green-400";
      case "in-progress":
        return "border-blue-400 bg-blue-400/20 text-blue-400 animate-pulse";
      case "available":
        return "border-yellow-400 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20";
      case "unaffordable":
        return "border-red-400/50 bg-red-400/5 text-red-400/70";
      case "locked":
        return "border-slate-600 bg-slate-800/50 text-slate-500";
      default:
        return "border-slate-600 bg-slate-800 text-slate-400";
    }
  };

  const categoryData = researchCategories[node.category];

  return (
    <div
      className={`
        absolute border-2 rounded-lg p-3 w-40 cursor-pointer transition-all duration-200
        ${getNodeColor()}
        ${isClickable ? "hover:scale-105 hover:shadow-lg" : ""}
      `}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
      }}
      onClick={() => isClickable && onNodeClick(node)}
    >
      {/* Node Icon */}
      <div className="text-center mb-2">
        <span className="text-2xl">
          {nodeState.completed ? "✅" : nodeState.inProgress ? "⏳" : node.icon}
        </span>
      </div>

      {/* Node Title */}
      <h4 className="font-bold text-sm text-center mb-1">{node.name}</h4>

      {/* Category Badge */}
      <div
        className={`text-xs px-2 py-1 rounded text-center mb-2 ${categoryData.bgColor} ${categoryData.color}`}
      >
        Tier {node.tier} • {categoryData.name}
      </div>

      {/* Progress Bar (if in progress) */}
      {nodeState.inProgress && (
        <div className="mb-2">
          <div className="w-full bg-slate-700 rounded-full h-1">
            <div
              className="bg-blue-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${nodeState.progress}%` }}
            />
          </div>
          <div className="text-xs text-center mt-1">
            {Math.round(nodeState.progress)}%
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>💰</span>
          <span
            className={
              resources.credits >= node.cost.credits
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {node.cost.credits.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>🔬</span>
          <span
            className={
              resources.research >= node.cost.research
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {node.cost.research}
          </span>
        </div>
        <div className="flex justify-between">
          <span>⏰</span>
          <span>{node.cost.time}h</span>
        </div>
      </div>
    </div>
  );
}

function ConnectionLine({
  from,
  to,
  completed,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  completed: boolean;
}) {
  const fromX = from.x + 80; // Half of node width
  const fromY = from.y + 60; // Rough center of node
  const toX = to.x + 80;
  const toY = to.y + 60;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: Math.min(fromX, toX) - 2,
        top: Math.min(fromY, toY) - 2,
        width: Math.abs(toX - fromX) + 4,
        height: Math.abs(toY - fromY) + 4,
      }}
    >
      <line
        x1={fromX > toX ? Math.abs(toX - fromX) : 0}
        y1={fromY > toY ? Math.abs(toY - fromY) : 0}
        x2={fromX > toX ? 0 : Math.abs(toX - fromX)}
        y2={fromY > toY ? 0 : Math.abs(toY - fromY)}
        stroke={completed ? "#10b981" : "#64748b"}
        strokeWidth="2"
        strokeDasharray={completed ? "none" : "5,5"}
        opacity={completed ? 1 : 0.5}
      />
    </svg>
  );
}

function ResearchNodeDetailModal({
  node,
  isOpen,
  onClose,
  onStart,
}: {
  node: ResearchNode | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}) {
  const { research, resources } = useGameStore();

  if (!node) return null;

  const nodeState = research.researchTree[node.id] || {
    completed: false,
    inProgress: false,
    progress: 0,
  };

  const canAfford =
    resources.credits >= node.cost.credits &&
    resources.research >= node.cost.research;

  const canStart =
    node.available &&
    !nodeState.completed &&
    !nodeState.inProgress &&
    canAfford;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Research: ${node.name}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <span className="text-4xl">{node.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-green-400">{node.name}</h3>
            <p className="text-slate-400">
              Tier {node.tier} • {researchCategories[node.category].name}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300">{node.description}</p>

        {/* Status */}
        <div className="bg-slate-800 rounded p-3">
          <h4 className="font-semibold mb-2">Status</h4>
          {nodeState.completed && (
            <span className="text-green-400">✅ Completed</span>
          )}
          {nodeState.inProgress && (
            <div>
              <span className="text-blue-400">⏳ In Progress</span>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${nodeState.progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {Math.round(nodeState.progress)}% complete
              </p>
            </div>
          )}
          {!nodeState.completed && !nodeState.inProgress && (
            <span
              className={node.available ? "text-yellow-400" : "text-slate-500"}
            >
              {node.available ? "🔓 Available" : "🔒 Locked"}
            </span>
          )}
        </div>

        {/* Requirements */}
        {node.prerequisites.length > 0 && (
          <div className="bg-slate-800 rounded p-3">
            <h4 className="font-semibold mb-2">Prerequisites</h4>
            <ul className="space-y-1">
              {node.prerequisites.map((prereqId) => {
                const prereqNode = researchTree.find((n) => n.id === prereqId);
                const prereqCompleted =
                  research.researchTree[prereqId]?.completed || false;
                return (
                  <li
                    key={prereqId}
                    className={`flex items-center gap-2 ${prereqCompleted ? "text-green-400" : "text-red-400"}`}
                  >
                    <span>{prereqCompleted ? "✅" : "❌"}</span>
                    <span>{prereqNode?.name || prereqId}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Cost */}
        <div className="bg-slate-800 rounded p-3">
          <h4 className="font-semibold mb-2">Research Cost</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl">💰</div>
              <div
                className={`font-bold ${resources.credits >= node.cost.credits ? "text-green-400" : "text-red-400"}`}
              >
                {node.cost.credits.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🔬</div>
              <div
                className={`font-bold ${resources.research >= node.cost.research ? "text-green-400" : "text-red-400"}`}
              >
                {node.cost.research}
              </div>
              <div className="text-xs text-slate-400">Research Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">⏰</div>
              <div className="font-bold text-blue-400">{node.cost.time}h</div>
              <div className="text-xs text-slate-400">Time Required</div>
            </div>
          </div>
        </div>

        {/* Unlocks */}
        <div className="bg-slate-800 rounded p-3">
          <h4 className="font-semibold mb-2">Unlocks</h4>
          <div className="space-y-2">
            {node.unlocks.species && node.unlocks.species.length > 0 && (
              <div>
                <span className="text-purple-400 font-medium">Species: </span>
                <span className="text-slate-300">
                  {node.unlocks.species.join(", ")}
                </span>
              </div>
            )}
            {node.unlocks.facilities && node.unlocks.facilities.length > 0 && (
              <div>
                <span className="text-orange-400 font-medium">
                  Facilities:{" "}
                </span>
                <span className="text-slate-300">
                  {node.unlocks.facilities.join(", ")}
                </span>
              </div>
            )}
            {node.unlocks.bonuses && node.unlocks.bonuses.length > 0 && (
              <div>
                <span className="text-green-400 font-medium">Bonuses:</span>
                <ul className="mt-1 space-y-1">
                  {node.unlocks.bonuses.map((bonus, index) => (
                    <li key={index} className="text-slate-300 text-sm">
                      • {bonus.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {canStart && (
            <Button onClick={onStart} variant="primary" className="flex-1">
              Start Research
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ResearchTreeView({ isOpen, onClose }: ResearchTreeViewProps) {
  const { research, startResearchNode } = useGameStore();
  const [selectedNode, setSelectedNode] = useState<ResearchNode | null>(null);
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update research tree with current progress
  const researchTree = updateResearchAvailability(
    researchTree.map((node) => ({
      ...node,
      completed: research.researchTree[node.id]?.completed || false,
      inProgress: research.researchTree[node.id]?.inProgress || false,
      progress: research.researchTree[node.id]?.progress || 0,
    })),
  );

  const handleNodeClick = (node: ResearchNode) => {
    setSelectedNode(node);
    setShowNodeDetail(true);
  };

  const handleStartResearch = () => {
    if (selectedNode) {
      startResearchNode(selectedNode.id);
      setShowNodeDetail(false);
      setSelectedNode(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - viewOffset.x,
        y: e.clientY - viewOffset.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render connection lines
  const renderConnections = () => {
    const connections = [];

    researchTree.forEach((node) => {
      node.prerequisites.forEach((prereqId) => {
        const prereqNode = researchTree.find((n) => n.id === prereqId);
        if (prereqNode) {
          const isCompleted =
            research.researchTree[prereqId]?.completed || false;
          connections.push(
            <ConnectionLine
              key={`${prereqId}-${node.id}`}
              from={prereqNode.position}
              to={node.position}
              completed={isCompleted}
            />,
          );
        }
      });
    });

    return connections;
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="🔬 Research Tree">
        <div className="h-96 relative">
          {/* Instructions */}
          <div className="mb-4 p-3 bg-slate-800 rounded text-sm">
            <p className="text-slate-300">
              Click nodes to view details and start research. Drag to pan the
              view.
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-green-400 bg-green-400/20 rounded"></div>
                Completed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-blue-400 bg-blue-400/20 rounded"></div>
                In Progress
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-yellow-400 bg-yellow-400/10 rounded"></div>
                Available
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-slate-600 bg-slate-800 rounded"></div>
                Locked
              </span>
            </div>
          </div>

          {/* Tree Container */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-hidden border border-slate-600 rounded bg-slate-900 relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative"
              style={{
                transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
                width: "1200px",
                height: "1200px",
              }}
            >
              {/* Connection Lines */}
              {renderConnections()}

              {/* Research Nodes */}
              {researchTree.map((node) => (
                <ResearchNodeComponent
                  key={node.id}
                  node={node}
                  onNodeClick={handleNodeClick}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Node Detail Modal */}
      <ResearchNodeDetailModal
        node={selectedNode}
        isOpen={showNodeDetail}
        onClose={() => {
          setShowNodeDetail(false);
          setSelectedNode(null);
        }}
        onStart={handleStartResearch}
      />
    </>
  );
}
