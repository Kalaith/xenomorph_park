import { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  modeLabel: string;
  useSmartUI: boolean;
  onToggleSmartUI: () => void;
  controls: ReactNode;
  timeDisplay: ReactNode;
  resourceDisplay: ReactNode;
  biomeDisplay: ReactNode;
}

export function TopBar({
  title,
  modeLabel,
  useSmartUI,
  onToggleSmartUI,
  controls,
  timeDisplay,
  resourceDisplay,
  biomeDisplay,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/80 bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
        <div className="hidden items-center gap-6 lg:flex">
          <div className="panel flex items-center gap-3 px-4 py-2">
            <h1 className="section-title text-lg tracking-wide">{title}</h1>
            <span className="status-pill">{modeLabel}</span>
          </div>

          <div className="flex flex-1 items-center justify-center gap-4">
            <div className="panel-muted px-3 py-2">{timeDisplay}</div>
            <div className="panel-muted min-w-[300px] px-3 py-2">{resourceDisplay}</div>
            <div className="panel-muted px-3 py-2">{biomeDisplay}</div>
          </div>

          <div className="panel-muted flex items-center gap-2 px-3 py-2">
            {controls}
            <div className="mx-1 h-4 w-px bg-slate-600/70" />
            <button
              onClick={onToggleSmartUI}
              className="rounded px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
              title="Toggle UI mode"
              type="button"
            >
              {useSmartUI ? 'Classic' : 'Smart'}
            </button>
          </div>
        </div>

        <div className="space-y-2 lg:hidden">
          <div className="panel flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <h1 className="section-title truncate text-base tracking-wide">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-pill">{modeLabel}</span>
              <button
                onClick={onToggleSmartUI}
                className="rounded px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
                title="Toggle UI mode"
                type="button"
              >
                {useSmartUI ? 'Classic' : 'Smart'}
              </button>
            </div>
          </div>

          <div className="panel-muted flex items-center gap-2 px-2 py-2">
            <div className="min-w-0 flex-1 overflow-x-auto">
              {controls}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="panel-muted px-3 py-2">{timeDisplay}</div>
            <div className="panel-muted px-3 py-2">{biomeDisplay}</div>
          </div>
          <div className="panel-muted px-3 py-2">{resourceDisplay}</div>
        </div>
      </div>
    </header>
  );
}
