/**
 * TG9 Integration Tests — DashboardSkillsView and TechSkills
 *
 * Test 1: `DashboardSkillsView` renders the `GitHubSyncPanel` when it receives
 *         `githubSyncedAt` and `githubStats` props (post-connection state with sync data).
 *
 * Test 2: `TechSkills` renders a "GitHub Verified" badge when at least one
 *         `userSkill.githubValidated === true`.
 *
 * Test 3: `TechSkills` renders an "Elite Verified" badge when at least one skill
 *         has both `aiValidated` and `githubValidated` true.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// =============================================================================
// Mocks — declared before component imports (vi.mock is hoisted to top of file)
// =============================================================================

// Stub next-intl for all components that call useTranslations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Stub next/navigation — DashboardSkillsView uses useParams
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard/skills',
}));

// Stub framer-motion — prevents animation side-effects in jsdom
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, key: string) =>
        // eslint-disable-next-line react/display-name
        React.forwardRef(
          (
            { children, animate, transition, initial, exit, whileHover, whileTap, ...rest }: any,
            ref: any,
          ) => React.createElement(key as string, { ref, ...rest }, children),
        ),
    },
  ),
  AnimatePresence: ({ children }: any) => children,
}));

// Stub lucide-react using importOriginal so all icons are available,
// overriding only the ones we want to replace with lightweight test doubles.
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
  };
});

// Stub @/features/tech — DashboardNav pulls in many complex sub-deps.
// Preserve TechBadge so TechSkills badge rendering is tested faithfully.
vi.mock('@/features/tech', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    DashboardNav: () => React.createElement('nav', { 'data-testid': 'dashboard-nav' }),
    HexBadge: ({ children }: any) =>
      React.createElement('span', { 'data-testid': 'hex-badge' }, children),
  };
});

// Stub SkillTreeView and ManualSkillModal — canvas/WebGL-heavy components
vi.mock('@/features/skills/components', () => ({
  SkillTreeView: () => React.createElement('div', { 'data-testid': 'skill-tree-view' }),
  ManualSkillModal: () => null,
}));

// Stub the GitHub sync server action — prevents real server calls in tests
vi.mock('@/features/github/actions/syncGitHub.action', () => ({
  syncGitHubAction: vi.fn().mockResolvedValue({
    hasError: false,
    message: 'ok',
    payload: { validatedSkillsCount: 0, stars: 0, totalCommits: 0 },
  }),
}));

// Stub auth-client signIn.social — prevents real OAuth redirect in jsdom
vi.mock('@/lib/auth-client', () => ({
  signIn: { social: vi.fn() },
}));

// Stub sonner toast — prevents real toast rendering in test env
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Stub formatTimeAgo — returns ISO string to avoid Date locale issues in CI
vi.mock('@/lib/utils/format', () => ({
  formatTimeAgo: (date: Date) => date.toISOString(),
}));

// =============================================================================
// Import components (must come after all vi.mock declarations)
// =============================================================================

import { DashboardSkillsView } from '../../../app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView';
import { TechSkills } from '../../portfolio/components/tech/TechSkills';

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Minimal `UserSkillWithDetails`-compatible skill object.
 * Only fields read by TechSkills and its children are set.
 */
