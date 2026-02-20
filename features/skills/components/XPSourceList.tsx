'use client';

/**
 * XPSourceList Component
 *
 * Displays the list of XP sources for a skill.
 * Shows experience details for EXPERIENCE type and learning sources for MANUAL type.
 */

import { memo } from 'react';
import { Briefcase, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { XPSourceListProps, SkillSourceWithExperience } from '../types/skill';

/**
 * Format date for display
 */
function formatDate(date: Date | string | null): string {
  if (!date) return 'Present';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Format XP amount with comma separator
 */
function formatXP(xp: number): string {
  return `+${xp.toLocaleString()} XP`;
}

/**
 * Get icon for source type
 */
function getSourceIcon(source: SkillSourceWithExperience) {
  if (source.sourceType === 'EXPERIENCE') {
    return source.experience?.type === 'EDUCATION' ? GraduationCap : Briefcase;
  }
  return BookOpen;
}

/**
 * Get source title for display
 */
function getSourceTitle(source: SkillSourceWithExperience): string {
  if (source.sourceType === 'EXPERIENCE' && source.experience) {
    return source.experience.title;
  }
  return 'Self-taught';
}

/**
 * Get source subtitle for display
 */
function getSourceSubtitle(source: SkillSourceWithExperience): string {
  if (source.sourceType === 'EXPERIENCE' && source.experience) {
    const company = source.experience.company;
    const startDate = formatDate(source.experience.startDate);
    const endDate = formatDate(source.experience.endDate);
    return `${company} | ${startDate} - ${endDate}`;
  }

  // For manual sources, show learning sources if available
  const metadata = source.metadata as { learningSources?: string; selfAssessmentLevel?: string } | null;
  if (metadata?.learningSources) {
    return metadata.learningSources.slice(0, 100) + (metadata.learningSources.length > 100 ? '...' : '');
  }

  return metadata?.selfAssessmentLevel
    ? `Self-assessed: ${metadata.selfAssessmentLevel.toLowerCase()}`
    : 'Manual entry';
}

/**
 * Individual source item component
 */
function SourceItem({
  source,
  onExperienceClick,
}: {
  source: SkillSourceWithExperience;
  onExperienceClick?: (experienceId: string) => void;
}) {
  const Icon = getSourceIcon(source);
  const isClickable = source.sourceType === 'EXPERIENCE' && source.experience && onExperienceClick;

  const handleClick = () => {
    if (isClickable && source.experienceId) {
      onExperienceClick(source.experienceId);
    }
  };

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && handleClick() : undefined}
      className={cn(
        'flex items-start gap-3 p-3 rounded-sm bg-[#1E293B]/50 border border-[#334155]/50',
        'transition-all duration-200',
        isClickable && 'cursor-pointer hover:bg-[#1E293B] hover:border-[#00D4FF]/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center',
          source.sourceType === 'EXPERIENCE'
            ? 'bg-[#00D4FF]/20 text-[#00D4FF]'
            : 'bg-[#A855F7]/20 text-[#A855F7]'
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getSourceTitle(source)}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2">
              {getSourceSubtitle(source)}
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-medium text-[#EAB308]">
            {formatXP(source.xpAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * XPSourceList displays all sources of XP for a skill
 */
function XPSourceListComponent({
  sources,
  onExperienceClick,
  className,
}: XPSourceListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className={cn('text-center py-4 text-[#64748B] text-sm', className)}>
        No XP sources yet
      </div>
    );
  }

  // Sort sources by XP amount (highest first)
  const sortedSources = [...sources].sort((a, b) => b.xpAmount - a.xpAmount);

  // Calculate total XP
  const totalXP = sources.reduce((sum, source) => sum + source.xpAmount, 0);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with total XP */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#64748B] uppercase tracking-wider font-medium">
          XP Sources ({sources.length})
        </span>
        <span className="text-[#EAB308] font-bold">
          Total: {totalXP.toLocaleString()} XP
        </span>
      </div>

      {/* Source list */}
      <div className="space-y-2">
        {sortedSources.map((source) => (
          <SourceItem
            key={source.id}
            source={source}
            onExperienceClick={onExperienceClick}
          />
        ))}
      </div>

      {/* Clickable hint */}
      {sources.some((s) => s.sourceType === 'EXPERIENCE') && onExperienceClick && (
        <p className="text-xs text-[#64748B] text-center pt-2">
          Click an experience to view in Timeline
        </p>
      )}
    </div>
  );
}

export const XPSourceList = memo(XPSourceListComponent);
