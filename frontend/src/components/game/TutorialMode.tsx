import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'wait' | 'condition';
    target?: string;
    condition?: () => boolean;
    description: string;
  };
  skippable?: boolean;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Xenomorph Park!',
    content: 'Welcome to your new xenomorph park management adventure! This tutorial will guide you through the basics of building and managing your park.',
    position: 'center',
    skippable: true
  },
  {
    id: 'resources',
    title: 'Understanding Resources',
    content: 'At the top, you can see your current resources: Credits (💰), Power (⚡), Research points (🔬), and Visitors (👥). These are essential for building and maintaining your park.',
    target: '.resource-counter',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'time',
    title: 'Time Progression',
    content: 'Time passes automatically in the game. You can see the current day and hour. Different times of day affect visitor flow and park atmosphere.',
    target: '.time-display',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'game_controls',
    title: 'Game Controls',
    content: 'Use these controls to switch between Building Mode and Horror Survival Mode, pause the game, and access undo/redo functions.',
    target: '.game-controls',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'facilities',
    title: 'Building Facilities',
    content: 'Click on a facility to select it, then click on the grid to place it. Different facilities have different costs and power requirements.',
    target: '.facility-panel',
    position: 'right',
    action: {
      type: 'condition',
      condition: () => useGameStore.getState().selectedFacility !== null,
      description: 'Select a facility from the panel'
    },
    skippable: true
  },
  {
    id: 'placing_facility',
    title: 'Placing Your First Facility',
    content: 'Great! Now click on any empty cell in the grid to place your selected facility. Green highlights show where you can place it.',
    target: '.game-grid',
    position: 'left',
    action: {
      type: 'condition',
      condition: () => useGameStore.getState().facilities.length > 0,
      description: 'Place a facility on the grid'
    },
    skippable: true
  },
  {
    id: 'power_generator',
    title: 'Power Management',
    content: 'Build Power Generators to increase your maximum power capacity. Most facilities require power to operate.',
    position: 'center',
    skippable: true
  },
  {
    id: 'research_lab',
    title: 'Research and Development',
    content: 'Research Labs generate research points over time. You need research points to unlock new xenomorph species and technologies.',
    position: 'center',
    skippable: true
  },
  {
    id: 'species_panel',
    title: 'Xenomorph Species',
    content: 'Here you can see available xenomorph species. You need to research most species before you can place them in your park.',
    target: '.species-panel',
    position: 'left',
    skippable: true
  },
  {
    id: 'research_tree',
    title: 'Research Tree',
    content: 'Click the 🔬 button in the header to open the research tree and unlock new technologies and species.',
    target: 'button[title*="Research Tree"]',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'genetic_modification',
    title: 'Genetic Modification',
    content: 'Once you have researched species, you can use the Gene Lab to create modified xenomorphs with enhanced abilities!',
    target: 'button:contains("🧬 Gene Lab")',
    position: 'left',
    skippable: true
  },
  {
    id: 'camera_controls',
    title: 'Camera Controls',
    content: 'Use the zoom controls to get a better view of your park. You can also pan by holding Ctrl and dragging, or use the mouse wheel to zoom.',
    target: '.camera-controls',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'right_click',
    title: 'Context Actions',
    content: 'Right-click on placed facilities and xenomorphs to see available actions like inspection, upgrades, and removal.',
    position: 'center',
    skippable: true
  },
  {
    id: 'visitor_management',
    title: 'Visitor Management',
    content: 'Build Visitor Centers to accommodate more guests. More dangerous xenomorphs attract more visitors but are harder to contain.',
    position: 'center',
    skippable: true
  },
  {
    id: 'horror_mode',
    title: 'Horror Survival Mode',
    content: 'When things go wrong, switch to Horror Mode to fight escaped xenomorphs and complete survival objectives!',
    position: 'center',
    skippable: true
  },
  {
    id: 'achievements',
    title: 'Achievements & Progress',
    content: 'Click the 🏆 button to view achievements and track your progress. Complete objectives to unlock rewards!',
    target: 'button[title="Achievements"]',
    position: 'bottom',
    skippable: true
  },
  {
    id: 'keyboard_shortcuts',
    title: 'Keyboard Shortcuts',
    content: 'Press H to view all available keyboard shortcuts. Many actions can be performed quickly using hotkeys.',
    position: 'center',
    skippable: true
  },
  {
    id: 'conclusion',
    title: 'Tutorial Complete!',
    content: 'You\'re ready to build your xenomorph park! Remember: balance visitor satisfaction with containment security. Good luck, and have fun!',
    position: 'center',
    skippable: false
  }
];

