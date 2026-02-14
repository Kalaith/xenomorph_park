import { useState, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CrisisEvent } from '../../types';
import { CrisisEventModal } from './CrisisEventModal';
import { extendedCrisisEvents } from './crisisEventsData';

interface ActiveCrisis {
  event: CrisisEvent;
  timeRemaining: number;
  consequences: string[];
  resolved: boolean;
}

export function useCrisisManager() {
  const { updateResources, resources, xenomorphs, addStatusMessage, day } = useGameStore();

  const [activeCrisis, setActiveCrisis] = useState<ActiveCrisis | null>(null);
  const [lastCrisisDay, setLastCrisisDay] = useState(0);
  const [crisisHistory, setCrisisHistory] = useState<string[]>([]);

  const applyCrisisConsequences = useCallback(
    (event: CrisisEvent, response: string): string[] => {
      void event;
      const consequences: string[] = [];

      if (response.includes('-20 visitors')) {
        updateResources({ visitors: Math.max(0, resources.visitors - 20) });
        consequences.push('Visitor count decreased by 20');
      }

      if (response.includes('+10 security')) {
        consequences.push('Security level increased');
      }

      if (response.includes('-50% visitors')) {
        updateResources({ visitors: Math.floor(resources.visitors * 0.5) });
        consequences.push('Visitor count reduced by 50%');
      }

      if (response.includes('-50% power')) {
        updateResources({ power: Math.floor(resources.power * 0.5) });
        consequences.push('Power reduced by 50% for emergency protocols');
      }

      if (response.includes('-credits')) {
        const cost = Math.floor(resources.credits * 0.2);
        updateResources({ credits: Math.max(0, resources.credits - cost) });
        consequences.push(`Emergency response cost: ${cost} credits`);
      }

      return consequences;
    },
    [resources.credits, resources.power, resources.visitors, updateResources]
  );

  const calculateCrisisProbability = useCallback(() => {
    let baseProbability = 0.1;

    baseProbability += xenomorphs.length * 0.05;

    if (resources.security === 'Low') baseProbability += 0.2;
    else if (resources.security === 'Medium') baseProbability += 0.1;

    if (resources.power < resources.maxPower * 0.3) baseProbability += 0.3;

    if (day - lastCrisisDay < 3) baseProbability *= 0.5;

    return Math.min(baseProbability, 0.8);
  }, [
    xenomorphs.length,
    resources.security,
    resources.power,
    resources.maxPower,
    day,
    lastCrisisDay,
  ]);

  const checkForCrisis = useCallback(() => {
    if (activeCrisis) return;

    const probability = calculateCrisisProbability();
    if (Math.random() < probability) {
      const availableEvents = extendedCrisisEvents.filter(
        event =>
          !crisisHistory.includes(event.name) || crisisHistory.length >= extendedCrisisEvents.length
      );

      const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];

      setActiveCrisis({
        event: selectedEvent,
        timeRemaining: 30,
        consequences: [],
        resolved: false,
      });

      setLastCrisisDay(day);
      addStatusMessage(`Crisis Event: ${selectedEvent.name}`, 'error');
    }
  }, [activeCrisis, calculateCrisisProbability, crisisHistory, day, addStatusMessage]);

  const handleCrisisResponse = useCallback(
    (response: string) => {
      if (!activeCrisis) return;

      const consequences = applyCrisisConsequences(activeCrisis.event, response);

      setActiveCrisis(null);
      setCrisisHistory(prev => [...prev, activeCrisis.event.name]);

      consequences.forEach(consequence => {
        addStatusMessage(consequence, 'warning');
      });
    },
    [activeCrisis, addStatusMessage, applyCrisisConsequences]
  );

  return {
    activeCrisis,
    checkForCrisis,
    handleCrisisResponse,
    crisisHistory,
    CrisisModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
      <CrisisEventModal
        isOpen={isOpen && !!activeCrisis}
        event={activeCrisis?.event || null}
        onClose={onClose}
        onResponse={handleCrisisResponse}
      />
    ),
  };
}
