'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/tech';
import { TimelineMap } from '@/features/timeline/components';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function TechTimeline({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const experiences = data.experiences?.experiences ?? [];
  const [selectedExperience, setSelectedExperience] = useState(null);

  if (experiences.length === 0) {
    return (
      <HUDPanel title={t('sections.timeline.tech.title')} className={className}>
        <p className="font-mono text-sm text-[#64748B]">
          {'>'} {t('sections.timeline.tech.emptyState')}
        </p>
      </HUDPanel>
    );
  }

  return (
    <div className={cn('h-full', className)} data-testid="tech-timeline">
      <TimelineMap
        experiences={experiences}
        selectedExperience={selectedExperience}
        onExperienceSelect={setSelectedExperience as any}
        isEditable={false}
        className="w-full h-full min-h-[400px]"
      />
    </div>
  );
}
