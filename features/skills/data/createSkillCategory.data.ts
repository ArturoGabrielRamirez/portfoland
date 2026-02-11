/**
 * Create Skill Category
 *
 * Creates a custom skill category for a user.
 * Validates unique name per user.
 */

import { prisma } from '@/lib/prisma';
import type { SkillCategory } from '../types/skill';

/**
 * Input for creating a custom category
 */
export interface CreateSkillCategoryInput {
  userId: string;
  name: string;
  color: string;
}

/**
 * Create a custom skill category for a user
 *
 * Custom categories have isDefault: false and are linked to the user.
 * Validates that the name is unique for this user.
 *
 * @param input - The category creation input
 * @returns The created category
 * @throws Error if category name already exists for user
 */
export async function createSkillCategoryData(
  input: CreateSkillCategoryInput
): Promise<SkillCategory> {
  const { userId, name, color } = input;

  // Generate slug from name
  const slug = generateCategorySlug(name);

  // Check for existing category with same name for this user
  const existing = await prisma.skillCategory.findFirst({
    where: {
      slug,
      OR: [
        { isDefault: true },
        { userId },
      ],
    },
  });

  if (existing) {
    throw new Error(`Category "${name}" already exists`);
  }

  // Create the custom category
  const category = await prisma.skillCategory.create({
    data: {
      name: name.trim(),
      slug,
      color,
      isDefault: false,
      userId,
    },
  });

  return category;
}

/**
 * Update a custom skill category
 *
 * Only allows updating categories owned by the user (not default categories).
 *
 * @param categoryId - The category ID
 * @param userId - The user ID for ownership validation
 * @param updates - The fields to update
 * @returns The updated category or null if not found/authorized
 */
export async function updateSkillCategoryData(
  categoryId: string,
  userId: string,
  updates: { name?: string; color?: string }
): Promise<SkillCategory | null> {
  // Check ownership
  const existing = await prisma.skillCategory.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    return null;
  }

  // Cannot update default categories
  if (existing.isDefault) {
    throw new Error('Cannot update default categories');
  }

  // Validate ownership
  if (existing.userId !== userId) {
    return null;
  }

  // Build update data
  const updateData: { name?: string; slug?: string; color?: string } = {};

  if (updates.name) {
    updateData.name = updates.name.trim();
    updateData.slug = generateCategorySlug(updates.name);

    // Check for duplicate name
    const duplicate = await prisma.skillCategory.findFirst({
      where: {
        id: { not: categoryId },
        slug: updateData.slug,
        OR: [
          { isDefault: true },
          { userId },
        ],
      },
    });

    if (duplicate) {
      throw new Error(`Category "${updates.name}" already exists`);
    }
  }

  if (updates.color) {
    updateData.color = updates.color;
  }

  const updated = await prisma.skillCategory.update({
    where: { id: categoryId },
    data: updateData,
  });

  return updated;
}

/**
 * Delete a custom skill category
 *
 * Only allows deleting categories owned by the user (not default categories).
 * Cannot delete if skills are assigned to this category.
 *
 * @param categoryId - The category ID
 * @param userId - The user ID for ownership validation
 * @returns Result indicating success or failure
 */
export async function deleteSkillCategoryData(
  categoryId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Check ownership and skills
  const existing = await prisma.skillCategory.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { skills: true },
      },
    },
  });

  if (!existing) {
    return {
      success: false,
      error: 'Category not found',
    };
  }

  // Cannot delete default categories
  if (existing.isDefault) {
    return {
      success: false,
      error: 'Cannot delete default categories',
    };
  }

  // Validate ownership
  if (existing.userId !== userId) {
    return {
      success: false,
      error: 'Not authorized to delete this category',
    };
  }

  // Cannot delete if skills are assigned
  if (existing._count.skills > 0) {
    return {
      success: false,
      error: 'Cannot delete category with assigned skills',
    };
  }

  await prisma.skillCategory.delete({
    where: { id: categoryId },
  });

  return { success: true };
}

/**
 * Generate slug from category name
 *
 * @param name - The category name
 * @returns Normalized slug
 */
function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
