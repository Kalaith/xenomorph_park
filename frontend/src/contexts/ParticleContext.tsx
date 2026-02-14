import { ReactNode } from 'react';
import { ParticleContext, ParticleContextType } from './particleContextValue';

export function ParticleProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ParticleContextType;
}) {
  return <ParticleContext.Provider value={value}>{children}</ParticleContext.Provider>;
}
