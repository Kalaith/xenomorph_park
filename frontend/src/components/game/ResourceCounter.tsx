import { useGameStore } from '../../stores/gameStore';
import { SECURITY_COLORS } from '../../constants/gameConstants';

export function ResourceCounter() {
  const { resources } = useGameStore();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-5 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-lg">💰</span>
          <div>
            <div className="text-green-400 font-mono">Credits</div>
            <div className="text-white font-bold">{formatNumber(resources.credits)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400 text-lg">⚡</span>
          <div>
            <div className="text-green-400 font-mono">Power</div>
            <div className="text-white font-bold">
              {resources.power}/{resources.maxPower}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-blue-400 text-lg">🔬</span>
          <div>
            <div className="text-green-400 font-mono">Research</div>
            <div className="text-white font-bold">{resources.research}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-orange-400 text-lg">🛡️</span>
          <div>
            <div className="text-green-400 font-mono">Security</div>
            <div className={`font-bold ${SECURITY_COLORS[resources.security]}`}>
              {resources.security}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-purple-400 text-lg">👥</span>
          <div>
            <div className="text-green-400 font-mono">Visitors</div>
            <div className="text-white font-bold">{resources.visitors}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
