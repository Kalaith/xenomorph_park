import { useState } from 'react';
import { ParticleSystem } from './ParticleSystem';

interface ParticleConfig {
  particleCount: number;
  particleLifespan: number;
  particleSize: { min: number; max: number };
  particleSpeed: { min: number; max: number };
  particleColors: string[];
  gravity?: number;
  spread: number;
  direction?: number;
  fade?: boolean;
}

export const particleConfigs = {
  containmentBreach: {
    particleCount: 50,
    particleLifespan: 120,
    particleSize: { min: 2, max: 8 },
    particleSpeed: { min: 2, max: 8 },
    particleColors: ['#ff0040', '#ff4040', '#ff8080', '#ffaa00'],
    gravity: 0.1,
    spread: 360,
    direction: 270,
    fade: true,
  } as ParticleConfig,

  explosion: {
    particleCount: 75,
    particleLifespan: 100,
    particleSize: { min: 3, max: 12 },
    particleSpeed: { min: 3, max: 12 },
    particleColors: ['#ffaa00', '#ff4040', '#ff0040', '#ffffff'],
    gravity: 0.2,
    spread: 360,
    direction: 0,
    fade: true,
  } as ParticleConfig,

  sparks: {
    particleCount: 30,
    particleLifespan: 80,
    particleSize: { min: 1, max: 4 },
    particleSpeed: { min: 1, max: 6 },
    particleColors: ['#00ff41', '#00cc33', '#ffffff'],
    gravity: 0.05,
    spread: 90,
    direction: 270,
    fade: true,
  } as ParticleConfig,

  smoke: {
    particleCount: 25,
    particleLifespan: 200,
    particleSize: { min: 8, max: 20 },
    particleSpeed: { min: 0.5, max: 2 },
    particleColors: ['rgba(100,100,100,0.7)', 'rgba(80,80,80,0.5)', 'rgba(60,60,60,0.3)'],
    gravity: -0.02,
    spread: 45,
    direction: 270,
    fade: true,
  } as ParticleConfig,
};

export function useParticles() {
  const [activeEffects, setActiveEffects] = useState<
    Array<{
      id: string;
      position: { x: number; y: number };
      config: ParticleConfig;
      duration: number;
    }>
  >([]);

  const addParticleEffect = (
    position: { x: number; y: number },
    config: ParticleConfig,
    duration: number = 3000
  ) => {
    const id = `effect-${Date.now()}-${Math.random()}`;
    setActiveEffects(prev => [...prev, { id, position, config, duration }]);
  };

  const removeParticleEffect = (id: string) => {
    setActiveEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const triggerContainmentBreach = (position: { x: number; y: number }) => {
    addParticleEffect(position, particleConfigs.containmentBreach, 4000);
  };

  const triggerExplosion = (position: { x: number; y: number }) => {
    addParticleEffect(position, particleConfigs.explosion, 2500);
  };

  const triggerSparks = (position: { x: number; y: number }) => {
    addParticleEffect(position, particleConfigs.sparks, 2000);
  };

  const triggerSmoke = (position: { x: number; y: number }) => {
    addParticleEffect(position, particleConfigs.smoke, 5000);
  };

  return {
    activeEffects,
    addParticleEffect,
    removeParticleEffect,
    triggerContainmentBreach,
    triggerExplosion,
    triggerSparks,
    triggerSmoke,
    ParticleSystemComponent: () => (
      <>
        {activeEffects.map(effect => (
          <ParticleSystem
            key={effect.id}
            isActive={true}
            position={effect.position}
            config={effect.config}
            duration={effect.duration}
            onComplete={() => removeParticleEffect(effect.id)}
          />
        ))}
      </>
    ),
  };
}
