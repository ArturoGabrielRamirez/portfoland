/**
 * Read Tools
 *
 * Read-only tool definitions that let the AI fetch portfolio data on demand.
 * Each tool uses the Vercel AI SDK `tool()` function with Zod parameter schemas.
 */

import { tool, generateObject } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getProjectsByUserIdData } from '@/features/projects/data/getProjectsByUserId.data'
import { getExperiencesByUserId } from '@/features/timeline/data/getExperiences.data'
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data'
import { getAssessmentHistoryData } from '@/features/assessment/data/getAssessmentHistory.data'
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data'

// =============================================================================
// Individual Tool Factories
// =============================================================================

function createGetProjectsTool(userId: string) {
  return tool({
    description: "Retrieves all user projects with details including title, description, technologies, status, and links.",
    parameters: z.object({
      reason: z.string().describe('Why you need the projects data'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_projects')
      try {
        const projects = await getProjectsByUserIdData(userId)
        return projects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          technologies: p.technologies,
          status: p.status,
          featured: p.featured,
          links: p.links,
        }))
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_projects):', err)
        return { error: 'Failed to retrieve projects' }
      }
    },
  })
}

function createGetExperiencesTool(userId: string) {
  return tool({
    description: "Retrieves all user work experiences with descriptions, dates, types, and aggregated stats.",
    parameters: z.object({
      reason: z.string().describe('Why you need the experiences data'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_experiences')
      try {
        const data = await getExperiencesByUserId(userId)
        return {
          experiences: data.experiences.map(e => ({
            id: e.id,
            type: e.type,
            title: e.title,
            company: e.company,
            description: e.description,
            startDate: e.startDate,
            endDate: e.endDate,
          })),
          stats: data.stats,
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_experiences):', err)
        return { error: 'Failed to retrieve experiences' }
      }
    },
  })
}

function createGetProfileTool(userId: string) {
  return tool({
    description: "Retrieves the user's profile data including bio, name, image, username, contact links, and portfolio settings.",
    parameters: z.object({
      reason: z.string().describe('Why you need the profile data'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_profile')
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            bio: true,
            image: true,
            username: true,
            email: true,
            portfolioMode: true,
            contactLinks: true,
            sectionVisibility: true,
            sectionOrder: true,
          },
        })
        if (!user) return { error: 'User not found' }
        return user
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_profile):', err)
        return { error: 'Failed to retrieve profile' }
      }
    },
  })
}

function createGetGitHubDataTool(userId: string) {
  return tool({
    description: "Retrieves the user's GitHub connection status, sync date, and repository/language stats.",
    parameters: z.object({
      reason: z.string().describe('Why you need the GitHub data'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_github_data')
      try {
        const status = await getGitHubConnectionStatus(userId)
        return {
          isConnected: status.isConnected,
          syncedAt: status.syncedAt,
          stats: status.stats,
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_github_data):', err)
        return { error: 'Failed to retrieve GitHub data' }
      }
    },
  })
}

function createGetAssessmentHistoryTool(userId: string) {
  return tool({
    description: "Retrieves per-skill assessment results with best scores and attempt counts.",
    parameters: z.object({
      reason: z.string().describe('Why you need the assessment history'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_assessment_history')
      try {
        const history = await getAssessmentHistoryData(userId)
        return history
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_assessment_history):', err)
        return { error: 'Failed to retrieve assessment history' }
      }
    },
  })
}

function createGetPortfolioHealthTool(userId: string) {
  return tool({
    description: "Computes a portfolio health score (0-100) and returns specific improvement suggestions.",
    parameters: z.object({
      reason: z.string().describe('Why you need the portfolio health check'),
    }),
    execute: async () => {
      logger.debug('TOOL: get_portfolio_health')
      try {
        const [user, counts] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { bio: true, image: true, username: true },
          }),
          prisma.$transaction([
            prisma.userSkill.count({ where: { userId } }),
            prisma.project.count({ where: { userId } }),
            prisma.experience.count({ where: { userId } }),
            prisma.account.count({ where: { userId, providerId: 'github' } }),
            prisma.skillAssessment.count({ where: { userId, status: 'PASSED' } }),
          ]),
        ])

        const [skillCount, projectCount, experienceCount, githubCount, assessmentsPassed] = counts
        const hasBio = !!user?.bio
        const hasImage = !!user?.image
        const hasUsername = !!user?.username
        const hasGitHub = githubCount > 0

        // Weighted score
        let score = 0
        const suggestions: string[] = []

        if (hasBio) { score += 15 } else { suggestions.push('Add a bio to improve your portfolio') }
        if (hasImage) { score += 10 } else { suggestions.push('Upload a profile image') }
        if (hasUsername) { score += 10 } else { suggestions.push('Set a username for your public portfolio URL') }
        if (skillCount >= 5) { score += 15 } else { suggestions.push(`Add more skills (${skillCount}/5 minimum)`) }
        if (projectCount >= 2) { score += 15 } else { suggestions.push(`Add more projects (${projectCount}/2 minimum)`) }
        if (experienceCount >= 1) { score += 10 } else { suggestions.push('Add at least one work experience') }
        if (hasGitHub) { score += 10 } else { suggestions.push('Connect GitHub for skill validation') }
        if (assessmentsPassed >= 1) { score += 15 } else { suggestions.push('Pass at least one skill assessment') }

        return { score, suggestions }
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_portfolio_health):', err)
        return { error: 'Failed to compute portfolio health' }
      }
    },
  })
}

