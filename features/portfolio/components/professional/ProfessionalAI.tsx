'use client';

import { useTranslations } from 'next-intl';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/features/shadcn/ui/badge';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ProfessionalAI({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');

  return (
    <section className={cn('py-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('sections.ai.professional.title')}
        </h2>
        <Badge variant="secondary">{t('sections.ai.professional.comingSoon')}</Badge>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
        <Bot className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">
          {t('sections.ai.professional.description')}
        </p>
      </div>
    </section>
  );
}
