import { useGameStore } from '../../stores/gameStore';

export function TimeDisplay() {
  const { day, hour, tick, paused } = useGameStore();

  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getTimeOfDay = (hour: number) => {
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 22) return 'Evening';
    return 'Night';
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-green-400 font-bold text-lg">
            Day {day}
          </div>
          <div className="text-slate-300">
            {formatTime(hour)}
          </div>
          <div className="text-slate-400 text-sm">
            {getTimeOfDay(hour)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${paused ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
          <span className="text-slate-400 text-sm">
            {paused ? 'Paused' : 'Running'}
          </span>
        </div>
      </div>

      {/* Progress bar for hour */}
      <div className="mt-2">
        <div className="w-full bg-slate-700 rounded-full h-1">
          <div
            className="bg-green-400 h-1 rounded-full transition-all duration-1000"
            style={{ width: `${(tick / 60) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}