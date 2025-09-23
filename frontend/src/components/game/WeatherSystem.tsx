import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';

export type Weather = 'clear' | 'fog' | 'rain' | 'storm' | 'toxic_fog' | 'alien_mist';
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight';

interface WeatherEffects {
  visibility: number; // 0-1
  mood: 'calm' | 'tense' | 'dangerous' | 'ominous';
  cssFilter: string;
  particles?: {
    type: 'rain' | 'fog' | 'sparks' | 'mist';
    intensity: number;
  };
}

const WEATHER_EFFECTS: Record<Weather, WeatherEffects> = {
  clear: {
    visibility: 1,
    mood: 'calm',
    cssFilter: 'brightness(1) contrast(1) saturate(1)',
  },
  fog: {
    visibility: 0.6,
    mood: 'tense',
    cssFilter: 'brightness(0.8) contrast(0.7) saturate(0.8) blur(1px)',
    particles: { type: 'fog', intensity: 0.3 }
  },
  rain: {
    visibility: 0.7,
    mood: 'tense',
    cssFilter: 'brightness(0.6) contrast(1.2) saturate(0.9) hue-rotate(10deg)',
    particles: { type: 'rain', intensity: 0.8 }
  },
  storm: {
    visibility: 0.4,
    mood: 'dangerous',
    cssFilter: 'brightness(0.4) contrast(1.5) saturate(0.6) hue-rotate(240deg)',
    particles: { type: 'rain', intensity: 1 }
  },
  toxic_fog: {
    visibility: 0.3,
    mood: 'dangerous',
    cssFilter: 'brightness(0.5) contrast(1.3) saturate(1.5) hue-rotate(90deg) sepia(0.3)',
    particles: { type: 'mist', intensity: 0.7 }
  },
  alien_mist: {
    visibility: 0.2,
    mood: 'ominous',
    cssFilter: 'brightness(0.3) contrast(1.8) saturate(2) hue-rotate(270deg) sepia(0.5)',
    particles: { type: 'sparks', intensity: 0.4 }
  }
};

const TIME_EFFECTS: Record<TimeOfDay, { brightness: number; hue: number; filter: string }> = {
  dawn: { brightness: 0.7, hue: 30, filter: 'sepia(0.3) saturate(1.2)' },
  morning: { brightness: 1, hue: 0, filter: 'brightness(1.1) saturate(1.1)' },
  noon: { brightness: 1.2, hue: 0, filter: 'brightness(1.2) contrast(1.1)' },
  afternoon: { brightness: 1, hue: 15, filter: 'sepia(0.1) saturate(1.1)' },
  evening: { brightness: 0.8, hue: 45, filter: 'sepia(0.4) saturate(1.3) hue-rotate(20deg)' },
  night: { brightness: 0.4, hue: 240, filter: 'brightness(0.4) contrast(1.2) saturate(0.8) hue-rotate(240deg)' },
  midnight: { brightness: 0.2, hue: 270, filter: 'brightness(0.2) contrast(1.5) saturate(0.6) hue-rotate(270deg)' }
};

interface WeatherSystemProps {
  children: React.ReactNode;
}

