'use client';

/**
 * LearningResourceCard Component
 *
 * Displays a single AI-generated learning resource with type icon,
 * duration, cost badge, and external link.
 */

import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningResource } from '../types/enhancement';

const TYPE_ICONS: Record<LearningResource['type'], string> = {
  video: '▶',
  article: '📄',
  course: '🎓',
  documentation: '📖',
  practice: '💻',
};

interface LearningResourceCardProps {
  resource: LearningResource;
}

export function LearningResourceCard({ resource }: LearningResourceCardProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      title="AI-generated link — verify before using"
      className={cn(
        'flex items-start gap-3 p-3 rounded-sm',
        'bg-[#0D1117] border border-[#1E293B]',
        'hover:border-[#2D3748] hover:bg-[#111827]',
        'transition-colors group'
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg">
        {TYPE_ICONS[resource.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors line-clamp-2">
            {resource.title}
          </span>
          <ExternalLink className="flex-shrink-0 w-3 h-3 text-[#64748B] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-[#64748B]">{resource.duration}</span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded border font-mono',
              resource.cost === 'free'
                ? 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/10'
                : 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10'
            )}
          >
            {resource.cost === 'free' ? 'Free' : 'Paid'}
          </span>
        </div>

        <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{resource.why}</p>
      </div>
    </a>
  );
}
