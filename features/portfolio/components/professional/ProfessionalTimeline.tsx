'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export function ProfessionalTimeline({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const experiences = data.experiences?.experiences ?? [];

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        {t('sections.timeline.professional.title')}
      </h2>
      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 mb-6 bg-gray-50 p-2 rounded border border-gray-100 italic">
        <span className="text-blue-500">$</span>
        <span>git log --pretty=format:"%h - %an, %ar : %s"</span>
      </div>

      {experiences.length === 0 ? (
        <p className="text-gray-400" data-testid="timeline-empty-state">
          {t('sections.timeline.professional.emptyState')}
        </p>
      ) : (
        <ol className="space-y-6 border-l-2 border-gray-100 pl-6">
          {experiences.map((exp) => (
            <li key={exp.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />

              <h3 className="text-lg font-semibold text-gray-900">
                {exp.title}
              </h3>
              <p className="text-sm font-medium text-gray-600">{exp.company}</p>
              <p className="mt-1 text-xs text-gray-400">
                <time dateTime={new Date(exp.startDate).toISOString()}>
                  {formatDate(exp.startDate)}
                </time>
                {' — '}
                {exp.endDate ? (
                  <time dateTime={new Date(exp.endDate).toISOString()}>
                    {formatDate(exp.endDate)}
                  </time>
                ) : (
                  'Present'
                )}
              </p>

              {exp.description && (
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {exp.description}
                </p>
              )}

              {/* Skill tags */}
              {exp.skills && exp.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {exp.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
