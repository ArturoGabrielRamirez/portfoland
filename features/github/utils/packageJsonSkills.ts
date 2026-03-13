/**
 * Package JSON Skills Extractor
 *
 * Pure utility — no API calls, no DB writes.
 * Maps npm package names from a package.json to known Portfoland skill names/categories.
 * Used by the GitHub sync flow to enrich skill detection beyond raw language bytes.
 */

// =============================================================================
// Package → Skill Mapping
// =============================================================================

/**
 * Known npm package names and their corresponding skill metadata.
 * Keys are exact npm package names (lowercase).
 * Values provide the human-readable skill name and its Portfoland category slug.
 */
const PACKAGE_TO_SKILL: Record<string, { name: string; category: string }> = {
  // Frontend frameworks
  react: { name: 'React', category: 'frontend' },
  next: { name: 'Next.js', category: 'frontend' },
  'next.js': { name: 'Next.js', category: 'frontend' },
  nextjs: { name: 'Next.js', category: 'frontend' },
  vue: { name: 'Vue.js', category: 'frontend' },
  nuxt: { name: 'Nuxt.js', category: 'frontend' },
  '@angular/core': { name: 'Angular', category: 'frontend' },
  svelte: { name: 'Svelte', category: 'frontend' },
  '@sveltejs/kit': { name: 'SvelteKit', category: 'frontend' },
  solid: { name: 'SolidJS', category: 'frontend' },
  'solid-js': { name: 'SolidJS', category: 'frontend' },

  // Core languages (imply usage even if repo lang bytes miss them)
  typescript: { name: 'TypeScript', category: 'core' },

  // Backend frameworks
  express: { name: 'Express.js', category: 'backend' },
  fastify: { name: 'Fastify', category: 'backend' },
  '@nestjs/core': { name: 'NestJS', category: 'backend' },
  nestjs: { name: 'NestJS', category: 'backend' },
  hono: { name: 'Hono', category: 'backend' },
  'koa': { name: 'Koa', category: 'backend' },

  // ORMs / DB clients
  prisma: { name: 'Prisma', category: 'backend' },
  '@prisma/client': { name: 'Prisma', category: 'backend' },
  'drizzle-orm': { name: 'Drizzle ORM', category: 'backend' },
  mongoose: { name: 'MongoDB', category: 'backend' },
  pg: { name: 'PostgreSQL', category: 'backend' },
  mysql2: { name: 'MySQL', category: 'backend' },
  redis: { name: 'Redis', category: 'backend' },
  ioredis: { name: 'Redis', category: 'backend' },
  '@upstash/redis': { name: 'Redis', category: 'backend' },
  knex: { name: 'Knex.js', category: 'backend' },
  sequelize: { name: 'Sequelize', category: 'backend' },

  // API patterns
  graphql: { name: 'GraphQL', category: 'backend' },
  'apollo-server': { name: 'GraphQL', category: 'backend' },
  '@apollo/server': { name: 'GraphQL', category: 'backend' },
  '@apollo/client': { name: 'GraphQL', category: 'frontend' },
  '@trpc/server': { name: 'tRPC', category: 'backend' },
  trpc: { name: 'tRPC', category: 'backend' },

  // CSS / styling
  tailwindcss: { name: 'Tailwind CSS', category: 'frontend' },
  'styled-components': { name: 'Styled Components', category: 'frontend' },
  sass: { name: 'Sass', category: 'frontend' },
  '@emotion/react': { name: 'Emotion', category: 'frontend' },
  'postcss': { name: 'PostCSS', category: 'frontend' },

  // Testing
  jest: { name: 'Jest', category: 'backend' },
  vitest: { name: 'Vitest', category: 'backend' },
  cypress: { name: 'Cypress', category: 'backend' },
  '@playwright/test': { name: 'Playwright', category: 'backend' },
  playwright: { name: 'Playwright', category: 'backend' },
  mocha: { name: 'Mocha', category: 'backend' },

  // Build tools / bundlers
  webpack: { name: 'Webpack', category: 'devops' },
  vite: { name: 'Vite', category: 'devops' },
  turbo: { name: 'Turborepo', category: 'devops' },
  turborepo: { name: 'Turborepo', category: 'devops' },
  esbuild: { name: 'esbuild', category: 'devops' },
  rollup: { name: 'Rollup', category: 'devops' },

  // DevOps / infra
  docker: { name: 'Docker', category: 'devops' },

  // Validation / schema
  zod: { name: 'Zod', category: 'backend' },
  yup: { name: 'Yup', category: 'backend' },
  joi: { name: 'Joi', category: 'backend' },

  // HTTP / network
  axios: { name: 'Axios', category: 'frontend' },
  'socket.io': { name: 'Socket.io', category: 'backend' },

  // Payments
  stripe: { name: 'Stripe', category: 'backend' },

  // 3D / data viz
  three: { name: 'Three.js', category: 'frontend' },
  '@react-three/fiber': { name: 'Three.js', category: 'frontend' },
  'd3': { name: 'D3.js', category: 'frontend' },

  // Animation
  'framer-motion': { name: 'Framer Motion', category: 'frontend' },
  gsap: { name: 'GSAP', category: 'frontend' },

  // Reactive / state
  rxjs: { name: 'RxJS', category: 'frontend' },
  zustand: { name: 'Zustand', category: 'frontend' },
  jotai: { name: 'Jotai', category: 'frontend' },
  redux: { name: 'Redux', category: 'frontend' },
  '@reduxjs/toolkit': { name: 'Redux', category: 'frontend' },
  '@tanstack/react-query: ': { name: 'React Query', category: 'frontend' },
  '@tanstack/react-query': { name: 'React Query', category: 'frontend' },
  swr: { name: 'SWR', category: 'frontend' },
  'react-query': { name: 'React Query', category: 'frontend' },

  // Auth
  'next-auth': { name: 'NextAuth.js', category: 'backend' },
  'better-auth': { name: 'Better Auth', category: 'backend' },
  passport: { name: 'Passport.js', category: 'backend' },

  // CMS / content
  '@sanity/client': { name: 'Sanity', category: 'backend' },
  contentful: { name: 'Contentful', category: 'backend' },
  '@contentlayer/core': { name: 'Contentlayer', category: 'backend' },

  // Mobile
  'react-native': { name: 'React Native', category: 'frontend' },
  expo: { name: 'Expo', category: 'frontend' },

  // Cloud SDKs
  '@aws-sdk/client-s3': { name: 'AWS', category: 'devops' },
  '@aws-sdk/client-dynamodb': { name: 'AWS', category: 'devops' },
  firebase: { name: 'Firebase', category: 'backend' },
  'firebase-admin': { name: 'Firebase', category: 'backend' },
  '@supabase/supabase-js': { name: 'Supabase', category: 'backend' },

  // ML / AI
  openai: { name: 'OpenAI', category: 'backend' },
  '@anthropic-ai/sdk': { name: 'Anthropic', category: 'backend' },
  tensorflow: { name: 'TensorFlow.js', category: 'backend' },
  '@tensorflow/tfjs': { name: 'TensorFlow.js', category: 'backend' },
  'ai': { name: 'Vercel AI SDK', category: 'backend' },
}

