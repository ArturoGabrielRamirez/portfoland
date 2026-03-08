/**
 * Write Tools
 *
 * Tool definitions that let the AI modify portfolio data.
 * Each tool uses the Vercel AI SDK `tool()` function with Zod parameter schemas.
 * Write operations include ownership checks where applicable.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// =============================================================================
// Individual Tool Factories
// =============================================================================

function createUpdateBioTool(userId: string) {
  return tool({
    description: "Update the user's bio/description text on their profile.",
    parameters: z.object({
      reason: z.string().describe('Why you are updating the bio'),
      newBio: z.string().describe('The new bio text'),
    }),
    execute: async ({ newBio }) => {
      logger.debug('TOOL: update_bio', { userId })
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { bio: newBio },
        })
        return { success: true, bio: newBio }
      } catch (err: any) {
        logger.error('TOOL_ERROR (update_bio):', err)
        return { error: 'Failed to update bio' }
      }
    },
  })
}

function createUpdateProjectDescriptionTool(userId: string) {
  return tool({
    description: "Update a specific project's description text.",
    parameters: z.object({
      reason: z.string().describe('Why you are updating this project description'),
      projectId: z.string().describe('The project ID to update'),
      newDescription: z.string().describe('The new description text'),
    }),
    execute: async ({ projectId, newDescription }) => {
      logger.debug('TOOL: update_project_description', { userId, projectId })
      try {
        // Ownership check
        const project = await prisma.project.findFirst({
          where: { id: projectId, userId },
          select: { id: true },
        })

        if (!project) {
          return { error: 'Not found or unauthorized' }
        }

        await prisma.project.update({
          where: { id: projectId },
          data: { description: newDescription },
        })

        return { success: true, projectId, description: newDescription }
      } catch (err: any) {
        logger.error('TOOL_ERROR (update_project_description):', err)
        return { error: 'Failed to update project description' }
      }
    },
  })
}

function createUpdateExperienceDescriptionTool(userId: string) {
  return tool({
    description: "Update a specific experience's description text.",
    parameters: z.object({
      reason: z.string().describe('Why you are updating this experience description'),
      experienceId: z.string().describe('The experience ID to update'),
      newDescription: z.string().describe('The new description text'),
    }),
    execute: async ({ experienceId, newDescription }) => {
      logger.debug('TOOL: update_experience_description', { userId, experienceId })
      try {
        // Ownership check
        const experience = await prisma.experience.findFirst({
          where: { id: experienceId, userId },
          select: { id: true },
        })

        if (!experience) {
          return { error: 'Not found or unauthorized' }
        }

        await prisma.experience.update({
          where: { id: experienceId },
          data: { description: newDescription },
        })

        return { success: true, experienceId, description: newDescription }
      } catch (err: any) {
        logger.error('TOOL_ERROR (update_experience_description):', err)
        return { error: 'Failed to update experience description' }
      }
    },
  })
}

function createSuggestSkillsTool() {
  return tool({
    description: "Suggest skills for the user to add. Returns suggestions without writing to the database - the user can accept them individually via add_skill.",
    parameters: z.object({
      reason: z.string().describe('Why you are suggesting these skills'),
      skills: z.array(
        z.object({
          name: z.string().describe('Skill name'),
          reason: z.string().describe('Why this skill is recommended'),
        }),
      ).describe('Array of skill suggestions'),
    }),
    execute: async ({ skills }) => {
      logger.debug('TOOL: suggest_skills', { count: skills.length })
      return {
        suggestions: skills,
        message: 'These are suggestions. Use add_skill to add any the user approves.',
      }
    },
  })
}

// =============================================================================
// Grouped Exports
// =============================================================================

/** Base write tools - always available */
export function baseWriteTools(userId: string) {
  return {
    update_bio: createUpdateBioTool(userId),
  }
}

/** Project write tools */
export function projectWriteTools(userId: string) {
  return {
    update_project_description: createUpdateProjectDescriptionTool(userId),
  }
}

/** Timeline write tools */
export function timelineWriteTools(userId: string) {
  return {
    update_experience_description: createUpdateExperienceDescriptionTool(userId),
  }
}

/** Skill write tools */
export function skillWriteTools(_userId: string) {
  return {
    suggest_skills: createSuggestSkillsTool(),
  }
}
