'use client';

/**
 * TimelineConnections Component
 *
 * SVG overlay that draws dashed lines connecting hexagon nodes chronologically.
 * Creates a visual flow between timeline experiences.
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Experience } from '../types/experience';

interface TimelineConnectionsProps {
  experiences: Experience[];
  /** Map from experience ID to screen position { x, y } */
  positions: Map<string, { x: number; y: number }>;
  className?: string;
}

/**
 * TimelineConnections draws animated dashed lines between experience nodes
 */
function TimelineConnectionsComponent({
  experiences,
  positions,
  className,
}: TimelineConnectionsProps) {
  // Sort experiences by start date to create chronological connections
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [experiences]);

  // Generate connection paths between consecutive nodes
  const connections = useMemo(() => {
    const lines: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];

    for (let i = 0; i < sortedExperiences.length - 1; i++) {
      const current = sortedExperiences[i];
      const next = sortedExperiences[i + 1];

      const currentPos = positions.get(current.id);
      const nextPos = positions.get(next.id);

      if (currentPos && nextPos) {
        lines.push({
          id: `${current.id}-${next.id}`,
          x1: currentPos.x,
          y1: currentPos.y,
          x2: nextPos.x,
          y2: nextPos.y,
        });
      }
    }

    return lines;
  }, [sortedExperiences, positions]);

  if (connections.length === 0) {
    return null;
  }

  return (
    <svg
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Gradient for the connection lines */}
        <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.6" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn, index) => (
        <motion.line
          key={conn.id}
          x1={conn.x1}
          y1={conn.y1}
          x2={conn.x2}
          y2={conn.y2}
          stroke="url(#connection-gradient)"
          strokeWidth="2"
          strokeDasharray="8 4"
          strokeLinecap="round"
          filter="url(#connection-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.8, delay: index * 0.1 },
            opacity: { duration: 0.3, delay: index * 0.1 },
          }}
        />
      ))}
    </svg>
  );
}

export const TimelineConnections = memo(TimelineConnectionsComponent);
