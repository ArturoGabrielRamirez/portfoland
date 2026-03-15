'use client';

/**
 * BioSkillSuggestions Component
 *
 * Watches the bio field and, after a 1.5s debounce, calls the AI suggestion
 * API to surface tech skills detected in the text. Each suggestion renders as
 * a pill button; clicking one adds the skill at BEGINNER level via the
 * existing createSkill server action and removes the pill from the list.
 */

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createSkill } from '@/features/skills/actions/createSkill';
import type { BioSkillSuggestion, BioSkillSuggestionsProps } from '../types/bioSuggestions';

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_MS = 1500;
const MIN_BIO_LENGTH = 30;

// =============================================================================
// Component
// =============================================================================

export function BioSkillSuggestions({ bio, onSkillAdded }: BioSkillSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<BioSkillSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Track which skills are being added individually
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevent re-fetching for the same bio text
  const lastFetchedBioRef = useRef<string>('');

  // Debounced fetch on bio change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Do nothing if bio is too short
    if (!bio || bio.length < MIN_BIO_LENGTH) {
      setSuggestions([]);
      setIsAnalyzing(false);
      return;
    }

    // Avoid re-fetching identical text
    if (bio === lastFetchedBioRef.current) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      lastFetchedBioRef.current = bio;
      setIsAnalyzing(true);

      try {
        const res = await fetch('/api/bio/suggest-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio }),
        });

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [bio]);

  // Handle adding a skill
  const handleAdd = (suggestion: BioSkillSuggestion) => {
    setAddingSkill(suggestion.name);

    startTransition(async () => {
      try {
        const result = await createSkill({
          name: suggestion.name,
          selfAssessmentLevel: 'BEGINNER',
        });

        if (result.hasError) {
          toast.error(result.message || 'Failed to add skill');
        } else {
          toast.success(`"${suggestion.name}" added to your skill tree`);
          // Remove the pill
          setSuggestions((prev) => prev.filter((s) => s.name !== suggestion.name));
          onSkillAdded?.();
        }
      } catch {
        toast.error('Unexpected error adding skill');
      } finally {
        setAddingSkill(null);
      }
    });
  };

  // Render nothing when nothing to show
  if (!isAnalyzing && suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {/* Label */}
      <span className="flex items-center gap-1 text-[10px] font-mono text-[#00D4FF]/70 uppercase tracking-wider shrink-0">
        <Sparkles className="w-3 h-3" />
        {isAnalyzing ? (
          <span className="flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing bio...
          </span>
        ) : (
          'AI Suggestions:'
        )}
      </span>

      {/* Skill Pills */}
      {!isAnalyzing &&
        suggestions.map((suggestion) => {
          const isAdding = addingSkill === suggestion.name;
          return (
            <div key={suggestion.name} className="relative group">
              <button
                type="button"
                onClick={() => handleAdd(suggestion)}
                disabled={isAdding || addingSkill !== null}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-sm border text-[10px] font-mono transition-all',
                  'border-[#00D4FF]/30 bg-[#00D4FF]/5 text-[#00D4FF]',
                  'hover:bg-[#00D4FF]/15 hover:border-[#00D4FF]/60',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {isAdding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span>{suggestion.name}</span>
              </button>

              {/* Tooltip on hover */}
              <div
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50',
                  'w-max max-w-[180px] px-2 py-1.5 rounded',
                  'bg-[#0A0E1A] border border-[#00D4FF]/20',
                  'text-[9px] font-mono text-gray-300 leading-tight text-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                  'pointer-events-none'
                )}
              >
                <span className="text-[#00D4FF]/60 uppercase tracking-wide text-[8px] block mb-0.5">
                  {suggestion.category}
                </span>
                {suggestion.reason}
              </div>
            </div>
          );
        })}
    </div>
  );
}