function makeUserSkill(overrides: {
  id?: string;
  aiValidated?: boolean;
  githubValidated?: boolean;
  level?: number;
  skillName?: string;
}) {
  const {
    id = 'skill-1',
    aiValidated = false,
    githubValidated = false,
    level = 2,
    skillName = 'TypeScript',
  } = overrides;

  return {
    id,
    level,
    aiValidated,
    githubValidated,
    totalXP: 200,
    userId: 'user-1',
    skillId: `skilldef-${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    skill: {
      id: `skilldef-${id}`,
      name: skillName,
      slug: skillName.toLowerCase(),
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 'cat-1',
        name: 'Frontend',
        color: '#00D4FF',
        isDefault: true,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    sources: [],
  } as any;
}

/** Minimal `PortfolioData`-compatible object for TechSkills */
function makePortfolioData(skills: any[]) {
  return {
    user: {
      id: 'user-1',
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      image: null,
      bio: null,
      portfolioMode: 'tech' as const,
      locale: 'en',
      sectionOrder: [],
      contactLinks: {},
      sectionVisibility: {},
    },
    skills: {
      user: { id: 'user-1', name: 'Test User', username: 'testuser', image: null },
      skills,
      categories: [
        {
          id: 'cat-1',
          name: 'Frontend',
          color: '#00D4FF',
          isDefault: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      groupedByCategory: [],
      stats: { totalSkills: skills.length, totalXP: 200, masterSkills: 0, categoriesUsed: 1 },
    },
    experiences: null,
    projects: [],
    services: [],
    testimonials: [],
    gallery: [],
    settings: null,
  } as any;
}

/** Base props for DashboardSkillsView */
const baseDashboardProps = {
  skills: [],
  categories: [],
  stats: { totalSkills: 0, totalXP: 0, masterSkills: 0, categoriesUsed: 0 },
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    username: null,
    image: null,
    portfolioMode: 'tech' as const,
  },
  isGitHubConnected: true,
  githubSyncedAt: new Date('2026-01-15T10:00:00Z'),
  githubStats: { stars: 12, totalCommits: 500, validatedSkillsCount: 3 },
};

// =============================================================================
// Tests
// =============================================================================

describe('TG9 — DashboardSkillsView and TechSkills integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Test 1: DashboardSkillsView renders GitHubSyncPanel (post-connection state)
  // ---------------------------------------------------------------------------
  it('DashboardSkillsView renders GitHubSyncPanel when githubSyncedAt and githubStats are provided', () => {
    render(<DashboardSkillsView {...baseDashboardProps} />);

    // The post-connection GitHubSyncPanel renders the SYNC_STATUS_PANEL label
    expect(screen.getByText(/SYNC_STATUS_PANEL: GITHUB/)).toBeTruthy();

    // validatedSkillsCount (3) must be visible in the stats grid
    expect(screen.getByText('3')).toBeTruthy();

    // The Re-Sync button must be present in the panel
    expect(screen.getByText('[ RE-SYNC GITHUB ]')).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Test 2: TechSkills renders "GitHub Verified" badge when githubValidated skill present
  // ---------------------------------------------------------------------------
  it('TechSkills renders GitHub Verified badge when at least one skill has githubValidated=true', () => {
    const skills = [makeUserSkill({ id: 'skill-1', aiValidated: false, githubValidated: true })];
    const data = makePortfolioData(skills);

    render(<TechSkills data={data} />);

    // GitHub Verified badge must be present
    const githubBadge = screen.getByText(/GitHub Verified/);
    expect(githubBadge).toBeTruthy();

    // AI Verified badge must NOT be present (no skill has aiValidated=true)
    expect(screen.queryByText(/AI Verified/)).toBeNull();

    // Elite Verified badge must NOT be present (no dual-validated skill)
    expect(screen.queryByText(/Elite Verified/)).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Test 3: TechSkills renders "Elite Verified" badge when a skill has both flags
  // ---------------------------------------------------------------------------
  it('TechSkills renders Elite Verified badge when at least one skill has both aiValidated and githubValidated true', () => {
    const skills = [
      makeUserSkill({ id: 'skill-1', aiValidated: true, githubValidated: true }),
      makeUserSkill({ id: 'skill-2', aiValidated: false, githubValidated: false }),
    ];
    const data = makePortfolioData(skills);

    render(<TechSkills data={data} />);

    // Elite Verified badge must be visible
    expect(screen.getByText(/Elite Verified/)).toBeTruthy();

    // AI Verified badge must also be visible (skill-1 has aiValidated=true)
    expect(screen.getByText(/AI Verified/)).toBeTruthy();

    // GitHub Verified badge must also be visible (skill-1 has githubValidated=true)
    expect(screen.getByText(/GitHub Verified/)).toBeTruthy();

    // Self-Assessed badge must be visible (skill-2 has aiValidated=false)
    expect(screen.getByText(/Self-Assessed/)).toBeTruthy();
  });
});
