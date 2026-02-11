'use client';

/**
 * SkillTagInput Component
 *
 * Tag input for adding skills with keyboard support.
 */

import { memo, useState, useCallback, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/features/shadcn/ui/input';

interface SkillTagInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

/**
 * SkillTagInput allows adding/removing skill tags
 */
function SkillTagInputComponent({
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags = 10,
  className,
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  // Add a new tag
  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();

      // Validate
      if (!trimmedTag) return;
      if (value.includes(trimmedTag)) return;
      if (value.length >= maxTags) return;

      onChange([...value, trimmedTag]);
      setInputValue('');
    },
    [value, onChange, maxTags]
  );

  // Remove a tag
  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    },
    [value, onChange]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        // Remove last tag on backspace if input is empty
        removeTag(value[value.length - 1]);
      } else if (e.key === ',') {
        // Also allow comma as separator
        e.preventDefault();
        addTag(inputValue);
      }
    },
    [inputValue, value, addTag, removeTag]
  );

  // Handle blur - add tag if there's text
  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  }, [inputValue, addTag]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {value.length < maxTags && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500">
        Press Enter or comma to add. {value.length}/{maxTags} skills.
      </p>
    </div>
  );
}

export const SkillTagInput = memo(SkillTagInputComponent);
