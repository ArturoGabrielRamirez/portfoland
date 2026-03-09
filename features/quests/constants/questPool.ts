/**
 * Quest Pool
 *
 * Static array of 15 quest templates. The pool is NOT stored in the DB —
 * it is a hardcoded constant. The questId in UserQuest references QuestTemplate.id.
 */

import type { QuestTemplate } from '../types/quest'

// =============================================================================
// Quest Pool
// =============================================================================

export const QUEST_POOL: QuestTemplate[] = [
  // --- Portfolio Completion (one-time) ---
  {
    id: 'add_bio',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 100,
    difficulty: 'easy',
    condition: 'has_bio',
    title: {
      en: 'Write your bio',
      es: 'Escribe tu bio',
    },
    description: {
      en: 'Add a professional bio to your profile.',
      es: 'Agrega una bio profesional a tu perfil.',
    },
  },
  {
    id: 'add_5_skills',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 150,
    difficulty: 'medium',
    condition: 'has_5_skills',
    title: {
      en: 'Add 5 skills',
      es: 'Agrega 5 skills',
    },
    description: {
      en: 'Add at least 5 skills to your skill tree.',
      es: 'Agrega al menos 5 skills a tu arbol de habilidades.',
    },
  },
  {
    id: 'add_project',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 100,
    difficulty: 'easy',
    condition: 'has_project',
    title: {
      en: 'Add your first project',
      es: 'Agrega tu primer proyecto',
    },
    description: {
      en: 'Showcase at least one project in your portfolio.',
      es: 'Muestra al menos un proyecto en tu portfolio.',
    },
  },
  {
    id: 'add_3_projects',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 200,
    difficulty: 'medium',
    condition: 'has_3_projects',
    title: {
      en: 'Add 3 projects',
      es: 'Agrega 3 proyectos',
    },
    description: {
      en: 'Showcase 3 or more projects to strengthen your portfolio.',
      es: 'Muestra 3 o mas proyectos para fortalecer tu portfolio.',
    },
  },
  {
    id: 'add_experience',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 100,
    difficulty: 'easy',
    condition: 'has_experience',
    title: {
      en: 'Add work experience',
      es: 'Agrega experiencia laboral',
    },
    description: {
      en: 'Add at least one work experience to your timeline.',
      es: 'Agrega al menos una experiencia laboral a tu linea de tiempo.',
    },
  },
  // --- Skill Validation (one-time) ---
  {
    id: 'connect_github',
    type: 'one_time',
    category: 'skill_validation',
    xpReward: 200,
    difficulty: 'medium',
    condition: 'has_github',
    title: {
      en: 'Connect GitHub',
      es: 'Conecta GitHub',
    },
    description: {
      en: 'Link your GitHub account to validate skills.',
      es: 'Vincula tu cuenta de GitHub para validar skills.',
    },
  },
  {
    id: 'take_assessment',
    type: 'one_time',
    category: 'skill_validation',
    xpReward: 300,
    difficulty: 'hard',
    condition: 'has_passed_assessment',
    title: {
      en: 'Pass a skill assessment',
      es: 'Pasa una evaluacion de skill',
    },
    description: {
      en: 'Complete and pass an AI-powered skill assessment.',
      es: 'Completa y aprueba una evaluacion de skill con IA.',
    },
  },
  // --- Content Improvement (daily) ---
  {
    id: 'improve_bio',
    type: 'daily',
    category: 'content_improvement',
    xpReward: 50,
    difficulty: 'easy',
    condition: 'bio_improved_today',
    title: {
      en: 'Improve your bio',
      es: 'Mejora tu bio',
    },
    description: {
      en: 'Update or refine your professional bio today.',
      es: 'Actualiza o mejora tu bio profesional hoy.',
    },
  },
  {
    id: 'improve_project_desc',
    type: 'daily',
    category: 'content_improvement',
    xpReward: 50,
    difficulty: 'easy',
    condition: 'project_desc_improved_today',
    title: {
      en: 'Improve a project description',
      es: 'Mejora una descripcion de proyecto',
    },
    description: {
      en: 'Enhance the description of one of your projects today.',
      es: 'Mejora la descripcion de uno de tus proyectos hoy.',
    },
  },
  // --- Exploration (daily) ---
  {
    id: 'visit_cv_page',
    type: 'daily',
    category: 'exploration',
    xpReward: 50,
    difficulty: 'easy',
    condition: 'visited_cv_today',
    title: {
      en: 'Visit the CV Generator',
      es: 'Visita el Generador de CV',
    },
    description: {
      en: 'Explore the CV Generator and see how to create tailored CVs.',
      es: 'Explora el Generador de CV y aprende a crear CVs personalizados.',
    },
  },
  // --- Portfolio Completion (weekly) ---
  {
    id: 'generate_cv',
    type: 'weekly',
    category: 'portfolio_completion',
    xpReward: 200,
    difficulty: 'medium',
    condition: 'generated_cv_this_week',
    title: {
      en: 'Generate a CV this week',
      es: 'Genera un CV esta semana',
    },
    description: {
      en: 'Create a tailored CV for a specific job target.',
      es: 'Crea un CV personalizado para un puesto especifico.',
    },
  },
  // --- Skill Validation (weekly) ---
  {
    id: 'github_sync',
    type: 'weekly',
    category: 'skill_validation',
    xpReward: 150,
    difficulty: 'medium',
    condition: 'synced_github_this_week',
    title: {
      en: 'Sync GitHub this week',
      es: 'Sincroniza GitHub esta semana',
    },
    description: {
      en: 'Sync your GitHub account to validate and update your skills.',
      es: 'Sincroniza tu cuenta de GitHub para validar y actualizar tus skills.',
    },
  },
  // --- Consistency (one-time) ---
  {
    id: 'login_streak_3',
    type: 'one_time',
    category: 'consistency',
    xpReward: 100,
    difficulty: 'easy',
    condition: 'streak_3',
    title: {
      en: '3-day login streak',
      es: 'Racha de 3 dias',
    },
    description: {
      en: 'Log in for 3 consecutive days to build momentum.',
      es: 'Inicia sesion 3 dias consecutivos para mantener el ritmo.',
    },
  },
  {
    id: 'login_streak_7',
    type: 'one_time',
    category: 'consistency',
    xpReward: 200,
    difficulty: 'medium',
    condition: 'streak_7',
    title: {
      en: '7-day login streak',
      es: 'Racha de 7 dias',
    },
    description: {
      en: 'Log in for 7 consecutive days — a full week of commitment.',
      es: 'Inicia sesion 7 dias consecutivos — una semana completa de dedicacion.',
    },
  },
  // --- Portfolio Completion (one-time hard) ---
  {
    id: 'complete_portfolio',
    type: 'one_time',
    category: 'portfolio_completion',
    xpReward: 300,
    difficulty: 'hard',
    condition: 'portfolio_80_percent',
    title: {
      en: 'Complete your portfolio (80%)',
      es: 'Completa tu portfolio (80%)',
    },
    description: {
      en: 'Reach 80% portfolio completeness: bio, skills, projects, experience, and GitHub.',
      es: 'Alcanza el 80% de completitud del portfolio: bio, skills, proyectos, experiencia y GitHub.',
    },
  },
]

// =============================================================================
// Filtered Subsets
// =============================================================================

export const DAILY_TEMPLATES: QuestTemplate[] = QUEST_POOL.filter(
  (t) => t.type === 'daily'
)

export const WEEKLY_TEMPLATES: QuestTemplate[] = QUEST_POOL.filter(
  (t) => t.type === 'weekly'
)

export const ONE_TIME_TEMPLATES: QuestTemplate[] = QUEST_POOL.filter(
  (t) => t.type === 'one_time'
)

// =============================================================================
// Helpers
// =============================================================================

/**
 * Find a quest template by its stable ID.
 *
 * @param id - The QuestTemplate.id string (e.g. 'add_bio')
 * @returns The matching template or undefined
 */
export function getTemplateById(id: string): QuestTemplate | undefined {
  return QUEST_POOL.find((t) => t.id === id)
}
