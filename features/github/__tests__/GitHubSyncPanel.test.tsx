/**
 * GitHubSyncPanel Component Tests (TG8)
 *
 * Test 1: When `isGitHubConnected` is `false`, the panel renders the pre-connection
 *         "Expansion Module" state with `[EXPANSION_MODULE]: github_validator.exe` visible.
 *
 * Test 2: When `isGitHubConnected` is `true` and `githubStats` has data, the panel
 *         renders the post-connection "Sync Status Panel" with the SKILLS stat visible.
 *
 * Test 3: When the "Re-Sync" button is clicked, `onSearchingTrigger` is called
 *         immediately before the async server action resolves.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// =============================================================================
// Mocks
// =============================================================================

// Mock the server action — returns a resolved success response by default
const mockSyncGitHubAction = vi.fn().mockResolvedValue({
  hasError: false,
  message: '[SYS_OK]: Validación GitHub completada.',
  payload: { validatedSkillsCount: 2, stars: 5, totalCommits: 100 },
});

vi.mock('../actions/syncGitHub.action', () => ({
  syncGitHubAction: () => mockSyncGitHubAction(),
}));

// Mock Better Auth client signIn.social — prevents real OAuth redirect in tests
vi.mock('@/lib/auth-client', () => ({
  signIn: {
    social: vi.fn(),
  },
}));

// Mock sonner toast — prevents actual toasts rendering in test environment
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// =============================================================================
// Import component (must come after vi.mock declarations)
// =============================================================================

import { GitHubSyncPanel } from '../components/GitHubSyncPanel';

// =============================================================================
// Test helpers
// =============================================================================

const baseProps = {
  userId: 'user_123',
  isGitHubConnected: false,
  githubSyncedAt: null,
  githubStats: null,
};

// =============================================================================
// Tests
// =============================================================================

describe('GitHubSyncPanel (TG8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pre-connection expansion module when isGitHubConnected is false', () => {
    render(<GitHubSyncPanel {...baseProps} isGitHubConnected={false} />);

    // The expansion module label must be visible
    expect(
      screen.getByText('[EXPANSION_MODULE]: github_validator.exe'),
    ).toBeTruthy();

    // The connect button must be present
    expect(screen.getByText('[ CONNECT GITHUB ]')).toBeTruthy();

    // Post-connection elements must NOT be present
    expect(screen.queryByText('[ RE-SYNC GITHUB ]')).toBeNull();
    expect(screen.queryByText(/SYNC_STATUS_PANEL/)).toBeNull();
  });

  it('renders post-connection status panel with stats when connected and synced', () => {
    const githubStats = {
      stars: 42,
      totalCommits: 1234,
      validatedSkillsCount: 5,
    };

    const syncedAt = new Date('2026-01-15T10:00:00Z');

    render(
      <GitHubSyncPanel
        {...baseProps}
        isGitHubConnected={true}
        githubSyncedAt={syncedAt}
        githubStats={githubStats}
      />,
    );

    // SYNC_STATUS_PANEL header must be visible
    expect(screen.getByText(/SYNC_STATUS_PANEL: GITHUB/)).toBeTruthy();

    // Stats must be rendered — validated skills count is the primary delight value
    expect(screen.getByText('5')).toBeTruthy(); // validatedSkillsCount
    expect(screen.getByText('42')).toBeTruthy(); // stars
    expect(screen.getByText('1234')).toBeTruthy(); // totalCommits

    // Re-sync button must be present
    expect(screen.getByText('[ RE-SYNC GITHUB ]')).toBeTruthy();

    // Pre-connection elements must NOT be present
    expect(screen.queryByText('[EXPANSION_MODULE]: github_validator.exe')).toBeNull();
  });

  it('calls onSearchingTrigger immediately when Re-Sync button is clicked', async () => {
    const onSearchingTrigger = vi.fn();
    const syncedAt = new Date();

    render(
      <GitHubSyncPanel
        {...baseProps}
        isGitHubConnected={true}
        githubSyncedAt={syncedAt}
        githubStats={{ stars: 0, totalCommits: 0, validatedSkillsCount: 0 }}
        onSearchingTrigger={onSearchingTrigger}
      />,
    );

    const resyncButton = screen.getByText('[ RE-SYNC GITHUB ]');
    fireEvent.click(resyncButton);

    // `onSearchingTrigger` must have been called synchronously before the action resolves
    expect(onSearchingTrigger).toHaveBeenCalledTimes(1);
  });
});
