import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Modal } from '../ui/Modal';
import { PulseEffect, ShakeEffect } from '../ui/VisualFeedback';
import { CrisisEvent, Severity } from '../../types';

interface CrisisEventModalProps {
  isOpen: boolean;
  event: CrisisEvent | null;
  onClose: () => void;
  onResponse: (response: string) => void;
}

interface ActiveCrisis {
  event: CrisisEvent;
  timeRemaining: number;
  consequences: string[];
  resolved: boolean;
}

const extendedCrisisEvents: CrisisEvent[] = [
  {
    name: 'Containment Breach',
    probability: 0.3,
    severity: 'Medium',
    description: 'Single xenomorph escapes containment. Security protocols activated.',
    responseOptions: [
      'Security lockdown - Seal all exits (-20 visitors, +10 security)',
      'Colonial Marine deployment - Send armed response (+resources cost, guaranteed success)',
      'Facility evacuation - Evacuate all civilians (-50% visitors, -facility income)',
    ],
  },
  {
    name: 'Power Failure',
    probability: 0.2,
    severity: 'High',
    description: 'Main power grid failure detected. All containment systems at risk of shutdown.',
    responseOptions: [
      'Emergency power - Use backup generators (-50% power for 2 days)',
      'Immediate evacuation - Clear facility entirely (-80% visitors, -security risk)',
      'Manual lockdown - Manually secure all containment (-power, requires staff)',
    ],
  },
  {
    name: 'Hive Outbreak',
    probability: 0.1,
    severity: 'Critical',
    description: 'Multiple xenomorphs coordinate escape attempt. Threat level: MAXIMUM',
    responseOptions: [
      'Nuclear option - Sterilize contaminated areas (-facilities, guaranteed elimination)',
      'Full marine assault - Deploy entire security force (-credits, -staff safety)',
      'Abandon facility - Evacuate all personnel and seal facility (-game over scenario)',
    ],
  },
  {
    name: 'Visitor Incident',
    probability: 0.25,
    severity: 'Low',
    description: 'Tourist safety incident reported. Media attention increasing.',
    responseOptions: [
      'Cover-up - Use corporate influence to suppress news (-credits, +reputation)',
      'Public relations - Hold press conference and show transparency (+trust, -secrets)',
      'Compensation - Pay damages to affected parties (-credits, +visitor confidence)',
    ],
  },
  {
    name: 'Research Contamination',
    probability: 0.15,
    severity: 'Medium',
    description: 'Laboratory contamination detected. Research materials compromised.',
    responseOptions: [
      'Quarantine lab - Seal and decontaminate research area (-research progress)',
      'Continue research - Risk spreading contamination for scientific gain (+research, +risk)',
      'Destroy samples - Eliminate contamination but lose research data (-research points)',
    ],
  },
  {
    name: 'Staff Rebellion',
    probability: 0.1,
    severity: 'High',
    description: 'Facility staff protest dangerous working conditions. Morale critical.',
    responseOptions: [
      'Increase security - Use force to maintain order (-staff morale, +control)',
      'Negotiate demands - Meet staff safety requirements (+credits cost, +morale)',
      'Replace staff - Hire new personnel with fewer scruples (-time, -expertise)',
    ],
  },
  {
    name: 'Corporate Inspection',
    probability: 0.2,
    severity: 'Medium',
    description: 'Weyland-Yutani corporate inspection team arrives unannounced.',
    responseOptions: [
      'Full cooperation - Show all facilities and records (+corporate standing)',
      'Limited access - Restrict access to sensitive areas (+secrecy, -trust)',
      'Bribe officials - Use credits to ensure favorable report (-credits, +results)',
    ],
  },
];

