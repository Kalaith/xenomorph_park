import { useState } from 'react';
import { ParticleSystem } from './AdvancedAnimations';

type ParticleType = 'spark' | 'smoke' | 'acid' | 'blood' | 'energy';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: ParticleType;
}

export function useParticleEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = (
    x: number,
    y: number,
    count: number,
    type: ParticleType,
    color?: string
  ) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      life: 0,
      maxLife: Math.random() * 2000 + 1000,
      size: Math.random() * 1.5 + 0.5,
      color: color || (type === 'spark' ? '#fbbf24' : type === 'acid' ? '#10b981' : '#ef4444'),
      type,
    }));

    setParticles(prev => [...prev, ...newParticles]);

    newParticles.forEach(particle => {
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, particle.maxLife);
    });
  };

  return {
    particles,
    createParticles,
    ParticleRenderer: () => <ParticleSystem particles={particles} />,
  };
}
