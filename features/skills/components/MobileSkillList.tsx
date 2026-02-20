'use client';

/**
 * MobileSkillList Component
 *
 * Collapsible accordion list of skills for mobile view.
 * Groups skills by category with expand/collapse behavior.
 */

import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XPBar, LevelBadge, TechBadge } from '@/features/tech';
import type { MobileSkillListProps, UserSkillWithDetails, SkillCategory, SkillsByCategory } from '../types/skill';
import { SKILL_LEVEL_NAMES, calculateLevelProgress, LEVEL_THRESHOLDS_ARRAY } from '../constants/xp';
import { getCategoryColor, type CategorySlug } from '../constants/categories';

/**
 * Group skills by category
 */
function groupSkillsByCategory(
  userSkills: UserSkillWithDetails[],
  categories: SkillCategory[]
): SkillsByCategory[] {
  const grouped: Map<string, SkillsByCategory> = new Map();

  // Initialize groups for all categories
  for (const category of categories) {
    grouped.set(category.id, {
      category,
      skills: [],
      totalXP: 0,
    });
  }

  // Add "Uncategorized" group with all required fields
  const now = new Date();
  grouped.set('uncategorized', {
    category: {
      id: 'uncategorized',
      name: 'Uncategorized',
      slug: 'uncategorized',
      color: '#64748B',
      isDefault: false,
      userId: null,
      createdAt: now,
      updatedAt: now,
    },
    skills: [],
    totalXP: 0,
  });

  // Group skills
  for (const skill of userSkills) {
    const categoryId = skill.skill?.categoryId ?? 'uncategorized';
    const group = grouped.get(categoryId);
    if (group) {
      group.skills.push(skill);
      group.totalXP += skill.totalXP ?? 0;
    } else {
      // Category not in list, add to uncategorized
      const uncategorized = grouped.get('uncategorized')!;
      uncategorized.skills.push(skill);
      uncategorized.totalXP += skill.totalXP ?? 0;
    }
  }

  // Return non-empty groups, sorted by total XP
  return Array.from(grouped.values())
    .filter((group) => group.skills.length > 0)
    .sort((a, b) => b.totalXP - a.totalXP);
}

/**
 * Get XP progress info for display
 */
function getXPProgressInfo(level: number, totalXP: number) {
  const currentThreshold = level <= 1 ? 0 : LEVEL_THRESHOLDS_ARRAY[level - 1].min;
  const nextThreshold = level >= 5 ? LEVEL_THRESHOLDS_ARRAY[4].min : LEVEL_THRESHOLDS_ARRAY[level].min;
  const xpInLevel = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return { xpInLevel, xpNeeded };
}

/**
 * Individual skill item in the list
 */
function MobileSkillItem({
  skill,
  onClick,
}: {
  skill: UserSkillWithDetails;
  onClick?: () => void;
}) {
  const level = (skill.level ?? 1) as 1 | 2 | 3 | 4 | 5;
  const levelName = SKILL_LEVEL_NAMES[level];
  const { xpInLevel, xpNeeded } = getXPProgressInfo(level, skill.totalXP ?? 0);

  // Determine source type indicators
  const hasExperienceSource = skill.sources?.some((s) => s.sourceType === 'EXPERIENCE');
  const hasManualSource = skill.sources?.some((s) => s.sourceType === 'MANUAL');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-sm',
        'bg-[#1E293B]/50 border border-[#334155]/50',
        'hover:bg-[#1E293B] hover:border-[#00D4FF]/30',
        'transition-all duration-200 text-left',
        'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:ring-offset-2 focus:ring-offset-[#0A0E1A]'
      )}
    >
      {/* Skill Letter Badge */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center text-lg font-bold text-white"
        style={{
          backgroundColor: skill.skill?.category?.color ?? '#64748B',
          boxShadow: `0 0 10px ${skill.skill?.category?.color ?? '#64748B'}40`,
        }}
      >
        {skill.skill?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>

      {/* Skill Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">
            {skill.skill?.name ?? 'Unknown'}
          </span>
          {/* Source indicators */}
          <div className="flex items-center gap-1">
            {hasExperienceSource && (
              <div title="Linked to experience">
                <Briefcase className="w-3 h-3 text-[#00D4FF]" />
              </div>
            )}
            {hasManualSource && (
              <div title="Self-taught">
                <BookOpen className="w-3 h-3 text-[#A855F7]" />
              </div>
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
                style={{ width: `${Math.min((xpInLevel / xpNeeded) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-[#EAB308] font-medium">
            {(skill.totalXP ?? 0).toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Level Badge */}
      <LevelBadge level={level} size="sm" />
    </button>
  );
}

/**
 * Category accordion section
 */
function CategorySection({
  group,
  isExpanded,
  onToggle,
  onSkillClick,
}: {
  group: SkillsByCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSkillClick?: (skill: UserSkillWithDetails) => void;
}) {
  const categoryColor = getCategoryColor(group.category.slug as CategorySlug) ?? group.category.color;

  return (
    <div className="border border-[#1E293B] rounded-sm overflow-hidden">
      {/* Category Header */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'hover:bg-[#1E293B]/50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00D4FF]/50'
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="text-white font-medium">{group.category.name}</span>
          <TechBadge color="cyan">{group.skills.length}</TechBadge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#EAB308]">
            {group.totalXP.toLocaleString()} XP
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-[#64748B] transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Skills List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2 border-t border-[#1E293B]">
              {group.skills
                .sort((a, b) => (b.totalXP ?? 0) - (a.totalXP ?? 0))
                .map((skill) => (
                  <MobileSkillItem
                    key={skill.id}
                    skill={skill}
                    onClick={() => onSkillClick?.(skill)}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * MobileSkillList renders a collapsible list of skills by category
 */
function MobileSkillListComponent({
  userSkills,
  categories,
  onSkillClick,
  className,
}: MobileSkillListProps) {
  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group skills by category
  const groupedSkills = useMemo(
    () => groupSkillsByCategory(userSkills, categories),
    [userSkills, categories]
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (groupedSkills.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-[#64748B]">No skills yet</p>
        <p className="text-sm text-[#4B5563] mt-1">
          Add your first skill to get started
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Stats Summary */}
      <div className="flex items-center justify-between p-3 rounded-sm bg-[#1E293B]/30 border border-[#334155]/30">
        <span className="text-sm text-[#64748B]">
          {userSkills.length} skill{userSkills.length !== 1 ? 's' : ''}
        </span>
        <span className="text-sm font-medium text-[#EAB308]">
          {userSkills.reduce((sum, s) => sum + (s.totalXP ?? 0), 0).toLocaleString()} total XP
        </span>
      </div>

      {/* Category Sections */}
      {groupedSkills.map((group) => (
        <CategorySection
          key={group.category.id}
          group={group}
          isExpanded={expandedCategories.has(group.category.id)}
          onToggle={() => toggleCategory(group.category.id)}
          onSkillClick={onSkillClick}
        />
      ))}
    </div>
  );
}

export const MobileSkillList = memo(MobileSkillListComponent);
