'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ProfessionalAbout({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        {t('sections.about.professional.title')}
      </h2>

      {user.bio ? (
        <p className="leading-relaxed text-gray-700">{user.bio}</p>
      ) : (
        <p className="text-gray-400" data-testid="about-empty-state">
          {t('sections.about.professional.emptyState')}
        </p>
      )}
    </section>
  );
}
