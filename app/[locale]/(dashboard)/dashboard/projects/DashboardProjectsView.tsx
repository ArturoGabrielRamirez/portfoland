'use client';

/**
 * DashboardProjectsView Component
 *
 * Client component for the dashboard projects page.
 * Lists existing projects with edit/delete, and a form to create new ones.
 */

import { useState, useCallback, useTransition } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { deleteProject } from '@/features/projects/actions/deleteProject';
import type { Project } from '@/features/projects/types/project';

interface DashboardProjectsViewProps {
  projects: Project[];
}

export function DashboardProjectsView({ projects }: DashboardProjectsViewProps) {
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
    if (!confirm(`Delete "${project.title}"?`)) return;

    startTransition(async () => {
      const result = await deleteProject({ id: project.id });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  }, []);

  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'text-cyan-400 bg-cyan-400/10',
    COMPLETED: 'text-green-400 bg-green-400/10',
    ARCHIVED: 'text-slate-400 bg-slate-400/10',
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Projects</h1>
              <p className="text-slate-400">Manage your project showcase</p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Form Section */}
        {showForm && (
          <div className="mb-8 rounded-xl border border-[#1E293B] bg-[#0D1421] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingProject ? 'Edit Project' : 'New Project'}
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
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No projects yet</p>
            <Button
              onClick={handleCreate}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'flex items-start gap-4 rounded-xl border border-[#1E293B] bg-[#0D1421] p-4 transition-colors hover:border-[#2E3B4B]',
                  project.featured && 'border-l-4 border-l-cyan-500'
                )}
              >
                {/* Thumbnail */}
                {project.imageUrl ? (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <FolderOpen className="w-8 h-8 text-slate-600" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{project.title}</h3>
                    {project.featured && (
                      <Star className="w-4 h-4 text-cyan-400 shrink-0" fill="currentColor" />
                    )}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full shrink-0',
                      statusColors[project.status] || statusColors.IN_PROGRESS
                    )}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1 mt-1">
                    {project.shortDescription || project.description}
                  </p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs text-slate-500">
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project)}
                    disabled={isPending}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
