'use client';

/**
 * SkillSuggestions Component
 *
 * Renders empty hexagons for suggested skills.
 * Shows static progressions and smart suggestions based on existing skills.
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { UserSkillWithDetails } from '../types/skill';
import { SkillHexagonNode } from './SkillHexagonNode';
import { getSmartSuggestions, getCategoryStarterSuggestions } from '../constants/suggestions';
import { CATEGORY_COLORS, type CategorySlug } from '../constants/categories';

/**
 * Props for SkillSuggestions
 */
interface SkillSuggestionsProps {
  userSkills: UserSkillWithDetails[];
  categorySlug?: CategorySlug;
  onSuggestionClick: (skillName: string) => void;
  maxSuggestions?: number;
  className?: string;
}

/**
 * SkillSuggestions renders suggested skills as empty hexagons
 */
function SkillSuggestionsComponent({
  userSkills,
  categorySlug,
  onSuggestionClick,
  maxSuggestions = 5,
  className,
}: SkillSuggestionsProps) {
  // Get existing skill names
  const existingSkillNames = useMemo(
    () => userSkills.map((us) => us.skill?.name ?? '').filter(Boolean),
    [userSkills]
  );

  // Get suggestions based on mode
  const suggestions = useMemo(() => {
    if (categorySlug) {
      // Category-specific suggestions
      return getCategoryStarterSuggestions(categorySlug, existingSkillNames);
    }

    // Smart suggestions based on all skills
    return getSmartSuggestions(existingSkillNames);
  }, [existingSkillNames, categorySlug]);

  // Limit number of suggestions
  const limitedSuggestions = suggestions.slice(0, maxSuggestions);

  // Get color for suggestions
  const suggestionColor = categorySlug
    ? CATEGORY_COLORS[categorySlug]
    : CATEGORY_COLORS.core;

  if (limitedSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: suggestionColor }}
        />
        <h3 className="text-sm font-medium text-[#64748B]">
          Suggested Skills
        </h3>
      </div>

      {/* Suggestions grid */}
      <div className="flex flex-wrap gap-3">
        {limitedSuggestions.map((skillName) => (
          <div
            key={skillName}
            className="flex flex-col items-center gap-1"
          >
            <SkillHexagonNode
              isEmpty
              suggestedSkillName={skillName}
              categoryColor={suggestionColor}
              onClick={() => onSuggestionClick(skillName)}
            />
            <span className="text-xs text-[#64748B] text-center max-w-[60px] truncate">
              {skillName}
            </span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-[#4B5563]">
        Click to add a suggested skill
      </p>
    </div>
  );
}

export const SkillSuggestions = memo(SkillSuggestionsComponent);
