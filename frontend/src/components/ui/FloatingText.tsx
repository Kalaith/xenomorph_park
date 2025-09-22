import { useState, useEffect } from 'react';

interface FloatingTextItem {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  duration: number;
  size?: 'sm' | 'md' | 'lg';
}

interface FloatingTextProps {
  items: FloatingTextItem[];
  onAnimationEnd: (id: string) => void;
}

export function FloatingText({ items, onAnimationEnd }: FloatingTextProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {items.map((item) => (
        <FloatingTextItem
          key={item.id}
          item={item}
          onAnimationEnd={onAnimationEnd}
        />
      ))}
    </div>
  );
}

function FloatingTextItem({
  item,
  onAnimationEnd
}: {
  item: FloatingTextItem;
  onAnimationEnd: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onAnimationEnd(item.id), 200); // Allow fade out animation
    }, item.duration);

    return () => clearTimeout(timer);
  }, [item.duration, item.id, onAnimationEnd]);

  const getSizeClasses = () => {
    switch (item.size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <div
      className={`
        absolute font-bold font-mono select-none
        ${getSizeClasses()}
        ${item.color}
        ${isVisible
          ? 'animate-[float_2s_ease-out_forwards]'
          : 'animate-[fadeOut_0.2s_ease-out_forwards]'
        }
      `}
      style={{
        left: item.position.x,
        top: item.position.y,
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      {item.text}
    </div>
  );
}

// Hook for managing floating text
export function useFloatingText() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);

  const addFloatingText = (
    text: string,
    position: { x: number; y: number },
    color: string = 'text-white',
    duration: number = 2000,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const id = `floating-${Date.now()}-${Math.random()}`;

    setFloatingTexts(prev => [...prev, {
      id,
      text,
      color,
      position,
      duration,
      size,
    }]);
  };

  const removeFloatingText = (id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  };

  // Helper to add resource change feedback
  const addResourceChange = (
    resource: string,
    amount: number,
    element?: HTMLElement
  ) => {
    let color = 'text-white';
    let prefix = '';

    if (amount > 0) {
      color = 'text-green-400';
      prefix = '+';
    } else if (amount < 0) {
      color = 'text-red-400';
    }

    // Get position from element or use center of screen
    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    if (element) {
      const rect = element.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    // Add some randomness to avoid overlap
    position.x += (Math.random() - 0.5) * 100;
    position.y += (Math.random() - 0.5) * 50;

    const icon = getResourceIcon(resource);
    const text = `${prefix}${Math.abs(amount)} ${icon}`;

    addFloatingText(text, position, color, 2000, amount > 100 ? 'lg' : 'md');
  };

  const getResourceIcon = (resource: string) => {
    const icons: Record<string, string> = {
      credits: '💰',
      power: '⚡',
      research: '🔬',
      visitors: '👥',
    };
    return icons[resource.toLowerCase()] || '';
  };

  return {
    floatingTexts,
    addFloatingText,
    removeFloatingText,
    addResourceChange,
    FloatingTextComponent: () => (
      <FloatingText
        items={floatingTexts}
        onAnimationEnd={removeFloatingText}
      />
    ),
  };
}