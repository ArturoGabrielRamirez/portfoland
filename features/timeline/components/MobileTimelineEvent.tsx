'use client';

/**
 * MobileTimelineEvent Component
 *
 * Vertical timeline event card for mobile view.
 * Shows as a list with connecting line and colored dots.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Briefcase, GraduationCap, Rocket, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { MobileTimelineEventProps } from '../types/experience';
import { EXPERIENCE_COLORS, EXPERIENCE_LABELS_EN } from '../constants/xp';

/**
 * Icon mapping for experience types
 */
const TypeIcons: Record<ExperienceType, React.ElementType> = {
  WORK: Briefcase,
  EDUCATION: GraduationCap,
  PROJECT: Rocket,
  CERTIFICATION: Award,
};

/**
 * Format date range for display
 */
function formatDateRange(startDate: Date, endDate: Date | null): string {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';

  return `${start} - ${end}`;
}

/**
 * MobileTimelineEvent renders a single event in the mobile vertical timeline
 */
function MobileTimelineEventComponent({
  experience,
  isFirst = false,
  isLast = false,
  onClick,
  className,
}: MobileTimelineEventProps) {
  const Icon = TypeIcons[experience.type];
  const color = EXPERIENCE_COLORS[experience.type];
  const typeLabel = EXPERIENCE_LABELS_EN[experience.type];

  const handleClick = () => {
    onClick?.(experience);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('relative flex gap-4', className)}
    >
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        {/* Top line */}
        {!isFirst && (
          <div className="w-0.5 h-4 bg-slate-700" />
        )}
        {isFirst && <div className="h-4" />}

        {/* Dot with icon */}
        <motion.div
          className="relative flex items-center justify-center w-10 h-10 rounded-full border-2"
          style={{
            borderColor: color,
            backgroundColor: `${color}20`,
            boxShadow: `0 0 12px ${color}40`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </motion.div>

        {/* Bottom line */}
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-[20px] bg-slate-700" />
        )}
      </div>

      {/* Content card */}
      <motion.button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex-1 text-left p-4 mb-4 rounded-lg',
          'bg-[#0D1421] border border-[#1E293B]',
          'hover:border-slate-600 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
        )}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Type badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="w-3 h-3" />
          {typeLabel}
        </div>

        {/* Title and company */}
        <h3 className="text-base font-semibold text-white">{experience.title}</h3>
        <p className="text-sm text-slate-400 mb-2">{experience.company}</p>

        {/* Date and location */}
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDateRange(experience.startDate, experience.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{experience.address}</span>
          </div>
        </div>

        {/* XP badge */}
        <div className="flex justify-end mt-2">
          <span
            className="text-sm font-bold"
            style={{ color }}
          >
            +{experience.xp} XP
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}

export const MobileTimelineEvent = memo(MobileTimelineEventComponent);
