/**
 * GitHub Sync Service Tests
 *
 * Verifies the core business logic in `syncGitHubService`:
 *
 * Test 1: When a user has TypeScript at ≥ 60% of language bytes AND has a
 *         matching UserSkill, `prisma.userSkill.updateMany` is called with
 *         `githubValidated: true` for the `typescript` slug.
 *
 * Test 2: When `getGitHubToken` returns `null` (no GitHub account linked),
 *         the service throws an error without calling `fetchGitHubSyncData`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// =============================================================================
// Mocks — must be declared before any module imports
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSkill: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('../data/getGitHubToken.data', () => ({
  getGitHubToken: vi.fn(),
}))

vi.mock('../api/github.api', () => ({
  fetchGitHubSyncData: vi.fn(),
}))

// =============================================================================
// Imports — after mocks are in place
// =============================================================================

import { prisma } from '@/lib/prisma'
import { getGitHubToken } from '../data/getGitHubToken.data'
import { fetchGitHubSyncData } from '../api/github.api'
import { syncGitHubService } from '../services/syncGitHub.service'

// =============================================================================
// Type-safe mock helpers
// =============================================================================

const mockGetGitHubToken = vi.mocked(getGitHubToken)
const mockFetchGitHubSyncData = vi.mocked(fetchGitHubSyncData)
const mockUserSkillFindMany = vi.mocked(prisma.userSkill.findMany)
const mockUserSkillUpdateMany = vi.mocked(prisma.userSkill.updateMany)
const mockUserUpdate = vi.mocked(prisma.user.update)

// =============================================================================
// Test data
// =============================================================================

const FAKE_USER_ID = 'user_abc123'
const FAKE_TOKEN = 'ghp_test_token_xyz'

// 7000 TypeScript bytes out of 10000 total = 70% — above the 60% threshold
const SYNC_DATA_TS_DOMINANT = {
  repos: [
    {
      id: 1,
      name: 'my-repo',
      full_name: 'user/my-repo',
      private: false,
      fork: false,
      stargazers_count: 5,
      language: 'TypeScript',
    },
  ],
  languageTotals: {
    TypeScript: 7000,
    CSS: 3000,
  },
  totalStars: 5,
  contributions: {
    totalCommitContributions: 200,
    totalRepositoriesWithContributedCommits: 3,
  },
}

// UserSkill record with the `typescript` slug
const USER_SKILL_TYPESCRIPT = {
  id: 'us_ts_001',
  skill: { slug: 'typescript' },
}

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks()

  // Default: user.update always succeeds
  mockUserUpdate.mockResolvedValue({} as never)
  // Default: updateMany always succeeds
  mockUserSkillUpdateMany.mockResolvedValue({ count: 1 } as never)
})

// =============================================================================
// Tests
// =============================================================================

describe('syncGitHubService', () => {
  it('calls prisma.userSkill.updateMany with githubValidated: true when TypeScript is ≥ 60% of bytes', async () => {
    // Arrange
    mockGetGitHubToken.mockResolvedValue(FAKE_TOKEN)
    mockFetchGitHubSyncData.mockResolvedValue(SYNC_DATA_TS_DOMINANT as never)
    mockUserSkillFindMany.mockResolvedValue([USER_SKILL_TYPESCRIPT] as never)

    // Act
    const result = await syncGitHubService(FAKE_USER_ID)

    // Assert: `typescript` slug was validated
    expect(result.validatedSlugs).toContain('typescript')

    // Assert: updateMany was called with the correct shape
    expect(mockUserSkillUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: FAKE_USER_ID,
        skill: { slug: { in: ['typescript'] } },
      },
      data: {
        githubValidated: true,
      },
    })
  })

  it('throws an error and does not call fetchGitHubSyncData when getGitHubToken returns null', async () => {
    // Arrange: no GitHub account linked
    mockGetGitHubToken.mockResolvedValue(null)

    // Act + Assert: service must throw
    await expect(syncGitHubService(FAKE_USER_ID)).rejects.toThrow(
      'No GitHub account linked'
    )

    // fetchGitHubSyncData must never be invoked
    expect(mockFetchGitHubSyncData).not.toHaveBeenCalled()
  })
})
