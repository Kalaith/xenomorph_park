import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../stores/gameStore';

interface ResearchPageProps {
  onOpenResearchTree: () => void;
  onOpenGeneticLab: () => void;
  onOpenAchievements: () => void;
}

export function ResearchPage({
  onOpenResearchTree,
  onOpenGeneticLab,
  onOpenAchievements,
}: ResearchPageProps) {
  const { research, resources } = useGameStore();

  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">Research and Genetics</h2>
        <p className="mt-1 text-sm text-slate-300">
          Advance unlocks, run genetic programs, and monitor progression through research tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="panel p-5">
          <h3 className="section-title text-lg">Research Status</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="panel-muted p-3">
              <div className="text-xs text-slate-400">In Progress</div>
              <div className="text-base font-medium text-slate-100">
                {research.inProgress ?? 'None'}
              </div>
            </div>
            <div className="panel-muted p-3">
              <div className="text-xs text-slate-400">Research Resource</div>
              <div className="text-base font-medium text-slate-100">
                {resources.research.toLocaleString()}
              </div>
            </div>
            <div className="panel-muted p-3">
              <div className="text-xs text-slate-400">Completed</div>
              <div className="text-base font-medium text-slate-100">{research.completed.length}</div>
            </div>
            <div className="panel-muted p-3">
              <div className="text-xs text-slate-400">Available</div>
              <div className="text-base font-medium text-slate-100">{research.available.length}</div>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="section-title text-lg">Research Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Button variant="primary" onClick={onOpenResearchTree}>
              Open Research Tree
            </Button>
            <Button variant="secondary" onClick={onOpenGeneticLab}>
              Open Genetic Modification Lab
            </Button>
            <Button variant="outline" onClick={onOpenAchievements}>
              View Achievements
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
