import { useState, useEffect } from 'react';

interface FloatingNumberProps {
  value: number;
  x: number;
  y: number;
  type: 'credits' | 'power' | 'research' | 'damage';
  onComplete: () => void;
}

interface PulseEffectProps {
  children: React.ReactNode;
  pulse: boolean;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

interface ShakeEffectProps {
  children: React.ReactNode;
  shake: boolean;
}

// Floating number animation for resource changes
export function FloatingNumber({ value, x, y, type, onComplete }: FloatingNumberProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTypeStyles = () => {
    switch (type) {
      case 'credits':
        return 'text-yellow-400';
      case 'power':
        return 'text-blue-400';
      case 'research':
        return 'text-purple-400';
      case 'damage':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  const formatValue = () => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}`;
  };

  return (
    <div
      className={`
        fixed pointer-events-none z-50 font-bold text-lg
        transition-all duration-1500 ease-out
        ${getTypeStyles()}
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-8'}
      `}
      style={{
        left: x,
        top: y,
        textShadow: '0 0 10px currentColor',
      }}
    >
      {formatValue()}
    </div>
  );
}

// Pulse effect for highlighting elements
export function PulseEffect({ children, pulse, color = 'green' }: PulseEffectProps) {
  const getColorClass = () => {
    switch (color) {
      case 'red':
        return 'shadow-red-400/50';
      case 'blue':
        return 'shadow-blue-400/50';
      case 'yellow':
        return 'shadow-yellow-400/50';
      default:
        return 'shadow-green-400/50';
    }
  };

  return (
    <div
      className={`
        transition-all duration-500
        ${pulse ? `animate-pulse shadow-lg ${getColorClass()}` : ''}
      `}
    >
      {children}
    </div>
  );
}

// Shake effect for errors or warnings
export function ShakeEffect({ children, shake }: ShakeEffectProps) {
  return (
    <div
      className={`
        transition-transform duration-200
        ${shake ? 'animate-shake' : ''}
      `}
    >
      {children}
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({
  size = 'md',
  color = 'green',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'red' | 'yellow';
}) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-400';
      case 'red':
        return 'border-red-400';
      case 'yellow':
        return 'border-yellow-400';
      default:
        return 'border-green-400';
    }
  };

  return (
    <div
      className={`
        ${getSizeClass()} 
        ${getColorClass()}
        border-2 border-t-transparent rounded-full animate-spin
      `}
    />
  );
}

// Progress bar with animation
export function AnimatedProgressBar({
  value,
  max,
  color = 'green',
  label,
  showPercentage = true,
}: {
  value: number;
  max: number;
  color?: 'green' | 'blue' | 'red' | 'yellow';
  label?: string;
  showPercentage?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-400',
          glow: 'shadow-blue-400/30',
        };
      case 'red':
        return {
          bg: 'bg-red-400',
          glow: 'shadow-red-400/30',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-400',
          glow: 'shadow-yellow-400/30',
        };
      default:
        return {
          bg: 'bg-green-400',
          glow: 'shadow-green-400/30',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>{label}</span>
          {showPercentage && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`
            h-full ${colors.bg} ${colors.glow}
            transition-all duration-500 ease-out
            shadow-sm
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Button with enhanced feedback
export function FeedbackButton({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  success = false,
  error = false,
  disabled = false,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> & {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  disabled?: boolean;
}) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled || loading) return;

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    onClick?.();
  };

  const getVariantClasses = () => {
    if (success) {
      return 'bg-green-500 hover:bg-green-600 text-white border-green-400';
    }
    if (error) {
      return 'bg-red-500 hover:bg-red-600 text-white border-red-400';
    }
    if (disabled || loading) {
      return 'bg-slate-600 text-slate-400 border-slate-500 cursor-not-allowed';
    }

    switch (variant) {
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-500';
      default:
        return 'bg-green-600 hover:bg-green-700 text-white border-green-500';
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded border transition-all duration-200
        ${getVariantClasses()}
        ${isClicked ? 'transform scale-95' : 'transform scale-100'}
        ${loading ? 'animate-pulse' : ''}
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${variant === 'primary' ? 'focus:ring-green-400' : 'focus:ring-slate-400'}
      `}
    >
      <div className="flex items-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {success && !loading && <span>✓</span>}
        {error && !loading && <span>✗</span>}
        {children}
      </div>
    </button>
  );
}
