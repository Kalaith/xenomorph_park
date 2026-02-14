import { Button } from '../../components/ui/Button';

interface SystemPageProps {
  useSmartUI: boolean;
  onToggleSmartUI: () => void;
  onOpenSettings: () => void;
  onStartTutorial: () => void;
}

export function SystemPage({
  useSmartUI,
  onToggleSmartUI,
  onOpenSettings,
  onStartTutorial,
}: SystemPageProps) {
  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <h2 className="section-title text-xl">System Settings</h2>
        <p className="mt-1 text-sm text-slate-300">
          Configure controls, accessibility preferences, and interface behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="panel p-5">
          <h3 className="section-title text-lg">Interface</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="panel-muted flex items-center justify-between p-3">
              <span>Current UI Mode</span>
              <span className="font-medium text-slate-100">{useSmartUI ? 'Smart UI' : 'Classic UI'}</span>
            </div>
            <Button variant="outline" onClick={onToggleSmartUI}>
              Toggle UI Mode
            </Button>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="section-title text-lg">Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Button variant="primary" onClick={onOpenSettings}>
              Open Settings
            </Button>
            <Button variant="secondary" onClick={onStartTutorial}>
              Start Tutorial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
