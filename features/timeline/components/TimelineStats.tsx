'use client';

/**
 * TimelineStats Component
 *
 * Displays aggregated statistics for a user's timeline.
 * HUD-style cards with gaming aesthetic.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flag, Briefcase, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineStatsProps } from '../types/experience';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  delay?: number;
}

/**
 * Individual stat card with HUD styling
 */
function StatCard({ icon: Icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'p-4 rounded-sm',
        'bg-[#0D1421] border border-[#1E293B]',
        'min-w-[140px]'
      )}
      style={{
        boxShadow: `0 0 20px ${color}15, inset 0 1px 0 ${color}20`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-sm mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Value */}
      <motion.span
        className="text-2xl font-bold text-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 400 }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </motion.span>

      {/* Label */}
      <span className="text-xs text-slate-400 text-center mt-1">{label}</span>

      {/* Corner accents */}
      <div
        className="absolute top-2 left-2 w-2 h-2 border-t border-l"
        style={{ borderColor: color }}
      />
      <div
        className="absolute top-2 right-2 w-2 h-2 border-t border-r"
        style={{ borderColor: color }}
      />
      <div
        className="absolute bottom-2 left-2 w-2 h-2 border-b border-l"
        style={{ borderColor: color }}
      />
      <div
        className="absolute bottom-2 right-2 w-2 h-2 border-b border-r"
        style={{ borderColor: color }}
      />
    </motion.div>
  );
}

/**
 * TimelineStats displays the 4 main metrics
 */
function TimelineStatsComponent({ stats, className }: TimelineStatsProps) {
  const statCards = [
    {
      icon: Zap,
      label: 'Total XP',
      value: stats.totalXP,
      color: '#00D4FF', // Cyan
    },
    {
      icon: Flag,
      label: 'Milestones',
      value: stats.milestones,
      color: '#A855F7', // Purple
    },
    {
      icon: Briefcase,
      label: 'Experiences',
      value: stats.totalExperiences,
      color: '#22C55E', // Green
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: stats.achievements,
      color: '#EAB308', // Yellow
    },
  ];

  return (
    <div className={cn('flex flex-wrap gap-4 justify-center', className)}>
      {statCards.map((stat, index) => (
        <StatCard key={stat.label} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}

export const TimelineStats = memo(TimelineStatsComponent);
