import { MouseEvent, ReactNode, useState } from 'react';
import { Button } from './Button';

interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  badge?: number | string;
  actions?: Array<{
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
}

export function CollapsiblePanel({
  title,
  icon,
  children,
  defaultExpanded = true,
  className = '',
  badge,
  actions = [],
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`panel ${className}`}>
      <div
        className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-slate-800/30"
        onClick={() => setIsExpanded(value => !value)}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-sm font-semibold text-slate-300">{icon}</span>}
          <h3 className="section-title text-lg">{title}</h3>
          {badge && <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100">{badge}</span>}
        </div>

        <div className="flex items-center gap-2">
          {actions.map(action => (
            <Button
              key={action.label}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={event => {
                (event as MouseEvent).stopPropagation();
                action.onClick();
              }}
              className="flex items-center gap-1 text-xs"
            >
              <span>{action.icon}</span>
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}

          <Button variant="outline" size="sm" className="border-slate-500 text-slate-100">
            {isExpanded ? 'v' : '>'}
          </Button>
        </div>
      </div>

      {isExpanded && <div className="border-t border-slate-700/70 px-3 pb-3">{children}</div>}
    </div>
  );
}
