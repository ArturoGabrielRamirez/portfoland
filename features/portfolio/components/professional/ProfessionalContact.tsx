'use client';

import { useTranslations } from 'next-intl';
import { Mail, Github, Linkedin, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ProfessionalContact({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.contact.professional.title')}
      </h2>

      <address className="not-italic">
        <div className="rounded-lg border border-gray-100 bg-white p-6">
          <div className="flex flex-col gap-4">
            {/* Email */}
            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Mail className="h-5 w-5" />
              {user.email}
            </a>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </a>
            </div>

            {/* Download CV */}
            <Button variant="outline" disabled className="w-fit">
              <Download className="mr-2 h-4 w-4" />
              Download CV — Coming Soon
            </Button>
          </div>
        </div>
      </address>
    </section>
  );
}
