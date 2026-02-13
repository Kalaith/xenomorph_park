import { useState, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import {
  campaignEventManager,
  CampaignEvent,
  EventChoice,
} from "../../utils/campaignEvents";

interface CampaignEventModalProps {
  isOpen: boolean;
  event: CampaignEvent | null;
  onClose: () => void;
  onChoiceSelected: (choice: EventChoice) => void;
}

export function CampaignEventModal({
  isOpen,
  event,
  onClose,
  onChoiceSelected,
}: CampaignEventModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const gameState = useGameStore();

  useEffect(() => {
    if (isOpen && event) {
      setSelectedChoice(null);
      setIsProcessing(false);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleChoiceSelect = async (choice: EventChoice) => {
    setSelectedChoice(choice.id);
    setIsProcessing(true);

    // Small delay for better UX
    setTimeout(() => {
      onChoiceSelected(choice);
      campaignEventManager.applyEventChoice(event, choice);
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 bg-red-500/10";
      case "high":
        return "border-orange-500 bg-orange-500/10";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10";
      case "low":
        return "border-blue-500 bg-blue-500/10";
      default:
        return "border-slate-500 bg-slate-500/10";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "📋";
      case "low":
        return "ℹ️";
      default:
        return "📄";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-slate-900 rounded-lg border-2 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getPriorityColor(event.priority)}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getPriorityIcon(event.priority)}</span>
            <h2 className="text-xl font-bold text-green-400">{event.name}</h2>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                event.priority === "critical"
                  ? "bg-red-500/20 text-red-400"
                  : event.priority === "high"
                    ? "bg-orange-500/20 text-orange-400"
                    : event.priority === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {event.priority}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{event.description}</p>
        </div>

        {/* Story Content */}
        <div className="p-6">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border-l-4 border-cyan-400">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-cyan-400">📖</span>
              <span className="font-semibold text-cyan-400">Story</span>
            </div>
            <p className="text-slate-300 leading-relaxed italic">
              {event.storyText}
            </p>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              Choose your response:
            </h3>
            {event.choices.map((choice) => {
              const isAvailable = campaignEventManager.isChoiceAvailable(
                choice,
                gameState,
              );
              const isSelected = selectedChoice === choice.id;

              return (
                <button
                  key={choice.id}
                  onClick={() =>
                    !isProcessing && isAvailable && handleChoiceSelect(choice)
                  }
                  disabled={!isAvailable || isProcessing}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-green-400 bg-green-400/20"
                      : isAvailable
                        ? "border-slate-600 bg-slate-800/50 hover:border-green-400 hover:bg-green-400/10"
                        : "border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">
                      {isSelected ? "✅" : isAvailable ? "👆" : "🚫"}
                    </span>
                    <div className="flex-1">
                      <h4
                        className={`font-semibold mb-1 ${
                          isAvailable ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {choice.text}
                      </h4>
                      <p
                        className={`text-sm mb-2 ${
                          isAvailable ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {choice.description}
                      </p>

                      {/* Requirements */}
                      {choice.requirements &&
                        choice.requirements.length > 0 && (
                          <div className="text-xs text-slate-500 mb-2">
                            <strong>Requirements:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {choice.requirements.map((req, index) => (
                                <li key={index}>
                                  {req.type === "resource" &&
                                    Object.entries(req.condition)
                                      .map(
                                        ([resource, value]) =>
                                          `${resource}: ${value}`,
                                      )
                                      .join(", ")}
                                  {req.type === "facility" &&
                                    req.condition.hasType &&
                                    `Facility: ${req.condition.hasType}`}
                                  {req.type === "research" &&
                                    req.condition.completed &&
                                    `Research: ${req.condition.completed.join(", ")}`}
                                  {req.type === "species" &&
                                    req.condition.minSpecies &&
                                    `Minimum species: ${req.condition.minSpecies}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Consequences Preview */}
                      <div className="text-xs">
                        <strong
                          className={
                            isAvailable ? "text-slate-400" : "text-slate-600"
                          }
                        >
                          Consequences:
                        </strong>
                        <ul className="list-disc list-inside ml-2 text-slate-500">
                          {choice.consequences.map((consequence, index) => (
                            <li key={index}>{consequence.description}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/20 border border-green-400 rounded-lg">
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-green-400">Processing choice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>{event.oneTime ? "One-time event" : "Recurring event"}</span>
            <span>Scenario: {event.scenarioId || "Universal"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage campaign events
export function useCampaignEvents() {
  const [currentEvent, setCurrentEvent] = useState<CampaignEvent | null>(null);
  const gameState = useGameStore();

  useEffect(() => {
    // Only check for events if we're in a campaign
    const isCampaignActive = !!localStorage.getItem(
      "current-campaign-scenario",
    );
    if (!isCampaignActive) return;

    const checkInterval = setInterval(() => {
      if (!currentEvent) {
        const newEvent = campaignEventManager.checkForEvents(gameState);
        if (newEvent) {
          setCurrentEvent(newEvent);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [gameState, currentEvent]);

  const handleEventChoice = (choice: EventChoice) => {
    void choice;
    // This will be handled by the modal component
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
