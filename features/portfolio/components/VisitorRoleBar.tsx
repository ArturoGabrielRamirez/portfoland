'use client';

import { cn } from '@/lib/utils';
import type { PortfolioMode } from '../types/portfolio';

// =============================================================================
// Types
// =============================================================================

export type VisitorRole = 'recruiter' | 'tech' | 'founder' | 'client' | null;

const ROLES: { id: Exclude<VisitorRole, null>; label: string; techLabel: string }[] = [
  { id: 'recruiter', label: 'Recruiter', techLabel: 'RECRUITER' },
  { id: 'tech',      label: 'Tech Lead', techLabel: 'TECH_LEAD' },
  { id: 'founder',   label: 'Founder',   techLabel: 'FOUNDER'   },
  { id: 'client',    label: 'Client',    techLabel: 'CLIENT'    },
];

interface VisitorRoleBarProps {
  role: VisitorRole;
  onRoleChange: (role: VisitorRole) => void;
  mode: PortfolioMode;
}

// =============================================================================
// Component
// =============================================================================

export function VisitorRoleBar({ role, onRoleChange, mode }: VisitorRoleBarProps) {
  const isTech = mode === 'tech';

  if (isTech) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,4%)] flex-shrink-0 flex-wrap gap-y-1.5">
        <span className="text-[10px] font-mono text-[hsl(174,100%,50%,0.5)] uppercase tracking-widest whitespace-nowrap">
          &gt; viewing_as:
        </span>
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => onRoleChange(null)}
            className={cn(
              'px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors',
              role === null
                ? 'bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-bold'
                : 'text-[hsl(174,100%,50%,0.45)] hover:text-[hsl(174,100%,50%)]'
            )}
          >
            [DEFAULT]
          </button>
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => onRoleChange(role === r.id ? null : r.id)}
              className={cn(
                'px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors',
                role === r.id
                  ? 'bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-bold'
                  : 'text-[hsl(174,100%,50%,0.45)] hover:text-[hsl(174,100%,50%)]'
              )}
            >
              [{r.techLabel}]
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Classic mode
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex-wrap gap-y-1.5">
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">I&apos;m a:</span>
      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onRoleChange(null)}
          className={cn(
            'px-3 py-1 text-xs rounded-full transition-colors',
            role === null
              ? 'bg-gray-900 text-white font-medium'
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          )}
        >
          Visitor
        </button>
        {ROLES.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => onRoleChange(role === r.id ? null : r.id)}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              role === r.id
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
