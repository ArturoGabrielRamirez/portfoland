'use client';

import { useTranslations } from 'next-intl';
import { Mail, Github, Linkedin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HUDPanel, GamingButton } from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingContact({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <HUDPanel title={t('sections.contact.gaming.title')} className={className}>
      <div className="flex flex-col gap-3">
        {/* Email */}
        {(user.contactLinks?.email || user.email) && (
          <a href={`mailto:${user.contactLinks?.email || user.email}`}>
            <GamingButton variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4" />
              {user.contactLinks?.email || user.email}
            </GamingButton>
          </a>
        )}

        {/* GitHub */}
        {user.contactLinks?.github && (
          <a href={user.contactLinks.github} target="_blank" rel="noopener noreferrer">
            <GamingButton variant="outline" className="w-full justify-start">
              <Github className="h-4 w-4" />
              GitHub
            </GamingButton>
          </a>
        )}

        {/* LinkedIn */}
        {user.contactLinks?.linkedin && (
          <a href={user.contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
            <GamingButton variant="outline" className="w-full justify-start">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </GamingButton>
          </a>
        )}

        {/* Custom Links */}
        {user.contactLinks?.custom?.map((link: any, idx: number) => (
          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
            <GamingButton variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4" />
              {link.label}
            </GamingButton>
          </a>
        ))}
      </div>
    </HUDPanel>
  );
}
