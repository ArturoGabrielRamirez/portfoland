'use client';

/**
 * RelatedSkillCard Component
 *
 * Displays a single AI-suggested related skill with an add button.
 */

import { Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RelatedSkill } from '../types/enhancement';

const PRIORITY_STYLES = {
  high: 'text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10',
  medium: 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10',
  low: 'text-[#64748B] border-[#64748B]/40 bg-[#64748B]/10',
} as const;

interface RelatedSkillCardProps {
  skill: RelatedSkill;
  onAdd: (name: string) => void;
  isAdding: boolean;
}

export function RelatedSkillCard({ skill, onAdd, isAdding }: RelatedSkillCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-sm bg-[#0D1117] border border-[#1E293B] hover:border-[#2D3748] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white truncate">{skill.name}</span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded border font-mono',
              PRIORITY_STYLES[skill.priority]
            )}
          >
            {skill.priority}
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{skill.category}</p>
        <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{skill.reason}</p>
      </div>

      {skill.alreadyAdded ? (
        <div className="flex-shrink-0 flex items-center gap-1 text-[#00D4FF] text-xs font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Added</span>
        </div>
      ) : (
        <button
          onClick={() => onAdd(skill.name)}
          disabled={isAdding}
          className={cn(
            'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium',
            'border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Add ${skill.name}`}
        >
          {isAdding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>Add</span>
        </button>
      )}
    </div>
  );
}
