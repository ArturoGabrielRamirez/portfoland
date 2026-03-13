/**
 * AI Tool Registry
 *
 * Barrel export for all AI tools and the registry builder.
 * All tools use Zod schemas with at least one required property to bypass
 * the @ai-sdk/google empty-schema serialization bug with additionalProperties:false.
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
// Existing Tools
// =============================================================================

export function existingTools(userId: string) {
  return {
    add_experience: tool({
      description: 'Add a new work experience or project.',
      parameters: z.object({
        reason: z.string().describe('Why you are adding this experience').default('User requested'),
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
        try {
          const result = await createExperienceService({
            userId,
            ...params,
            startDate: new Date(params.startDate),
            endDate: params.endDate ? new Date(params.endDate) : null,
            latitude: 0,
            longitude: 0,
          })
          return {
            ...result,
            _ai_instruction: "MUST DO: Respond to the user confirming the experience was added successfully."
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR (add_experience):', err)
          return { error: 'Failed to add experience', details: err.message } as any
        }
      },
    }),

    add_skill: tool({
      description: 'Add a new skill node.',
      parameters: z.object({
        reason: z.string().describe('Why you are adding this skill').default('User requested'),
        name: z.string(),
        level: z.number().min(1).max(5),
      }),
      execute: async ({ name, level }) => {
        logger.debug('TOOL: add_skill', { name, level })
        try {
          const result = await createSkillService({
            userId,
            name,
            selfAssessmentLevel: level as any,
          })
          return {
            ...result,
            _ai_instruction: "MUST DO: Respond to the user confirming the skill was added successfully."
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR (add_skill):', err)
          return { error: 'Failed to add skill', details: err.message } as any
        }
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
          return {
            skills: (skills || []).map(s => ({
              name: s?.skill?.name || 'Unknown',
              level: (s as any)?.level || 1,
              category: s?.skill?.category?.name || 'General',
            })),
            _ai_instruction: "MUST DO: Respond to the user with a brief summary of their current portfolio data."
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR:', err)
          return { error: 'Failed' } as any
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
            _ai_instruction: "MUST DO: Analyze the skill tree data and respond to the user with a helpful insight or suggestion."
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR (get_skill_tree):', err)
          return { error: 'Failed to retrieve skill tree', details: err.message } as any
        }
      },
    }),

    // DEPRECATED: Wrappers for migration to suggest_skill_path
    suggest_learning_path: tool({
      description: 'DEPRECATED: Use suggest_skill_path instead.',
      parameters: z.object({
        reason: z.string().describe('Migration reason').default('Legacy wrapper call'),
        skillName: z.string().optional(),
        locale: z.string().optional(),
      }),
      execute: async (args) => {
        logger.debug('TOOL: suggest_learning_path (DEPRECATED wrapper)')
        const registry = allReadTools(userId) as any
        return await registry.suggest_skill_path.execute(args)
      },
    }),

    suggestLearningPath: tool({
      description: 'DEPRECATED: Use suggest_skill_path instead.',
      parameters: z.object({
        reason: z.string().describe('Migration reason').default('Legacy wrapper call'),
        targetRole: z.string().optional(),
        skillsToLearn: z.array(z.string()).optional(),
        reasoning: z.string().optional(),
      }),
      execute: async (args) => {
        logger.debug('TOOL: suggestLearningPath (DEPRECATED wrapper)')
        const registry = allReadTools(userId) as any
        return await registry.suggest_skill_path.execute({
          reasoning: args.reasoning || 'Legacy fallback',
          targetRole: args.targetRole,
          skillsToHighlight: args.skillsToLearn,
        })
      },
    }),
  }
}

// =============================================================================
// Tool Registry Builder
// =============================================================================

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
