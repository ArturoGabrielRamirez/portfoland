'use client';

/**
 * SkillConnections Component
 *
 * SVG overlay that draws connection lines between related skills.
 * Solid lines for direct relationships, dashed for suggested progressions.
 * Adapted from TimelineConnections pattern.
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { UserSkillWithDetails } from '../types/skill';

/**
 * Connection type determines line style
 */
type ConnectionType = 'direct' | 'suggested';

/**
 * Connection definition between two skills
 */
interface SkillConnection {
  id: string;
  fromSkillId: string;
  toSkillId: string;
  type: ConnectionType;
}

/**
 * Props for SkillConnections
 */
interface SkillConnectionsProps {
  /** Array of skill connections to draw */
  connections: SkillConnection[];
  /** Map from skill ID to screen position { x, y } */
  positions: Map<string, { x: number; y: number }>;
  /** Custom className for the SVG container */
  className?: string;
}

/**
 * Calculate control points for a curved connection line
 */
function calculateCurveControlPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { cx1: number; cy1: number; cx2: number; cy2: number } {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Perpendicular offset for curve
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.2;

  return {
    cx1: midX - dy * 0.1,
    cy1: midY + dx * 0.1,
    cx2: midX + dy * 0.1,
    cy2: midY - dx * 0.1,
  };
}

/**
 * Generate SVG path for a connection line
 */
function generateConnectionPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curved: boolean = true
): string {
  if (!curved) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const { cx1, cy1, cx2, cy2 } = calculateCurveControlPoints(x1, y1, x2, y2);
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

/**
 * SkillConnections draws animated lines between related skill nodes
 */
function SkillConnectionsComponent({
  connections,
  positions,
  className,
}: SkillConnectionsProps) {
  // Generate connection line data
  const connectionLines = useMemo(() => {
    const lines: Array<{
      id: string;
      path: string;
      type: ConnectionType;
    }> = [];

    for (const conn of connections) {
      const fromPos = positions.get(conn.fromSkillId);
      const toPos = positions.get(conn.toSkillId);

      if (fromPos && toPos) {
        lines.push({
          id: conn.id,
          path: generateConnectionPath(
            fromPos.x,
            fromPos.y,
            toPos.x,
            toPos.y,
            true
          ),
          type: conn.type,
        });
      }
    }

    return lines;
  }, [connections, positions]);

  if (connectionLines.length === 0) {
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
        {/* Gradient for direct connection lines */}
        <linearGradient
          id="skill-connection-gradient-direct"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.8" />
        </linearGradient>

        {/* Gradient for suggested connection lines */}
        <linearGradient
          id="skill-connection-gradient-suggested"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.6" />
        </linearGradient>

        {/* Glow filter for direct connections */}
        <filter
          id="skill-connection-glow-direct"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#00D4FF" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glow filter for suggested connections */}
        <filter
          id="skill-connection-glow-suggested"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#A855F7" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Arrow marker for suggested progressions */}
        <marker
          id="skill-connection-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A855F7" fillOpacity="0.6" />
        </marker>
      </defs>

      {connectionLines.map((line, index) => {
        const isDirect = line.type === 'direct';

        return (
          <motion.path
            key={line.id}
            d={line.path}
            fill="none"
            stroke={`url(#skill-connection-gradient-${line.type})`}
            strokeWidth={isDirect ? 2 : 1.5}
            strokeDasharray={isDirect ? undefined : '6 4'}
            strokeLinecap="round"
            filter={`url(#skill-connection-glow-${line.type})`}
            markerEnd={isDirect ? undefined : 'url(#skill-connection-arrow)'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.8, delay: index * 0.1 },
              opacity: { duration: 0.3, delay: index * 0.1 },
            }}
          />
        );
      })}
    </svg>
  );
}

export const SkillConnections = memo(SkillConnectionsComponent);
