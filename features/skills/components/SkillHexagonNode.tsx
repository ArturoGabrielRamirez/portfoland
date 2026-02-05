'use client';

/**
 * SkillHexagonNode Component
 *
 * Hexagonal node for skill visualization in the skill tree.
 * Adapted from Timeline HexagonNode with level-based styling.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillHexagonNodeProps } from '../types/skill';
import {
  LEVEL_VISUAL_STYLES,
  LEVEL_GLOW_FILTERS,
  LEVEL_ANIMATIONS,
} from '../constants/levels';

/**
 * Get skill display letter (first letter of skill name)
 */
function getSkillLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Generate particle positions for L4/L5 effects
 */
function generateParticlePositions(count: number): Array<{ x: number; y: number; delay: number }> {
  const positions: Array<{ x: number; y: number; delay: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({
      x: Math.cos(angle) * 30,
      y: Math.sin(angle) * 30,
      delay: i * 0.15,
    });
  }
  return positions;
}

/**
 * SkillHexagonNode renders a hexagonal marker for a skill
 */
function SkillHexagonNodeComponent({
  userSkill,
  isEmpty = false,
  suggestedSkillName,
  categoryColor,
  onClick,
  className,
}: SkillHexagonNodeProps) {
  // Determine level and visual style
  const level = (userSkill?.level ?? 1) as 1 | 2 | 3 | 4 | 5;
  const visualStyle = LEVEL_VISUAL_STYLES[level];
  const glowFilter = LEVEL_GLOW_FILTERS[level];
  const particleCount = LEVEL_ANIMATIONS.particleCount[level];

  // Get skill name for display
  const skillName = userSkill?.skill?.name ?? suggestedSkillName ?? 'Unknown';
  const skillLetter = getSkillLetter(skillName);

  // Colors
  const fillColor = isEmpty ? 'transparent' : categoryColor;
  const strokeColor = categoryColor;

  // Generate particle positions for L4/L5
  const particles = particleCount > 0 ? generateParticlePositions(particleCount) : [];

  // Golden color for L5
  const isLegendary = level === 5;
  const legendaryColor = '#F59E0B';

  const handleClick = () => {
    onClick?.();
  };

  // Aria label
  const ariaLabel = isEmpty
    ? `Add ${suggestedSkillName ?? 'new'} skill`
    : `${skillName} - Level ${level} ${visualStyle.name}`;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex items-center justify-center',
        'w-12 h-14 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00D4FF]',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: visualStyle.animationScale,
        opacity: 1,
      }}
      whileHover={{ scale: visualStyle.animationScale + 0.1 }}
      whileTap={{ scale: visualStyle.animationScale - 0.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-label={ariaLabel}
    >
      {/* SVG Hexagon Background */}
      <svg
        viewBox="0 0 48 56"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: visualStyle.hasGlow
            ? `drop-shadow(0 0 ${glowFilter.stdDeviation * 2}px ${isLegendary ? legendaryColor : categoryColor})`
            : undefined,
        }}
      >
        <defs>
          {/* Gradient fill for non-empty nodes */}
          {!isEmpty && (
            <linearGradient
              id={`skill-grad-${userSkill?.id ?? 'empty'}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={isLegendary ? legendaryColor : fillColor}
                stopOpacity={visualStyle.fillOpacity * 0.9}
              />
              <stop
                offset="100%"
                stopColor={isLegendary ? '#D97706' : fillColor}
                stopOpacity={visualStyle.fillOpacity * 0.6}
              />
            </linearGradient>
          )}

          {/* Glow filter for higher levels */}
          {visualStyle.hasGlow && (
            <filter id={`skill-glow-${userSkill?.id ?? 'empty'}`}>
              <feGaussianBlur
                stdDeviation={glowFilter.stdDeviation}
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Hexagon path */}
        <path
          d="M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z"
          fill={isEmpty ? 'transparent' : `url(#skill-grad-${userSkill?.id ?? 'empty'})`}
          stroke={isLegendary ? legendaryColor : strokeColor}
          strokeWidth={isEmpty ? 1 : 2}
          strokeDasharray={isEmpty ? '4 2' : undefined}
          strokeOpacity={isEmpty ? 0.5 : visualStyle.strokeOpacity}
          className="transition-all duration-200"
        />
      </svg>

      {/* Content: Icon or Letter */}
      {isEmpty ? (
        <HelpCircle
          className="relative z-10 w-5 h-5 text-[#64748B]"
          strokeWidth={1.5}
        />
      ) : (
        <span
          className={cn(
            'relative z-10 font-bold text-sm',
            isLegendary ? 'text-[#0A0E1A]' : 'text-white'
          )}
          style={{
            textShadow: visualStyle.hasGlow
              ? `0 0 8px ${isLegendary ? legendaryColor : categoryColor}`
              : undefined,
          }}
        >
          {skillLetter}
        </span>
      )}

      {/* Crown icon for Master level (L5) */}
      {isLegendary && !isEmpty && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Crown className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
        </motion.div>
      )}

      {/* Particle effects for L4/L5 */}
      {visualStyle.hasParticles && !isEmpty && (
        <>
          {particles.map((particle, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: isLegendary ? legendaryColor : categoryColor,
              }}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [0, particle.x, particle.x * 1.5],
                y: [0, particle.y, particle.y * 1.5],
                scale: [0.5, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Pulsing ring for Expert/Master levels */}
      {(level === 4 || level === 5) && !isEmpty && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1px solid ${isLegendary ? legendaryColor : categoryColor}`,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: LEVEL_ANIMATIONS.pulseSpeed[level] / 1000,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Sparkle effect for Master level */}
      {isLegendary && !isEmpty && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-3 h-3 text-[#F59E0B]" strokeWidth={2} />
        </motion.div>
      )}
    </motion.button>
  );
}

export const SkillHexagonNode = memo(SkillHexagonNodeComponent);
