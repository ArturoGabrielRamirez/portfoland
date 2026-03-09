/**
 * AI Tool Registry
 *
 * Barrel export for all AI tools and the registry builder.
 * All tools are available on every page — pageContext only affects the system
 * prompt (proactive suggestions), not tool availability. This gives users
 * full AI capabilities regardless of which dashboard page they're on.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createExperienceService } from '@/features/timeline/services/experience.service'
import { createSkillService } from '@/features/skills/services/skill.service'
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data'
import { getSelfAssessmentLevel, hasGitHubValidation } from '@/features/skills/types/skill'
import { allReadTools } from './readTools'
import {
  baseWriteTools,
  projectWriteTools,
  timelineWriteTools,
  skillWriteTools,
  cvWriteTools,
} from './writeTools'

// =============================================================================
// Existing Tools (extracted from app/api/chat/route.ts)
// =============================================================================

/**
 * The 4 original tools that were inline in the chat route.
 * Extracted here without changing behavior.
 */
export function existingTools(userId: string) {
  return {
    add_experience: tool({
      description: 'Add a new work experience or project.',
      parameters: z.object({
        type: z.enum(['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION']),
        title: z.string(),
        company: z.string(),
        address: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        description: z.string(),
      }),
      execute: async (params) => {
        logger.debug('TOOL: add_experience', params)
        return await createExperienceService({
          userId,
          ...params,
          startDate: new Date(params.startDate),
          endDate: params.endDate ? new Date(params.endDate) : null,
          latitude: 0,
          longitude: 0,
        })
      },
    }),

    add_skill: tool({
      description: 'Add a new skill node.',
      parameters: z.object({
        name: z.string(),
        level: z.number().min(1).max(5),
      }),
      execute: async ({ name, level }) => {
        logger.debug('TOOL: add_skill', { name, level })
        return await createSkillService({
          userId,
          name,
          selfAssessmentLevel: level as any,
        })
      },
    }),

    get_portfolio_data: tool({
      description: "Retrieves the current user's skills and experiences.",
      parameters: z.object({
        reason: z.string().describe('Reason for fetching data'),
      }),
      execute: async () => {
        logger.debug('TOOL: get_portfolio_data')
        try {
          const skills = await getUserSkillsData(userId)
          return (skills || []).map(s => ({
            name: s?.skill?.name || 'Unknown',
            level: (s as any)?.level || 1,
            category: s?.skill?.category?.name || 'General',
          }))
        } catch (err: any) {
          logger.error('TOOL_ERROR:', err)
          return { error: 'Failed' }
        }
      },
    }),

    get_skill_tree: tool({
      description: "Retrieves the user's complete skill tree with detailed information including levels, categories, XP, and validation status. Use this to analyze skill progression and suggest learning paths.",
      parameters: z.object({
        reason: z.string().describe('Why you need the skill tree data (e.g., to suggest next skills to learn)'),
      }),
      execute: async () => {
        logger.debug('TOOL: get_skill_tree')
        try {
          const userSkills = await getUserSkillsData(userId)

          if (!userSkills || userSkills.length === 0) {
            return {
              message: 'No skills found. User should add skills to their profile.',
              skills: [],
            }
          }

          const skillTree = userSkills.map(us => ({
            name: us.skill.name,
            category: us.skill.category.name,
            selfAssessmentLevel: getSelfAssessmentLevel(us.sources),
            totalXP: us.totalXP,
            githubValidated: hasGitHubValidation(us),
            manuallyAdded: us.sources.some(s => s.sourceType === 'MANUAL'),
            experienceBased: us.sources.some(s => s.sourceType === 'EXPERIENCE'),
            sourcesCount: us.sources.length,
          }))

          // Group by category for better analysis
          const byCategory = skillTree.reduce((acc, skill) => {
            if (!acc[skill.category]) {
              acc[skill.category] = []
            }
            acc[skill.category].push(skill)
            return acc
          }, {} as Record<string, typeof skillTree>)

          return {
            totalSkills: skillTree.length,
            categories: Object.keys(byCategory),
            skillsByCategory: byCategory,
            skills: skillTree,
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR (get_skill_tree):', err)
          return { error: 'Failed to retrieve skill tree', details: err.message }
        }
      },
    }),

    suggestLearningPath: tool({
      description: "Suggest a learning path of specific skills for the user based on their goals and what they are missing.",
      parameters: z.object({
        targetRole: z.string().describe("The target role or goal the user wants to achieve"),
        skillsToLearn: z.array(z.string()).describe("A list of specific skill names the user should learn next. These must be precise skill names (e.g. 'React', 'TypeScript')."),
        reasoning: z.string().describe("Brief explanation of why you suggested these skills"),
      }),
      execute: async ({ targetRole, skillsToLearn, reasoning }) => {
        logger.debug('TOOL: suggestLearningPath', { targetRole, skillsToLearn, reasoning })
        return { success: true, targetRole, skillsToLearn, reasoning }
      },
    }),
  }
}

// =============================================================================
// Tool Registry Builder
// =============================================================================

/**
 * Build the full tool registry for the AI chat.
 *
 * All tools are always available regardless of page context.
 * Page context only affects the system prompt, not tool availability.
 *
 * @param userId - The authenticated user's ID
 * @param _pageContext - Reserved for future use (currently unused)
 * @returns All available tools merged into a single object
 */
export function buildToolRegistry(userId: string, _pageContext?: string) {
  return {
    ...allReadTools(userId),
    ...baseWriteTools(userId),
    ...projectWriteTools(userId),
    ...timelineWriteTools(userId),
    ...skillWriteTools(userId),
    ...cvWriteTools(userId),
    ...existingTools(userId),
  }
}
