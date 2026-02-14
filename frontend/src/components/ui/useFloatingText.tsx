import { useState } from 'react';
import { FloatingText } from './FloatingText';

interface FloatingTextItem {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  duration: number;
  size?: 'sm' | 'md' | 'lg';
}

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

    setFloatingTexts(prev => [
      ...prev,
      {
        id,
        text,
        color,
        position,
        duration,
        size,
      },
    ]);
  };

  const removeFloatingText = (id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  };

  const addResourceChange = (resource: string, amount: number, element?: HTMLElement) => {
    let color = 'text-white';
    let prefix = '';

    if (amount > 0) {
      color = 'text-green-400';
      prefix = '+';
    } else if (amount < 0) {
      color = 'text-red-400';
    }

    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    if (element) {
      const rect = element.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    position.x += (Math.random() - 0.5) * 100;
    position.y += (Math.random() - 0.5) * 50;

    const icon = getResourceIcon(resource);
    const text = `${prefix}${Math.abs(amount)} ${icon}`;

    addFloatingText(text, position, color, 2000, amount > 100 ? 'lg' : 'md');
  };

  const getResourceIcon = (resource: string) => {
    const icons: Record<string, string> = {
      credits: '\u{1F4B0}',
      power: '\u26A1',
      research: '\u{1F52C}',
      visitors: '\u{1F465}',
    };
    return icons[resource.toLowerCase()] || '';
  };

  return {
    floatingTexts,
    addFloatingText,
    removeFloatingText,
    addResourceChange,
    FloatingTextComponent: () => (
      <FloatingText items={floatingTexts} onAnimationEnd={removeFloatingText} />
    ),
  };
}
