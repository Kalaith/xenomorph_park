import { useState, useEffect, useRef, useCallback } from 'react';

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
  gravity?: number;
  fade?: boolean;
}

interface ParticleSystemProps {
  isActive: boolean;
  position: { x: number; y: number };
  config: ParticleConfig;
  duration?: number;
  onComplete?: () => void;
}

interface ParticleConfig {
  particleCount: number;
  particleLifespan: number;
  particleSize: { min: number; max: number };
  particleSpeed: { min: number; max: number };
  particleColors: string[];
  gravity?: number;
  spread: number; // How wide the particle spread is (in degrees)
  direction?: number; // Base direction in degrees (0 = right, 90 = up, etc.)
  fade?: boolean;
}

export function ParticleSystem({
  isActive,
  position,
  config,
  duration = 3000,
  onComplete
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (config.direction || 0) + (Math.random() - 0.5) * config.spread;
      const speed = config.particleSpeed.min + Math.random() * (config.particleSpeed.max - config.particleSpeed.min);
      const size = config.particleSize.min + Math.random() * (config.particleSize.max - config.particleSize.min);
      const color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];

      newParticles.push({
        id: `particle-${i}`,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle * Math.PI / 180) * speed,
        vy: Math.sin(angle * Math.PI / 180) * speed,
        life: config.particleLifespan,
        maxLife: config.particleLifespan,
        size,
        color,
        gravity: config.gravity || 0,
        fade: config.fade || false,
      });
    }

    setParticles(newParticles);
  }, [config, position.x, position.y]);

  const animate = useCallback(() => {
    const step = () => {
      setParticles(prevParticles => {
        const currentTime = Date.now();
        const elapsed = currentTime - (startTimeRef.current || 0);

        if (elapsed >= duration) {
          onComplete?.();
          return [];
        }

        return prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + (particle.gravity || 0),
            life: particle.life - 1,
          }))
          .filter(particle => particle.life > 0);
      });

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
  }, [duration, onComplete]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      createParticles();
      animate();
    } else {
      setParticles([]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, createParticles, isActive]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map(particle => {
        const opacity = particle.fade
          ? particle.life / particle.maxLife
          : 1;

        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        );
      })}
    </div>
  );
}

// Predefined particle configurations
export const PARTICLE_CONFIGS = {
  containmentBreach: {
    particleCount: 50,
    particleLifespan: 120,
    particleSize: { min: 2, max: 8 },
    particleSpeed: { min: 2, max: 8 },
    particleColors: ['#ff0040', '#ff4040', '#ff8080', '#ffaa00'],
    gravity: 0.1,
    spread: 360,
    direction: 270, // Up
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
    direction: 270, // Up
    fade: true,
  } as ParticleConfig,

  smoke: {
    particleCount: 25,
    particleLifespan: 200,
    particleSize: { min: 8, max: 20 },
    particleSpeed: { min: 0.5, max: 2 },
    particleColors: ['rgba(100,100,100,0.7)', 'rgba(80,80,80,0.5)', 'rgba(60,60,60,0.3)'],
    gravity: -0.02, // Negative gravity for upward movement
    spread: 45,
    direction: 270, // Up
    fade: true,
  } as ParticleConfig,
};

// Hook for managing particle effects
export function useParticles() {
  const [activeEffects, setActiveEffects] = useState<Array<{
    id: string;
    position: { x: number; y: number };
    config: ParticleConfig;
    duration: number;
  }>>([]);

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

  // Convenience methods for common effects
  const triggerContainmentBreach = (position: { x: number; y: number }) => {
    addParticleEffect(position, PARTICLE_CONFIGS.containmentBreach, 4000);
  };

  const triggerExplosion = (position: { x: number; y: number }) => {
    addParticleEffect(position, PARTICLE_CONFIGS.explosion, 2500);
  };

  const triggerSparks = (position: { x: number; y: number }) => {
    addParticleEffect(position, PARTICLE_CONFIGS.sparks, 2000);
  };

  const triggerSmoke = (position: { x: number; y: number }) => {
    addParticleEffect(position, PARTICLE_CONFIGS.smoke, 5000);
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
