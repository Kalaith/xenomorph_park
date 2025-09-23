import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SECURITY_COLORS } from '../../constants/gameConstants';
import { Tooltip, TooltipContent } from './Tooltip';
import { Button } from './Button';

type ViewMode = 'compact' | 'detailed' | 'trends';

export function SmartResourceDisplay() {
  const { resources } = useGameStore();
  const [viewMode, setViewMode] = useState<ViewMode>('compact');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const netIncome = resources.dailyRevenue - resources.dailyExpenses;
  const powerUtilization = Math.round((resources.power / resources.maxPower) * 100);
  const visitorCapacity = Math.round((resources.visitors / resources.maxVisitors) * 100);

  return (
    <div className="bg-slate-900/95 border border-green-400/30 rounded-lg">
      {/* Header with view mode selector */}
      <div className="flex items-center justify-between p-3 border-b border-green-400/20">
        <h3 className="text-green-400 font-bold glow">Resources</h3>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'compact' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            📊 Compact
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
            className="text-xs"
          >
            📋 Detailed
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('trends')}
            className="text-xs"
          >
            📈 Trends
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-3">
        {viewMode === 'compact' && <CompactView resources={resources} formatNumber={formatNumber} />}
        {viewMode === 'detailed' && <DetailedView resources={resources} formatNumber={formatNumber} />}
        {viewMode === 'trends' && <TrendsView resources={resources} formatNumber={formatNumber} />}
      </div>
    </div>
  );
}

function CompactView({ resources, formatNumber }: any) {
  const netIncome = resources.dailyRevenue - resources.dailyExpenses;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Credits - Most important */}
      <Tooltip
        content="Primary currency for building and upgrades"
        position="auto"
      >
        <div className="text-center p-2 bg-slate-800/50 rounded cursor-help">
          <div className="text-green-400 text-2xl">💰</div>
          <div className="text-white font-bold">{formatNumber(resources.credits)}</div>
          <div className="text-xs text-slate-400">Credits</div>
        </div>
      </Tooltip>

      {/* Power - Critical resource */}
      <Tooltip
        content={`Power usage: ${resources.power}/${resources.maxPower}`}
        position="auto"
      >
        <div className="text-center p-2 bg-slate-800/50 rounded cursor-help">
          <div className="text-yellow-400 text-2xl">⚡</div>
          <div className="text-white font-bold">{resources.power}/{resources.maxPower}</div>
          <div className="text-xs text-slate-400">Power</div>
        </div>
      </Tooltip>

      {/* Daily P&L - Performance indicator */}
      <Tooltip
        content={`Revenue: +${formatNumber(resources.dailyRevenue)} | Expenses: -${formatNumber(resources.dailyExpenses)}`}
        position="auto"
      >
        <div className="text-center p-2 bg-slate-800/50 rounded cursor-help">
          <div className="text-cyan-400 text-2xl">📊</div>
          <div className={`font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatNumber(netIncome)}
          </div>
          <div className="text-xs text-slate-400">Daily P&L</div>
        </div>
      </Tooltip>
    </div>
  );
}

function DetailedView({ resources, formatNumber }: any) {
  const netIncome = resources.dailyRevenue - resources.dailyExpenses;

  return (
    <div className="space-y-3">
      {/* Financial Overview */}
      <div className="bg-slate-800/30 rounded p-3">
        <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
          💰 Financial Status
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Credits:</span>
            <span className="ml-2 text-white font-mono">{resources.credits.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400">Daily Net:</span>
            <span className={`ml-2 font-mono ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netIncome >= 0 ? '+' : ''}{netIncome.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Revenue:</span>
            <span className="ml-2 text-green-400 font-mono">+{resources.dailyRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400">Expenses:</span>
            <span className="ml-2 text-red-400 font-mono">-{resources.dailyExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Operational Status */}
      <div className="bg-slate-800/30 rounded p-3">
        <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
          ⚙️ Operations
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Power:</span>
            <span className="ml-2 text-white font-mono">{resources.power}/{resources.maxPower}</span>
          </div>
          <div>
            <span className="text-slate-400">Security:</span>
            <span className={`ml-2 font-mono ${SECURITY_COLORS[resources.security]}`}>
              {resources.security}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Visitors:</span>
            <span className="ml-2 text-white font-mono">{resources.visitors}/{resources.maxVisitors}</span>
          </div>
          <div>
            <span className="text-slate-400">Research:</span>
            <span className="ml-2 text-blue-400 font-mono">{resources.research}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendsView({ resources, formatNumber }: any) {
  const netIncome = resources.dailyRevenue - resources.dailyExpenses;
  const powerUtilization = Math.round((resources.power / resources.maxPower) * 100);
  const visitorCapacity = Math.round((resources.visitors / resources.maxVisitors) * 100);

  return (
    <div className="space-y-3">
      {/* Progress Bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Power Utilization</span>
            <span className="text-white">{powerUtilization}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                powerUtilization >= 90 ? 'bg-red-400' :
                powerUtilization >= 70 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${Math.min(powerUtilization, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Visitor Capacity</span>
            <span className="text-white">{visitorCapacity}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="h-2 bg-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(visitorCapacity, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-800/30 rounded p-2 text-center">
          <div className="text-cyan-400 font-bold">{formatNumber(netIncome)}</div>
          <div className="text-xs text-slate-400">Daily Net</div>
        </div>
        <div className="bg-slate-800/30 rounded p-2 text-center">
          <div className="text-blue-400 font-bold">{resources.research}</div>
          <div className="text-xs text-slate-400">Research Pts</div>
        </div>
      </div>
    </div>
  );
}