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

  return (
    <div className={cn('h-full', className)} data-testid="tech-skills">
      {/* AI-validated badge legend — only renders when at least one skill is AI-validated */}
      {userSkills.some(s => s.aiValidated) && (
        <div className="flex items-center gap-3 mb-4 px-2">
          <TechBadge color="magenta">★ AI Verified</TechBadge>
          <TechBadge color="gray">Self-Assessed</TechBadge>
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
