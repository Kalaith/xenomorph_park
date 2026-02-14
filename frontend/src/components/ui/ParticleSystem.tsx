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
  onComplete,
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (config.direction || 0) + (Math.random() - 0.5) * config.spread;
      const speed =
        config.particleSpeed.min +
        Math.random() * (config.particleSpeed.max - config.particleSpeed.min);
      const size =
        config.particleSize.min +
        Math.random() * (config.particleSize.max - config.particleSize.min);
      const color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];

      newParticles.push({
        id: `particle-${i}`,
        x: position.x,
        y: position.y,
        vx: Math.cos((angle * Math.PI) / 180) * speed,
        vy: Math.sin((angle * Math.PI) / 180) * speed,
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
        const opacity = particle.fade ? particle.life / particle.maxLife : 1;

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
