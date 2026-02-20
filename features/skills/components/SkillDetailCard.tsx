'use client';

/**
 * SkillDetailCard Component
 *
 * Pokemon-style flip card for skill details.
 * Front side shows skill info, back side shows XP breakdown.
 */

import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Edit, Trash2, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, XPBar, LevelBadge, TechBadge } from '@/features/tech';
import type { SkillDetailCardProps } from '../types/skill';
import {
  SKILL_LEVEL_NAMES,
  calculateLevelProgress,
  LEVEL_THRESHOLDS_ARRAY,
} from '../constants/xp';
import { LEVEL_VISUAL_STYLES, LEVEL_BADGE_COLORS } from '../constants/levels';
import { CATEGORY_COLORS, getCategoryColor } from '../constants/categories';
import { XPSourceList } from './XPSourceList';

/**
 * Get next level XP threshold
 */
function getNextLevelThreshold(level: number): number {
  if (level >= 5) return LEVEL_THRESHOLDS_ARRAY[4].min;
  return LEVEL_THRESHOLDS_ARRAY[level].min;
}

/**
 * Get current level XP threshold
 */
function getCurrentLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  return LEVEL_THRESHOLDS_ARRAY[level - 1].min;
}

/**
 * SkillDetailCard renders a flippable card with skill details
 */
function SkillDetailCardComponent({
  userSkill,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isEditable = false,
  className,
}: SkillDetailCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get skill data
  const level = (userSkill.level ?? 1) as 1 | 2 | 3 | 4 | 5;
  const levelName = SKILL_LEVEL_NAMES[level];
  const visualStyle = LEVEL_VISUAL_STYLES[level];
  const badgeColors = LEVEL_BADGE_COLORS[level];

  // Category info
  const categorySlug = userSkill.skill?.category?.slug;
  const categoryColor = categorySlug
    ? getCategoryColor(categorySlug as any)
    : userSkill.skill?.category?.color ?? CATEGORY_COLORS.core;
  const categoryName = userSkill.skill?.category?.name ?? 'Uncategorized';

  // XP calculations
  const totalXP = userSkill.totalXP ?? 0;
  const currentThreshold = getCurrentLevelThreshold(level);
  const nextThreshold = getNextLevelThreshold(level);
  const xpInLevel = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = calculateLevelProgress(totalXP);

  // Is this a legendary (master) skill?
  const isLegendary = level === 5;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset flip state when closed
  useEffect(() => {
    if (!isOpen) {
      setIsFlipped(false);
    }
  }, [isOpen]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleExperienceClick = (experienceId: string) => {
    // Navigate to timeline with the experience selected
    // This could be handled by the parent component
    window.location.href = `/dashboard/timeline?experience=${experienceId}`;
  };

  // Check if skill can be deleted (no experience sources)
  const hasExperienceSources = userSkill.sources?.some(
    (source) => source.sourceType === 'EXPERIENCE'
  );
  const canDelete = isEditable && !hasExperienceSources;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/20 backdrop-blur-[2px]"
        >
          <motion.div
            ref={cardRef}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'relative w-full max-w-sm perspective-1000 mt-4',
              className
            )}
            style={{ perspective: 1000 }}
          >
            {/* Card Container - preserves 3D */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className="relative preserve-3d"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <TechCard
                  variant={isLegendary ? 'featured' : 'glow'}
                  className={cn(
                    'w-full overflow-hidden relative rounded-sm',
                    isLegendary && 'ring-2 ring-[#F59E0B]'
                  )}
                  style={{
                    boxShadow: `0 0 30px ${categoryColor}40`,
                  }}
                >
                  {/* CRT effect overlay */}
                  <div className="absolute inset-0 pointer-events-none crt-lines opacity-10 z-10" />
                  {/* Header */}
                  <div
                    className="relative p-4 border-b border-[#1E293B]"
                    style={{
                      background: `linear-gradient(135deg, ${categoryColor}20 0%, transparent 100%)`,
                    }}
                  >
                    {/* Close button */}
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 p-1.5 rounded-sm text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Category badge */}
                    <TechBadge color="gray" className="mb-3">
                      {categoryName}
                    </TechBadge>

                    {/* Skill Icon/Letter */}
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-16 h-16 clip-hexagon flex items-center justify-center relative',
                          'text-2xl font-bold font-mono',
                          isLegendary ? 'text-[#0A0E1A]' : 'text-white'
                        )}
                        style={{
                          backgroundColor: categoryColor,
                          boxShadow: `0 0 20px ${categoryColor}60`,
                        }}
                      >
                        {userSkill.skill?.name?.charAt(0).toUpperCase() ?? '?'}
                        {isLegendary && (
                          <Crown className="absolute -top-2 -right-2 w-5 h-5 text-[#F59E0B]" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">
                          {userSkill.skill?.name ?? 'Unknown Skill'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <LevelBadge level={level} size="sm" />
                          <span
                            className="text-sm font-medium"
                            style={{ color: badgeColors.text }}
                          >
                            {levelName}
                          </span>
                          {isLegendary && (
                            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="p-4">
                    <XPBar
                      current={xpInLevel}
                      max={xpNeeded}
                      level={level}
                      showLabel={true}
                    />
                    <p className="text-xs text-[#64748B] mt-2 text-center">
                      {totalXP.toLocaleString()} total XP
                      {level < 5 && (
                        <> | {(nextThreshold - totalXP).toLocaleString()} to {SKILL_LEVEL_NAMES[(level + 1) as 1 | 2 | 3 | 4 | 5]}</>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex items-center justify-between">
                    <button
                      onClick={handleFlip}
                      className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                      aria-label="Flip card to see XP breakdown"
                    >
                      <RotateCcw className="w-4 h-4" />
                      XP Breakdown
                    </button>

                    {isEditable && (
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={onEdit}
                            className="p-2 rounded-sm text-[#64748B] hover:text-[#00D4FF] hover:bg-[#1E293B] transition-colors"
                            aria-label="Edit skill"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && canDelete && (
                          <button
                            onClick={onDelete}
                            className="p-2 rounded-sm text-[#64748B] hover:text-[#EF4444] hover:bg-[#1E293B] transition-colors"
                            aria-label="Delete skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </TechCard>
              </div>

              {/* Back Side */}
              <div
                className="backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <TechCard
                  variant="default"
                  className="w-full overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      XP Breakdown
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFlip}
                        className="p-1.5 rounded-sm text-[#64748B] hover:text-[#00D4FF] hover:bg-[#1E293B] transition-colors"
                        aria-label="Flip card back"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-1.5 rounded-sm text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* XP Source List */}
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <XPSourceList
                      sources={userSkill.sources ?? []}
                      onExperienceClick={handleExperienceClick}
                    />
                  </div>

                  {/* Footer */}
                  <div className="p-4 pt-0 text-center border-t border-[#1E293B]">
                    <p className="text-xs text-[#64748B]">
                      Skill added{' '}
                      {new Date(userSkill.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </TechCard>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const SkillDetailCard = memo(SkillDetailCardComponent);
