'use client';

/**
 * GitHubSyncPanel Component
 *
 * Skills dashboard widget that surfaces GitHub connection state and sync controls.
 *
 * Two visual states:
 * - Pre-connection: expansion module CTA to connect GitHub via OAuth
 * - Post-connection: sync status grid (last upload, repos, stars, validated skills)
 *   with a Re-Sync button that drives AIEye state transitions via callbacks.
 *
 * Tech Mode aesthetic — angular borders, monospace font, cyan/amber palette.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { linkSocial } from '@/lib/auth-client';
import { formatTimeAgo } from '@/lib/utils/format';
import { syncGitHubAction } from '../actions/syncGitHub.action';
import { addGitHubSuggestedSkillsAction } from '../actions/addGitHubSuggestedSkills.action';
import { GITHUB_MESSAGES } from '../constants/messages';
import type { GitHubSyncPanelProps } from '../types/github';
import type { GitHubSuggestedSkill } from '../types/sync';
import { GitHubReauthModal } from './GitHubReauthModal';

// =============================================================================
// Main Component
// =============================================================================

/**
 * GitHub sync status panel for the skills dashboard.
 *
 * @param userId - The authenticated user's ID
 * @param githubSyncedAt - Timestamp of the last GitHub sync; null means never synced
 * @param githubStats - Persisted summary stats from the last sync
 * @param isGitHubConnected - True when a GitHub OAuth account is linked
 * @param onXPGainTrigger - Called on sync success; drives AIEye xp_gain animation
 * @param onLifeLossTrigger - Called on sync failure; drives AIEye life_loss animation
 * @param onSearchingTrigger - Called when sync begins; drives AIEye searching state
 * @param className - Additional class names for the outer container
 */
