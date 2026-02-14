import { Button } from '../../components/ui/Button';

interface CampaignPageProps {
  isCampaignActive: boolean;
  onOpenCampaign: () => void;
  onOpenHistoricalScenarios: () => void;
  onOpenCampaignStats: () => void;
}

export function CampaignPage({
  isCampaignActive,
  onOpenCampaign,
  onOpenHistoricalScenarios,
  onOpenCampaignStats,
}: CampaignPageProps) {
  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">Campaign and Scenarios</h2>
        <p className="mt-1 text-sm text-slate-300">
          Launch scenarios, track objectives, and review campaign performance.
        </p>
        <div className="mt-3 text-sm text-slate-300">
          Status:{' '}
          <span className={isCampaignActive ? 'text-emerald-300' : 'text-slate-400'}>
            {isCampaignActive ? 'Active scenario in progress' : 'No active scenario'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="panel p-5">
          <h3 className="section-title text-lg">Campaign Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="primary" onClick={onOpenCampaign}>
              Open Campaign Mode
            </Button>
            <Button variant="secondary" onClick={onOpenHistoricalScenarios}>
              Historical Scenarios
            </Button>
            <Button variant="outline" onClick={onOpenCampaignStats}>
              Campaign Statistics
            </Button>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="section-title text-lg">Objective Tracking</h3>
          <p className="mt-3 text-sm text-slate-300">
            Campaign objectives are tracked continuously in the in-game HUD when a scenario is
            active.
          </p>
        </div>
      </div>
    </section>
  );
}
