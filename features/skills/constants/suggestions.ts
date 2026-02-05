/**
 * Skill Suggestions Constants
 *
 * Defines static skill progressions and smart suggestion rules
 * for the skill tree visualization.
 */

// =============================================================================
// Static Skill Progressions
// =============================================================================

/**
 * Predefined skill progression paths
 * Key: prerequisite skill (lowercase)
 * Value: array of suggested next skills
 */
export const SKILL_PROGRESSIONS: Record<string, string[]> = {
  // JavaScript ecosystem
  javascript: ['TypeScript', 'React', 'Node.js', 'Vue.js', 'Angular'],
  typescript: ['React', 'Node.js', 'NestJS', 'Next.js'],

  // React ecosystem
  react: ['Next.js', 'Redux', 'React Query', 'React Native', 'Remix'],
  'react native': ['Expo', 'React Navigation', 'Native Base', 'App Store Deployment'],
  nextjs: ['Vercel', 'Server Components', 'App Router'],

  // Vue ecosystem
  vue: ['Nuxt.js', 'Vuex', 'Pinia', 'Vue Router'],
  nuxt: ['Vue 3', 'Nitro', 'Nuxt Content'],
  'nuxt.js': ['Vue 3', 'Nitro', 'Nuxt Content'],

  // Angular ecosystem
  angular: ['RxJS', 'NgRx', 'Angular Material', 'NestJS'],

  // Node.js ecosystem
  nodejs: ['Express', 'NestJS', 'Fastify', 'GraphQL', 'MongoDB'],
  express: ['NestJS', 'Fastify', 'REST APIs', 'Middleware'],
  nestjs: ['TypeORM', 'Prisma', 'GraphQL', 'Microservices'],

  // Python ecosystem
  python: ['Django', 'FastAPI', 'Flask', 'Machine Learning', 'Data Science'],
  django: ['Django REST Framework', 'Celery', 'PostgreSQL'],
  fastapi: ['SQLAlchemy', 'Pydantic', 'Async Python'],

  // Database
  sql: ['PostgreSQL', 'MySQL', 'SQLite'],
  postgresql: ['PostGIS', 'pgAdmin', 'Database Design'],
  mongodb: ['Mongoose', 'MongoDB Atlas', 'Aggregation Pipeline'],
  prisma: ['PostgreSQL', 'MongoDB', 'Database Migrations'],

  // DevOps
  docker: ['Kubernetes', 'Docker Compose', 'CI/CD'],
  kubernetes: ['Helm', 'ArgoCD', 'Service Mesh'],
  'ci/cd': ['GitHub Actions', 'Jenkins', 'GitLab CI'],
  aws: ['EC2', 'S3', 'Lambda', 'CloudFormation', 'ECS'],
  gcp: ['Cloud Run', 'Cloud Functions', 'BigQuery'],
  azure: ['Azure Functions', 'Azure DevOps', 'AKS'],

  // Frontend fundamentals
  html: ['CSS', 'JavaScript', 'Accessibility', 'SEO'],
  css: ['Sass', 'Tailwind CSS', 'CSS Modules', 'Styled Components'],
  'tailwind css': ['Headless UI', 'Radix UI', 'shadcn/ui'],
  tailwindcss: ['Headless UI', 'Radix UI', 'shadcn/ui'],

  // Testing
  testing: ['Jest', 'Cypress', 'Playwright', 'Vitest'],
  jest: ['React Testing Library', 'Mock Service Worker', 'Code Coverage'],
  cypress: ['E2E Testing', 'Component Testing', 'Cypress Cloud'],
  playwright: ['E2E Testing', 'Visual Testing', 'API Testing'],

  // API & GraphQL
  'rest api': ['OpenAPI', 'Swagger', 'API Versioning'],
  'rest apis': ['OpenAPI', 'Swagger', 'API Versioning'],
  graphql: ['Apollo', 'GraphQL Code Generator', 'Relay'],

  // Mobile
  flutter: ['Dart', 'Firebase', 'Mobile UI/UX'],
  swift: ['SwiftUI', 'Combine', 'iOS Development'],
  kotlin: ['Jetpack Compose', 'Android Development', 'Coroutines'],

  // Data & AI
  'machine learning': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Deep Learning'],
  'data science': ['Pandas', 'NumPy', 'Jupyter', 'Data Visualization'],
  ai: ['Large Language Models', 'Prompt Engineering', 'RAG'],
};

