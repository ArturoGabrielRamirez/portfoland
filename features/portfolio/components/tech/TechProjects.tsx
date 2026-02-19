'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  FolderOpen,
  ExternalLink,
  Github,
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TechCard,
  TechCardHeader,
  TechCardTitle,
  TechCardContent,
  TechBadge,
  TechButton,
  StatCard,
} from '@/features/tech';
import { ProjectDetailModal } from '@/features/projects/components/ProjectDetailModal';
import type { PortfolioSectionProps, ProjectData } from '../../types/portfolio';
import type { ProjectLink } from '@/features/projects/types/project';

// =============================================================================
// Helpers
// =============================================================================

const LINK_TYPE_ICONS: Record<string, React.ReactNode> = {
  LIVE: <ExternalLink className="h-3 w-3" />,
  REPO: <Github className="h-3 w-3" />,
  DOCS: <FileText className="h-3 w-3" />,
  VIDEO: <Video className="h-3 w-3" />,
  CASE_STUDY: <BookOpen className="h-3 w-3" />,
  OTHER: <LinkIcon className="h-3 w-3" />,
};

// =============================================================================
// Component
// =============================================================================

export function TechProjects({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { projects } = data;

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (project: ProjectData) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (projects.length === 0) {
    return (
      <div className={cn('p-6', className)}>
        <p className="font-mono text-sm text-[#64748B]">
          {'>'} {t('sections.projects.tech.emptyState')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stat */}
      <StatCard
        value={projects.length}
        label="Projects"
        icon={<FolderOpen className="h-5 w-5" />}
        color="cyan"
      />

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const links = (project.links ?? []) as unknown as ProjectLink[];

          return (
            <TechCard
              key={project.id}
              variant={project.featured ? 'featured' : 'glow'}
              data-testid="tech-project-card"
              className="cursor-pointer"
              onClick={() => handleCardClick(project)}
            >
              {/* Cover image with cyberpunk gradient overlay */}
              {project.imageUrl && (
                <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#D946EF]/20" />
                </div>
              )}

              <TechCardHeader>
                <TechCardTitle>{project.title}</TechCardTitle>
              </TechCardHeader>

              <TechCardContent>
                {/* Short description */}
                {(project.shortDescription || project.description) && (
                  <p className="mb-3 line-clamp-2 text-sm text-slate-400">
                    {project.shortDescription || project.description}
                  </p>
                )}

                {/* Technology badges */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech: string) => (
                      <TechBadge key={tech} color="cyan">
                        {tech}
                      </TechBadge>
                    ))}
                  </div>
                )}

                {/* Link buttons */}
                {links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {links.map((link, index) => (
                      <TechButton
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(link.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        {LINK_TYPE_ICONS[link.type] || LINK_TYPE_ICONS.OTHER}
                        <span>{link.label}</span>
                      </TechButton>
                    ))}
                  </div>
                )}
              </TechCardContent>
            </TechCard>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          mode="tech"
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
