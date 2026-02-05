/**
 * Get Skill Categories
 *
 * Retrieves skill categories: default system categories and user's custom categories.
 * Returns merged and sorted by name.
 */

import { prisma } from '@/lib/prisma';
import type { SkillCategory } from '../types/skill';
import { ensureDefaultCategories } from './seedDefaultCategories.data';

/**
 * Get all skill categories available to a user
 *
 * Includes both default system categories (isDefault: true) and
 * user's custom categories.
 *
 * @param userId - The user's ID
 * @returns Array of skill categories sorted by name
 */
export async function getSkillCategoriesData(userId: string): Promise<SkillCategory[]> {
  // Ensure default categories exist on first load
  await ensureDefaultCategories();

  const categories = await prisma.skillCategory.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId },
      ],
    },
    orderBy: { name: 'asc' },
  });

  return categories;
}

/**
 * Get default system categories only
 *
 * @returns Array of default skill categories
 */
export async function getDefaultCategoriesData(): Promise<SkillCategory[]> {
  const categories = await prisma.skillCategory.findMany({
    where: { isDefault: true },
    orderBy: { name: 'asc' },
  });

  return categories;
}

/**
 * Get category by ID
 *
 * @param categoryId - The category ID
 * @returns The category or null if not found
 */
export async function getCategoryByIdData(categoryId: string): Promise<SkillCategory | null> {
  const category = await prisma.skillCategory.findUnique({
    where: { id: categoryId },
  });

  return category;
}

/**
 * Get category by slug for a user
 *
 * @param slug - The category slug
 * @param userId - The user's ID (null for default categories)
 * @returns The category or null if not found
 */
export async function getCategoryBySlugData(
  slug: string,
  userId: string | null
): Promise<SkillCategory | null> {
  const category = await prisma.skillCategory.findFirst({
    where: {
      slug,
      OR: [
        { isDefault: true },
        { userId },
      ],
    },
  });

  return category;
}
