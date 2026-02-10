'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingAbout({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <HUDPanel title={t('sections.about.gaming.title')} className={className}>
      {user.bio ? (
        <p
          className="text-slate-300 leading-relaxed"
          style={{ textShadow: '0 0 5px rgba(0, 212, 255, 0.2)' }}
        >
          {user.bio}
        </p>
      ) : (
        <p className="font-mono text-sm text-[#64748B]" data-testid="gaming-about-empty">
          {'>'} {t('sections.about.gaming.emptyState')}
        </p>
      )}
    </HUDPanel>
  );
}
