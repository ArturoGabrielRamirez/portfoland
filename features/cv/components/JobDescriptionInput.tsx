/**
 * JobDescriptionInput Component
 *
 * Collapsible textarea for pasting a job description.
 * Shows character count and optional field indicator.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  inputClassName: string;
  labelClassName: string;
  isTech: boolean;
}

const MAX_CHARS = 10000;

export function JobDescriptionInput({
  value,
  onChange,
  inputClassName,
  labelClassName,
  isTech,
}: JobDescriptionInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-2 text-left',
          labelClassName,
        )}
        aria-expanded={isOpen}
      >
        <span>
          {isTech ? '> JOB_DESCRIPTION (OPTIONAL)' : 'Job Description (optional)'}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isTech
                ? 'Paste job description for ATS optimization...'
                : 'Paste the full job description here for ATS optimization...'
            }
            rows={6}
            maxLength={MAX_CHARS}
            className={cn(inputClassName, 'resize-y min-h-[120px]')}
            aria-label="Job description"
          />
          <div
            className={cn(
              'text-right text-[10px]',
              isTech ? 'font-mono text-gray-600' : 'text-gray-400',
            )}
          >
            {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
