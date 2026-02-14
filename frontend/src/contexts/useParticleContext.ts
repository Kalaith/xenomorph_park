import { useContext } from 'react';
import { ParticleContext } from './particleContextValue';

export function useParticleContext() {
  const context = useContext(ParticleContext);
  if (!context) {
    return {
      triggerContainmentBreach: () => {},
      triggerExplosion: () => {},
      triggerSparks: () => {},
      triggerSmoke: () => {},
    };
  }
  return context;
}
