import { useState } from 'react';
import { Button } from './Button';

interface ToolbarGroup {
  id: string;
  label: string;
  icon: string;
  items: ToolbarItem[];
  badge?: number;
}

interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: number | string;
}

interface SmartToolbarProps {
  groups: ToolbarGroup[];
  className?: string;
}

export function SmartToolbar({ groups, className = '' }: SmartToolbarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    if (activeGroup === groupId) {
      setActiveGroup(null);
    } else {
      setActiveGroup(groupId);
    }
  };

  return (
    <div className={`panel ${className}`}>
      <div className="flex flex-wrap items-center gap-2 p-2">
        {groups.map(group => (
          <div key={group.id} className="relative">
            <Button
              variant={activeGroup === group.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleGroup(group.id)}
              className="relative flex min-w-[88px] items-center gap-2"
            >
              <span className="text-lg">{group.icon}</span>
              <span className="hidden text-xs sm:inline">{group.label}</span>
              {group.badge && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {group.badge}
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {activeGroup && (
        <div className="border-t border-slate-700/70 p-3">
          {(() => {
            const group = groups.find(g => g.id === activeGroup);
            if (!group) return null;

            return (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {group.items.map(item => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      item.onClick();
                      setActiveGroup(null);
                    }}
                    disabled={item.disabled}
                    className="flex items-center justify-start gap-2 border-slate-500 text-left text-slate-200 hover:bg-slate-700/40"
                  >
                    <span>{item.icon}</span>
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded bg-slate-700 px-1 text-xs text-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
