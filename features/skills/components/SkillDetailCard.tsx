'use client';

/**
 * SkillDetailCard Component
 *
 * Slide-in card for skill details with three tabs:
 * - Stats: XP progress and level info
 * - XP: XP breakdown by source
 * - Enhance: AI-powered skill improvement suggestions
 */

import { memo, useState, useTransition, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Edit, Trash2, Crown, Sparkles, Loader2,
  BarChart2, Zap, Link2
} from 'lucide-react';
import { toast } from 'sonner';
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
import { SkillIcon } from './SkillIcon';
import { suggestEnhancementsAction } from '@/features/skill-enhancement/actions/suggestEnhancements.action';
import { SkillEnhancementPanel } from '@/features/skill-enhancement/components/SkillEnhancementPanel';
import type { SkillEnhancement } from '@/features/skill-enhancement/types/enhancement';
import { createSkill } from '../actions/createSkill';

type Tab = 'stats' | 'xp' | 'enhance';

function getNextLevelThreshold(level: number): number {
  if (level >= 5) return LEVEL_THRESHOLDS_ARRAY[4].min;
  return LEVEL_THRESHOLDS_ARRAY[level].min;
}

function getCurrentLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  return LEVEL_THRESHOLDS_ARRAY[level - 1].min;
}

function SkillDetailCardComponent({
  userSkill,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isEditable = false,
  className,
  githubConnected = false,
  locale = 'en',
}: SkillDetailCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [enhancement, setEnhancement] = useState<SkillEnhancement | null>(null);
  const [isLoadingEnhancement, setIsLoadingEnhancement] = useState(false);
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const level = (userSkill.level ?? 1) as 1 | 2 | 3 | 4 | 5;
  const levelName = SKILL_LEVEL_NAMES[level];
  const visualStyle = LEVEL_VISUAL_STYLES[level];
  const badgeColors = LEVEL_BADGE_COLORS[level];

  const categorySlug = userSkill.skill?.category?.slug;
  const categoryColor = categorySlug
    ? getCategoryColor(categorySlug as any)
    : userSkill.skill?.category?.color ?? CATEGORY_COLORS.core;
  const categoryName = userSkill.skill?.category?.name ?? 'Uncategorized';

  const totalXP = userSkill.totalXP ?? 0;
  const currentThreshold = getCurrentLevelThreshold(level);
  const nextThreshold = getNextLevelThreshold(level);
  const xpInLevel = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = calculateLevelProgress(totalXP);
  const isLegendary = level === 5;

  const hasExperienceSources = userSkill.sources?.some(
    (source) => source.sourceType === 'EXPERIENCE'
  );
  const canDelete = isEditable && !hasExperienceSources;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('stats');
      setEnhancement(null);
      setIsLoadingEnhancement(false);
    }
  }, [isOpen]);

  const handleGetEnhancement = async () => {
    setIsLoadingEnhancement(true);
    try {
      const result = await suggestEnhancementsAction({
        skillName: userSkill.skill?.name ?? '',
        skillLevel: level,
        category: categoryName,
        locale,
      });
      if (!result.hasError && result.payload) {
        setEnhancement(result.payload);
      } else {
        toast.error(result.message ?? 'Failed to get suggestions');
      }
    } catch {
      toast.error('Failed to get AI suggestions');
    } finally {
      setIsLoadingEnhancement(false);
    }
  };

  const handleAddRelatedSkill = (skillName: string) => {
    setAddingSkill(skillName);
    startTransition(async () => {
      try {
        const result = await createSkill({
          name: skillName,
          selfAssessmentLevel: 'BEGINNER',
        });
        if (!result.hasError) {
          toast.success(`${skillName} added to your skill tree`);
          // Mark as added in current enhancement
          if (enhancement) {
            setEnhancement({
              ...enhancement,
              relatedSkills: enhancement.relatedSkills.map(rs =>
                rs.name === skillName ? { ...rs, alreadyAdded: true } : rs
              ),
            });
          }
        } else {
          toast.error(result.message ?? 'Failed to add skill');
        }
      } catch {
        toast.error('Failed to add skill');
      } finally {
        setAddingSkill(null);
      }
    });
  };

  const handleExperienceClick = (experienceId: string) => {
    window.location.href = `/dashboard/timeline?experience=${experienceId}`;
  };

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Stats', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'xp', label: 'XP', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'enhance', label: 'Enhance', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

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
            className={cn('relative w-full max-w-sm mt-4', className)}
          >
            <TechCard
              variant={isLegendary ? 'featured' : 'glow'}
              className={cn(
                'w-full overflow-hidden relative rounded-sm',
                isLegendary && 'ring-2 ring-[#F59E0B]'
              )}
              style={{ boxShadow: `0 0 30px ${categoryColor}40` }}
            >
              {/* CRT overlay */}
              <div className="absolute inset-0 pointer-events-none crt-lines opacity-10 z-10" />

              {/* Header */}
              <div
                className="relative p-4 border-b border-[#1E293B]"
                style={{ background: `linear-gradient(135deg, ${categoryColor}20 0%, transparent 100%)` }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-sm text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <TechBadge color="gray" className="mb-3">{categoryName}</TechBadge>

                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 clip-hexagon flex items-center justify-center relative',
                    )}
                    style={{ backgroundColor: categoryColor, boxShadow: `0 0 20px ${categoryColor}60` }}
                  >
                    <SkillIcon skillName={userSkill.skill?.name ?? ''} size="lg" className="relative z-10" />
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
                      <span className="text-sm font-medium" style={{ color: badgeColors.text }}>
                        {levelName}
                      </span>
                      {isLegendary && <Sparkles className="w-4 h-4 text-[#F59E0B]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-[#1E293B]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
                      activeTab === tab.id
                        ? 'text-[#00D4FF] border-b-2 border-[#00D4FF] bg-[#00D4FF]/5'
                        : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B]/50'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto max-h-[60vh]">
                {/* Stats Tab */}
                {activeTab === 'stats' && (
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

                    {/* Edit/Delete actions */}
                    {isEditable && (
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#1E293B]">
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
                )}

                {/* XP Tab */}
                {activeTab === 'xp' && (
                  <div className="p-4">
                    <XPSourceList
                      sources={userSkill.sources ?? []}
                      onExperienceClick={handleExperienceClick}
                    />
                    <p className="text-xs text-[#64748B] mt-4 text-center border-t border-[#1E293B] pt-4">
                      Skill added{' '}
                      {new Date(userSkill.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {/* Enhance Tab */}
                {activeTab === 'enhance' && (
                  <div className="p-4">
                    {!enhancement && !isLoadingEnhancement && (
                      <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <Sparkles className="w-10 h-10 text-[#D946EF] opacity-60" />
                        <div>
                          <p className="text-sm font-medium text-white">Get AI Suggestions</p>
                          <p className="text-xs text-[#64748B] mt-1">
                            Related skills, learning resources, and next-level guidance
                          </p>
                          <p className="text-xs text-[#475569] mt-1">Costs 1 life</p>
                        </div>
                        <button
                          onClick={handleGetEnhancement}
                          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium bg-[#D946EF]/10 border border-[#D946EF]/40 text-[#D946EF] hover:bg-[#D946EF]/20 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          Get AI Suggestions
                        </button>
                      </div>
                    )}

                    {isLoadingEnhancement && (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="w-8 h-8 text-[#D946EF] animate-spin" />
                        <p className="text-sm text-[#64748B]">Getting AI suggestions...</p>
                      </div>
                    )}

                    {enhancement && (
                      <SkillEnhancementPanel
                        enhancement={enhancement}
                        onAddSkill={handleAddRelatedSkill}
                        addingSkill={addingSkill}
                      />
                    )}
                  </div>
                )}
              </div>
            </TechCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const SkillDetailCard = memo(SkillDetailCardComponent);
