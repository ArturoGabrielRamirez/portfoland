'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/features/shadcn/ui/card';
import type { PortfolioSectionProps } from '../../types/portfolio';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export function ProfessionalProjects({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { projects } = data;

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.projects.professional.title')}
      </h2>

      {projects.length === 0 ? (
        <p className="text-gray-400" data-testid="projects-empty-state">
          {t('sections.projects.professional.emptyState')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" data-testid="projects-grid">
          {projects.map((project) => (
            <Card key={project.id} className="border-gray-100 bg-white" data-testid="project-card">
              <CardHeader>
                <CardTitle className="text-gray-900">{project.title}</CardTitle>
                <p className="text-xs text-gray-400">
                  {formatDate(project.startDate)}
                  {project.endDate && ` — ${formatDate(project.endDate)}`}
                </p>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="mb-3 text-sm text-gray-600">{project.description}</p>
                )}
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
