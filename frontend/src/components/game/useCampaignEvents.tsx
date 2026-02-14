import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { campaignEventManager, CampaignEvent, EventChoice } from '../../utils/campaignEvents';
import { CampaignEventModal } from './CampaignEventModal';

export function useCampaignEvents() {
  const [currentEvent, setCurrentEvent] = useState<CampaignEvent | null>(null);
  const gameState = useGameStore();

  useEffect(() => {
    const isCampaignActive = !!localStorage.getItem('current-campaign-scenario');
    if (!isCampaignActive) return;

    const checkInterval = setInterval(() => {
      if (!currentEvent) {
        const newEvent = campaignEventManager.checkForEvents(gameState);
        if (newEvent) {
          setCurrentEvent(newEvent);
        }
      }
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [gameState, currentEvent]);

  const handleEventChoice = (choice: EventChoice) => {
    void choice;
  };

  const closeEvent = () => {
    setCurrentEvent(null);
  };

  return {
    currentEvent,
    handleEventChoice,
    closeEvent,
    CampaignEventModal: () => (
      <CampaignEventModal
        isOpen={!!currentEvent}
        event={currentEvent}
        onClose={closeEvent}
        onChoiceSelected={handleEventChoice}
      />
    ),
  };
}
