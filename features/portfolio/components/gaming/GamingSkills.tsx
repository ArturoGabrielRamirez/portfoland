'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/gaming';
import { SkillTreeView } from '@/features/skills/components';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingSkills({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const userSkills = data.skills?.userSkills ?? [];
  const categories = data.skills?.categories ?? [];

  if (userSkills.length === 0) {
    return (
      <HUDPanel title={t('sections.skills.gaming.title')} className={className}>
        <p className="font-mono text-sm text-[#64748B]">
          {'>'} {t('sections.skills.gaming.emptyState')}
        </p>
      </HUDPanel>
    );
  }

  return (
    <div className={cn('h-full', className)} data-testid="gaming-skills">
      <SkillTreeView
        userSkills={userSkills}
        categories={categories}
        isEditable={false}
        className="w-full h-full min-h-[400px]"
      />
    </div>
  );
}
