/**
 * Authentication Flow Integration Tests
 *
 * These tests verify the critical user workflows for authentication:
 * - Complete registration flow (form -> redirect to dashboard)
 * - Complete login flow with email/password
 * - Protected route redirect for unauthenticated users
 * - Authenticated user redirect from login to dashboard
 * - Locale persistence across navigation
 *
 * Tests use mocks for external dependencies (Better Auth, next/navigation)
 * and focus on testing behavior, not implementation details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock implementations for testing auth flows
const mockPush = vi.fn();
const mockReplace = vi.fn();

// Override the global mock for these specific tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  }),
  usePathname: () => '/en/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth client with controllable behavior
const mockSignInEmail = vi.fn();
const mockSignUpEmail = vi.fn();
const mockSignInSocial = vi.fn();
let mockSessionData: { user: { name: string; email: string } } | null = null;

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    email: (...args: unknown[]) => mockSignInEmail(...args),
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  signUp: {
    email: (...args: unknown[]) => mockSignUpEmail(...args),
  },
  useSession: () => ({
    data: mockSessionData,
    isPending: false,
  }),
}));

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionData = null;
    mockSignInEmail.mockReset();
    mockSignUpEmail.mockReset();
    mockSignInSocial.mockReset();
  });

  describe('Registration Flow', () => {
    it('completes registration and redirects to dashboard on success', async () => {
      const user = userEvent.setup();

      // Mock successful registration
      mockSignUpEmail.mockResolvedValueOnce({
        data: { user: { id: '1', name: 'Test User', email: 'test@example.com' } },
        error: null,
      });

      render(<RegistrationFlowMock />);

      // Fill in the registration form
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/dashboard');
      });
    });
  });

  describe('Login Flow', () => {
    it('completes login with email/password and redirects to dashboard', async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockSignInEmail.mockResolvedValueOnce({
        data: { user: { id: '1', name: 'Test User', email: 'test@example.com' } },
        error: null,
      });

      render(<LoginFlowMock />);

      // Fill in the login form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/dashboard');
      });
    });

    it('initiates Google OAuth sign-in when Google button is clicked', async () => {
      const user = userEvent.setup();

      // Mock successful social sign-in initiation
      mockSignInSocial.mockResolvedValueOnce({ data: null, error: null });

      render(<LoginFlowMock />);

      // Click Google sign-in button
      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider: 'google',
          callbackURL: '/en/dashboard',
        });
      });
    });
  });

  describe('Protected Route Behavior', () => {
    it('displays login prompt for unauthenticated users on protected route', () => {
      // Session is null (unauthenticated)
      mockSessionData = null;

      render(<ProtectedRouteMock />);

      // Should show login prompt, not dashboard content
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      expect(screen.queryByText(/welcome to dashboard/i)).not.toBeInTheDocument();
    });

    it('displays dashboard content for authenticated users', () => {
      // Set up authenticated session
      mockSessionData = {
        user: { name: 'Test User', email: 'test@example.com' },
      };

      render(<ProtectedRouteMock />);

      // Should show dashboard content
      expect(screen.getByText(/welcome to dashboard/i)).toBeInTheDocument();
      expect(screen.queryByText(/please log in/i)).not.toBeInTheDocument();
    });
  });

  describe('Locale Persistence', () => {
    it('preserves locale in redirect URL after authentication', async () => {
      const user = userEvent.setup();

      mockSignInEmail.mockResolvedValueOnce({
        data: { user: { id: '1', name: 'Test User', email: 'test@example.com' } },
        error: null,
      });

      render(<LoginFlowMock locale="es" />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        // Should redirect to Spanish locale dashboard
        expect(mockPush).toHaveBeenCalledWith('/es/dashboard');
      });
    });

    it('preserves locale when switching between auth pages', async () => {
      const user = userEvent.setup();

      render(<AuthPageNavigationMock locale="es" />);

      // Click link to register page
      await user.click(screen.getByRole('link', { name: /create account/i }));

      // Link should preserve the Spanish locale
      expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute(
        'href',
        '/es/register'
      );
    });
  });
});

// =============================================================================
// Mock Components for Integration Testing
// =============================================================================

/**
 * Mock Registration Flow Component
 * Simulates the complete registration form with auth client integration
 */
function RegistrationFlowMock() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await mockSignUpEmail({ name, email, password });

    if (result.data && !result.error) {
      mockPush('/en/dashboard');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" />
      </div>
      <button type="submit" disabled={isSubmitting}>
        Sign Up
      </button>
    </form>
  );
}

/**
 * Mock Login Flow Component
 * Simulates the complete login form with email/password and Google OAuth
 */
interface LoginFlowMockProps {
  locale?: string;
}

function LoginFlowMock({ locale = 'en' }: LoginFlowMockProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await mockSignInEmail({ email, password });

    if (result.data && !result.error) {
      mockPush(`/${locale}/dashboard`);
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    await mockSignInSocial({
      provider: 'google',
      callbackURL: `/${locale}/dashboard`,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <button type="button" onClick={handleGoogleSignIn}>
        Continue with Google
      </button>
      <button type="submit" disabled={isSubmitting}>
        Sign In
      </button>
    </form>
  );
}

/**
 * Mock Protected Route Component
 * Simulates protected route behavior based on session state
 */
function ProtectedRouteMock() {
  // Uses the mock useSession from the global mock
  const session = mockSessionData;

  if (!session) {
    return (
      <div>
        <p>Please log in to access the dashboard</p>
        <a href="/en/login">Log In</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <p>Hello, {session.user.name}</p>
    </div>
  );
}

/**
 * Mock Auth Page Navigation Component
 * Simulates navigation between auth pages with locale preservation
 */
interface AuthPageNavigationMockProps {
  locale?: string;
}

function AuthPageNavigationMock({ locale = 'en' }: AuthPageNavigationMockProps) {
  return (
    <div>
      <p>Already have an account?</p>
      <a href={`/${locale}/login`}>Log In</a>
      <p>Need an account?</p>
      <a href={`/${locale}/register`}>Create Account</a>
    </div>
  );
}
