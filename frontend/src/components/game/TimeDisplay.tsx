import { useGameStore } from "../../stores/gameStore";

export function TimeDisplay() {
  const { day, hour, paused } = useGameStore();

  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getTimeOfDay = (hour: number) => {
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    if (hour >= 18 && hour < 22) return "Evening";
    return "Night";
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-bold">Day {day}</span>
        <span className="text-slate-300">{formatTime(hour)}</span>
        <span className="text-slate-400">{getTimeOfDay(hour)}</span>
      </div>

      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${paused ? "bg-red-400" : "bg-green-400"} ${!paused ? "animate-pulse" : ""}`}
        ></div>
        <span className="text-slate-400 text-xs">
          {paused ? "Paused" : "Running"}
        </span>
      </div>
    </div>
  );
}
