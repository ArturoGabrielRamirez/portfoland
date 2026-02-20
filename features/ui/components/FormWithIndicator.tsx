'use client';

/**
 * FormWithIndicator - Cyberpunk form wrapper with integrated status indicator
 *
 * Wraps forms/components with a hexagonal LED-style status indicator
 * that shows loading, error, success states visually
 */

import { cn } from '@/lib/utils';

export type IndicatorStatus = 'idle' | 'loading' | 'error' | 'success';
export type IndicatorPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface FormWithIndicatorProps {
  children: React.ReactNode;
  status?: IndicatorStatus;
  indicatorPosition?: IndicatorPosition;
  className?: string;
}

// Status color mapping
const STATUS_COLORS: Record<IndicatorStatus, { border: string; fill: string; glow: string }> = {
  idle: {
    border: 'hsl(174,100%,50%)',
    fill: 'hsl(174,100%,50%,0.05)',
    glow: 'none',
  },
  loading: {
    border: 'hsl(174,100%,50%)',
    fill: 'hsl(174,100%,50%,0.15)',
    glow: '0 0 12px hsl(174,100%,50%)',
  },
  error: {
    border: 'hsl(0,100%,50%)',
    fill: 'hsl(0,100%,50%,0.15)',
    glow: '0 0 16px hsl(0,100%,50%)',
  },
  success: {
    border: 'hsl(150,100%,45%)',
    fill: 'hsl(150,100%,45%,0.15)',
    glow: '0 0 16px hsl(150,100%,45%)',
  },
};

// Position class mapping
const POSITION_CLASSES: Record<IndicatorPosition, string> = {
  'top-right': 'top-3 right-3',
  'top-left': 'top-3 left-3',
  'bottom-right': 'bottom-3 right-3',
  'bottom-left': 'bottom-3 left-3',
};

export function FormWithIndicator({
  children,
  status = 'idle',
  indicatorPosition = 'top-right',
  className,
}: FormWithIndicatorProps) {
  const colors = STATUS_COLORS[status];
  const isLoading = status === 'loading';
  const isActive = status === 'error' || status === 'success';

  return (
    <div className={cn('relative', className)}>
      {children}

      {/* Hexagonal status indicator - ENHANCED VISIBILITY */}
      <div className={cn('absolute pointer-events-none z-10', POSITION_CLASSES[indicatorPosition])}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          className="transform-gpu drop-shadow-2xl"
        >
          {/* Outer hexagonal ring */}
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill="none"
            stroke={colors.border}
            strokeWidth="3"
            opacity={isActive ? 1 : isLoading ? 0.9 : 0.4}
            className={cn(
              'transition-all duration-300',
              isLoading && 'animate-pulse-ring'
            )}
            style={{
              filter: isActive || isLoading ? colors.glow : 'drop-shadow(0 0 4px currentColor)',
            }}
          />

          {/* Inner hexagon fill */}
          <path
            d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
            fill={colors.fill}
            stroke={colors.border}
            strokeWidth="2"
            opacity={isActive ? 0.9 : isLoading ? 0.7 : 0.3}
            className="transition-all duration-300"
          />

          {/* Central indicator dot */}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill={colors.border}
            opacity={isActive ? 1 : isLoading ? 1 : 0.5}
            className={cn(
              'transition-all duration-200',
              isLoading && 'animate-pulse-dot'
            )}
            style={{
              filter: isActive || isLoading ? colors.glow : 'drop-shadow(0 0 6px currentColor)',
            }}
          />

          {/* Rotating segments for loading state */}
          {isLoading && (
            <>
              <line
                x1="50" y1="8"
                x2="50" y2="20"
                stroke={colors.border}
                strokeWidth="3"
                opacity="0.9"
                className="animate-spin origin-center"
                style={{ transformOrigin: '50px 50px' }}
              />
              <line
                x1="85" y1="30"
                x2="72" y2="38"
                stroke={colors.border}
                strokeWidth="3"
                opacity="0.7"
                className="animate-spin-slow origin-center"
                style={{ transformOrigin: '50px 50px' }}
              />
            </>
          )}

          {/* Pulsing glow ring for active states */}
          {(isActive || isLoading) && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={colors.border}
              strokeWidth="1"
              opacity="0.3"
              className="animate-ping"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
