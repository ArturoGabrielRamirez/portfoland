/**
 * GitHub API Layer Tests
 *
 * Tests for the raw GitHub API functions in `features/github/api/github.api.ts`.
 * All tests mock `fetch` globally — no real network calls are made.
 *
 * Test cases:
 * 1. `fetchUserRepos` filters out forked repos from the response
 * 2. `aggregateLanguages` sums language bytes across multiple repos correctly
 * 3. `fetchContributions` returns `totalCommitContributions` from the GraphQL response
 * 4. `fetchUserRepos` throws a typed `GitHubAuthError` when the endpoint returns 401
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  fetchUserRepos,
  aggregateLanguages,
  fetchContributions,
  fetchGitHubSyncData,
} from '../api/github.api'
import { GitHubAuthError } from '../types'
import type { GitHubRepo } from '../types'

// =============================================================================
// Test helpers
// =============================================================================

/** Build a minimal mock Response object for fetch stubs */
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

// =============================================================================
// Test data
// =============================================================================

const FAKE_TOKEN = 'ghp_testtoken123'

const ownedRepo: GitHubRepo = {
  id: 1,
  name: 'my-project',
  full_name: 'testuser/my-project',
  private: false,
  fork: false,
  stargazers_count: 10,
  language: 'TypeScript',
}

const forkedRepo: GitHubRepo = {
  id: 2,
  name: 'forked-lib',
  full_name: 'testuser/forked-lib',
  private: false,
  fork: true,
  stargazers_count: 0,
  language: 'JavaScript',
}

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchUserRepos', () => {
  it('filters out forked repos and returns only non-fork repos', async () => {
    // Mock returns 2 repos: 1 owned, 1 fork — result must include only the owned one
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(mockResponse([ownedRepo, forkedRepo]))
    )

    const repos = await fetchUserRepos(FAKE_TOKEN)

    expect(repos).toHaveLength(1)
    expect(repos[0].fork).toBe(false)
    expect(repos[0].name).toBe('my-project')
  })

  it('throws GitHubAuthError with type "auth" when the endpoint returns 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(mockResponse({ message: 'Bad credentials' }, 401))
    )

    // Capture the thrown error from a single call to inspect its properties
    let caught: unknown
    try {
      await fetchUserRepos(FAKE_TOKEN)
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(GitHubAuthError)
    expect((caught as GitHubAuthError).type).toBe('auth')
    expect((caught as GitHubAuthError).name).toBe('GitHubAuthError')
  })
})

describe('aggregateLanguages', () => {
  it('correctly sums language bytes across multiple repos', async () => {
    // Repo1: TypeScript = 1000 bytes
    // Repo2: TypeScript = 500 bytes, JavaScript = 200 bytes
    // Expected: TypeScript = 1500, JavaScript = 200

    const repo1: GitHubRepo = {
      ...ownedRepo,
      id: 10,
      name: 'repo1',
      full_name: 'user/repo1',
    }
    const repo2: GitHubRepo = {
      ...ownedRepo,
      id: 11,
      name: 'repo2',
      full_name: 'user/repo2',
    }

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        // First call: languages for repo1
        .mockResolvedValueOnce(mockResponse({ TypeScript: 1000 }))
        // Second call: languages for repo2
        .mockResolvedValueOnce(mockResponse({ TypeScript: 500, JavaScript: 200 }))
    )

    const totals = await aggregateLanguages(FAKE_TOKEN, [repo1, repo2])

    expect(totals['TypeScript']).toBe(1500)
    expect(totals['JavaScript']).toBe(200)
  })
})

describe('fetchContributions', () => {
  it('returns totalCommitContributions from the GraphQL response', async () => {
    const mockGraphQLResponse = {
      data: {
        viewer: {
          contributionsCollection: {
            totalCommitContributions: 847,
            totalRepositoriesWithContributedCommits: 23,
          },
        },
      },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(mockResponse(mockGraphQLResponse))
    )

    const contributions = await fetchContributions(FAKE_TOKEN)

    expect(contributions).not.toBeNull()
    expect(contributions!.totalCommitContributions).toBe(847)
    expect(contributions!.totalRepositoriesWithContributedCommits).toBe(23)
  })

  it('returns null when the GraphQL response contains errors', async () => {
    const mockErrorResponse = {
      data: null,
      errors: [{ message: 'Unauthorized' }],
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(mockResponse(mockErrorResponse))
    )

    const contributions = await fetchContributions(FAKE_TOKEN)

    expect(contributions).toBeNull()
  })
})

describe('fetchGitHubSyncData', () => {
  it('throws GitHubAuthError with type "auth" when repos endpoint returns 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(mockResponse({ message: 'Bad credentials' }, 401))
    )

    let caught: unknown
    try {
      await fetchGitHubSyncData(FAKE_TOKEN)
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(GitHubAuthError)
    expect((caught as GitHubAuthError).type).toBe('auth')
  })
})