export function CrisisEventModal({ isOpen, event, onClose, onResponse }: CrisisEventModalProps) {
  void onClose;
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (!isOpen || !event) return;

    setTimeRemaining(30);
    setSelectedResponse(null);

    // Trigger shake effect for high severity events
    if (event.severity === 'Critical' || event.severity === 'High') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-select first option if time runs out
          onResponse(event.responseOptions[0]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, event, onResponse]);

  const handleResponse = (response: string) => {
    setSelectedResponse(response);
    setTimeout(() => {
      onResponse(response);
    }, 500);
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 border-red-400 bg-red-400/20';
      case 'High':
        return 'text-orange-400 border-orange-400 bg-orange-400/20';
      case 'Medium':
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
      default:
        return 'text-green-400 border-green-400 bg-green-400/20';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return '🚨';
      case 'High':
        return '⚠️';
      case 'Medium':
        return '🔶';
      default:
        return 'ℹ️';
    }
  };

  if (!event) return null;

  return (
    <ShakeEffect shake={isShaking}>
      <Modal
        isOpen={isOpen}
        onClose={() => {}} // Prevent manual close during crisis
        title={`🚨 CRISIS EVENT`}
      >
        <div className="space-y-6">
          {/* Event Header */}
          <div className={`border rounded-lg p-4 ${getSeverityColor(event.severity)}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getSeverityIcon(event.severity)}</span>
              <div>
                <h3 className="text-xl font-bold">{event.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span>Severity: {event.severity}</span>
                  <span className="text-red-400 font-bold">Time: {timeRemaining}s</span>
                </div>
              </div>
            </div>
            <p className="text-slate-300">{event.description}</p>
          </div>

          {/* Timer Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Response Time Remaining</span>
              <span className={timeRemaining <= 10 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                {timeRemaining}s
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeRemaining <= 10 ? 'bg-red-400' : 'bg-yellow-400'
                }`}
                style={{ width: `${(timeRemaining / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            <h4 className="text-green-400 font-semibold">Choose Your Response:</h4>
            {event.responseOptions.map((option, index) => {
              const isSelected = selectedResponse === option;
              const [action, consequence] = option.split(' - ');

              return (
                <PulseEffect key={index} pulse={isSelected} color="green">
                  <button
                    onClick={() => handleResponse(option)}
                    disabled={!!selectedResponse}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                      ${
                        isSelected
                          ? 'border-green-400 bg-green-400/20 text-green-400'
                          : 'border-slate-600 bg-slate-800 hover:border-green-400/50 hover:bg-slate-700'
                      }
                      ${selectedResponse && !isSelected ? 'opacity-50' : ''}
                      disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-1">
                        {index === 0 ? '🛡️' : index === 1 ? '⚔️' : '🏃'}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-300 mb-1">{action}</div>
                        {consequence && (
                          <div className="text-sm text-slate-400">Consequences: {consequence}</div>
                        )}
                      </div>
                      {isSelected && <span className="text-green-400 text-xl">✓</span>}
                    </div>
                  </button>
                </PulseEffect>
              );
            })}
          </div>

          {/* Warning Message */}
          <div className="bg-red-900/30 border border-red-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span>⚠️</span>
              <span>
                Crisis events have permanent consequences. Choose carefully!
                {timeRemaining <= 10 && ' Time running out - first option will be auto-selected!'}
              </span>
            </div>
          </div>

          {/* Auto-selected message */}
          {selectedResponse && (
            <div className="text-center text-green-400">
              <span>Response selected... Implementing solution...</span>
            </div>
          )}
        </div>
      </Modal>
    </ShakeEffect>
  );
}

// Crisis Manager Hook
export function useCrisisManager() {
  const { updateResources, resources, xenomorphs, addStatusMessage, day } = useGameStore();

  const [activeCrisis, setActiveCrisis] = useState<ActiveCrisis | null>(null);
  const [lastCrisisDay, setLastCrisisDay] = useState(0);
  const [crisisHistory, setCrisisHistory] = useState<string[]>([]);

  // Calculate crisis probability based on game state
  const calculateCrisisProbability = useCallback(() => {
    let baseProbability = 0.1; // 10% base chance per day

    // Increase probability based on number of xenomorphs
    baseProbability += xenomorphs.length * 0.05;

    // Increase probability based on low security
    if (resources.security === 'Low') baseProbability += 0.2;
    else if (resources.security === 'Medium') baseProbability += 0.1;

    // Increase probability based on power shortage
    if (resources.power < resources.maxPower * 0.3) baseProbability += 0.3;

    // Decrease probability if recent crisis occurred
    if (day - lastCrisisDay < 3) baseProbability *= 0.5;

    return Math.min(baseProbability, 0.8); // Cap at 80%
  }, [
    xenomorphs.length,
    resources.security,
    resources.power,
    resources.maxPower,
    day,
    lastCrisisDay,
  ]);

  // Trigger crisis check
  const checkForCrisis = useCallback(() => {
    if (activeCrisis) return;

    const probability = calculateCrisisProbability();
    if (Math.random() < probability) {
      // Select random crisis event
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
      addStatusMessage(`🚨 Crisis Event: ${selectedEvent.name}`, 'error');
    }
  }, [activeCrisis, calculateCrisisProbability, crisisHistory, day, addStatusMessage]);

  // Handle crisis response
  const handleCrisisResponse = useCallback(
    (response: string) => {
      if (!activeCrisis) return;

      const consequences = applyCrisisConsequences(activeCrisis.event, response);

      setActiveCrisis(null);
      setCrisisHistory(prev => [...prev, activeCrisis.event.name]);

      // Apply consequences
      consequences.forEach(consequence => {
        addStatusMessage(consequence, 'warning');
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [activeCrisis, addStatusMessage]
  );

  const applyCrisisConsequences = (event: CrisisEvent, response: string): string[] => {
    const consequences: string[] = [];

    // Parse response for consequences
    if (response.includes('-20 visitors')) {
      updateResources({ visitors: Math.max(0, resources.visitors - 20) });
      consequences.push('Visitor count decreased by 20');
    }

    if (response.includes('+10 security')) {
      // Would need to implement security level changes
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
  };

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
