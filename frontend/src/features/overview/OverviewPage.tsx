import { ReactNode } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface OverviewPageProps {
  resourceTrends: ReactNode;
  isCampaignActive: boolean;
}

export function OverviewPage({ resourceTrends, isCampaignActive }: OverviewPageProps) {
  const { day, hour, resources, facilities, xenomorphs, research, economics } = useGameStore();

  const stats = [
    { label: 'Day', value: day.toString() },
    { label: 'Hour', value: `${hour}:00` },
    { label: 'Facilities', value: facilities.length.toString() },
    { label: 'Species Placed', value: xenomorphs.length.toString() },
    { label: 'Research Completed', value: research.completed.length.toString() },
    { label: 'Visitor Satisfaction', value: `${Math.round(economics.visitorSatisfaction * 100)}%` },
  ];

  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">Park Overview</h2>
        <p className="mt-1 text-sm text-slate-300">
          Core status snapshot for operations, economics, and containment readiness.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map(stat => (
            <div key={stat.label} className="panel-muted p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {resourceTrends}
          <div className="panel p-5">
            <h3 className="section-title text-lg">Resource Snapshot</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Credits</div>
                <div className="text-base font-medium text-slate-100">
                  {resources.credits.toLocaleString()}
                </div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Power</div>
                <div className="text-base font-medium text-slate-100">
                  {resources.power}/{resources.maxPower}
                </div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Visitors</div>
                <div className="text-base font-medium text-slate-100">
                  {resources.visitors}/{resources.maxVisitors}
                </div>
              </div>
              <div className="panel-muted p-3">
                <div className="text-xs text-slate-400">Security</div>
                <div className="text-base font-medium text-slate-100">{resources.security}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="section-title text-lg">Campaign Snapshot</h3>
          <p className="mt-3 text-sm text-slate-300">
            {isCampaignActive
              ? 'A campaign scenario is active. Objective tracking is pinned in the HUD.'
              : 'No active campaign scenario. Open the Campaign section to start one.'}
          </p>
        </div>
      </div>
    </section>
  );
}
