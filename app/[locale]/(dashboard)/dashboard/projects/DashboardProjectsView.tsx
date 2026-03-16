'use client';

import { useState, useCallback, useTransition } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ProjectModal } from '@/features/projects/components/ProjectModal';
import { DeleteConfirmModal } from '@/features/ui/components/DeleteConfirmModal';
import { deleteProject } from '@/features/projects/actions/deleteProject';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
import type { Project } from '@/features/projects/types/project';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface DashboardProjectsViewProps {
  projects: Project[];
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
    portfolioMode: PortfolioMode;
  };
}

export function DashboardProjectsView({ projects, user }: DashboardProjectsViewProps) {
  const t = useTranslations('dashboard.projects');
  const tStatus = useTranslations('dashboard.projects.status');
  const mc = modeClasses(user.portfolioMode);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = useCallback(() => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingProject(undefined);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteProject({ id: deleteTarget.id });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
      setDeleteTarget(null);
    });
  }, [deleteTarget]);

  const statusColors: Record<string, string> = mc.isTech
    ? {
        IN_PROGRESS: 'text-[hsl(174,100%,50%)] bg-[hsl(174,100%,50%,0.1)]',
        COMPLETED: 'text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)]',
        ARCHIVED: 'text-[#64748B] bg-[#64748B]/10',
      }
    : {
        IN_PROGRESS: 'text-blue-600 bg-blue-50',
        COMPLETED: 'text-green-700 bg-green-50',
        ARCHIVED: 'text-gray-500 bg-gray-100',
      };

  const getStatusLabel = (status: string): string => {
    const statusKey = status.toLowerCase();
    if (statusKey === 'in_progress') return tStatus('in_progress');
    if (statusKey === 'completed') return tStatus('completed');
    if (statusKey === 'archived') return tStatus('archived');
    return status.replace('_', ' ');
  };

  return (
    <>
      {/* Page Header */}
      <div className={cn('px-6 py-6 flex items-center justify-between', mc.headerBorder)}>
        <div>
          <h1 className={mc.heading}>{t('title')}</h1>
          <p className={cn('text-xs mt-1', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t('subtitle')}</p>
        </div>
        <button onClick={handleCreate} className={mc.primaryButton}>
          <Plus className="w-3.5 h-3.5" />
          {t('addProject')}
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className={cn('w-16 h-16 mx-auto mb-4', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
            <p className={cn('mb-4', mc.isTech ? 'text-muted-foreground font-mono' : 'text-gray-500')}>{t('empty.title')}</p>
            <button onClick={handleCreate} className={cn(mc.primaryButton, 'mx-auto')}>
              <Plus className="w-4 h-4" />
              {t('empty.addFirst')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  mc.isTech
                    ? 'flex items-start gap-4 rounded-sm border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-4 transition-colors hover:border-[hsl(174,100%,50%,0.3)]'
                    : 'flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow',
                  mc.isTech && project.featured && 'border-l-4 border-l-[hsl(174,100%,50%)]',
                  !mc.isTech && project.featured && 'border-l-4 border-l-blue-500'
                )}
              >
                {/* Thumbnail */}
                {project.imageUrl ? (
                  <div className={cn(
                    'relative h-20 w-28 shrink-0 overflow-hidden',
                    mc.isTech ? 'rounded-sm clip-hexagon' : 'rounded-lg'
                  )}>
                    <Image src={project.imageUrl} alt={project.title} fill className="object-cover" sizes="112px" />
                  </div>
                ) : (
                  <div className={cn(
                    'flex h-20 w-28 shrink-0 items-center justify-center',
                    mc.isTech ? 'rounded-sm clip-hexagon bg-[hsl(200,20%,13%)]' : 'rounded-lg bg-gray-100'
                  )}>
                    <FolderOpen className={cn('w-8 h-8', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn('font-medium truncate', mc.isTech ? 'text-foreground font-mono' : 'text-gray-900')}>{project.title}</h3>
                    {project.featured && (
                      <Star className={cn('w-4 h-4 shrink-0', mc.isTech ? 'text-[hsl(174,100%,50%)]' : 'text-blue-500')} fill="currentColor" />
                    )}
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 shrink-0 uppercase tracking-wider',
                      mc.isTech ? 'rounded-sm font-mono' : 'rounded-full font-medium',
                      statusColors[project.status] || statusColors.IN_PROGRESS
                    )}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <p className={cn('text-xs line-clamp-1 mt-1', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>
                    {project.shortDescription || project.description}
                  </p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className={cn(
                            'text-[10px] px-2 py-0.5',
                            mc.isTech
                              ? 'font-mono rounded-sm bg-[hsl(174,100%,50%,0.1)] text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.2)]'
                              : 'rounded-full bg-gray-100 text-gray-600 border border-gray-200'
                          )}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className={cn('text-[10px]', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-400')}>
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(project)} className={mc.editButton} title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    disabled={isPending}
                    className={cn(mc.dangerButton, 'disabled:opacity-50')}
                    title="Delete"
                  >
                    {isPending && deleteTarget?.id === project.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Project Form Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        project={editingProject}
        portfolioMode={user.portfolioMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This action cannot be undone. The project and all its data will be permanently removed."
        isLoading={isPending}
        portfolioMode={user.portfolioMode}
      />
    </>
  );
}
