import { createContext, useContext, ReactNode } from 'react';

interface ParticleContextType {
  triggerContainmentBreach: (position: { x: number; y: number }) => void;
  triggerExplosion: (position: { x: number; y: number }) => void;
  triggerSparks: (position: { x: number; y: number }) => void;
  triggerSmoke: (position: { x: number; y: number }) => void;
}

const ParticleContext = createContext<ParticleContextType | null>(null);

export function useParticleContext() {
  const context = useContext(ParticleContext);
  if (!context) {
    // Return no-op functions if context is not available
    return {
      triggerContainmentBreach: () => {},
      triggerExplosion: () => {},
      triggerSparks: () => {},
      triggerSmoke: () => {},
    };
  }
  return context;
}

export function ParticleProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ParticleContextType;
}) {
  return (
    <ParticleContext.Provider value={value}>
      {children}
    </ParticleContext.Provider>
  );
}