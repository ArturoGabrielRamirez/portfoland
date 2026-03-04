'use client';

/**
 * GitHubReauthModal Component
 *
 * Shown when GitHub sync returns a 401 auth error — prompts the user to
 * reconnect their GitHub account via Better Auth social sign-in.
 *
 * Visual: red/error styling consistent with `life_loss` AIEye state.
 * Uses shadcn Dialog primitive for accessible modal semantics.
 */

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shadcn/ui/dialog';
import { signIn } from '@/lib/auth-client';

import { GITHUB_MESSAGES } from '../constants/messages';

// =============================================================================
// Types
// =============================================================================

interface GitHubReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Modal that surfaces when the GitHub OAuth token is expired or revoked.
 *
 * @param isOpen  - Controls Dialog visibility
 * @param onClose - Called when the user dismisses without reconnecting
 */
export function GitHubReauthModal({ isOpen, onClose }: GitHubReauthModalProps) {
  /** Triggers Better Auth social sign-in for GitHub, then returns to skills page */
  const handleReconnect = () => {
    signIn.social({
      provider: 'github',
      callbackURL: '/dashboard/skills',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-[hsl(200,30%,6%)] border border-[hsl(0,80%,55%,0.4)] rounded-none max-w-sm font-mono"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-[hsl(0,80%,55%)] font-mono text-sm">
            [SYS_ERR]: ENLACE GITHUB PERDIDO
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="py-2">
          <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
            {GITHUB_MESSAGES.AUTH_ERROR}
          </p>
          <p className="text-[10px] text-gray-600">
            Tu token de GitHub ha expirado o fue revocado. Reconecta para continuar validando
            skills.
          </p>
        </div>

        {/* Actions */}
        <DialogFooter className="flex gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 font-mono text-[11px] py-2 border border-gray-700 text-gray-500 hover:text-gray-400 transition-colors"
          >
            [ CANCELAR ]
          </button>
          <button
            onClick={handleReconnect}
            className="flex-1 text-center font-mono text-[11px] py-2 border border-[hsl(0,80%,55%,0.4)] text-[hsl(0,80%,55%)] hover:bg-[hsl(0,80%,55%,0.08)] transition-colors"
          >
            [ RECONECTAR ]
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
