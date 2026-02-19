'use client';

/**
 * MobileSkillItem Component
 *
 * Compact skill display for mobile view.
 * Shows name, LevelBadge, XPBar (mini), and source indicator icons.
 * Tap to expand inline details.
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LevelBadge } from '@/features/tech';
import type { MobileSkillItemProps } from '../types/skill';
import { SKILL_LEVEL_NAMES, LEVEL_THRESHOLDS_ARRAY } from '../constants/xp';

/**
 * Get XP progress info for display
 */
function getXPProgressInfo(level: number, totalXP: number) {
  const currentThreshold = level <= 1 ? 0 : LEVEL_THRESHOLDS_ARRAY[level - 1].min;
  const nextThreshold = level >= 5 ? LEVEL_THRESHOLDS_ARRAY[4].min : LEVEL_THRESHOLDS_ARRAY[level].min;
  const xpInLevel = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return { xpInLevel, xpNeeded, currentThreshold, nextThreshold };
}

/**
 * MobileSkillItem renders a compact skill display with expandable details
 */
function MobileSkillItemComponent({
  userSkill,
  onClick,
  isExpanded: controlledExpanded,
  className,
}: MobileSkillItemProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? localExpanded;

  const level = (userSkill.level ?? 1) as 1 | 2 | 3 | 4 | 5;
  const levelName = SKILL_LEVEL_NAMES[level];
  const { xpInLevel, xpNeeded } = getXPProgressInfo(level, userSkill.totalXP ?? 0);
  const progressPercent = Math.min((xpInLevel / xpNeeded) * 100, 100);

  // Determine source type indicators
  const hasExperienceSource = userSkill.sources?.some((s) => s.sourceType === 'EXPERIENCE');
  const hasManualSource = userSkill.sources?.some((s) => s.sourceType === 'MANUAL');

  // Get experiences linked to this skill
  const linkedExperiences = userSkill.sources
    ?.filter((s) => s.sourceType === 'EXPERIENCE' && s.experience)
    .map((s) => s.experience!) ?? [];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocalExpanded((prev) => !prev);
    }
  };

  return (
    <div className={cn('rounded-sm overflow-hidden', className)}>
      {/* Main skill row */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 p-3',
          'bg-[#1E293B]/50 border border-[#334155]/50',
          'hover:bg-[#1E293B] hover:border-[#00D4FF]/30',
          'transition-all duration-200 text-left',
          'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:ring-offset-2 focus:ring-offset-[#0A0E1A]',
          isExpanded && 'bg-[#1E293B] border-[#00D4FF]/30'
        )}
        aria-expanded={isExpanded}
      >
        {/* Skill Letter Badge */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center text-lg font-bold text-white"
          style={{
            backgroundColor: userSkill.skill?.category?.color ?? '#64748B',
            boxShadow: `0 0 10px ${userSkill.skill?.category?.color ?? '#64748B'}40`,
          }}
        >
          {userSkill.skill?.name?.charAt(0).toUpperCase() ?? '?'}
        </div>

        {/* Skill Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {userSkill.skill?.name ?? 'Unknown'}
            </span>
            {/* Source indicators */}
            <div className="flex items-center gap-1">
              {hasExperienceSource && (
                <Briefcase
                  className="w-3 h-3 text-[#00D4FF]"
                  aria-label="Linked to experience"
                />
              )}
              {hasManualSource && (
                <BookOpen
                  className="w-3 h-3 text-[#A855F7]"
                  aria-label="Self-taught"
                />
              )}
            </div>
          </div>

          {/* Level and XP Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#64748B]">{levelName}</span>
            <div className="flex-1">
              <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EAB308] to-[#FCD34D] rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-[#EAB308] font-medium">
              {(userSkill.totalXP ?? 0).toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Level Badge and Expand Icon */}
        <div className="flex items-center gap-2">
          <LevelBadge level={level} size="sm" />
          <ChevronRight
            className={cn(
              'w-4 h-4 text-[#64748B] transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3 bg-[#1E293B]/30 border-t border-[#334155]/30">
              {/* XP Breakdown */}
              <div>
                <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">
                  XP Sources
                </h4>
                <div className="space-y-1.5">
                  {userSkill.sources?.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {source.sourceType === 'EXPERIENCE' ? (
                          <>
                            <Briefcase className="w-3.5 h-3.5 text-[#00D4FF]" />
                            <span className="text-[#94A3B8] truncate max-w-[180px]">
                              {source.experience?.title ?? 'Experience'}
                            </span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-[#A855F7]" />
                            <span className="text-[#94A3B8]">Self-assessed</span>
                          </>
                        )}
                      </div>
                      <span className="text-[#EAB308] font-medium">
                        +{source.xpAmount} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Experiences */}
              {linkedExperiences.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">
                    Linked Experiences
                  </h4>
                  <div className="space-y-1.5">
                    {linkedExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-2 rounded-sm bg-[#0D1421]/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {exp.title}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {exp.company}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: userSkill.skill?.category?.color ?? '#64748B',
                  }}
                />
                <span className="text-xs text-[#64748B]">
                  {userSkill.skill?.category?.name ?? 'Uncategorized'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const MobileSkillItem = memo(MobileSkillItemComponent);
