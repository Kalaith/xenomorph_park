import { createContext } from 'react';

export interface ParticleContextType {
  triggerContainmentBreach: (position: { x: number; y: number }) => void;
  triggerExplosion: (position: { x: number; y: number }) => void;
  triggerSparks: (position: { x: number; y: number }) => void;
  triggerSmoke: (position: { x: number; y: number }) => void;
}

export const ParticleContext = createContext<ParticleContextType | null>(null);
