import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';

// Particle system for various effects
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
  type: 'spark' | 'smoke' | 'acid' | 'blood' | 'energy';
}

interface ParticleSystemProps {
  particles: Particle[];
  className?: string;
}

export function ParticleSystem({ particles, className = '' }: ParticleSystemProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${className}`}>
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: particle.x + particle.vx * particle.life,
              y: particle.y + particle.vy * particle.life,
              scale: particle.size,
              opacity: 1 - particle.life / particle.maxLife,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: particle.maxLife / 1000,
              ease: 'easeOut',
            }}
            className={`absolute w-2 h-2 rounded-full ${getParticleStyle(particle.type)}`}
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function getParticleStyle(type: Particle['type']): string {
  switch (type) {
    case 'spark':
      return 'shadow-lg shadow-yellow-400/50';
    case 'smoke':
      return 'opacity-60 blur-sm';
    case 'acid':
      return 'shadow-lg shadow-green-400/50';
    case 'blood':
      return 'shadow-sm';
    case 'energy':
      return 'shadow-lg shadow-blue-400/50 animate-pulse';
    default:
      return '';
  }
}

// Animated background effects
export function AnimatedBackground() {
  const [stars, setStars] = useState<
    Array<{ id: string; x: number; y: number; opacity: number; size: number }>
  >([]);

  useEffect(() => {
    const starCount = 50;
    const newStars = Array.from({ length: starCount }, (_, i) => ({
      id: `star-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.2,
      size: Math.random() * 2 + 1,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated grid lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Glitch effect component
interface GlitchTextProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  trigger?: boolean;
}

export function GlitchText({ children, intensity = 'medium', trigger = false }: GlitchTextProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      const glitchAnimation = async () => {
        const iterations = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 8;

        for (let i = 0; i < iterations; i++) {
          await controls.start({
            x: [0, -2, 2, -1, 1, 0],
            textShadow: [
              '0 0 0 transparent',
              '2px 0 0 #ff0040, -2px 0 0 #00ff41',
              '-2px 0 0 #ff0040, 2px 0 0 #00ff41',
              '0 0 0 transparent',
            ],
            transition: { duration: 0.1 },
          });
        }
      };

      glitchAnimation();
    }
  }, [trigger, intensity, controls]);

  return (
    <motion.div animate={controls} className="inline-block">
      {children}
    </motion.div>
  );
}

// Containment breach effect
export function ContainmentBreachEffect({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Red alert overlay */}
          <motion.div
            className="fixed inset-0 bg-red-600/20 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Screen shake effect */}
          <motion.div
            className="fixed inset-0 pointer-events-none z-20"
            animate={{
              x: [0, -5, 5, -3, 3, 0],
              y: [0, -2, 2, -1, 1, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Alert borders */}
          <motion.div
            className="fixed inset-0 border-4 border-red-500 pointer-events-none z-25"
            animate={{
              borderColor: ['#ef4444', '#7f1d1d', '#ef4444'],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// Holographic display effect
interface HologramProps {
  children: React.ReactNode;
  className?: string;
  flicker?: boolean;
}

export function Hologram({ children, className = '', flicker = true }: HologramProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        flicker
          ? {
              opacity: [1, 0.8, 1, 0.9, 1],
            }
          : {}
      }
      transition={
        flicker
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      {/* Hologram content */}
      <div className="relative z-10 text-cyan-400">{children}</div>

      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(6, 182, 212, 0.1) 2px,
            rgba(6, 182, 212, 0.1) 4px
          )`,
        }}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-cyan-400/10 rounded blur-sm -z-10" />
    </motion.div>
  );
}

// Energy pulse effect for facilities
export function EnergyPulse({
  isActive,
  color = '#10b981',
}: {
  isActive: boolean;
  color?: string;
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 pointer-events-none"
          style={{ borderColor: color }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 2, 3],
            opacity: [1, 0.5, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </AnimatePresence>
  );
}

// Matrix-style digital rain
export function DigitalRain() {
  const [drops, setDrops] = useState<
    Array<{ id: string; x: number; chars: string[]; speed: number }>
  >([]);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split('');
    const columns = Math.floor(window.innerWidth / 20);

    const newDrops = Array.from({ length: columns }, (_, i) => ({
      id: `drop-${i}`,
      x: i * 20,
      chars: Array.from(
        { length: Math.floor(Math.random() * 20) + 10 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ),
      speed: Math.random() * 2 + 1,
    }));

    setDrops(newDrops);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
      {drops.map(drop => (
        <motion.div
          key={drop.id}
          className="absolute text-green-400 font-mono text-sm"
          style={{ left: drop.x }}
          animate={{
            y: [-100, window.innerHeight + 100],
          }}
          transition={{
            duration: 15 / drop.speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {drop.chars.map((char, index) => (
            <motion.div
              key={index}
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            >
              {char}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Morphing blob effect
export function MorphingBlob({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl ${className}`}
      animate={{
        scale: [1, 1.2, 0.8, 1],
        borderRadius: ['50%', '40%', '60%', '50%'],
        x: [0, 50, -30, 0],
        y: [0, -20, 30, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 50, className = '', onComplete }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-2 h-5 bg-current ml-1"
      />
    </span>
  );
}

// Lightning effect
export function Lightning({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-full h-full">
            <motion.path
              d="M100,50 L200,150 L150,200 L300,400"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.1 }}
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing particle effects
export function useParticleEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = (
    x: number,
    y: number,
    count: number,
    type: Particle['type'],
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

    // Remove particles after their lifetime
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
