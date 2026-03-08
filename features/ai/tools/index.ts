/**
 * AI Tool Registry
 *
 * Barrel export for all AI tools and the registry builder that assembles
 * page-context-aware tool sets for the chat API route.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createExperienceService } from '@/features/timeline/services/experience.service'
import { createSkillService } from '@/features/skills/services/skill.service'
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data'
import { getSelfAssessmentLevel, hasGitHubValidation } from '@/features/skills/types/skill'
import {
  baseReadTools,
  projectPageTools,
  timelinePageTools,
  generalReadTools,
  allReadTools,
} from './readTools'
import {
  baseWriteTools,
  projectWriteTools,
  timelineWriteTools,
  skillWriteTools,
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
  }
}

// =============================================================================
// Tool Registry Builder
// =============================================================================

/**
 * Build a page-context-aware tool registry for the AI chat.
 *
 * Always includes base read/write tools and the 4 existing tools.
 * Adds page-specific tools based on the current dashboard page.
 *
 * @param userId - The authenticated user's ID
 * @param pageContext - The current dashboard page identifier
 * @returns A merged object of all applicable tools
 */
export function buildToolRegistry(userId: string, pageContext?: string) {
  // Base tools always included
  const tools: Record<string, any> = {
    ...baseReadTools(userId),
    ...baseWriteTools(userId),
    ...existingTools(userId),
  }

  switch (pageContext) {
    case 'skills':
      Object.assign(tools, skillWriteTools(userId))
      break
    case 'timeline':
      Object.assign(tools, timelinePageTools(userId))
      Object.assign(tools, timelineWriteTools(userId))
      break
    case 'projects':
      Object.assign(tools, projectPageTools(userId))
      Object.assign(tools, projectWriteTools(userId))
      break
    case 'dashboard':
      Object.assign(tools, allReadTools(userId))
      break
    default:
      // General pages get github + assessment tools
      Object.assign(tools, generalReadTools(userId))
      break
  }

  return tools
}
