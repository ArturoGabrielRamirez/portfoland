'use client';

/**
 * DashboardProjectsView Component - Cyberpunk V2
 *
 * Client component for the dashboard projects page with cyberpunk hexagonal design.
 */

import { useState, useCallback, useTransition } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardNav } from '@/features/tech';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { deleteProject } from '@/features/projects/actions/deleteProject';
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
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard.projects');
  const tStatus = useTranslations('dashboard.projects.status');
  
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleCreate = useCallback(() => {
    setEditingProject(undefined);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingProject(undefined);
  }, []);

  const handleDelete = useCallback((project: Project) => {
    if (!confirm(t('deleteConfirm', { title: project.title }))) return;

    startTransition(async () => {
      const result = await deleteProject({ id: project.id });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  }, [t]);

  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'text-[hsl(174,100%,50%)] bg-[hsl(174,100%,50%,0.1)]',
    COMPLETED: 'text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)]',
    ARCHIVED: 'text-[#64748B] bg-[#64748B]/10',
  };

  const getStatusLabel = (status: string): string => {
    const statusKey = status.toLowerCase();
    if (statusKey === 'in_progress') return tStatus('in_progress');
    if (statusKey === 'completed') return tStatus('completed');
    if (statusKey === 'archived') return tStatus('archived');
    return status.replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Main Navigation */}
      <DashboardNav locale={locale} user={user} />

      {/* Page Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">{t('title')}</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('addProject')}
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Form Section */}
        {showForm && (
          <div className="mb-8 rounded-sm border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-6">
            <h2 className="text-lg font-mono font-bold text-foreground mb-4">
              {editingProject ? t('form.editProject') : t('form.newProject')}
            </h2>
            <ProjectForm
              project={editingProject}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-[hsl(174,100%,50%,0.3)] mx-auto mb-4" />
            <p className="text-muted-foreground font-mono mb-4">{t('empty.title')}</p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow inline-flex mx-auto"
            >
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
                  'flex items-start gap-4 rounded-sm border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-4 transition-colors hover:border-[hsl(174,100%,50%,0.3)]',
                  project.featured && 'border-l-4 border-l-[hsl(60,100%,50%)]'
                )}
              >
                {/* Thumbnail */}
                {project.imageUrl ? (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm clip-hexagon">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-sm clip-hexagon bg-[hsl(200,20%,13%)]">
                    <FolderOpen className="w-8 h-8 text-[hsl(174,100%,50%,0.3)]" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground font-mono font-medium truncate">{project.title}</h3>
                    {project.featured && (
                      <Star className="w-4 h-4 text-[hsl(60,100%,50%)] shrink-0" fill="currentColor" />
                    )}
                    <span className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-sm shrink-0 uppercase tracking-wider',
                      statusColors[project.status] || statusColors.IN_PROGRESS
                    )}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground line-clamp-1 mt-1">
                    {project.shortDescription || project.description}
                  </p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[hsl(174,100%,50%,0.1)] text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.2)]"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] transition-colors rounded-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    disabled={isPending}
                    className="p-2 text-muted-foreground hover:text-[hsl(0,100%,60%)] hover:bg-[hsl(0,100%,60%,0.1)] transition-colors rounded-sm disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
