import { useContext } from 'react';
import { FloatingTextContext } from './floatingTextContextValue';

export function useFloatingTextContext() {
  const context = useContext(FloatingTextContext);
  if (!context) {
    return {
      addResourceChange: () => {},
      addFloatingText: () => {},
    };
  }
  return context;
}
