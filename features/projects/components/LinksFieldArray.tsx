'use client';

/**
 * LinksFieldArray Component
 *
 * Dynamic list of project links with add/remove functionality.
 * Each row has a type select, label input, and url input.
 * Uses useFieldArray from react-hook-form.
 */

import { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { Input } from '@/features/shadcn/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/features/shadcn/ui/form';
import { PROJECT_LINK_TYPES } from '../types/project';

interface LinksFieldArrayProps {
  className?: string;
  t: (key: string) => string;
}

function LinksFieldArrayComponent({ className, t }: LinksFieldArrayProps) {
  const form = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const handleAddLink = () => {
    append({ type: 'LIVE', label: '', url: '' });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-[120px_1fr_1fr_auto] gap-2 items-start"
          data-testid={`link-row-${index}`}
        >
          {/* Type select */}
          <FormField
            control={form.control}
            name={`links.${index}.type`}
            render={({ field: selectField }) => (
              <FormItem>
                {index === 0 && (
                  <FormLabel className="text-white text-xs">
                    {t('form.linkType')}
                  </FormLabel>
                )}
                <FormControl>
                  <select
                    {...selectField}
                    className="w-full h-9 px-2 rounded-md border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    data-testid={`link-type-${index}`}
                  >
                    {PROJECT_LINK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Label input */}
          <FormField
            control={form.control}
            name={`links.${index}.label`}
            render={({ field: labelField }) => (
              <FormItem>
                {index === 0 && (
                  <FormLabel className="text-white text-xs">
                    {t('form.linkLabel')}
                  </FormLabel>
                )}
                <FormControl>
                  <Input
                    {...labelField}
                    placeholder={t('form.linkLabelPlaceholder')}
                    maxLength={50}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid={`link-label-${index}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL input */}
          <FormField
            control={form.control}
            name={`links.${index}.url`}
            render={({ field: urlField }) => (
              <FormItem>
                {index === 0 && (
                  <FormLabel className="text-white text-xs">
                    {t('form.linkUrl')}
                  </FormLabel>
                )}
                <FormControl>
                  <Input
                    {...urlField}
                    placeholder="https://..."
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid={`link-url-${index}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remove button */}
          <div className={cn(index === 0 && 'mt-6')}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 p-0"
              data-testid={`remove-link-${index}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAddLink}
        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
        data-testid="add-link-button"
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('form.addLink')}
      </Button>
    </div>
  );
}

export const LinksFieldArray = memo(LinksFieldArrayComponent);
