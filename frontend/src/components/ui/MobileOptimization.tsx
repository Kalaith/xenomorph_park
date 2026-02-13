import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';

// Touch controls for mobile devices
interface TouchControlsProps {
  onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

export function TouchControls({ 
  onMove, 
  onAction, 
  onSecondaryAction, 
  className = '' 
}: TouchControlsProps) {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleJoystickDrag = (_event: unknown, info: PanInfo) => {
    const maxDistance = 40;
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    
    if (distance <= maxDistance) {
      setJoystickPosition({ x: info.offset.x, y: info.offset.y });
    } else {
      const angle = Math.atan2(info.offset.y, info.offset.x);
      setJoystickPosition({
        x: Math.cos(angle) * maxDistance,
        y: Math.sin(angle) * maxDistance
      });
    }

    // Trigger movement based on joystick position
    if (onMove && distance > 20) {
      const angle = Math.atan2(info.offset.y, info.offset.x);
      const degrees = (angle * 180) / Math.PI;
      
      if (degrees >= -45 && degrees <= 45) {
        onMove('right');
      } else if (degrees >= 45 && degrees <= 135) {
        onMove('down');
      } else if (degrees >= -135 && degrees <= -45) {
        onMove('up');
      } else {
        onMove('left');
      }
    }
  };

  const handleJoystickEnd = () => {
    setJoystickPosition({ x: 0, y: 0 });
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-50 ${className}`}>
      {/* Virtual Joystick */}
      <div className="relative pointer-events-auto">
        <div className="w-20 h-20 bg-slate-800/80 rounded-full border-2 border-green-400/50 flex items-center justify-center backdrop-blur-sm">
          <motion.div
            ref={joystickRef}
            className="w-8 h-8 bg-green-400 rounded-full cursor-pointer touch-none"
            drag
            dragConstraints={{
              top: -40,
              left: -40,
              right: 40,
              bottom: 40,
            }}
            dragElastic={0}
            onDrag={handleJoystickDrag}
            onDragEnd={handleJoystickEnd}
            animate={{
              x: joystickPosition.x,
              y: joystickPosition.y,
            }}
            whileDrag={{ scale: 1.2 }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pointer-events-auto">
        {onSecondaryAction && (
          <motion.button
            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-yellow-400/50 flex items-center justify-center text-yellow-400 text-xl font-bold backdrop-blur-sm"
            whileTap={{ scale: 0.9 }}
            onTouchStart={onSecondaryAction}
          >
            R
          </motion.button>
        )}
        
        {onAction && (
          <motion.button
            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-red-400/50 flex items-center justify-center text-red-400 text-xl font-bold backdrop-blur-sm"
            whileTap={{ scale: 0.9 }}
            onTouchStart={onAction}
          >
            🔫
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Swipe gesture handler
interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SwipeGesture({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown, 
  children, 
  className = '' 
}: SwipeGestureProps) {
  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

// Mobile-optimized modal
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function MobileModal({ isOpen, onClose, title, children }: MobileModalProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (currentY - startY > 100) {
      onClose();
    }
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center lg:justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        className="w-full max-h-[90vh] bg-slate-900 rounded-t-2xl lg:rounded-lg lg:max-w-2xl lg:max-h-[80vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator */}
        <div className="flex justify-center py-2 lg:hidden">
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-green-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 text-xl p-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Touch-optimized grid
interface TouchGridProps {
  items: Array<{ id: string; content: React.ReactNode; onTap?: () => void }>;
  columns?: number;
  className?: string;
}

export function TouchGrid({ items, columns = 2, className = '' }: TouchGridProps) {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="bg-slate-800 rounded-lg p-4 border border-slate-600 min-h-[120px] flex items-center justify-center cursor-pointer"
          whileTap={{ scale: 0.95 }}
          onTap={item.onTap}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && scrollRef.current?.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, (currentY - startY) * 0.5);
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <div
      ref={scrollRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center py-2 text-green-400"
        animate={{ 
          height: pullDistance,
          opacity: pullDistance > 0 ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
      >
        {isRefreshing ? (
          <div className="animate-spin text-xl">🔄</div>
        ) : pullDistance > 60 ? (
          <span className="text-sm">Release to refresh</span>
        ) : pullDistance > 0 ? (
          <span className="text-sm">Pull to refresh</span>
        ) : null}
      </motion.div>

      {children}
    </div>
  );
}

// Mobile navigation tabs
interface MobileTabsProps {
  tabs: Array<{ id: string; label: string; icon: string; badge?: number }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onTabChange, className = '' }: MobileTabsProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 lg:hidden ${className}`}>
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`
              flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors
              ${activeTab === tab.id 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-slate-400 hover:text-slate-300'
              }
            `}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="relative">
              <span className="text-lg">{tab.icon}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Device orientation handler
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// Touch feedback hook
export function useTouchFeedback() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    // Add touch feedback
    const ripple = document.createElement('div');
    ripple.className = 'fixed w-4 h-4 bg-green-400/30 rounded-full pointer-events-none z-50 animate-ping';
    ripple.style.left = `${touch.clientX - 8}px`;
    ripple.style.top = `${touch.clientY - 8}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 1000);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { touchStart };
}

// Mobile-specific viewport management
export function useMobileViewport() {
  useEffect(() => {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Set viewport meta tag for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevent pull-to-refresh on body
    const preventPullToRefresh = (e: TouchEvent) => {
      if (e.touches.length === 1 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    document.body.addEventListener('touchstart', preventPullToRefresh, { passive: false });
    document.body.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventZoom);
      document.body.removeEventListener('touchstart', preventPullToRefresh);
      document.body.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);
}
