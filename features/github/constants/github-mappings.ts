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

// =============================================================================
// Display names (slug → human-readable label for the "Add Skills" suggestion UI)
// =============================================================================

export const GITHUB_SKILL_DISPLAY_NAMES: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  bash: 'Bash / Shell',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  ruby: 'Ruby',
  php: 'PHP',
  css: 'CSS',
  html: 'HTML',
  vue: 'Vue.js',
  svelte: 'Svelte',
  dart: 'Dart',
}

// =============================================================================
// Default category per skill slug (used when auto-adding from GitHub)
// =============================================================================

export const GITHUB_SKILL_CATEGORY_SLUG: Record<string, string> = {
  typescript: 'core',
  javascript: 'core',
  html: 'core',
  css: 'core',
  python: 'backend',
  bash: 'devops',
  cpp: 'backend',
  c: 'backend',
  go: 'backend',
  rust: 'backend',
  java: 'backend',
  kotlin: 'backend',
  swift: 'backend',
  ruby: 'backend',
  php: 'backend',
  vue: 'frontend',
  svelte: 'frontend',
  dart: 'devops',
}
