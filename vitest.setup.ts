import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock better-auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
    useSession: () => ({
      data: null,
      isPending: false,
    }),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/en/login',
  useSearchParams: () => new URLSearchParams(),
}));
