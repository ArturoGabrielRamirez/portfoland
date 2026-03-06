'use client';

/**
 * AssessmentWidget Component
 *
 * Skills dashboard widget that surfaces AI skill assessment capabilities.
 *
 * Displays a token meter (daily allowance) and one row per eligible skill,
 * with a "Take Assessment" CTA that respects three disabled states:
 *   1. Already validated (aiAssessmentValidated === true)
 *   2. Cooldown active (hit MAX_ATTEMPTS_BEFORE_COOLDOWN in 24h window)
 *   3. No tokens remaining today
 *
 * Tech Mode aesthetic — angular borders, monospace font, cyan palette.
 * Matches GitHubSyncPanel visual style for dashboard consistency.
 */

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { ASSESSMENT_SUPPORTED_SKILL_SLUGS } from '../constants/supportedSkills';
import { DEFAULT_ASSESSMENT_TOKENS } from '../constants/tokens';
import { SKILL_LEVEL_NAMES } from '@/features/skills/constants/xp';
import type { AssessmentWidgetProps } from '../types/assessment';
import type { UserSkillWithDetails } from '@/features/skills/types/skill';
import { AssessmentModal } from './AssessmentModal';

// =============================================================================
// Local Types
// =============================================================================

/** Tracks the cooldown end time per skill slug, updated when action returns cooldown error */
type CooldownMap = Record<string, Date>;

/** Represents the skill selected for assessment — passed to the modal */
export interface ActiveSkill {
  skillSlug: string;
  skillName: string;
  skillLevel: number;
}

// =============================================================================
// Helper
// =============================================================================

/**
 * Resolves a SKILL_LEVEL_NAMES key safely.
 * The map only covers levels 1–5; clamps anything outside that range.
 */
