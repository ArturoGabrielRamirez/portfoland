/**
 * GitHubReauthModal Component Tests (TG10)
 *
 * Test 1: When `isOpen` is `true`, the modal renders with the AUTH_ERROR message
 *         containing "Enlace perdido con la base de datos de GitHub".
 *
 * Test 2: When `isOpen` is `false`, the Dialog is not open and the message is
 *         not visible in the document.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// =============================================================================
// Mocks
// =============================================================================

// Mock Better Auth client signIn.social — prevents real OAuth redirect in tests
vi.mock('@/lib/auth-client', () => ({
  signIn: {
    social: vi.fn(),
  },
}));

// =============================================================================
// Import component (must come after vi.mock declarations)
// =============================================================================

import { GitHubReauthModal } from '../components/GitHubReauthModal';

// =============================================================================
// Tests
// =============================================================================

describe('GitHubReauthModal (TG10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the auth error message when isOpen is true', () => {
    render(<GitHubReauthModal isOpen={true} onClose={vi.fn()} />);

    // The GITHUB_MESSAGES.AUTH_ERROR string must be visible
    expect(
      screen.getByText(
        '[SYS_ERR]: Enlace perdido con la base de datos de GitHub. Reautoriza para continuar.',
      ),
    ).toBeTruthy();

    // The title must be visible
    expect(screen.getByText('[SYS_ERR]: ENLACE GITHUB PERDIDO')).toBeTruthy();

    // The reconectar button must be present
    expect(screen.getByText('[ RECONECTAR ]')).toBeTruthy();

    // The cancel button must be present
    expect(screen.getByText('[ CANCELAR ]')).toBeTruthy();
  });

  it('does not show the modal content when isOpen is false', () => {
    render(<GitHubReauthModal isOpen={false} onClose={vi.fn()} />);

    // The auth error message must NOT be visible when the dialog is closed
    expect(
      screen.queryByText(
        '[SYS_ERR]: Enlace perdido con la base de datos de GitHub. Reautoriza para continuar.',
      ),
    ).toBeNull();
  });
});
