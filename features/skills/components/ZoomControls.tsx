'use client';

/**
 * ZoomControls Component
 *
 * Zoom in/out buttons, fit all button, and current zoom level indicator
 * for the galaxy canvas visualization.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for ZoomControls
 */
interface ZoomControlsProps {
  /** Current zoom level (1 = 100%) */
  zoomLevel: number;
  /** Callback when zoom in is clicked */
  onZoomIn: () => void;
  /** Callback when zoom out is clicked */
  onZoomOut: () => void;
  /** Callback when fit all is clicked */
  onFitAll: () => void;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Custom className */
  className?: string;
}

/**
 * ZoomControls renders zoom control buttons for the galaxy canvas
 */
function ZoomControlsComponent({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitAll,
  minZoom = 0.5,
  maxZoom = 2,
  className,
}: ZoomControlsProps) {
  const canZoomIn = zoomLevel < maxZoom;
  const canZoomOut = zoomLevel > minZoom;
  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-sm',
        'bg-[#0D1421]/90 border border-[#1E293B]',
        'backdrop-blur-sm shadow-lg',
        className
      )}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Zoom In Button */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={cn(
          'p-2 rounded-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:ring-offset-2 focus:ring-offset-[#0D1421]',
          canZoomIn
            ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            : 'text-[#334155] cursor-not-allowed'
        )}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      {/* Zoom Level Indicator */}
      <div
        className={cn(
          'px-2 py-1 rounded-sm text-xs font-medium',
          'bg-[#1E293B] text-[#00D4FF] min-w-[48px] text-center'
        )}
      >
        {zoomPercentage}%
      </div>

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={cn(
          'p-2 rounded-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:ring-offset-2 focus:ring-offset-[#0D1421]',
          canZoomOut
            ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            : 'text-[#334155] cursor-not-allowed'
        )}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-[#334155] my-1" />

      {/* Fit All Button */}
      <button
        type="button"
        onClick={onFitAll}
        className={cn(
          'p-2 rounded-sm transition-all duration-200',
          'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]',
          'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:ring-offset-2 focus:ring-offset-[#0D1421]'
        )}
        aria-label="Fit all"
        title="Fit all clusters in view"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export const ZoomControls = memo(ZoomControlsComponent);
