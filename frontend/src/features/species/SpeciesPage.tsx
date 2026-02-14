import { ReactNode } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface SpeciesPageProps {
  speciesPanel: ReactNode;
}

export function SpeciesPage({ speciesPanel }: SpeciesPageProps) {
  const { selectedSpecies, xenomorphs, research } = useGameStore();
  const placedSpecies = new Set(xenomorphs.map(x => x.species.name));

  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">Species Management</h2>
        <p className="mt-1 text-sm text-slate-300">
          Browse available species, evaluate danger level, and select deployment candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <div>{speciesPanel}</div>
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="section-title text-lg">Selection Details</h3>
            {selectedSpecies ? (
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400">Name:</span> {selectedSpecies.name}
                </div>
                <div>
                  <span className="text-slate-400">Danger:</span> {selectedSpecies.dangerLevel}
                </div>
                <div>
                  <span className="text-slate-400">Containment Difficulty:</span>{' '}
                  {selectedSpecies.containmentDifficulty}
                </div>
                <div>
                  <span className="text-slate-400">Research Cost:</span>{' '}
                  {selectedSpecies.researchCost.toLocaleString()}
                </div>
                <p className="pt-1">{selectedSpecies.description}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Select a species from the panel to inspect attributes.
              </p>
            )}
          </div>

          <div className="panel p-5">
            <h3 className="section-title text-lg">Roster Summary</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Placed Units</div>
                <div className="text-lg font-semibold text-slate-100">{xenomorphs.length}</div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Unique Species</div>
                <div className="text-lg font-semibold text-slate-100">{placedSpecies.size}</div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Researched Species</div>
                <div className="text-lg font-semibold text-slate-100">{research.completed.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
