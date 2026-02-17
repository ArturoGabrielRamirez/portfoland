'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ProfessionalAbout({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <section className={cn('py-6', className)}>
      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-1 border-b border-gray-100 pb-1">
        <span>drwxr-xr-x</span>
        <span>1 {user.username || 'user'}</span>
        <span>staff</span>
        <span>4096</span>
        <span>Feb 16 21:00</span>
        <span className="text-blue-500">about.md</span>
      </div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        {t('sections.about.professional.title')}
      </h2>

      {user.bio ? (
        <div className="leading-relaxed text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown>{user.bio}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-400" data-testid="about-empty-state">
          {t('sections.about.professional.emptyState')}
        </p>
      )}
    </section>
  );
}
