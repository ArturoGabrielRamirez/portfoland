'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel, TechBadge } from '@/features/tech';
import { SkillTreeView } from '@/features/skills/components';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function TechSkills({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const userSkills = data.skills?.skills ?? [];
  const categories = data.skills?.categories ?? [];

  if (userSkills.length === 0) {
    return (
      <HUDPanel title={t('sections.skills.tech.title')} className={className}>
        <p className="font-mono text-sm text-[#64748B]">
          {'>'} {t('sections.skills.tech.emptyState')}
        </p>
      </HUDPanel>
    );
  }

  // Determine which validation states are present across all skills
  const hasAIValidated = userSkills.some((s) => s.aiValidated);
  const hasGitHubValidated = userSkills.some((s) => s.githubValidated);
  const hasDualValidated = userSkills.some((s) => s.aiValidated && s.githubValidated);
  const hasAssessmentValidated = userSkills.some((s) => s.aiAssessmentValidated);
  const hasSelfAssessed = userSkills.some((s) => !s.aiValidated);

  return (
    <div className={cn('h-full', className)} data-testid="tech-skills">
      {/* Validation badge legend — renders only when at least one validation type is present (TG9) */}
      {(hasAIValidated || hasGitHubValidated) && (
        <div className="flex items-center gap-3 mb-4 px-2 flex-wrap">
          {hasAIValidated && (
            <TechBadge color="magenta">&#9733; AI Verified</TechBadge>
          )}
          {hasGitHubValidated && (
            <TechBadge color="green">&#x2B21; GitHub Verified</TechBadge>
          )}
          {hasDualValidated && (
            <TechBadge color="yellow">&#10022; Elite Verified</TechBadge>
          )}
          {hasAssessmentValidated && (
            <TechBadge color="cyan">&#9670; Assessment Verified</TechBadge>
          )}
          {hasSelfAssessed && (
            <TechBadge color="gray">Self-Assessed</TechBadge>
          )}
        </div>
      )}
      <SkillTreeView
        userSkills={userSkills}
        categories={categories}
        isEditable={false}
        className="w-full h-full min-h-[400px]"
      />
    </div>
  );
}
