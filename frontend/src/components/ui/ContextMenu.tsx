import { useEffect, useRef } from 'react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ isOpen, position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to prevent menu from going off-screen
  const adjustedPosition = () => {
    if (!menuRef.current) return position;

    const rect = menuRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewport.height) {
      y = viewport.height - rect.height - 10;
    }

    return { x: Math.max(10, x), y: Math.max(10, y) };
  };

  if (!isOpen) return null;

  const finalPosition = adjustedPosition();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-2 min-w-48"
        style={{
          left: finalPosition.x,
          top: finalPosition.y,
        }}
      >
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-4 py-2 text-left text-sm transition-colors
              flex items-center gap-3
              ${
                item.disabled
                  ? 'text-slate-500 cursor-not-allowed'
                  : item.destructive
                    ? 'text-red-400 hover:bg-red-400/10'
                    : 'text-slate-200 hover:bg-slate-700'
              }
            `}
          >
            {item.icon && <span className="text-lg leading-none">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
