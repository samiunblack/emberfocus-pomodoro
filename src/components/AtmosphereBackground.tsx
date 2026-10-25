import React, { useMemo } from 'react';

interface AtmosphereBackgroundProps {
  progress: number; // 0.0 to 1.0
  isRunning: boolean;
  intensityLevel?: 'subtle' | 'balanced' | 'vivid';
}

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({
  progress,
  isRunning,
  intensityLevel = 'balanced',
}) => {
  // Generate random static background stars/firefly motes once
  const motes = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: (i * 37.1) % 100,
      y: (i * 29.3) % 95,
      size: (i % 3 === 0 ? 2 : 1),
      opacity: 0.15 + ((i * 17) % 50) / 100,
      twinkleSpeed: 2 + (i % 5) * 1.2,
      delay: (i * 0.3) % 4,
    }));
  }, []);

  // Intensity multipliers
  const multiplier = intensityLevel === 'subtle' ? 0.6 : intensityLevel === 'vivid' ? 1.4 : 1.0;
  const p = Math.max(0, Math.min(1, progress));
  
  // Calculate dynamic lighting colors as session progresses
  // At 0%: calm midnight twilight indigo
  // At 100%: warm glowing hearth with radiant magenta and amber campfire cast
  const innerGlowOpacity = (0.15 + p * 0.45 * (isRunning ? 1 : 0.7)) * multiplier;
  const midGlowOpacity = (0.10 + p * 0.35 * (isRunning ? 1 : 0.7)) * multiplier;
  const ambientWarmth = p * 0.3 * multiplier;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none transition-colors duration-1000">
      {/* Base Canvas Color with smooth progression shift */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          backgroundColor: '#161224',
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(16, 12, 26, 0.95),
              rgba(${Math.floor(28 + 35 * ambientWarmth)}, ${Math.floor(18 + 10 * ambientWarmth)}, ${Math.floor(38 + 15 * ambientWarmth)}, 0.98)
            )
          `,
        }}
      />

      {/* Dynamic Concentric Radial Glow behind campfire that intensifies with progress */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(
              circle at 50% 50%,
              rgba(255, 95, 31, ${innerGlowOpacity * 0.85}) 0%,
              rgba(235, 40, 110, ${innerGlowOpacity * 0.95}) ${20 + p * 15}%,
              rgba(142, 28, 110, ${midGlowOpacity * 0.85}) ${40 + p * 25}%,
              rgba(48, 20, 68, ${midGlowOpacity * 0.5}) ${65 + p * 20}%,
              rgba(0, 0, 0, 0) 85%
            )
          `,
          filter: 'blur(35px)',
          transform: isRunning ? 'scale(1.02)' : 'scale(1)',
        }}
      />

      {/* Secondary breathing fire aura when running */}
      {isRunning && (
        <div
          className="absolute inset-0 animate-pulse duration-3000 transition-opacity duration-1000"
          style={{
            background: `
              radial-gradient(
                circle at 50% 48%,
                rgba(255, 140, 50, ${0.12 + p * 0.22}) 0%,
                rgba(220, 50, 90, ${0.08 + p * 0.16}) 35%,
                transparent 70%
              )
            `,
            filter: 'blur(50px)',
          }}
        />
      )}

      {/* Subtle pixel scanline / atmospheric grid texture for retro feel */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Distant background twilight stars/motes */}
      {motes.map((mote) => (
        <div
          key={mote.id}
          className="absolute rounded-full transition-opacity duration-1000"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            backgroundColor: mote.id % 4 === 0 ? '#ffb3ba' : mote.id % 2 === 0 ? '#ffdfba' : '#baffc9',
            opacity: mote.opacity * (1 - p * 0.35), // gentle fading of distant stars as fire brightens
            boxShadow: mote.size > 1 ? '0 0 3px rgba(255, 220, 180, 0.4)' : 'none',
          }}
        />
      ))}

      {/* Vignette border frame for immersive desktop presentation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(10, 8, 18, 0.65) 100%)',
        }}
      />
    </div>
  );
};