interface TutorialModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialMode({ isOpen, onClose }: TutorialModeProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isWaitingForAction, setIsWaitingForAction] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  // Highlight target element
  useEffect(() => {
    if (!isOpen || !currentStep.target) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, currentStep.target]);

  // Handle action conditions
  useEffect(() => {
    if (!isOpen || !currentStep.action || currentStep.action.type !== 'condition') return;

    setIsWaitingForAction(true);

    const checkCondition = () => {
      if (currentStep.action?.condition?.()) {
        setIsWaitingForAction(false);
        setTimeout(() => nextStep(), 1000); // Small delay before auto-advancing
      }
    };

    const interval = setInterval(checkCondition, 500);
    return () => clearInterval(interval);
  }, [currentStepIndex, isOpen]);

  const nextStep = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setIsWaitingForAction(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsWaitingForAction(false);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  const getStepPosition = () => {
    if (!currentStep.target || !highlightedElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const modalWidth = 400; // Approximate modal width
    const modalHeight = 300; // Approximate modal height

    switch (currentStep.position) {
      case 'top':
        return {
          top: rect.top - modalHeight - 20,
          left: rect.left + rect.width / 2 - modalWidth / 2,
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - modalWidth / 2,
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - modalHeight / 2,
          left: rect.left - modalWidth - 20,
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 - modalHeight / 2,
          left: rect.right + 20,
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with highlighted element */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Highlight cutout */}
        {highlightedElement && (
          <div
            className="absolute border-4 border-green-400 rounded-lg animate-pulse pointer-events-auto"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 8,
              left: highlightedElement.getBoundingClientRect().left - 8,
              width: highlightedElement.getBoundingClientRect().width + 16,
              height: highlightedElement.getBoundingClientRect().height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tutorial Modal */}
      <div
        className="fixed z-50 bg-slate-900 border-2 border-green-400 rounded-lg shadow-2xl p-6 max-w-md"
        style={getStepPosition()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-green-400">{currentStep.title}</h3>
            <div className="text-sm text-slate-400 mt-1">
              Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
            </div>
          </div>
          <button
            onClick={skipTutorial}
            className="text-slate-400 hover:text-red-400 transition-colors"
            title="Skip Tutorial"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="text-slate-200 mb-6 leading-relaxed">
          {currentStep.content}
        </div>

        {/* Action Instruction */}
        {currentStep.action && isWaitingForAction && (
          <div className="bg-blue-900/30 border border-blue-400/50 rounded p-3 mb-4">
            <div className="text-blue-400 text-sm font-semibold mb-1">Action Required:</div>
            <div className="text-blue-200 text-sm">{currentStep.action.description}</div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="text-sm"
          >
            ← Previous
          </Button>

          <div className="flex gap-2">
            {currentStep.skippable && (
              <Button
                variant="outline"
                onClick={skipTutorial}
                className="text-sm"
              >
                Skip Tutorial
              </Button>
            )}

            <Button
              variant="primary"
              onClick={nextStep}
              disabled={isWaitingForAction}
              className="text-sm"
            >
              {isLastStep ? 'Finish' : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manage tutorial state
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

  // Auto-start tutorial for new players
  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000); // Start tutorial after 2 seconds for new players

      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  return {
    showTutorial,
    hasSeenTutorial,
    startTutorial,
    endTutorial,
    resetTutorial,
    TutorialComponent: () => (
      <TutorialMode isOpen={showTutorial} onClose={endTutorial} />
    ),
  };
}