// =============================================================================
// Skill Pairing Rules
// =============================================================================

/**
 * Skills that commonly go together
 * If user has any skill from the array, suggest the others
 */
export const SKILL_PAIRINGS: string[][] = [
  // Frontend stack
  ['HTML', 'CSS', 'JavaScript'],
  ['React', 'TypeScript', 'Tailwind CSS'],
  ['Next.js', 'React', 'TypeScript'],
  ['Vue.js', 'TypeScript', 'Pinia'],

  // Backend stack
  ['Node.js', 'Express', 'MongoDB'],
  ['Python', 'Django', 'PostgreSQL'],
  ['TypeScript', 'NestJS', 'Prisma'],

  // Full stack
  ['React', 'Node.js', 'MongoDB'],
  ['Next.js', 'Prisma', 'PostgreSQL'],
  ['Vue.js', 'Nuxt.js', 'Supabase'],

  // DevOps essentials
  ['Docker', 'Kubernetes', 'CI/CD'],
  ['AWS', 'Terraform', 'Linux'],
  ['Git', 'GitHub Actions', 'Docker'],

  // Testing trinity
  ['Jest', 'React Testing Library', 'Cypress'],
  ['Vitest', 'Playwright', 'Mock Service Worker'],

  // Data engineering
  ['Python', 'SQL', 'Pandas'],
  ['Machine Learning', 'Python', 'TensorFlow'],
];

// =============================================================================
// Category-based Suggestions
// =============================================================================

/**
 * Starter suggestions by category
 * Shown when user has no skills in a category
 */
export const CATEGORY_STARTERS: Record<string, string[]> = {
  core: ['JavaScript', 'TypeScript', 'Git', 'Linux'],
  frontend: ['React', 'Vue.js', 'CSS', 'Tailwind CSS'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
  devops: ['Docker', 'CI/CD', 'AWS', 'Linux'],
  design: ['Figma', 'UI/UX Design', 'Design Systems'],
  'soft-skills': ['Communication', 'Problem Solving', 'Leadership', 'Teamwork'],
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get suggested skills based on user's existing skills
 */
export function getSmartSuggestions(existingSkillNames: string[]): string[] {
  const suggestions = new Set<string>();
  const existingLower = existingSkillNames.map((s) => s.toLowerCase());

  // Get progression-based suggestions
  for (const skillName of existingLower) {
    const progressions = SKILL_PROGRESSIONS[skillName] ?? [];
    for (const suggestion of progressions) {
      if (!existingLower.includes(suggestion.toLowerCase())) {
        suggestions.add(suggestion);
      }
    }
  }

  // Get pairing-based suggestions
  for (const pairing of SKILL_PAIRINGS) {
    const pairingLower = pairing.map((s) => s.toLowerCase());
    const hasAny = pairingLower.some((s) => existingLower.includes(s));
    if (hasAny) {
      for (const skill of pairing) {
        if (!existingLower.includes(skill.toLowerCase())) {
          suggestions.add(skill);
        }
      }
    }
  }

  return Array.from(suggestions).slice(0, 10);
}

/**
 * Get starter suggestions for a category
 */
export function getCategoryStarterSuggestions(
  categorySlug: string,
  existingSkillNames: string[]
): string[] {
  const existingLower = existingSkillNames.map((s) => s.toLowerCase());
  const starters = CATEGORY_STARTERS[categorySlug] ?? [];

  return starters.filter((skill) => !existingLower.includes(skill.toLowerCase()));
}

/**
 * Get direct progression suggestions for a specific skill
 */
export function getSkillProgressions(skillName: string): string[] {
  return SKILL_PROGRESSIONS[skillName.toLowerCase()] ?? [];
}
