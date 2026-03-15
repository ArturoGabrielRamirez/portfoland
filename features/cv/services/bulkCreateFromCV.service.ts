/**
 * Bulk Create From CV Service
 *
 * Orchestrates bulk creation of skills, experiences, and projects
 * from an imported CV. Runs creation loops sequentially to avoid
 * race conditions on category lookups.
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { createSkillService } from '@/features/skills/services/skill.service';
import { createExperienceService } from '@/features/timeline/services/experience.service';
import { createProjectService } from '@/features/projects/services/project.service';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { getSkillCategoriesData } from '@/features/skills/data/getSkillCategories.data';
import { logger } from '@/lib/logger';
import type { SelfAssessmentLevel } from '@/features/skills/constants/xp';
import type {
  BulkCreateResult,
  CVImportSkillItem,
  CVImportExperienceItem,
  CVImportProjectItem,
} from '../types/cvImport';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Map a numeric skill level (1–5) to a SelfAssessmentLevel enum value
 */
function mapLevelToSelfAssessment(level: number): SelfAssessmentLevel {
  if (level <= 2) return 'BEGINNER';
  if (level === 3) return 'INTERMEDIATE';
  return 'ADVANCED';
}

// =============================================================================
// Service
// =============================================================================

/**
 * Create skills, experiences, and projects from confirmed CV import items
 *
 * @param userId - The authenticated user's ID
 * @param confirmedSkills - Skill items the user wants to import
 * @param confirmedExperiences - Experience items the user wants to import
 * @param confirmedProjects - Project items the user wants to import
 * @returns Aggregate counts of added and skipped items
 */
export async function bulkCreateFromCVService(
  userId: string,
  confirmedSkills: CVImportSkillItem[],
  confirmedExperiences: CVImportExperienceItem[],
  confirmedProjects: CVImportProjectItem[]
): Promise<BulkCreateResult> {
  let skillsAdded = 0;
  let experiencesAdded = 0;
  let projectsAdded = 0;
  let skipped = 0;

  // -------------------------------------------------------------------------
  // Skills
  // -------------------------------------------------------------------------

  if (confirmedSkills.length > 0) {
    // Fetch existing skill names and categories in parallel
    const [existingSkills, categories] = await Promise.all([
      getUserSkillsData(userId),
      getSkillCategoriesData(userId),
    ]);

    // Build a set of existing skill names (lowercase) for duplicate detection
    const existingNames = new Set(
      existingSkills.map((us) => us.skill.name.toLowerCase())
    );

    for (const skill of confirmedSkills) {
      // Skip duplicates (case-insensitive)
      if (existingNames.has(skill.name.toLowerCase())) {
        skipped++;
        continue;
      }

      // Try to match AI-provided category name to an existing category
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === skill.category.toLowerCase()
      );

      try {
        await createSkillService({
          userId,
          name: skill.name,
          categoryId: matchedCategory?.id,
          selfAssessmentLevel: mapLevelToSelfAssessment(skill.level),
        });
        skillsAdded++;
        // Track the added skill to prevent re-adding in the same batch
        existingNames.add(skill.name.toLowerCase());
      } catch (error) {
        logger.warn(`CV_IMPORT: failed to create skill "${skill.name}"`, error);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Experiences
  // -------------------------------------------------------------------------

  for (const exp of confirmedExperiences) {
    // Parse startDate — skip if invalid
    const startDate = new Date(exp.startDate);
    if (isNaN(startDate.getTime())) {
      logger.warn(`CV_IMPORT: invalid startDate "${exp.startDate}" for experience "${exp.title}" — skipping`);
      continue;
    }

    // Parse endDate — null if missing or invalid
    let endDate: Date | null = null;
    if (exp.endDate) {
      const parsed = new Date(exp.endDate);
      endDate = isNaN(parsed.getTime()) ? null : parsed;
    }

    try {
      await createExperienceService({
        userId,
        type: exp.type,
        title: exp.title,
        company: exp.company,
        latitude: 0,
        longitude: 0,
        address: '',
        startDate,
        endDate,
        description: exp.description,
      });
      experiencesAdded++;
    } catch (error) {
      logger.warn(`CV_IMPORT: failed to create experience "${exp.title}"`, error);
    }
  }

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------

  for (const proj of confirmedProjects) {
    try {
      await createProjectService({
        userId,
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies,
        status: 'COMPLETED',
        startDate: new Date(),
      });
      projectsAdded++;
    } catch (error) {
      logger.warn(`CV_IMPORT: failed to create project "${proj.title}"`, error);
    }
  }

  // -------------------------------------------------------------------------
  // Revalidate caches
  // -------------------------------------------------------------------------

  revalidateTag(`user-stats-${userId}`);
  revalidatePath('/dashboard/skills');
  revalidatePath('/dashboard/timeline');
  revalidatePath('/dashboard/projects');

  return { skillsAdded, experiencesAdded, projectsAdded, skipped };
}
