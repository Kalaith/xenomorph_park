import { useState, useEffect, useCallback } from 'react';
import { StatusMessage } from '../../types';

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
  defaultDuration?: number;
}

interface NotificationItem extends StatusMessage {
  duration: number;
  isVisible: boolean;
  isExiting: boolean;
}

const NOTIFICATION_ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
};

const NOTIFICATION_COLORS = {
  info: {
    bg: 'bg-blue-400/20',
    border: 'border-blue-400/30',
    text: 'text-blue-400'
  },
  success: {
    bg: 'bg-green-400/20',
    border: 'border-green-400/30',
    text: 'text-green-400'
  },
  warning: {
    bg: 'bg-yellow-400/20',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400'
  },
  error: {
    bg: 'bg-red-400/20',
    border: 'border-red-400/30',
    text: 'text-red-400'
  }
};

export function NotificationSystem({ 
  position = 'top-right', 
  maxNotifications = 5,
  defaultDuration = 4000 
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Add notification function that can be called from outside
  const addNotification = useCallback((message: string, type: StatusMessage['type'], duration?: number) => {
    const notification: NotificationItem = {
      id: `notification-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
      duration: duration ?? defaultDuration,
      isVisible: false,
      isExiting: false
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      
      // Limit number of notifications
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(0, maxNotifications);
      }
      
      return newNotifications;
    });

    // Make visible after a brief delay for animation
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isVisible: true } : n)
      );
    }, 10);

    // Auto remove after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, [defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    // Start exit animation
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isExiting: true } : n)
    );

    // Remove after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  // Expose addNotification globally for use in stores
  useEffect(() => {
    // @ts-ignore - Adding to window for global access
    window.addNotification = addNotification;
    
    return () => {
      // @ts-ignore
      delete window.addNotification;
    };
  }, [addNotification]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={getPositionClasses()}>
      <div className="space-y-2 w-80">
        {notifications.map((notification) => {
          const colors = NOTIFICATION_COLORS[notification.type];
          const icon = NOTIFICATION_ICONS[notification.type];
          
          return (
            <div
              key={notification.id}
              className={`
                pointer-events-auto
                ${colors.bg} ${colors.border} border rounded-lg p-3
                backdrop-blur-sm shadow-lg
                transition-all duration-300 ease-in-out
                ${notification.isVisible && !notification.isExiting 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-full opacity-0'
                }
                ${notification.isExiting ? 'translate-x-full opacity-0' : ''}
                hover:scale-105 cursor-pointer
              `}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              
              {/* Progress bar for timed notifications */}
              {notification.duration > 0 && (
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.text.replace('text-', 'bg-')} transition-all ease-linear`}
                    style={{
                      animation: `shrink ${notification.duration}ms linear`,
                      animationFillMode: 'forwards'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Hook for easy access to notifications
export function useNotifications() {
  const addNotification = useCallback((message: string, type: StatusMessage['type'], duration?: number) => {
    // @ts-ignore
    if (window.addNotification) {
      // @ts-ignore
      window.addNotification(message, type, duration);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }, []);

  return { addNotification };
}