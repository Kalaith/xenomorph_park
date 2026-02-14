import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Screen reader announcements
interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
}: ScreenReaderAnnouncementProps) {
  return (
    <div role="status" aria-live={priority} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

// Skip navigation links
export function SkipNavigation() {
  return (
    <div className="sr-only skip-nav-container z-50">
      <a
        href="#main-content"
        className="bg-green-400 text-black px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="bg-green-400 text-black px-4 py-2 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-green-600"
      >
        Skip to navigation
      </a>
    </div>
  );
}

// Focus trap for modals
interface FocusTrapProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FocusTrap({ isActive, children, className = '' }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const focusableArray = Array.from(focusableElements) as HTMLElement[];
    firstFocusableRef.current = focusableArray[0];
    lastFocusableRef.current = focusableArray[focusableArray.length - 1];

    // Focus the first element
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusableRef.current) {
            e.preventDefault();
            lastFocusableRef.current?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusableRef.current) {
            e.preventDefault();
            firstFocusableRef.current?.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        // Allow parent to handle escape
        const escapeEvent = new CustomEvent('focustrap-escape');
        containerRef.current?.dispatchEvent(escapeEvent);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = '',
}: AccessibleButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-500';
      default:
        return 'bg-green-600 hover:bg-green-700 text-white border-green-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={`
        font-medium border-2 rounded transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Accessible form field with proper labeling
interface AccessibleFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function AccessibleField({
  label,
  children,
  error,
  hint,
  required = false,
  className = '',
}: AccessibleFieldProps) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-300">
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <div>
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id: fieldId,
          'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required,
        })}
      </div>

      {hint && (
        <p id={hintId} className="text-sm text-slate-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible modal with proper ARIA attributes
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description
    ? `modal-desc-${Math.random().toString(36).substr(2, 9)}`
    : undefined;

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';

      // Announce modal opening
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Dialog opened: ${title}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <FocusTrap isActive={isOpen} className="w-full max-w-2xl max-h-[90vh] mx-4">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`bg-slate-900 border border-green-400/30 rounded-lg overflow-hidden ${className}`}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 id={titleId} className="text-xl font-bold text-green-400">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          {description && (
            <p
              id={descriptionId}
              className="px-4 py-2 text-slate-400 text-sm border-b border-slate-700"
            >
              {description}
            </p>
          )}

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
        </motion.div>
      </FocusTrap>
    </div>
  );
}

// Live region for dynamic content updates
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  className = '',
}: LiveRegionProps) {
  return (
    <div role="status" aria-live={priority} aria-atomic={atomic} className={`sr-only ${className}`}>
      {children}
    </div>
  );
}

// Keyboard navigation hints
interface KeyboardHintsProps {
  shortcuts: Array<{ keys: string; description: string }>;
  className?: string;
}

export function KeyboardHints({ shortcuts, className = '' }: KeyboardHintsProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setShowHints(!showHints)}
        className="text-sm text-slate-400 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-2 py-1"
        aria-expanded={showHints}
        aria-controls="keyboard-hints"
      >
        ⌨️ Keyboard Shortcuts
      </button>

      {showHints && (
        <div
          id="keyboard-hints"
          className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg z-50 min-w-64"
          role="region"
          aria-label="Keyboard shortcuts"
        >
          <h3 className="text-green-400 font-semibold mb-3">Keyboard Shortcuts</h3>
          <ul className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <li key={index} className="flex justify-between text-sm">
                <span className="text-slate-300">{shortcut.description}</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                  {shortcut.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Progress indicator with percentage for screen readers
interface AccessibleProgressProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export function AccessibleProgress({ value, max, label, className = '' }: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}% complete`}
        className="w-full bg-slate-700 rounded-full h-2"
      >
        <div
          className="bg-green-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <LiveRegion>
        {label} progress: {percentage}% complete
      </LiveRegion>
    </div>
  );
}

// Error boundary with accessible error messages
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class AccessibleErrorBoundary extends React.Component<
  AccessibleErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: AccessibleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Accessibility Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div role="alert" className="bg-red-900/30 border border-red-400/30 rounded-lg p-4 m-4">
            <h2 className="text-red-400 font-bold text-lg mb-2">Something went wrong</h2>
            <p className="text-slate-300 mb-4">
              An error occurred while rendering this component. Please try refreshing the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
