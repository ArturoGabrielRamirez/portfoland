'use client';

import { cn } from '@/lib/utils';
import type { PortfolioMode } from '../types/portfolio';
import type { VisitorRole } from './VisitorRoleBar';

// =============================================================================
// Role pitch copy
// =============================================================================

const ROLE_COPY: Record<Exclude<VisitorRole, null | 'recruiter'>, { headline: string; body: string }> = {
  tech: {
    headline: 'Built for engineers, by an engineer.',
    body: 'Explore the skill tree, GitHub-verified stack, and technical project breakdowns.',
  },
  founder: {
    headline: 'Impact-driven work, measurable results.',
    body: 'Check out the projects and services sections to see what this person can build for your vision.',
  },
  client: {
    headline: 'Let\'s work together.',
    body: 'Browse services, gallery, and testimonials — then reach out directly.',
  },
};

// =============================================================================
// Props
// =============================================================================

interface RoleBannerProps {
  role: VisitorRole;
  mode: PortfolioMode;
}

// =============================================================================
// Component
// =============================================================================

export function RoleBanner({ role, mode }: RoleBannerProps) {
  if (!role || role === 'recruiter') return null;
  const copy = ROLE_COPY[role];
  const isTech = mode === 'tech';

  if (isTech) {
    return (
      <div className="mx-4 mt-2 mb-1 border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)] px-4 py-2.5 flex-shrink-0">
        <p className="text-[10px] font-mono text-[hsl(174,100%,50%)] uppercase tracking-wider">
          &gt; {copy.headline}
        </p>
        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{copy.body}</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-2 mb-1 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 flex-shrink-0">
      <p className="text-sm font-semibold text-blue-900">{copy.headline}</p>
      <p className="text-xs text-blue-600 mt-0.5">{copy.body}</p>
    </div>
  );
}
