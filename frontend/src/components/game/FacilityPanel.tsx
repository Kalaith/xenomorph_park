import { useGameStore } from "../../stores/gameStore";
import { facilityDefinitions } from "../../data/gameData";
import { FacilityDefinition } from "../../types";

export function FacilityPanel() {
  const { selectedFacility, selectFacility, resources } = useGameStore();

  const handleFacilitySelect = (facility: FacilityDefinition) => {
    if (selectedFacility?.name === facility.name) {
      selectFacility(null);
    } else {
      selectFacility(facility);
    }
  };

  const canAfford = (facility: FacilityDefinition) => {
    return (
      resources.credits >= facility.cost &&
      resources.power >= facility.powerRequirement
    );
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4 mb-4">
      <h3 className="text-green-400 font-bold text-lg mb-4 glow">Facilities</h3>
      <div className="grid grid-cols-1 gap-2">
        {facilityDefinitions.map((facility) => {
          const isSelected = selectedFacility?.name === facility.name;
          const affordable = canAfford(facility);

          return (
            <button
              key={facility.name}
              onClick={() => handleFacilitySelect(facility)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all duration-200
                ${
                  isSelected
                    ? "border-green-400 bg-green-400/20 shadow-lg shadow-green-400/20"
                    : "border-slate-600 hover:border-slate-500"
                }
                ${!affordable ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800/50"}
              `}
              disabled={!affordable}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-400 font-semibold">
                  {facility.name}
                </span>
                <div className="text-right text-sm">
                  <div className="text-yellow-400">
                    💰 {facility.cost.toLocaleString()}
                  </div>
                  <div className="text-blue-400">
                    ⚡ {facility.powerRequirement}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{facility.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
