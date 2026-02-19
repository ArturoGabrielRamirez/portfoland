'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/tech';
import ReactMarkdown from 'react-markdown';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function TechAbout({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <HUDPanel title={t('sections.about.gaming.title')} className={className}>
      {user.bio ? (
        <div
          className="text-slate-300 leading-relaxed font-mono prose prose-invert prose-sm max-w-none"
          style={{ textShadow: '0 0 5px rgba(0, 212, 255, 0.2)' }}
        >
          <ReactMarkdown>{user.bio}</ReactMarkdown>
        </div>
      ) : (
        <p className="font-mono text-sm text-[#64748B]" data-testid="gaming-about-empty">
          {'>'} {t('sections.about.gaming.emptyState')}
        </p>
      )}
    </HUDPanel>
  );
}
