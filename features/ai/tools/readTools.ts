/**
 * Read Tools
 *
 * Read-only tool definitions that let the AI fetch portfolio data on demand.
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
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
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
        })) as any
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
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
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
        } as any
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_experiences):', err)
        return { error: 'Failed to retrieve experiences' } as any
      }
    },
  })
}

function createGetProfileTool(userId: string) {
  return tool({
    description: "Retrieves the user's profile data including bio, name, image, username, contact links, and portfolio settings.",
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
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
        if (!user) return { error: 'User not found' } as any
        return user as any
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_profile):', err)
        return { error: 'Failed to retrieve profile' } as any
      }
    },
  })
}

function createGetGitHubDataTool(userId: string) {
  return tool({
    description: "Retrieves the user's GitHub connection status, sync date, and repository/language stats.",
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
      logger.debug('TOOL: get_github_data')
      try {
        const status = await getGitHubConnectionStatus(userId)
        return {
          isConnected: status.isConnected,
          syncedAt: status.syncedAt,
          stats: status.stats,
        } as any
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_github_data):', err)
        return { error: 'Failed to retrieve GitHub data' } as any
      }
    },
  })
}

function createGetAssessmentHistoryTool(userId: string) {
  return tool({
    description: "Retrieves per-skill assessment results with best scores and attempt counts.",
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
      logger.debug('TOOL: get_assessment_history')
      try {
        const history = await getAssessmentHistoryData(userId)
        return history as any
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_assessment_history):', err)
        return { error: 'Failed to retrieve assessment history' } as any
      }
    },
  })
}

function createGetPortfolioHealthTool(userId: string) {
  return tool({
    description: "Computes a portfolio health score (0-100) and returns specific improvement suggestions.",
    parameters: z.object({ reason: z.string().describe('Why you need this data') }),
    execute: async (_args) => {
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

        return {
          score,
          suggestions,
          _ai_instruction: "MUST DO: Respond to the user by summarizing this health score and suggestions briefly."
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (get_portfolio_health):', err)
        return { error: 'Failed to compute portfolio health' } as any
      }
    },
  })
}

function createSuggestSkillPathTool(userId: string) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  return tool({
    description: "Suggest a learning path, resources, and highlight related skills on the tree. Use when the user asks what to learn, how to improve, or for role-based guidance.",
    parameters: z.object({
      skillName: z.string().optional().describe("Specific skill to research (e.g., 'React')"),
      targetRole: z.string().optional().describe("Target career role (e.g., 'AI Expert', 'Frontend Dev')"),
      skillsToHighlight: z.array(z.string()).optional().describe("List of exact skill names to highlight"),
      reasoning: z.string().describe("Why you are suggesting this path"),
      locale: z.string().optional(),
    }),
    execute: async ({ skillName, targetRole, skillsToHighlight, locale = 'en' }) => {
      logger.debug('TOOL: suggest_skill_path', { skillName, targetRole, skillsToHighlight })
      try {
        const userSkills = await getUserSkillsData(userId)
        const userSkillNames = userSkills.map(us => us.skill.name)

        let nextLevelFocus = ''
        let relatedSkills: any[] = []
        let resources: any[] = []

        // If we have a specific context to research, call the LLM
        // If everything is undefined, use a default targetRole based on locale
        const effectiveRole = targetRole || (skillName ? undefined : (locale === 'es' ? 'Experto en IA / Desarrollo' : 'AI Expert / Developer'));

        if (skillName || effectiveRole) {
          const matchedSkill = skillName
            ? userSkills.find(us => us.skill.name.toLowerCase() === skillName.toLowerCase())
            : null

          const skillLevel = matchedSkill ? (matchedSkill.level ?? 3) : 3

          const prompt = locale === 'es'
            ? `Sugiere un camino de aprendizaje para ${effectiveRole || skillName}. Nivel actual en ${skillName || 'tema'}: ${skillLevel}/5. Skills actuales: ${userSkillNames.join(', ')}. No sugieras lo que ya tiene. Genera 3-4 recursos y 3-4 skills relacionadas.`
            : `Suggest a learning path for ${effectiveRole || skillName}. Current level in ${skillName || 'topic'}: ${skillLevel}/5. Current skills: ${userSkillNames.join(', ')}. Do not suggest what they already have. Generate 3-4 resources and 3-4 related skills.`;

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

          nextLevelFocus = result.object.nextLevelFocus
          relatedSkills = result.object.relatedSkills
          resources = result.object.resources
        }

        // Combine manually provided highlights with AI suggestions
        const finalHighlights = [
          ...(skillsToHighlight || []),
          ...relatedSkills.map(s => s.name)
        ]

        return {
          success: true,
          targetRole,
          skill: skillName,
          nextLevelFocus: nextLevelFocus || (locale === 'es' ? 'Sigue explorando estas áreas' : 'Keep exploring these areas'),
          relatedSkills,
          resources,
          skillsToLearn: Array.from(new Set(finalHighlights)), // Backward compatible name for client interception
          tip: locale === 'es'
            ? `Visita /dashboard/skills y haz clic en las habilidades resaltadas para ver detalles.`
            : `Visit /dashboard/skills and click on highlighted skills for more details.`,
          _ai_instruction: locale === 'es'
            ? "MUST DO: Responde al usuario narrando los resultados de este tool con entusiasmo y brevedad."
            : "MUST DO: Respond to the user by narrating the findings of this tool with enthusiasm and brevity."
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (suggest_skill_path):', err)
        return { error: 'Failed to generate path', details: err.message } as any
      }
    },
  })
}

// =============================================================================
// Grouped Exports
// =============================================================================

export function baseReadTools(userId: string) {
  return {
    get_profile: createGetProfileTool(userId),
    get_portfolio_health: createGetPortfolioHealthTool(userId),
  }
}

export function projectPageTools(userId: string) {
  return {
    get_projects: createGetProjectsTool(userId),
  }
}

export function timelinePageTools(userId: string) {
  return {
    get_experiences: createGetExperiencesTool(userId),
  }
}

export function generalReadTools(userId: string) {
  return {
    get_github_data: createGetGitHubDataTool(userId),
    get_assessment_history: createGetAssessmentHistoryTool(userId),
  }
}

export function allReadTools(userId: string) {
  return {
    get_profile: createGetProfileTool(userId),
    get_portfolio_health: createGetPortfolioHealthTool(userId),
    get_projects: createGetProjectsTool(userId),
    get_experiences: createGetExperiencesTool(userId),
    get_github_data: createGetGitHubDataTool(userId),
    get_assessment_history: createGetAssessmentHistoryTool(userId),
    suggest_skill_path: createSuggestSkillPathTool(userId),
  }
}