function getLevelName(level: number): string {
  const clamped = Math.min(5, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5;
  return SKILL_LEVEL_NAMES[clamped];
}

// =============================================================================
// SkillRow Sub-component
// =============================================================================

interface SkillRowProps {
  userSkill: UserSkillWithDetails;
  hasTokens: boolean;
  cooldownEndsAt?: Date;
  history?: { bestScore: number; totalAttempts: number };
  onTakeAssessment: () => void;
}

/**
 * Single row in the assessment widget — shows skill name, level, validation
 * icons, and a "Take Assessment" CTA with one of three disabled states.
 */
function SkillRow({ userSkill, hasTokens, cooldownEndsAt, history, onTakeAssessment }: SkillRowProps) {
  const { skill, level, aiValidated, githubValidated, aiAssessmentValidated } = userSkill;

  // Determine disabled state and tooltip
  const isAlreadyValidated = aiAssessmentValidated === true;
  const isCooldownActive = cooldownEndsAt != null && cooldownEndsAt > new Date();
  const isNoTokens = !hasTokens;

  const isDisabled = isAlreadyValidated || isCooldownActive || isNoTokens;

  let tooltipText = '';
  if (isAlreadyValidated) {
    tooltipText = 'Already Validated';
  } else if (isCooldownActive && cooldownEndsAt) {
    tooltipText = `Cooldown active until ${cooldownEndsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isNoTokens) {
    tooltipText = 'No tokens remaining';
  }

  const levelName = getLevelName(level);

  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(174,100%,50%,0.1)] last:border-b-0">
      {/* Skill identity */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Skill name + level badge */}
        <div className="min-w-0">
          <span className="font-mono text-[11px] text-gray-300 truncate block">
            {skill.name}
          </span>
          <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
            {levelName}
          </span>
          {history && history.totalAttempts > 0 && (
            <span className="font-mono text-[9px] text-gray-600 mt-0.5">
              Best: {history.bestScore}% · {history.totalAttempts}x
            </span>
          )}
        </div>

        {/* Validation icons — show current validation states for context */}
        <div className="flex items-center gap-0.5 shrink-0">
          {aiValidated && (
            <span className="font-mono text-[10px] text-[#D946EF]" title="AI Validated">
              ★
            </span>
          )}
          {githubValidated && (
            <span
              className="font-mono text-[10px] text-[hsl(174,100%,50%)]"
              title="GitHub Validated"
            >
              ⬡
            </span>
          )}
          {isAlreadyValidated && (
            <span className="font-mono text-[10px] text-[#00D4FF]" title="Assessment Validated">
              ◆
            </span>
          )}
        </div>
      </div>

      {/* CTA button — disabled state varies by reason */}
      <button
        onClick={onTakeAssessment}
        disabled={isDisabled}
        title={tooltipText || undefined}
        className={cn(
          'shrink-0 font-mono text-[9px] px-2 py-1 border transition-colors',
          isDisabled
            ? 'border-gray-700 text-gray-700 cursor-not-allowed opacity-50'
            : 'border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)]',
        )}
      >
        {isAlreadyValidated
          ? '[ ◆ DONE ]'
          : isCooldownActive
            ? '[ COOLDOWN ]'
            : isNoTokens
              ? '[ NO TOKENS ]'
              : '[ ASSESS ]'}
      </button>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Assessment widget for the skills dashboard.
 *
 * @param userSkills - All user skills; component filters internally to supported slugs
 * @param assessmentTokens - Current token balance and last reset date from User.meta
 * @param onAssessmentPass - Callback fired when an assessment is passed (triggers CRT xpGain)
 * @param className - Additional class names for the outer container
 */
export function AssessmentWidget({
  userSkills,
  assessmentTokens,
  assessmentHistory,
  onAssessmentPass,
  className,
}: AssessmentWidgetProps & { className?: string }) {
  // Filter to skills whose slug is in the supported assessment list
  const eligibleSkills: UserSkillWithDetails[] = userSkills.filter((us) =>
    ASSESSMENT_SUPPORTED_SKILL_SLUGS.includes(us.skill.slug),
  );

  // Tracks which skill row triggered the modal
  const [activeSkill, setActiveSkill] = useState<ActiveSkill | null>(null);
  // Controls modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  // Tracks cooldown end times keyed by skillSlug — updated via modal callback
  const [cooldownMap, setCooldownMap] = useState<CooldownMap>({});

  const hasTokens = assessmentTokens.remaining > 0;

  /** Opens the assessment modal for the given skill */
  const handleTakeAssessment = (userSkill: UserSkillWithDetails) => {
    setActiveSkill({
      skillSlug: userSkill.skill.slug,
      skillName: userSkill.skill.name,
      skillLevel: userSkill.level,
    });
    setModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        'relative border border-[hsl(174,100%,50%,0.2)]',
        'bg-[hsl(200,30%,6%)] p-4',
        className,
      )}
    >
      {/* Angular corner accent — top-left */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(174,100%,50%,0.6)]" />
      {/* Angular corner accent — bottom-right */}
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(174,100%,50%,0.6)]" />

      {/* Terminal-style panel label */}
      <p className="text-[10px] font-mono text-[hsl(174,100%,50%)] opacity-60 mb-3 uppercase tracking-widest">
        // ASSESSMENT_MODULE: ai_skill_validator.exe
      </p>

      {/* Token meter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          [ASSESSMENT_TOKENS]:
        </span>
        <span
          className={cn(
            'font-mono text-xs font-semibold',
            assessmentTokens.remaining === 0 ? 'text-red-500' : 'text-[#00D4FF]',
          )}
          title={assessmentTokens.remaining === 0 ? 'Resets tomorrow' : undefined}
        >
          {assessmentTokens.remaining}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50">
          / {DEFAULT_ASSESSMENT_TOKENS}
        </span>
        {assessmentTokens.remaining === 0 && (
          <span className="font-mono text-[9px] text-red-400/60 italic">— resets tomorrow</span>
        )}
      </div>

      {/* Skill rows or empty state */}
      {eligibleSkills.length === 0 ? (
        /* Empty state — user has no supported skills added yet */
        <p className="font-mono text-xs text-muted-foreground/50">
          [SYS_MSG]: No supported skills found. Add React, TypeScript, JavaScript, Python, or
          Node.js to enable assessments.
        </p>
      ) : (
        <div>
          {eligibleSkills.map((userSkill) => (
            <SkillRow
              key={userSkill.id}
              userSkill={userSkill}
              hasTokens={hasTokens}
              cooldownEndsAt={cooldownMap[userSkill.skill.slug]}
              history={assessmentHistory?.[userSkill.skill.slug]}
              onTakeAssessment={() => handleTakeAssessment(userSkill)}
            />
          ))}
        </div>
      )}

      {/* Assessment Modal — wired in TG10 */}
      {modalOpen && activeSkill && (
        <AssessmentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          skillSlug={activeSkill.skillSlug}
          skillName={activeSkill.skillName}
          skillLevel={activeSkill.skillLevel}
          onPassComplete={onAssessmentPass}
        />
      )}
    </div>
  );
}
