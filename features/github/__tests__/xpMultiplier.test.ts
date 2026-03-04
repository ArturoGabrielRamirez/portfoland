/**
 * XP Multiplier Tests
 *
 * Verifies that the 1.3x GitHub XP multiplier is correctly applied at read
 * time across all three dashboard data functions:
 *
 * Test 1: getUserDashboardStats — githubValidated skill gets 1.3x totalXP boost
 * Test 2: getTopRunners — runner totalXP reflects 1.3x boost for githubValidated skill
 * Test 3: getRecentUserActivity — skill event has boosted XP and type 'skill_github'
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// =============================================================================
// Mocks — declared before any module imports
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
    },
    experience: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    userSkill: {
      findMany: vi.fn(),
    },
  },
}))

// Make unstable_cache a transparent pass-through so the inner fetch function
// runs directly without needing Next.js cache infrastructure in tests.
vi.mock('next/cache', () => ({
  unstable_cache:
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) =>
      fn(...args),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// =============================================================================
// Imports — after mocks are in place
// =============================================================================

import { prisma } from '@/lib/prisma'
import { getUserDashboardStats } from '@/features/dashboard/data/getUserDashboardStats.data'
import { getTopRunners } from '@/features/dashboard/data/getTopRunners.data'
import { getRecentUserActivity } from '@/features/dashboard/data/getRecentUserActivity.data'
import { GITHUB_XP_MULTIPLIER } from '@/features/github/constants/xp'

// =============================================================================
// Type-safe mock helpers
// =============================================================================

const mockUserFindUniqueOrThrow = vi.mocked(prisma.user.findUniqueOrThrow)
const mockUserFindMany = vi.mocked(prisma.user.findMany)
const mockExperienceFindMany = vi.mocked(prisma.experience.findMany)
const mockProjectFindMany = vi.mocked(prisma.project.findMany)
const mockUserSkillFindMany = vi.mocked(prisma.userSkill.findMany)

// =============================================================================
// Shared test data
// =============================================================================

const FAKE_USER_ID = 'user_test_001'
const NOW = new Date('2026-01-01T12:00:00Z')

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks()
})

// =============================================================================
// Tests
// =============================================================================

describe('GitHub XP Multiplier — getUserDashboardStats', () => {
  it('applies 1.3x multiplier to a githubValidated skill totalXP', async () => {
    // Arrange: user with one AI+GitHub validated skill at totalXP = 100
    mockUserFindUniqueOrThrow.mockResolvedValue({
      bio: 'Test bio',
      image: 'https://example.com/avatar.png',
      username: 'testuser',
      currentStreak: 0,
      lastStreakDate: null,
      experiences: [],
      projects: [],
      userSkills: [{ totalXP: 100, githubValidated: true }],
      _count: { conversations: 0, userSkills: 1 },
    } as never)

    // Act
    const stats = await getUserDashboardStats(FAKE_USER_ID)

    // Assert: totalXP should include Math.round(100 * 1.3) = 130, not 100
    const expectedSkillXP = Math.round(100 * GITHUB_XP_MULTIPLIER)
    expect(expectedSkillXP).toBe(130)
    expect(stats.totalXP).toBe(130)
  })
})

describe('GitHub XP Multiplier — getTopRunners', () => {
  it('reflects 1.3x boost in runner totalXP for a githubValidated skill', async () => {
    // Arrange: one user with one skill — totalXP: 100, githubValidated: true
    mockUserFindMany.mockResolvedValue([
      {
        id: FAKE_USER_ID,
        name: 'Test User',
        username: 'testuser',
        image: null,
        experiences: [],
        projects: [],
        userSkills: [{ aiValidated: true, githubValidated: true, totalXP: 100 }],
      },
    ] as never)

    // Act
    const runners = await getTopRunners(FAKE_USER_ID)

    // Assert: the single runner's totalXP should reflect 1.3x boost = 130
    expect(runners).toHaveLength(1)
    const expectedSkillXP = Math.round(100 * GITHUB_XP_MULTIPLIER)
    expect(expectedSkillXP).toBe(130)
    expect(runners[0].totalXP).toBe(130)
  })
})

describe('GitHub XP Multiplier — getRecentUserActivity', () => {
  it('emits skill_github event with 1.3x boosted XP when githubValidated is true', async () => {
    // Arrange: one skill — aiValidated: false, githubValidated: true, totalXP: 200
    const skillUpdatedAt = new Date(NOW.getTime() - 1000)
    const skillCreatedAt = new Date(NOW.getTime() - 60000)

    mockExperienceFindMany.mockResolvedValue([])
    mockProjectFindMany.mockResolvedValue([])
    mockUserSkillFindMany.mockResolvedValue([
      {
        id: 'skill_001',
        skill: { name: 'TypeScript' },
        aiValidated: false,
        githubValidated: true,
        totalXP: 200,
        createdAt: skillCreatedAt,
        updatedAt: skillUpdatedAt,
      },
    ] as never)

    // Act
    const events = await getRecentUserActivity(FAKE_USER_ID)

    // Assert: event type is 'skill_github' and XP is Math.round(200 * 1.3) = 260
    expect(events).toHaveLength(1)
    const expectedXP = Math.round(200 * GITHUB_XP_MULTIPLIER)
    expect(expectedXP).toBe(260)
    expect(events[0].type).toBe('skill_github')
    expect(events[0].xp).toBe(260)
    expect(events[0].title).toBe('TypeScript')
  })
})
