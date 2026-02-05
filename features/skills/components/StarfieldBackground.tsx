'use client';

/**
 * StarfieldBackground Component
 *
 * Dark space background with animated star particles.
 * Uses CSS animations for performance optimization.
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for StarfieldBackground
 */
interface StarfieldBackgroundProps {
  /** Number of star particles to render */
  starCount?: number;
  /** Custom className for the container */
  className?: string;
}

/**
 * Generate random star positions and properties
 */
function generateStars(count: number): Array<{
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}> {
  const stars = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
      delay: Math.random() * 5, // 0-5s delay
      duration: Math.random() * 3 + 2, // 2-5s duration
    });
  }

  return stars;
}

/**
 * StarfieldBackground renders a dark space background with twinkling stars
 */
function StarfieldBackgroundComponent({
  starCount = 100,
  className,
}: StarfieldBackgroundProps) {
  // Memoize star generation to prevent re-renders
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden bg-[#0A0E1A]',
        className
      )}
      aria-hidden="true"
    >
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E1A]/50 to-[#0A0E1A]" />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.size > 2 ? '#00D4FF' : '#FFFFFF',
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: star.size > 2
              ? `0 0 ${star.size * 2}px rgba(0, 212, 255, 0.5)`
              : `0 0 ${star.size}px rgba(255, 255, 255, 0.3)`,
          }}
        />
      ))}

      {/* Subtle nebula effect - top right */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)',
        }}
      />

      {/* Subtle nebula effect - bottom left */}
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

export const StarfieldBackground = memo(StarfieldBackgroundComponent);
