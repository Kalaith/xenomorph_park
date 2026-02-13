import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";
import { gameConstants } from "../constants/gameConstants";

export function useGameLoop() {
  const gameTick = useGameStore((s) => s.gameTick);
  const paused = useGameStore((s) => s.paused);
  const mode = useGameStore((s) => s.mode);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!paused && mode === "building") {
      intervalRef.current = setInterval(() => {
        gameTick();
      }, gameConstants.GAME_TICK_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paused, mode, gameTick]);

  return null;
}
