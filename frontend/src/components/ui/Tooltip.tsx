import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right" | "auto";
  delay?: number;
  disabled?: boolean;
  rich?: boolean; // Whether to show rich content
  maxWidth?: number;
}

export function Tooltip({
  content,
  children,
  position = "auto",
  delay = 500,
  disabled = false,
  rich = false,
  maxWidth = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate optimal position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let optimalPosition = position;

    if (position === "auto") {
      // Calculate which position fits best
      const spaceTop = triggerRect.top;
      const spaceBottom = viewport.height - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewport.width - triggerRect.right;

      if (spaceBottom >= tooltipRect.height) {
        optimalPosition = "bottom";
      } else if (spaceTop >= tooltipRect.height) {
        optimalPosition = "top";
      } else if (spaceRight >= tooltipRect.width) {
        optimalPosition = "right";
      } else if (spaceLeft >= tooltipRect.width) {
        optimalPosition = "left";
      } else {
        optimalPosition = "bottom"; // Default fallback
      }
    }

    setTooltipPosition(optimalPosition);
  }, [isVisible, position]);

  const getTooltipStyle = () => {
    if (!triggerRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const offset = 8;

    switch (tooltipPosition) {
      case "top":
        return {
          bottom: window.innerHeight - triggerRect.top + offset,
          left: triggerRect.left + triggerRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: triggerRect.bottom + offset,
          left: triggerRect.left + triggerRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: triggerRect.top + triggerRect.height / 2,
          right: window.innerWidth - triggerRect.left + offset,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: triggerRect.top + triggerRect.height / 2,
          left: triggerRect.right + offset,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: triggerRect.bottom + offset,
          left: triggerRect.left + triggerRect.width / 2,
          transform: "translateX(-50%)",
        };
    }
  };

  const getArrowStyle = () => {
    const baseClasses =
      "absolute w-2 h-2 bg-slate-800 border border-slate-600 rotate-45";

    switch (tooltipPosition) {
      case "top":
        return `${baseClasses} -bottom-1 left-1/2 transform -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} -top-1 left-1/2 transform -translate-x-1/2`;
      case "left":
        return `${baseClasses} -right-1 top-1/2 transform -translate-y-1/2`;
      case "right":
        return `${baseClasses} -left-1 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} -top-1 left-1/2 transform -translate-x-1/2`;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && content && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 pointer-events-none" />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none"
            style={getTooltipStyle()}
          >
            <div
              className={`
                bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3
                text-sm text-slate-200
                ${rich ? "min-w-48" : "whitespace-nowrap"}
                animate-in fade-in-0 zoom-in-95 duration-200
              `}
              style={{ maxWidth: `${maxWidth}px` }}
            >
              {/* Arrow */}
              <div className={getArrowStyle()} />

              {/* Content */}
              <div className="relative z-10">{content}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Rich tooltip content components
export function TooltipContent({
  title,
  description,
  stats,
  actions,
}: {
  title: string;
  description?: string;
  stats?: Array<{ label: string; value: string | number; color?: string }>;
  actions?: Array<{ label: string; shortcut?: string }>;
}) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-green-400">{title}</div>

      {description && (
        <div className="text-slate-300 text-xs leading-relaxed">
          {description}
        </div>
      )}

      {stats && stats.length > 0 && (
        <div className="space-y-1 border-t border-slate-600 pt-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-slate-400">{stat.label}:</span>
              <span className={stat.color || "text-slate-200"}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="space-y-1 border-t border-slate-600 pt-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-slate-400">{action.label}</span>
              {action.shortcut && (
                <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-300 text-xs">
                  {action.shortcut}
                </kbd>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
