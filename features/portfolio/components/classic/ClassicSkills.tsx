'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ClassicSkills({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const userSkills = data.skills?.skills ?? [];

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped = new Map<string, { name: string; color: string; skills: typeof userSkills }>();

    for (const us of userSkills) {
      const catName = us.skill.category?.name ?? 'Other';
      const catColor = us.skill.category?.color ?? '#6B7280';
      if (!grouped.has(catName)) {
        grouped.set(catName, { name: catName, color: catColor, skills: [] });
      }
      grouped.get(catName)!.skills.push(us);
    }

    return Array.from(grouped.values());
  }, [userSkills]);

  return (
    <section className={cn('py-6', className)}>
      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-1 border-b border-gray-100 pb-1">
        <span>CPU: 12.4%</span>
        <span>MEM: 2.1GB/16GB</span>
        <span>UPTIME: 365d</span>
        <span className="text-purple-500">skills.bin</span>
      </div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.skills.professional.title')}
      </h2>

      {userSkills.length === 0 ? (
        <p className="text-gray-400" data-testid="skills-empty-state">
          {t('sections.skills.professional.emptyState')}
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2" data-testid="skills-grid">
          {skillsByCategory.map((category) => (
            <div key={category.name}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                  data-testid="category-dot"
                />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {category.name}
                </h3>
              </div>

              <div className="space-y-3">
                {category.skills.map((us) => (
                  <div key={us.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{us.skill.name}</span>
                      <span className="text-xs text-gray-400">Lv. {us.level}/5</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100" role="progressbar" aria-valuenow={us.level} aria-valuemin={0} aria-valuemax={5}>
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${(us.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
