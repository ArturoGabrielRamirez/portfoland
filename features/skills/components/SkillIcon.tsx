'use client';

/**
 * SkillIcon Component
 *
 * Renders a technology icon from the Devicon CDN for a given skill name.
 * Falls back to the -plain.svg variant on first error, then renders a
 * colored letter circle if both CDN variants fail or no slug is found.
 *
 * No npm dependencies — CDN <img> only.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SkillIconProps } from '../types/skill';
import { getDeviconSlug, getDeviconUrl, getDeviconPlainUrl } from '../utils/devicons';

// =============================================================================
// Constants
// =============================================================================

/**
 * Size map: size key → pixel dimension (width and height).
 */
const SIZE_MAP: Record<NonNullable<SkillIconProps['size']>, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
};

/**
 * Fallback circle background colors, indexed by skillName.charCodeAt(0) % 6.
 * Matches CATEGORY_COLORS order from features/skills/constants/categories.ts.
 */
const FALLBACK_COLORS: [string, string, string, string, string, string] = [
  '#D946EF', // core — magenta
  '#A855F7', // frontend — purple
  '#22C55E', // backend — green
  '#F97316', // devops — orange
  '#EC4899', // design — pink
  '#EAB308', // soft-skills — yellow
];

// =============================================================================
// Component
// =============================================================================

/**
 * SkillIcon renders the Devicon SVG for a technology skill.
 *
 * @example
 *   <SkillIcon skillName="React" size="md" />
 *   <SkillIcon skillName="Leadership" size="sm" /> // shows fallback circle
 */
export function SkillIcon({ skillName, size = 'sm', className }: SkillIconProps) {
  const [plainFailed, setPlainFailed] = useState(false);
  const [usePlain, setUsePlain] = useState(false);

  const px = SIZE_MAP[size];
  const slug = getDeviconSlug(skillName);

  // Derive fallback circle color from first character
  const fallbackColor = skillName.length > 0
    ? FALLBACK_COLORS[skillName.charCodeAt(0) % 6]
    : FALLBACK_COLORS[0];

  // Render fallback circle when no slug found or both CDN variants failed
  if (!slug || plainFailed) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center flex-shrink-0',
          className
        )}
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          backgroundColor: fallbackColor,
        }}
        aria-label={skillName}
      >
        <span className="text-[10px] font-mono font-bold text-white leading-none select-none">
          {skillName.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  // Handle CDN image with two-stage fallback: original → plain → letter circle
  const handleError = () => {
    if (!usePlain) {
      // First error: try the -plain.svg variant
      setUsePlain(true);
    } else {
      // Second error: render the letter circle fallback
      setPlainFailed(true);
    }
  };

  const src = usePlain ? getDeviconPlainUrl(slug) : getDeviconUrl(slug);

  return (
    <img
      src={src}
      alt={skillName}
      width={px}
      height={px}
      onError={handleError}
      className={cn('inline-block flex-shrink-0', className)}
      style={{ width: px, height: px }}
    />
  );
}
