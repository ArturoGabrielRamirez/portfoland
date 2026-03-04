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
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { signIn } from '@/lib/auth-client';
import { formatTimeAgo } from '@/lib/utils/format';
import { syncGitHubAction } from '../actions/syncGitHub.action';
import { GITHUB_MESSAGES } from '../constants/messages';
import type { GitHubSyncPanelProps } from '../types/github';

// =============================================================================
// Placeholder for GitHubReauthModal — wired in TG10
// =============================================================================

/** Temporary stub rendered until TG10 creates the real modal component */
function GitHubReauthModalPlaceholder({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GitHub re-authorization required"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="bg-[hsl(200,30%,8%)] border border-[hsl(0,80%,55%,0.4)] font-mono p-6 max-w-sm w-full mx-4">
        {/* Angular top-left corner accent */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(0,80%,55%,0.6)]" />
        {/* Angular bottom-right corner accent */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(0,80%,55%,0.6)]" />

        <p className="text-[10px] font-mono text-[hsl(0,80%,55%)] opacity-70 mb-2 uppercase tracking-widest">
          [SYS_ERR]: auth_failure
        </p>
        <p className="text-xs font-mono text-gray-300 mb-4">
          {GITHUB_MESSAGES.AUTH_ERROR}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              signIn.social({ provider: 'github', callbackURL: '/dashboard/skills' })
            }
            className="flex-1 font-mono text-[11px] py-2 border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)] transition-colors"
          >
            [ RECONECTAR GITHUB ]
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[11px] py-2 px-3 border border-gray-700 text-gray-500 hover:text-gray-400 transition-colors"
          >
            [ CANCELAR ]
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /** Initiates GitHub OAuth connect flow via Better Auth client */
  const handleConnectGitHub = () => {
    signIn.social({
      provider: 'github',
      callbackURL: '/dashboard/skills',
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
        // Sync succeeded — fire xp_gain animation and notify user
        onXPGainTrigger?.();
        toast.success(GITHUB_MESSAGES.SYNC_SUCCESS);
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

        {/* Re-sync button */}
        <button
          onClick={handleResync}
          disabled={isPending}
          className="w-full font-mono text-[11px] py-2 border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '[ SYNCING... ]' : '[ RE-SYNC GITHUB ]'}
        </button>
      </div>

      {/* Re-authorization modal — replaced by GitHubReauthModal in TG10 */}
      <GitHubReauthModalPlaceholder
        isOpen={showReauthModal}
        onClose={() => setShowReauthModal(false)}
      />
    </>
  );
}
