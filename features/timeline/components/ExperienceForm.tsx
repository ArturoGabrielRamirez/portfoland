'use client';

/**
 * ExperienceForm Component
 *
 * Form for creating and editing experiences.
 * Features auto-save with debounce and validation.
 */

import { memo, useState, useCallback, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Briefcase, GraduationCap, Rocket, Award, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { Input } from '@/features/shadcn/ui/input';
import { Label } from '@/features/shadcn/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/features/shadcn/ui/form';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { ExperienceFormProps, CreateExperienceInput } from '../types/experience';
import { createExperienceSchema } from '../schemas/experience.schema';
import { EXPERIENCE_TYPES, EXPERIENCE_LABELS_EN, EXPERIENCE_COLORS } from '../constants/xp';
import { LocationPicker } from './LocationPicker';
import { SkillTagInput } from './SkillTagInput';

/**
 * Icon mapping for experience types
 */
const TypeIcons: Record<ExperienceType, React.ElementType> = {
  WORK: Briefcase,
  EDUCATION: GraduationCap,
  PROJECT: Rocket,
  CERTIFICATION: Award,
};

/**
 * ExperienceForm handles create/edit experience with validation
 */
function ExperienceFormComponent({
  experience,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: ExperienceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isEditMode = !!experience;

  // Form values type
  interface FormValues {
    type: string;
    title: string;
    company: string;
    latitude: number;
    longitude: number;
    address: string;
    startDate: Date;
    endDate: Date | null;
    description: string;
    skills: string[];
  }

  // Initialize form with react-hook-form and yup
  const form = useForm<FormValues>({
    resolver: yupResolver(createExperienceSchema) as any,
    defaultValues: {
      type: experience?.type || 'WORK',
      title: experience?.title || '',
      company: experience?.company || '',
      latitude: experience?.latitude || 0,
      longitude: experience?.longitude || 0,
      address: experience?.address || '',
      startDate: experience?.startDate || new Date(),
      endDate: experience?.endDate || null,
      description: experience?.description || '',
      skills: experience?.skills || [],
    },
  });

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: FormValues) => {
      setSaveStatus('saving');

      startTransition(async () => {
        try {
          if (isEditMode && experience) {
            await onSubmit({ ...data, id: experience.id, type: data.type as ExperienceType });
          } else {
            await onSubmit({ ...data, type: data.type as ExperienceType });
          }
          setSaveStatus('saved');

          // Reset saved status after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          setSaveStatus('idle');
        }
      });
    },
    [onSubmit, isEditMode, experience]
  );

  // Handle location change
  const handleLocationChange = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      form.setValue('latitude', location.latitude);
      form.setValue('longitude', location.longitude);
      form.setValue('address', location.address);
    },
    [form]
  );

  // Format date for input
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const loading = isLoading || isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
        {/* Type selector */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Type</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_TYPES.map((type) => {
                    const Icon = TypeIcons[type];
                    const color = EXPERIENCE_COLORS[type];
                    const isSelected = field.value === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => field.onChange(type)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-sm border transition-all',
                          isSelected
                            ? 'border-transparent'
                            : 'border-slate-700 hover:border-slate-600'
                        )}
                        style={{
                          backgroundColor: isSelected ? `${color}20` : 'transparent',
                          borderColor: isSelected ? color : undefined,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: isSelected ? color : '#64748B' }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: isSelected ? color : '#94A3B8' }}
                        >
                          {EXPERIENCE_LABELS_EN[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Senior Software Engineer"
                  className="bg-[#0D1421] border-[#1E293B] text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Company / Organization</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Google, MIT, Personal Project"
                  className="bg-[#0D1421] border-[#1E293B] text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <div>
          <Label className="text-white mb-2 block">Location</Label>
          <LocationPicker
            value={
              form.watch('latitude') && form.watch('longitude')
                ? {
                    latitude: form.watch('latitude'),
                    longitude: form.watch('longitude'),
                    address: form.watch('address'),
                  }
                : undefined
            }
            onChange={handleLocationChange}
          />
          {form.formState.errors.address && (
            <p className="text-red-400 text-sm mt-1">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={formatDateForInput(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    className="bg-[#0D1421] border-[#1E293B] text-white"
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
                <FormLabel className="text-white">End Date (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={formatDateForInput(field.value)}
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value) : null)
                    }
                    className="bg-[#0D1421] border-[#1E293B] text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Describe your experience, responsibilities, achievements..."
                  className="w-full px-3 py-2 bg-[#0D1421] border border-[#1E293B] rounded-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#0A0E1A]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Skills (optional)</FormLabel>
              <FormControl>
                <SkillTagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Add skills..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-slate-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Saved</span>
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
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                'Update Experience'
              ) : (
                'Add Experience'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const ExperienceForm = memo(ExperienceFormComponent);
