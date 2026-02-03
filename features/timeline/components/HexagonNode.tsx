'use client';

/**
 * HexagonNode Component
 *
 * Hexagonal marker for timeline experiences on the map.
 * Features type-based colors and glow effects.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Rocket, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { Experience, HexagonNodeProps } from '../types/experience';
import { EXPERIENCE_COLORS, EXPERIENCE_GLOW_COLORS } from '../constants/xp';

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
 * HexagonNode renders a hexagonal marker for an experience
 */
function HexagonNodeComponent({
  experience,
  isSelected = false,
  isCurrent = false,
  onClick,
  className,
}: HexagonNodeProps) {
  const Icon = TypeIcons[experience.type];
  const color = EXPERIENCE_COLORS[experience.type];
  const glowColor = EXPERIENCE_GLOW_COLORS[experience.type];

  const handleClick = () => {
    onClick?.(experience);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex items-center justify-center',
        'w-12 h-14 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.2 : 1,
        opacity: 1,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-label={`${experience.title} at ${experience.company}`}
    >
      {/* Hexagon SVG background */}
      <svg
        viewBox="0 0 48 56"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor})`
            : `drop-shadow(0 0 6px ${glowColor})`,
        }}
      >
        <defs>
          <linearGradient id={`grad-${experience.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Hexagon path */}
        <path
          d="M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z"
          fill={`url(#grad-${experience.id})`}
          stroke={color}
          strokeWidth={isSelected ? 3 : 2}
          className="transition-all duration-200"
        />
      </svg>

      {/* Icon */}
      <Icon
        className="relative z-10 w-5 h-5 text-white"
        strokeWidth={2}
      />

      {/* Current indicator (pulsing ring) */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.button>
  );
}

export const HexagonNode = memo(HexagonNodeComponent);
