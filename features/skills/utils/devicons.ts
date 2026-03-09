/**
 * Devicon Utility
 *
 * Maps skill names to Devicon CDN slugs for technology icon display.
 * Pure TypeScript — no npm dependencies, uses Devicon CDN only.
 *
 * Pattern mirrors getCategoryColor from features/skills/constants/categories.ts:
 * Record lookup with explicit null fallback.
 */

// =============================================================================
// Slug Map
// =============================================================================

/**
 * Flat normalized lookup: already-lowercased, trimmed, punctuation-stripped
 * keys map to exact Devicon slug values.
 */
export const DEVICON_SLUGS: Record<string, string> = {
  // Web fundamentals
  javascript: 'javascript',
  typescript: 'typescript',
  html5: 'html5',
  html: 'html5',
  css3: 'css3',
  css: 'css3',
  sass: 'sass',
  scss: 'sass',

  // Frontend frameworks
  react: 'react',
  reactnative: 'react',
  nextjs: 'nextjs',
  vuejs: 'vuejs',
  vue: 'vuejs',
  angularjs: 'angularjs',
  angular: 'angularjs',
  svelte: 'svelte',
  tailwindcss: 'tailwindcss',
  tailwind: 'tailwindcss',
  bootstrap: 'bootstrap',

  // Backend / runtime
  nodejs: 'nodejs',
  express: 'express',
  nestjs: 'nestjs',
  python: 'python',
  django: 'django',
  fastapi: 'fastapi',
  flask: 'flask',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  java: 'java',
  csharp: 'csharp',
  dotnet: 'dotnetcore',
  php: 'php',
  ruby: 'ruby',
  rails: 'rails',
  swift: 'swift',
  kotlin: 'kotlin',
  dart: 'dart',
  flutter: 'flutter',

  // Databases
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  redis: 'redis',
  sqlite: 'sqlite',
  graphql: 'graphql',
  prisma: 'prisma',

  // DevOps / infra
  docker: 'docker',
  kubernetes: 'kubernetes',
  terraform: 'terraform',
  nginx: 'nginx',
  linux: 'linux',
  bash: 'bash',
  aws: 'amazonwebservices',
  amazonwebservices: 'amazonwebservices',
  azure: 'azure',
  googlecloud: 'googlecloud',
  gcp: 'googlecloud',

  // Version control / CI
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',

  // Build / test tooling
  webpack: 'webpack',
  vite: 'vitejs',
  vitejs: 'vitejs',
  jest: 'jest',
  vitest: 'vitest',

  // Design / editor
  figma: 'figma',
  blender: 'blender',
  vscode: 'vscode',
} as const;

// =============================================================================
// Alias Substitutions (applied after stripping punctuation)
// =============================================================================

/**
 * Post-strip alias map: normalized (stripped) form → normalized target.
 * Applied before the DEVICON_SLUGS lookup so that e.g. "node.js" → "nodejs".
 */
const ALIASES: Record<string, string> = {
  nodejs: 'nodejs',      // already normalized, kept for clarity
  nextjs: 'nextjs',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  tailwind: 'tailwindcss',
  vuejs: 'vuejs',
  reactnative: 'react',
  golang: 'go',
  dotnet: 'dotnet',
  gcp: 'googlecloud',
  mongo: 'mongodb',
  rails: 'rails',
  scss: 'sass',
  html: 'html5',
  css: 'css3',
  angular: 'angularjs',
  vitejs: 'vitejs',
};

// =============================================================================
// Exported Functions
// =============================================================================

/**
 * Resolves a skill name to its Devicon slug, or null if not found.
 *
 * Normalization pipeline:
 *   1. Lowercase + trim
 *   2. Strip all non-alphanumeric characters
 *   3. Apply alias substitutions
 *   4. Lookup in DEVICON_SLUGS
 *
 * @example
 *   getDeviconSlug('Next.js')  // → 'nextjs'
 *   getDeviconSlug('Postgres') // → 'postgresql'
 *   getDeviconSlug('tailwind') // → 'tailwindcss'
 *   getDeviconSlug('vue.js')   // → 'vuejs'
 *   getDeviconSlug('NotReal')  // → null
 */
export function getDeviconSlug(skillName: string): string | null {
  const stripped = skillName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const aliased = ALIASES[stripped] ?? stripped;
  return DEVICON_SLUGS[aliased] ?? null;
}

/**
 * Returns the CDN URL for the `-original.svg` variant of a Devicon slug.
 *
 * @example
 *   getDeviconUrl('react')
 *   // → 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg'
 */
export function getDeviconUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

/**
 * Returns the CDN URL for the `-plain.svg` variant of a Devicon slug.
 * Used as the first onError fallback when the original variant fails.
 */
export function getDeviconPlainUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-plain.svg`;
}
