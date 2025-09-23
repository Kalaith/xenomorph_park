import { useState, ReactNode } from 'react';
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
  actions = []
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-slate-900/80 border border-green-400/30 rounded-lg ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-green-400 font-bold text-lg glow">{title}</h3>
          {badge && (
            <span className="bg-green-400/20 text-green-400 text-xs px-2 py-1 rounded">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Action buttons */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent panel toggle
                action.onClick();
              }}
              className="text-xs flex items-center gap-1"
            >
              <span>{action.icon}</span>
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}

          {/* Expand/collapse button */}
          <Button
            variant="outline"
            size="sm"
            className="text-green-400"
          >
            {isExpanded ? '▼' : '▶'}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-green-400/20">
          {children}
        </div>
      )}
    </div>
  );
}