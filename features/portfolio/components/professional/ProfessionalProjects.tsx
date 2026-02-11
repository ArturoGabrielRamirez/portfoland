'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ExternalLink,
  Github,
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/features/shadcn/ui/card';
import type { PortfolioSectionProps, ProjectData } from '../../types/portfolio';
import type { ProjectLink } from '@/features/projects/types/project';

// =============================================================================
// Helpers
// =============================================================================

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

const LINK_TYPE_ICONS: Record<string, React.ReactNode> = {
  LIVE: <ExternalLink className="h-3.5 w-3.5" />,
  REPO: <Github className="h-3.5 w-3.5" />,
  DOCS: <FileText className="h-3.5 w-3.5" />,
  VIDEO: <Video className="h-3.5 w-3.5" />,
  CASE_STUDY: <BookOpen className="h-3.5 w-3.5" />,
  OTHER: <LinkIcon className="h-3.5 w-3.5" />,
};

// =============================================================================
// Component
// =============================================================================

export function ProfessionalProjects({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { projects } = data;

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (project: ProjectData) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

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
          {projects.map((project) => {
            const links = (project.links ?? []) as ProjectLink[];

            return (
              <Card
                key={project.id}
                className={cn(
                  'cursor-pointer border-gray-100 bg-white transition-shadow hover:shadow-md',
                  project.featured && 'border-l-4 border-blue-600'
                )}
                data-testid="project-card"
                onClick={() => handleCardClick(project)}
              >
                {/* Cover Image */}
                {project.imageUrl && (
                  <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-gray-900">{project.title}</CardTitle>
                    {project.featured && (
                      <span
                        className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                        data-testid="featured-indicator"
                      >
                        {t('sections.projects.professional.featured')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(project.startDate)}
                    {project.endDate && ` — ${formatDate(project.endDate)}`}
                  </p>
                </CardHeader>

                <CardContent>
                  {/* Short description or truncated description */}
                  {(project.shortDescription || project.description) && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {project.shortDescription || project.description}
                    </p>
                  )}

                  {/* Technology badges */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link icon buttons */}
                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                          title={link.label}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {LINK_TYPE_ICONS[link.type] || LINK_TYPE_ICONS.OTHER}
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ProjectDetailModal will be rendered here in TG7 */}
    </section>
  );
}
