import { createContext } from 'react';

export interface FloatingTextContextType {
  addResourceChange: (resource: string, amount: number, element?: HTMLElement) => void;
  addFloatingText: (
    text: string,
    position: { x: number; y: number },
    color?: string,
    duration?: number,
    size?: 'sm' | 'md' | 'lg'
  ) => void;
}

export const FloatingTextContext = createContext<FloatingTextContextType | null>(null);