export function WeatherSystem({ children }: WeatherSystemProps) {
  const { hour, day } = useGameStore();
  const [currentWeather, setCurrentWeather] = useState<Weather>('clear');
  const [weatherTransition, setWeatherTransition] = useState(false);

  // Determine time of day
  const getTimeOfDay = (hour: number): TimeOfDay => {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 13) return 'noon';
    if (hour >= 13 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'evening';
    if (hour >= 19 && hour < 23) return 'night';
    return 'midnight';
  };

  // Weather change logic
  useEffect(() => {
    const weatherChangeChance = 0.1; // 10% chance per hour

    if (Math.random() < weatherChangeChance) {
      const weathers: Weather[] = ['clear', 'fog', 'rain', 'storm', 'toxic_fog', 'alien_mist'];

      // Weight the weather based on danger level and day
      let weatherWeights = [0.4, 0.2, 0.2, 0.1, 0.05, 0.05]; // Base weights

      // Increase dangerous weather chance as days progress
      const dangerMultiplier = Math.min(3, day * 0.1);
      weatherWeights[3] *= dangerMultiplier; // storm
      weatherWeights[4] *= dangerMultiplier; // toxic_fog
      weatherWeights[5] *= dangerMultiplier; // alien_mist

      // Normalize weights
      const totalWeight = weatherWeights.reduce((sum, weight) => sum + weight, 0);
      weatherWeights = weatherWeights.map(weight => weight / totalWeight);

      // Select weather based on weights
      const random = Math.random();
      let cumulativeWeight = 0;

      for (let i = 0; i < weathers.length; i++) {
        cumulativeWeight += weatherWeights[i];
        if (random <= cumulativeWeight) {
          if (weathers[i] !== currentWeather) {
            setWeatherTransition(true);
            setTimeout(() => {
              setCurrentWeather(weathers[i]);
              setWeatherTransition(false);
            }, 1000);
          }
          break;
        }
      }
    }
  }, [hour, day, currentWeather]);

  const timeOfDay = getTimeOfDay(hour);
  const weatherEffect = WEATHER_EFFECTS[currentWeather];
  const timeEffect = TIME_EFFECTS[timeOfDay];

  // Combine weather and time effects
  const combinedFilter = [
    timeEffect.filter,
    weatherEffect.cssFilter,
    weatherTransition ? 'blur(2px)' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="relative">
      {/* Weather Particles */}
      {weatherEffect.particles && (
        <WeatherParticles
          type={weatherEffect.particles.type}
          intensity={weatherEffect.particles.intensity}
        />
      )}

      {/* Weather Information Display */}
      <div className="fixed top-4 right-4 z-50 bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm">
        <div className="text-green-400 font-semibold mb-1">Environmental Status</div>
        <div className="space-y-1 text-slate-300">
          <div>🌤️ Weather: <span className="capitalize">{currentWeather.replace('_', ' ')}</span></div>
          <div>🕐 Time: <span className="capitalize">{timeOfDay}</span> ({hour}:00)</div>
          <div>👁️ Visibility: <span className={weatherEffect.visibility < 0.5 ? 'text-red-400' : 'text-green-400'}>
            {Math.round(weatherEffect.visibility * 100)}%
          </span></div>
          <div>😨 Mood: <span className={
            weatherEffect.mood === 'calm' ? 'text-green-400' :
            weatherEffect.mood === 'tense' ? 'text-yellow-400' :
            weatherEffect.mood === 'dangerous' ? 'text-red-400' : 'text-purple-400'
          }>
            {weatherEffect.mood}
          </span></div>
        </div>
      </div>

      {/* Lightning Effect for Storms */}
      {currentWeather === 'storm' && <LightningEffect />}

      {/* Main Content with Weather/Time Filters */}
      <div
        className={`transition-all duration-2000 ${weatherTransition ? 'animate-pulse' : ''}`}
        style={{
          filter: combinedFilter,
          opacity: weatherTransition ? 0.7 : 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function WeatherParticles({ type, intensity }: { type: 'rain' | 'fog' | 'sparks' | 'mist'; intensity: number }) {
  const particleCount = Math.floor(50 * intensity);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {Array.from({ length: particleCount }, (_, i) => (
        <WeatherParticle key={i} type={type} delay={i * 100} />
      ))}
    </div>
  );
}

function WeatherParticle({ type, delay }: { type: 'rain' | 'fog' | 'sparks' | 'mist'; delay: number }) {
  const [position, setPosition] = useState({
    x: Math.random() * window.innerWidth,
    y: -10,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newY = prev.y + (type === 'rain' ? 5 : 1);
        let newX = prev.x;

        if (type === 'rain') {
          newX += (Math.random() - 0.5) * 2; // Wind effect
        } else if (type === 'sparks') {
          newX += (Math.random() - 0.5) * 4;
          newY += Math.random() * 3;
        }

        // Reset when particle goes off screen
        if (newY > window.innerHeight + 10) {
          return {
            x: Math.random() * window.innerWidth,
            y: -10,
          };
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [type]);

  const getParticleStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
    };

    switch (type) {
      case 'rain':
        return {
          ...baseStyle,
          width: '2px',
          height: '10px',
          background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.8), rgba(173, 216, 230, 0.2))',
          borderRadius: '1px',
        };
      case 'fog':
      case 'mist':
        return {
          ...baseStyle,
          width: '20px',
          height: '20px',
          background: type === 'fog'
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)'
            : 'radial-gradient(circle, rgba(0, 255, 65, 0.1), transparent)',
          borderRadius: '50%',
        };
      case 'sparks':
        return {
          ...baseStyle,
          width: '3px',
          height: '3px',
          background: '#00ff41',
          borderRadius: '50%',
          boxShadow: '0 0 4px #00ff41',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      style={{
        ...getParticleStyle(),
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

function LightningEffect() {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isFlashing) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="w-full h-full bg-white opacity-20 animate-pulse" />
    </div>
  );
}