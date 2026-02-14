import { useState, useEffect, useCallback } from 'react';

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

export function useTouchFeedback() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    const ripple = document.createElement('div');
    ripple.className =
      'fixed w-4 h-4 bg-green-400/30 rounded-full pointer-events-none z-50 animate-ping';
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

export function useMobileViewport() {
  useEffect(() => {
    let lastTouchEnd = 0;

    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    const preventPullToRefresh = (e: TouchEvent) => {
      if (e.touches.length === 1 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    document.body.addEventListener('touchstart', preventPullToRefresh, {
      passive: false,
    });
    document.body.addEventListener('touchmove', preventPullToRefresh, {
      passive: false,
    });

    return () => {
      document.removeEventListener('touchend', preventZoom);
      document.body.removeEventListener('touchstart', preventPullToRefresh);
      document.body.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);
}
