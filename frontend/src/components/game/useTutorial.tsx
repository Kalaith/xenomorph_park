import { useState, useEffect } from 'react';
import { TutorialMode } from './TutorialMode';

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('xenomorph-park-tutorial-seen') === 'true';
  });

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const endTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('xenomorph-park-tutorial-seen', 'true');
  };

  const resetTutorial = () => {
    setHasSeenTutorial(false);
    localStorage.removeItem('xenomorph-park-tutorial-seen');
  };

  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  return {
    showTutorial,
    hasSeenTutorial,
    startTutorial,
    endTutorial,
    resetTutorial,
    TutorialComponent: () => <TutorialMode isOpen={showTutorial} onClose={endTutorial} />,
  };
}
