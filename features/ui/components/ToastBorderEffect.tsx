'use client';

/**
 * ToastBorderEffect - Cyberpunk visual feedback for toast notifications
 *
 * Creates a pulsing border and hexagonal corner indicators when toasts appear
 * Colors match the toast type (error, success, warning, info)
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'error' | 'success' | 'warning' | 'info' | null;

interface ToastBorderEffectProps {
  className?: string;
}

// Color mapping for toast types
const TOAST_COLORS: Record<Exclude<ToastType, null>, string> = {
  error: 'hsl(0, 100%, 50%)',
  success: 'hsl(150, 100%, 45%)',
  warning: 'hsl(60, 100%, 50%)',
  info: 'hsl(174, 100%, 50%)',
};

export function ToastBorderEffect({ className }: ToastBorderEffectProps) {
  const [activeToast, setActiveToast] = useState<ToastType>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Listen for custom toast events
    const handleToastEvent = (event: CustomEvent<{ type: ToastType }>) => {
      if (event.detail.type) {
        setActiveToast(event.detail.type);
        setIsAnimating(true);

        // Reset animation after duration
        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => setActiveToast(null), 300);
        }, 2000);
      }
    };

    window.addEventListener('toast-show' as any, handleToastEvent);
    return () => window.removeEventListener('toast-show' as any, handleToastEvent);
  }, []);

  if (!activeToast) return null;

  const color = TOAST_COLORS[activeToast];

  return (
    <div className={cn('pointer-events-none fixed inset-0 z-50', className)}>
      {/* Pulsing border */}
      <div
        className={cn(
          'absolute inset-0 border-2 rounded-sm',
          isAnimating && 'animate-border-pulse'
        )}
        style={{
          borderColor: color,
          boxShadow: isAnimating
            ? `0 0 20px ${color}, inset 0 0 20px ${color}40`
            : 'none',
        }}
      />

      {/* Status indicator - Hexagon with ring (top-right) */}
      <div className="absolute top-6 right-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          className="transform-gpu"
        >
          {/* Outer hexagonal ring */}
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill="none"
            stroke={isAnimating ? color : 'hsl(174,100%,50%)'}
            strokeWidth="2"
            opacity={isAnimating ? 0.8 : 0.2}
            className={cn(
              'transition-all duration-300',
              isAnimating && 'animate-pulse-ring'
            )}
            style={{
              filter: isAnimating ? `drop-shadow(0 0 12px ${color})` : 'none',
            }}
          />

          {/* Inner hexagon (always visible, dim when idle) */}
          <path
            d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
            fill={isAnimating ? `${color}20` : 'hsl(174,100%,50%,0.05)'}
            stroke={isAnimating ? color : 'hsl(174,100%,50%)'}
            strokeWidth="1.5"
            opacity={isAnimating ? 0.6 : 0.15}
            className="transition-all duration-300"
          />

          {/* Central dot indicator */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill={isAnimating ? color : 'hsl(174,100%,50%)'}
            opacity={isAnimating ? 1 : 0.3}
            className={cn(
              'transition-all duration-200',
              isAnimating && 'animate-pulse-dot'
            )}
            style={{
              filter: isAnimating ? `drop-shadow(0 0 8px ${color})` : 'none',
            }}
          />

          {/* Rotating segments for loading state */}
          {isAnimating && (
            <>
              <line
                x1="50" y1="10"
                x2="50" y2="20"
                stroke={color}
                strokeWidth="2"
                opacity="0.6"
                className="animate-spin origin-center"
                style={{ transformOrigin: '50px 50px' }}
              />
              <line
                x1="85" y1="30"
                x2="75" y2="35"
                stroke={color}
                strokeWidth="2"
                opacity="0.4"
                className="animate-spin-slow origin-center"
                style={{ transformOrigin: '50px 50px' }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Scanline flash effect */}
      {isAnimating && (
        <div
          className="absolute inset-0 opacity-30 animate-scanline-flash"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${color}20 2px,
              ${color}20 4px
            )`,
          }}
        />
      )}
    </div>
  );
}
