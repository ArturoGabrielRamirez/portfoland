'use client';

/**
 * ExperienceCard Component
 *
 * Displays experience details in a gaming-styled card.
 * Used as an overlay on the map when a hexagon node is selected.
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Briefcase, GraduationCap, Rocket, Award, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { ExperienceCardProps } from '../types/experience';
import {
  EXPERIENCE_COLORS,
  EXPERIENCE_COLOR_CLASSES,
  EXPERIENCE_LABELS_EN,
} from '../constants/xp';

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
 * ExperienceCard displays detailed information about an experience
 */
function ExperienceCardComponent({
  experience,
  isEditable = false,
  onEdit,
  onDelete,
  onClose,
  className,
}: ExperienceCardProps) {
  const Icon = TypeIcons[experience.type];
  const color = EXPERIENCE_COLORS[experience.type];
  const colorClasses = EXPERIENCE_COLOR_CLASSES[experience.type];
  const typeLabel = EXPERIENCE_LABELS_EN[experience.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'relative w-80 bg-[#0D1421] border border-[#1E293B] rounded-lg overflow-hidden',
          'shadow-xl',
          className
        )}
        style={{
          boxShadow: `0 0 20px ${EXPERIENCE_COLORS[experience.type]}20`,
        }}
      >
        {/* Header with type badge and close button */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              'bg-opacity-20'
            )}
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="w-4 h-4" />
            <span>{typeLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            {isEditable && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => onEdit?.(experience)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                  onClick={() => onDelete?.(experience.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Company */}
          <div>
            <h3 className="text-lg font-semibold text-white">{experience.title}</h3>
            <p className="text-slate-400">{experience.company}</p>
          </div>

          {/* Date and Location */}
          <div className="flex flex-col gap-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(experience.startDate, experience.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{experience.address}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 line-clamp-3">{experience.description}</p>

          {/* Skills */}
          {experience.skills && experience.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {experience.skills.length > 5 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400">
                  +{experience.skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with XP */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t border-[#1E293B]"
          style={{ backgroundColor: `${color}10` }}
        >
          <span className="text-sm text-slate-400">Experience Points</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold" style={{ color }}>
              +{experience.xp}
            </span>
            <span className="text-sm" style={{ color }}>
              XP
            </span>
          </div>
        </div>

        {/* Accent border */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export const ExperienceCard = memo(ExperienceCardComponent);
