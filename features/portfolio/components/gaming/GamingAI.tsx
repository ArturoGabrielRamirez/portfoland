'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingAI({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');

  return (
    <HUDPanel className={className}>
      <div className="relative flex flex-col items-center gap-6 overflow-hidden py-8">
        {/* Title with neon glow */}
        <h2
          className="text-2xl font-bold text-[#00D4FF]"
          style={{ textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' }}
        >
          {t('sections.ai.gaming.title')}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-400 text-center max-w-sm">
          {t('sections.ai.gaming.description')}
        </p>

        {/* Pulsing dot */}
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full bg-[#00D4FF] animate-pulse"
            data-testid="pulsing-dot"
          />
          <span className="font-mono text-sm text-[#64748B]" data-testid="system-initializing">
            {t('sections.ai.gaming.status')}
          </span>
        </div>

        {/* Scanline effect overlay */}
        <div
          className="scanline-overlay absolute inset-0 pointer-events-none opacity-10"
          data-testid="scanline-overlay"
        />
      </div>
    </HUDPanel>
  );
}
