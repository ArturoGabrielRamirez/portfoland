/**
 * GitHub Language Mappings
 *
 * Maps GitHub API language names (as returned by the `/repos/{owner}/{repo}/languages`
 * endpoint) to Portfoland skill slugs. Used during the GitHub sync to match repository
 * language data against a user's existing UserSkill records.
 *
 * Keys are exact strings returned by the GitHub API. Values are the Portfoland skill
 * slugs stored in `Skill.slug`. Only languages with matching UserSkill records are
 * validated — no new skills are auto-created.
 */

// =============================================================================
// Language Mapping
// =============================================================================

export const GITHUB_LANGUAGE_MAP: Record<string, string> = {
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  Python: 'python',
  'Jupyter Notebook': 'python',
  Shell: 'bash',
  'C++': 'cpp',
  C: 'c',
  Go: 'go',
  Rust: 'rust',
  Java: 'java',
  Kotlin: 'kotlin',
  Swift: 'swift',
  Ruby: 'ruby',
  PHP: 'php',
  CSS: 'css',
  HTML: 'html',
  Vue: 'vue',
  Svelte: 'svelte',
  Dart: 'dart',
} as const;