function createSuggestLearningPathTool(userId: string) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  return tool({
    description: "Suggest learning resources, related technologies, and next-level guidance for a specific skill. Use when the user asks how to improve or learn a skill.",
    parameters: z.object({
      skillName: z.string().describe("The skill to get improvement suggestions for (e.g., 'React', 'TypeScript')"),
      locale: z.string().optional().describe("Language for suggestions: 'en' or 'es'"),
    }),
    execute: async ({ skillName, locale = 'en' }) => {
      logger.debug('TOOL: suggest_learning_path', { skillName })
      try {
        const userSkills = await getUserSkillsData(userId)
        const matchedSkill = userSkills.find(
          us => us.skill.name.toLowerCase() === skillName.toLowerCase()
        )
        const skillLevel = matchedSkill ? (matchedSkill.level ?? 3) : 3
        const category = matchedSkill?.skill?.category?.name ?? 'General'
        const userSkillNames = userSkills.map(us => us.skill.name)

        const prompt = locale === 'es'
          ? `Sugiere recursos de aprendizaje y habilidades relacionadas para alguien con nivel ${skillLevel}/5 en ${skillName} (categoría: ${category}). Habilidades actuales del usuario: ${userSkillNames.join(', ')}. No sugieras habilidades que ya tiene. Genera 3-4 recursos realistas.`
          : `Suggest learning resources and related skills for someone at level ${skillLevel}/5 in ${skillName} (category: ${category}). User's current skills: ${userSkillNames.join(', ')}. Do not suggest skills they already have. Generate 3-4 realistic resources with real URLs.`

        const result = await generateObject({
          model: google('gemini-2.0-flash'),
          prompt,
          schema: z.object({
            nextLevelFocus: z.string(),
            relatedSkills: z.array(z.object({
              name: z.string(),
              reason: z.string(),
            })).max(4),
            resources: z.array(z.object({
              title: z.string(),
              type: z.enum(['video', 'article', 'course', 'documentation', 'practice']),
              url: z.string(),
              duration: z.string(),
              cost: z.enum(['free', 'paid']),
            })).max(4),
          }),
        })

        return {
          skill: skillName,
          currentLevel: skillLevel,
          nextLevelFocus: result.object.nextLevelFocus,
          relatedSkills: result.object.relatedSkills,
          resources: result.object.resources,
          tip: `Visit /dashboard/skills and click on ${skillName} to open the full Enhancement panel with add buttons for related skills.`,
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (suggest_learning_path):', err)
        return { error: 'Failed to generate suggestions', details: err.message }
      }
    },
  })
}

// =============================================================================
// Grouped Exports
// =============================================================================

/** Base read tools - always available */
export function baseReadTools(userId: string) {
  return {
    get_profile: createGetProfileTool(userId),
    get_portfolio_health: createGetPortfolioHealthTool(userId),
  }
}

/** Project page tools */
export function projectPageTools(userId: string) {
  return {
    get_projects: createGetProjectsTool(userId),
  }
}

/** Timeline page tools */
export function timelinePageTools(userId: string) {
  return {
    get_experiences: createGetExperiencesTool(userId),
  }
}

/** General read tools - GitHub and assessment data for non-specialized pages */
export function generalReadTools(userId: string) {
  return {
    get_github_data: createGetGitHubDataTool(userId),
    get_assessment_history: createGetAssessmentHistoryTool(userId),
  }
}

/** All read tools - used for dashboard overview */
export function allReadTools(userId: string) {
  return {
    get_profile: createGetProfileTool(userId),
    get_portfolio_health: createGetPortfolioHealthTool(userId),
    get_projects: createGetProjectsTool(userId),
    get_experiences: createGetExperiencesTool(userId),
    get_github_data: createGetGitHubDataTool(userId),
    get_assessment_history: createGetAssessmentHistoryTool(userId),
    suggest_learning_path: createSuggestLearningPathTool(userId),
  }
}
