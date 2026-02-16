'use client';

/**
 * ManualSkillForm Component
 *
 * Form for adding self-taught skills manually.
 * Uses react-hook-form with Yup validation.
 */

import { memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { cn } from '@/lib/utils';
import { GamingButton, GamingInput, Spinner } from '@/features/gaming';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/features/shadcn/ui/form';
import { manualSkillEntrySchema } from '../schemas/skill.schema';
import type { ManualSkillFormProps, CreateSkillInput, SkillCategory } from '../types/skill';
import { SELF_ASSESSMENT_XP_VALUES } from '../constants/xp';
import { CategorySelect } from './CategorySelect';

/**
 * Self-assessment level options
 */
const SELF_ASSESSMENT_OPTIONS = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    description: `Learning the basics (${SELF_ASSESSMENT_XP_VALUES.BEGINNER} XP)`,
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
    description: `Comfortable with common tasks (${SELF_ASSESSMENT_XP_VALUES.INTERMEDIATE} XP)`,
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: `Deep expertise (${SELF_ASSESSMENT_XP_VALUES.ADVANCED} XP)`,
  },
] as const;

/**
 * Extended props interface for internal use
 */
interface ManualSkillFormInternalProps extends ManualSkillFormProps {
  categories: SkillCategory[];
  onCreateCategory?: () => void;
  /** Edit mode - disables name, category, and date fields */
  isEditMode?: boolean;
}

/**
 * ManualSkillForm renders a form for adding manual skills
 */
function ManualSkillFormComponent({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  categories,
  onCreateCategory,
  isEditMode = false,
  className,
}: ManualSkillFormInternalProps) {
  const form = useForm<CreateSkillInput>({
    resolver: yupResolver(manualSkillEntrySchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      selfAssessmentLevel: initialData?.selfAssessmentLevel ?? 'BEGINNER',
      categoryId: initialData?.categoryId ?? '',
      learningSources: initialData?.learningSources ?? '',
      dateStarted: initialData?.dateStarted ?? undefined,
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const onFormSubmit = async (data: CreateSkillInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className={cn('space-y-5', className)}
      >
        {/* Skill Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Skill Name {!isEditMode && <span className="text-[#EF4444]">*</span>}
              </FormLabel>
              <FormControl>
                <GamingInput
                  {...field}
                  placeholder="e.g., TypeScript, React, Docker"
                  error={!!errors.name}
                  disabled={isLoading || isEditMode}
                  aria-required={!isEditMode}
                />
              </FormControl>
              {isEditMode && (
                <FormDescription className="text-[#64748B]">
                  Skill name cannot be changed.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Self-Assessment Level */}
        <FormField
          control={control}
          name="selfAssessmentLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Skill Level <span className="text-[#EF4444]">*</span>
              </FormLabel>
              <FormControl>
                <div className="grid gap-2">
                  {SELF_ASSESSMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all',
                        'hover:bg-[#1E293B]',
                        field.value === option.value
                          ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                          : 'border-[#334155] bg-[#0D1421]'
                      )}
                    >
                      <input
                        type="radio"
                        {...field}
                        value={option.value}
                        checked={field.value === option.value}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          field.value === option.value
                            ? 'border-[#00D4FF]'
                            : 'border-[#64748B]'
                        )}
                      >
                        {field.value === option.value && (
                          <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-white">
                          {option.label}
                        </span>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category - Hidden in edit mode */}
        {!isEditMode && (
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Category</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    categories={categories}
                    onCreateNew={onCreateCategory}
                  />
                </FormControl>
                <FormDescription className="text-[#64748B]">
                  Optional. Helps organize skills in the skill tree.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Learning Sources */}
        <FormField
          control={control}
          name="learningSources"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Learning Sources</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="e.g., Online courses, books, projects, bootcamps..."
                  rows={3}
                  disabled={isLoading}
                  className={cn(
                    'flex w-full rounded-sm border bg-[#0D1421] px-4 py-3 text-sm text-white placeholder:text-[#64748B]',
                    'transition-all duration-200 resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0E1A]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.learningSources
                      ? 'border-[#EF4444] focus:ring-[#EF4444]'
                      : 'border-[#1E293B] hover:border-[#334155] focus:border-[#00D4FF] focus:ring-[#00D4FF]'
                  )}
                />
              </FormControl>
              <FormDescription className="text-[#64748B]">
                Optional. Describe how you learned this skill.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Started - Hidden in edit mode */}
        {!isEditMode && (
          <FormField
            control={control}
            name="dateStarted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Date Started</FormLabel>
                <FormControl>
                  <GamingInput
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    disabled={isLoading}
                    error={!!errors.dateStarted}
                  />
                </FormControl>
                <FormDescription className="text-[#64748B]">
                  Optional. When did you start learning this skill?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
          {onCancel && (
            <GamingButton
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </GamingButton>
          )}
          <GamingButton
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4" />
                {isEditMode ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Add Skill'
            )}
          </GamingButton>
        </div>
      </form>
    </Form>
  );
}

export const ManualSkillForm = memo(ManualSkillFormComponent);
