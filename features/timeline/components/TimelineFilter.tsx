'use client';

/**
 * TimelineFilter Component
 *
 * Filter tabs for filtering experiences by type.
 * Styled as pills with gaming aesthetic.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { TimelineFilterProps } from '../types/experience';
import {
  EXPERIENCE_TYPES,
  EXPERIENCE_LABELS_EN,
  EXPERIENCE_COLORS,
  type FilterOption,
} from '../constants/xp';

/**
 * Filter options with labels
 */
const FILTER_OPTIONS: Array<{ value: FilterOption; label: string }> = [
  { value: 'ALL', label: 'All' },
  ...EXPERIENCE_TYPES.map((type) => ({
    value: type as FilterOption,
    label: EXPERIENCE_LABELS_EN[type],
  })),
];

/**
 * TimelineFilter renders filter pills for experience types
 */
function TimelineFilterComponent({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: TimelineFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = activeFilter === value;
        const count = counts?.[value];
        const color = value === 'ALL' ? '#00D4FF' : EXPERIENCE_COLORS[value as ExperienceType];

        return (
          <motion.button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={cn(
              'relative px-4 py-2 rounded-sm text-sm font-medium font-mono',
              'border transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500',
              isActive
                ? 'text-white border-transparent'
                : 'text-muted-foreground border-[hsl(174,100%,50%,0.15)] hover:border-[hsl(174,100%,50%,0.3)] hover:text-foreground'
            )}
            style={{
              backgroundColor: isActive ? color : 'transparent',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {label}
              {count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-xs rounded-sm font-mono',
                    isActive ? 'bg-white/20' : 'bg-[hsl(200,30%,8%)]'
                  )}
                >
                  {count}
                </span>
              )}
            </span>

            {/* Glow effect when active */}
            {isActive && (
              <motion.div
                layoutId="filter-glow"
                className="absolute inset-0 rounded-sm"
                style={{
                  boxShadow: `0 0 20px ${color}60`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export const TimelineFilter = memo(TimelineFilterComponent);
