'use client';

/**
 * ProjectForm Component
 *
 * Form for creating and editing projects.
 * Supports create mode (no project prop) and edit mode (project prop provided).
 */

import { memo, useState, useCallback, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { Input } from '@/features/shadcn/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/features/shadcn/ui/form';
import { SkillTagInput } from '@/features/timeline/components/SkillTagInput';
import type { ProjectFormProps, ProjectLink } from '../types/project';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema';
import { createProject } from '../actions/createProject';
import { updateProject } from '../actions/updateProject';
import { ImageUpload } from './ImageUpload';
import { LinksFieldArray } from './LinksFieldArray';
import { ImproveDescriptionButton } from '@/features/ai/components/ImproveDescriptionButton';

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format date for input value
 */
function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

const PROJECT_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const;

/**
 * ProjectForm handles create/edit project with validation
 */
function ProjectFormComponent({
  project,
  onCancel,
  className,
}: ProjectFormProps) {
  const t = useTranslations('projects');
  const params = useParams();
  const locale = params.locale as string || 'en';
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

  const isEditMode = !!project;

  // Parse links from JSON if needed
  const parseLinks = (links: unknown): ProjectLink[] => {
    if (!links) return [];
    if (Array.isArray(links)) return links as ProjectLink[];
    if (typeof links === 'string') {
      try {
        return JSON.parse(links);
      } catch {
        return [];
      }
    }
    return [];
  };

  const form = useForm({
    resolver: yupResolver(
      (isEditMode ? updateProjectSchema : createProjectSchema) as any
    ),
    defaultValues: {
      ...(isEditMode && project ? { id: project.id } : {}),
      title: project?.title || '',
      slug: project?.slug || '',
      description: project?.description || '',
      shortDescription: project?.shortDescription || '',
      imageUrl: project?.imageUrl || '',
      technologies: project?.technologies || [],
      links: parseLinks(project?.links),
      featured: project?.featured || false,
      status: project?.status || 'IN_PROGRESS',
      startDate: project?.startDate || new Date(),
      endDate: project?.endDate || null,
      order: project?.order ?? null,
    },
  });

  // Auto-generate slug from title on blur
  const handleTitleBlur = useCallback(() => {
    const currentSlug = form.getValues('slug');
    if (!currentSlug) {
      const title = form.getValues('title');
      if (title) {
        form.setValue('slug', generateSlug(title));
      }
    }
  }, [form]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      setSaveStatus('saving');

      startTransition(async () => {
        try {
          const payload = {
            ...data,
            links: data.links || [],
          };

          const result = isEditMode
            ? await updateProject(payload)
            : await createProject(payload);

          if (result.hasError) {
            toast.error(result.message);
            setSaveStatus('idle');
          } else {
            toast.success(result.message);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          }
        } catch {
          setSaveStatus('idle');
        }
      });
    },
    [isEditMode]
  );

  const loading = isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
        data-testid="project-form"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">{t('form.title')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.titlePlaceholder')}
                  onBlur={(e) => {
                    field.onBlur();
                    handleTitleBlur();
                  }}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="title-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">{t('form.slug')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.slugPlaceholder')}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="slug-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short Description */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {t('form.shortDescription')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t('form.shortDescriptionPlaceholder')}
                  maxLength={200}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="short-description-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-white">
                  {t('form.description')}
                </FormLabel>
                <ImproveDescriptionButton
                  currentDescription={field.value}
                  onImproved={(improved) => field.onChange(improved)}
                  mode="gaming"
                  locale={locale}
                  context="project"
                />
              </div>
              <FormControl>
                <textarea
                  {...field}
                  rows={6}
                  maxLength={5000}
                  placeholder={t('form.descriptionPlaceholder')}
                  className="w-full px-3 py-2 bg-[#0D1421] border border-[#1E293B] rounded-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  data-testid="description-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {t('form.imageUpload')}
              </FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={(url) => field.onChange(url || '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Technologies */}
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {t('form.technologies')}
              </FormLabel>
              <FormControl>
                <SkillTagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('form.technologiesPlaceholder')}
                  maxTags={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Links */}
        <div>
          <FormLabel className="text-white mb-2 block">
            {t('form.links')}
          </FormLabel>
          <LinksFieldArray t={t} />
        </div>

        {/* Featured Toggle */}
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value || false}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    data-testid="featured-checkbox"
                  />
                </FormControl>
                <FormLabel className="text-white cursor-pointer">
                  {t('form.featured')}
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">{t('form.status')}</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full h-9 px-3 rounded-sm border border-[#1E293B] bg-[#0D1421] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  data-testid="status-select"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`status.${status}`)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {t('form.startDate')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={formatDateForInput(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="start-date-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {t('form.endDate')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={formatDateForInput(field.value)}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="end-date-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-slate-400">{t('form.saving')}</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">{t('form.saved')}</span>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="text-slate-400 hover:text-white"
              >
                {t('form.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              data-testid="submit-button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                t('form.updateProject')
              ) : (
                t('form.addProject')
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const ProjectForm = memo(ProjectFormComponent);
