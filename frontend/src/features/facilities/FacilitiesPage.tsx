import { ReactNode } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface FacilitiesPageProps {
  facilityPanel: ReactNode;
}

export function FacilitiesPage({ facilityPanel }: FacilitiesPageProps) {
  const { selectedFacility, facilities, resources } = useGameStore();

  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">Facilities</h2>
        <p className="mt-1 text-sm text-slate-300">
          Build and manage infrastructure that powers containment, research, and visitor operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <div>{facilityPanel}</div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="section-title text-lg">Selected Facility</h3>
            {selectedFacility ? (
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400">Name:</span> {selectedFacility.name}
                </div>
                <div>
                  <span className="text-slate-400">Cost:</span>{' '}
                  {selectedFacility.cost.toLocaleString()} credits
                </div>
                <div>
                  <span className="text-slate-400">Power Requirement:</span>{' '}
                  {selectedFacility.powerRequirement}
                </div>
                <p className="pt-1">{selectedFacility.description}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Select a facility from the panel to inspect requirements.
              </p>
            )}
          </div>

          <div className="panel p-5">
            <h3 className="section-title text-lg">Infrastructure Summary</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Placed Facilities</div>
                <div className="text-lg font-semibold text-slate-100">{facilities.length}</div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Available Credits</div>
                <div className="text-lg font-semibold text-slate-100">
                  {resources.credits.toLocaleString()}
                </div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Power Budget</div>
                <div className="text-lg font-semibold text-slate-100">
                  {resources.power}/{resources.maxPower}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
