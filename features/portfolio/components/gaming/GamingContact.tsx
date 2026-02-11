'use client';

import { useTranslations } from 'next-intl';
import { Mail, Github, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HUDPanel, GamingButton } from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingContact({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <HUDPanel title={t('sections.contact.gaming.title')} className={className}>
      <div className="flex flex-col gap-3">
        <a href={`mailto:${user.email}`}>
          <GamingButton variant="outline" className="w-full justify-start">
            <Mail className="h-4 w-4" />
            {user.email}
          </GamingButton>
        </a>
        <a href="#">
          <GamingButton variant="outline" className="w-full justify-start">
            <Github className="h-4 w-4" />
            GitHub
          </GamingButton>
        </a>
        <a href="#">
          <GamingButton variant="outline" className="w-full justify-start">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </GamingButton>
        </a>
      </div>
    </HUDPanel>
  );
}
