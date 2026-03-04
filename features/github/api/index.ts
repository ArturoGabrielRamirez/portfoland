/**
 * GitHub API Barrel Export
 *
 * Re-exports all public API functions and error classes from the GitHub API layer.
 */

export {
  fetchUserRepos,
  fetchRepoLanguages,
  fetchContributions,
  aggregateLanguages,
  fetchGitHubSyncData,
} from './github.api'
