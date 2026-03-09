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
import { generateCVService } from '@/features/cv/services/generateCV.service'

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

function createGenerateCVTool(userId: string) {
  return tool({
    description: "Generate a professional CV/resume from the user's portfolio data. Optionally tailored for a specific job target. The CV is saved and can be downloaded as PDF from /dashboard/cv.",
    parameters: z.object({
      targetJob: z.string().optional().describe('The job title to tailor the CV for (e.g. "Senior React Developer")'),
      jobDescription: z.string().optional().describe('The full job description text for ATS optimization'),
    }),
    execute: async ({ targetJob, jobDescription }) => {
      logger.debug('TOOL: generate_cv', { userId, targetJob })
      try {
        const result = await generateCVService(userId, targetJob, jobDescription)
        return {
          success: true,
          cvId: result.cvId,
          title: result.title,
          message: `CV "${result.title}" generated successfully. View and download it at /dashboard/cv.`,
        }
      } catch (err: any) {
        logger.error('TOOL_ERROR (generate_cv):', err)
        return { error: err.message || 'Failed to generate CV' }
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

/** CV write tools */
export function cvWriteTools(userId: string) {
  return {
    generate_cv: createGenerateCVTool(userId),
  }
}