// =============================================================================
// Public Function
// =============================================================================

/**
 * Extracted skill candidate shape — no DB IDs, just names and categories.
 */
export interface PackageSkillCandidate {
  name: string
  /** Portfoland category slug (e.g. 'frontend', 'backend', 'devops', 'core') */
  category: string
}

/**
 * Extracts recognised skills from a parsed package.json object.
 *
 * Merges `dependencies` and `devDependencies`, looks each package name up in
 * `PACKAGE_TO_SKILL`, and returns a deduplicated list ordered by name.
 * Unknown packages are silently skipped.
 *
 * @param packageJson - A parsed package.json object (any shape — extra fields are ignored)
 * @returns Deduplicated array of skill candidates found in the manifest
 */
export function extractSkillsFromPackageJson(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageJson: Record<string, any>
): PackageSkillCandidate[] {
  const deps: Record<string, string> = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }

  const seenNames = new Set<string>()
  const result: PackageSkillCandidate[] = []

  for (const pkgName of Object.keys(deps)) {
    const mapping = PACKAGE_TO_SKILL[pkgName]
    if (!mapping) continue

    if (seenNames.has(mapping.name)) continue
    seenNames.add(mapping.name)

    result.push({ name: mapping.name, category: mapping.category })
  }

  // Sort alphabetically by skill name for deterministic output
  return result.sort((a, b) => a.name.localeCompare(b.name))
}
