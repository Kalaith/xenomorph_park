import { useState, useCallback } from 'react';
import { FloatingNumber } from './VisualFeedback';

export function useFloatingNumbers() {
  const [floatingNumbers, setFloatingNumbers] = useState<
    Array<{
      id: string;
      value: number;
      x: number;
      y: number;
      type: 'credits' | 'power' | 'research' | 'damage';
    }>
  >([]);

  const addFloatingNumber = useCallback(
    (value: number, x: number, y: number, type: 'credits' | 'power' | 'research' | 'damage') => {
      const id = `floating-${Date.now()}-${Math.random()}`;
      setFloatingNumbers(prev => [...prev, { id, value, x, y, type }]);
    },
    []
  );

  const removeFloatingNumber = useCallback((id: string) => {
    setFloatingNumbers(prev => prev.filter(num => num.id !== id));
  }, []);

  const FloatingNumbersRenderer = () => (
    <>
      {floatingNumbers.map(num => (
        <FloatingNumber
          key={num.id}
          value={num.value}
          x={num.x}
          y={num.y}
          type={num.type}
          onComplete={() => removeFloatingNumber(num.id)}
        />
      ))}
    </>
  );

  return {
    addFloatingNumber,
    FloatingNumbersRenderer,
  };
}
