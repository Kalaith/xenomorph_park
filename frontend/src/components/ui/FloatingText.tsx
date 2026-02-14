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
      {items.map(item => (
        <FloatingTextItem key={item.id} item={item} onAnimationEnd={onAnimationEnd} />
      ))}
    </div>
  );
}

function FloatingTextItem({
  item,
  onAnimationEnd,
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
        ${
          isVisible
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
