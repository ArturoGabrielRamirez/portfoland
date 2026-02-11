'use client';

import { useTranslations } from 'next-intl';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GamingCard,
  GamingCardHeader,
  GamingCardTitle,
  GamingCardContent,
  GamingBadge,
  StatCard,
} from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function GamingProjects({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { projects } = data;

  if (projects.length === 0) {
    return (
      <div className={cn('p-6', className)}>
        <p className="font-mono text-sm text-[#64748B]">
          {'>'} {t('sections.projects.gaming.emptyState')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stat */}
      <StatCard
        value={projects.length}
        label="Missions"
        icon={<FolderOpen className="h-5 w-5" />}
        color="cyan"
      />

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <GamingCard key={project.id} variant="glow" data-testid="gaming-project-card">
            <GamingCardHeader>
              <GamingCardTitle>{project.title}</GamingCardTitle>
            </GamingCardHeader>
            <GamingCardContent>
              {project.description && (
                <p className="mb-3 text-sm text-slate-400">{project.description}</p>
              )}
              {project.skills && project.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.skills.map((skill: string) => (
                    <GamingBadge key={skill} color="cyan">
                      {skill}
                    </GamingBadge>
                  ))}
                </div>
              )}
            </GamingCardContent>
          </GamingCard>
        ))}
      </div>
    </div>
  );
}