export function GitHubSyncPanel({
  githubSyncedAt,
  githubStats,
  isGitHubConnected,
  onXPGainTrigger,
  onLifeLossTrigger,
  onSearchingTrigger,
  className,
}: GitHubSyncPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<GitHubSuggestedSkill[]>([]);
  const [isAddingSkills, setIsAddingSkills] = useState(false);
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /** Links GitHub to the current account without replacing the active session */
  const handleConnectGitHub = () => {
    linkSocial({
      provider: 'github',
      callbackURL: '/dashboard/skills',
      scopes: ['user:email', 'read:user', 'repo'],
    });
  };

  /**
   * Runs the GitHub sync action.
   *
   * Flow:
   *   1. Fire `onSearchingTrigger` — switches AIEye to "searching" state
   *   2. Execute `syncGitHubAction` inside a React transition (non-blocking)
   *   3a. On success: fire `onXPGainTrigger` + show success toast
   *   3b. On auth error: fire `onLifeLossTrigger` + open re-auth modal
   *   3c. On other error: fire `onLifeLossTrigger` + show error toast
   */
  const handleResync = () => {
    // Immediately transition AIEye to "searching" before the async work starts
    onSearchingTrigger?.();

    startTransition(async () => {
      const result = await syncGitHubAction();

      if (!result.hasError) {
        // Sync succeeded — fire xp_gain animation, notify user, and refresh
        // server component data so hexagons show updated githubValidated flags.
        onXPGainTrigger?.();
        toast.success(GITHUB_MESSAGES.SYNC_SUCCESS);
        router.refresh();
        // Surface any skills found in GitHub but not yet in the profile
        const suggested = (result.payload as { suggestedSkills?: GitHubSuggestedSkill[] } | null)
          ?.suggestedSkills ?? [];
        setSuggestedSkills(suggested);
      } else {
        // Sync failed — fire life_loss animation for all error types
        onLifeLossTrigger?.();

        const errorMessage = result.message ?? '';
        const isAuthError =
          errorMessage.includes('GITHUB_AUTH_ERROR') ||
          errorMessage.includes('auth') ||
          (result.payload as { errorType?: string } | null)?.errorType === 'auth';

        if (isAuthError) {
          setShowReauthModal(true);
        } else {
          toast.error(GITHUB_MESSAGES.SYNC_ERROR);
        }
      }
    });
  };

  /** Adds all (or a subset of) suggested skills to the user's profile */
  const handleAddSuggestedSkills = async (skills: GitHubSuggestedSkill[]) => {
    setIsAddingSkills(true);
    try {
      const result = await addGitHubSuggestedSkillsAction({ skills });
      if (!result.hasError) {
        toast.success(result.message ?? 'Skills added');
        setSuggestedSkills([]);
        router.refresh();
      } else {
        toast.error('Could not add skills. Try again.');
      }
    } finally {
      setIsAddingSkills(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Pre-connection state
  // ---------------------------------------------------------------------------

  if (!isGitHubConnected) {
    return (
      <div
        className={cn(
          'relative border border-dashed border-[hsl(174,100%,50%,0.2)]',
          'bg-[hsl(200,30%,6%)] p-4',
          className,
        )}
      >
        {/* Angular corner accent — top-left */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(174,100%,50%,0.6)]" />
        {/* Angular corner accent — bottom-right */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(174,100%,50%,0.6)]" />

        {/* Terminal-style module label */}
        <p className="text-[10px] font-mono text-[hsl(174,100%,50%)] opacity-60 mb-3 uppercase tracking-widest">
          [EXPANSION_MODULE]: github_validator.exe
        </p>

        {/* Hex icon placeholder */}
        <div className="text-4xl text-center mb-4 opacity-40 text-[hsl(174,100%,50%)]">
          ⬡
        </div>

        {/* Description */}
        <p className="font-mono text-[11px] text-gray-400 text-center mb-4">
          Conecta tu cuenta GitHub para validar skills automáticamente y obtener +30% XP boost
        </p>

        {/* Privacy notice */}
        <p className="font-mono text-[10px] text-gray-600 mb-4 leading-relaxed">
          {GITHUB_MESSAGES.PRIVACY_NOTICE}
        </p>

        {/* Connect CTA */}
        <button
          onClick={handleConnectGitHub}
          className="block w-full text-center font-mono text-[11px] py-2 border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)] transition-colors"
        >
          [ CONNECT GITHUB ]
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Post-connection state
  // ---------------------------------------------------------------------------

  return (
    <>
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
          // SYNC_STATUS_PANEL: GITHUB
        </p>

        {/* Stats grid — repos, stars, validated skills count */}
        {githubStats ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="font-mono text-lg text-[hsl(174,100%,50%)]">
                {githubStats.validatedSkillsCount}
              </p>
              <p className="font-mono text-[10px] text-gray-500">SKILLS</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-lg text-[hsl(52,100%,50%)]">
                {githubStats.stars}
              </p>
              <p className="font-mono text-[10px] text-gray-500">STARS</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-lg text-[hsl(150,100%,45%)]">
                {githubStats.totalCommits}
              </p>
              <p className="font-mono text-[10px] text-gray-500">COMMITS</p>
            </div>
          </div>
        ) : (
          // Placeholder stats grid when no sync data is available yet
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['SKILLS', 'STARS', 'COMMITS'] as const).map((label) => (
              <div key={label} className="text-center">
                <p className="font-mono text-lg text-gray-700">—</p>
                <p className="font-mono text-[10px] text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Last sync timestamp */}
        <p className="font-mono text-[10px] text-gray-600 mb-1">
          Last Data Upload:{' '}
          <span className="text-gray-500">
            {githubSyncedAt ? formatTimeAgo(githubSyncedAt) : 'Never'}
          </span>
        </p>

        {/* Privacy notice */}
        <p className="font-mono text-[9px] text-muted-foreground/50 mb-4 leading-relaxed">
          {GITHUB_MESSAGES.PRIVACY_NOTICE}
        </p>

        {/* Suggested skills — shown after sync when new skills are detected */}
        {suggestedSkills.length > 0 && (
          <div className="mb-3 border border-dashed border-[hsl(52,100%,50%,0.3)] p-2">
            <p className="font-mono text-[9px] text-[hsl(52,100%,50%)] opacity-70 mb-2 uppercase tracking-widest">
              // NEW_SKILLS_DETECTED
            </p>
            <div className="space-y-1 mb-2">
              {suggestedSkills.map((s) => (
                <div key={s.slug} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-300">{s.name}</span>
                  {s.firstSeen && (
                    <span className="font-mono text-[9px] text-gray-600">
                      since {new Date(s.firstSeen).getFullYear()}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddSuggestedSkills(suggestedSkills)}
                disabled={isAddingSkills}
                className="flex-1 font-mono text-[10px] py-1 border border-[hsl(52,100%,50%,0.4)] text-[hsl(52,100%,50%)] hover:bg-[hsl(52,100%,50%,0.08)] disabled:opacity-40 transition-colors"
              >
                {isAddingSkills ? '[ ADDING... ]' : '[ ADD ALL ]'}
              </button>
              <button
                onClick={() => setSuggestedSkills([])}
                disabled={isAddingSkills}
                className="font-mono text-[10px] px-3 py-1 border border-gray-700 text-gray-600 hover:text-gray-400 transition-colors"
              >
                [ SKIP ]
              </button>
            </div>
          </div>
        )}

        {/* Re-sync button */}
        <button
          onClick={handleResync}
          disabled={isPending}
          className="w-full font-mono text-[11px] py-2 border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '[ SYNCING... ]' : '[ RE-SYNC GITHUB ]'}
        </button>
      </div>

      {/* Re-authorization modal — shown when token is expired or revoked */}
      <GitHubReauthModal
        isOpen={showReauthModal}
        onClose={() => setShowReauthModal(false)}
      />
    </>
  );
}
