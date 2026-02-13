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

      {/* Corner hexagons */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
        const positions = {
          'top-left': 'top-4 left-4',
          'top-right': 'top-4 right-4',
          'bottom-left': 'bottom-4 left-4',
          'bottom-right': 'bottom-4 right-4',
        };

        return (
          <div
            key={corner}
            className={cn('absolute', positions[corner as keyof typeof positions])}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              className={cn(isAnimating && 'animate-hex-ping')}
            >
              <path
                d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                fill="none"
                stroke={color}
                strokeWidth="3"
                opacity={isAnimating ? 0.8 : 0}
                style={{
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
            </svg>
          </div>
        );
      })}

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
