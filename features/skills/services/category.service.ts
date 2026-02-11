/**
 * Category Service Layer
 *
 * Business logic for skill category operations.
 * Validates business rules and orchestrates data layer calls.
 */

import { SKILL_MESSAGES_EN } from '../constants/messages';
import type { SkillCategory } from '../types/skill';
import { createSkillCategoryData } from '../data';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a category via service
 */
export interface CreateCategoryServiceInput {
  userId: string;
  name: string;
  color: string;
}

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Create a new custom skill category
 *
 * Validates unique name per user and creates the category.
 *
 * @param input - The category creation data
 * @returns The created category
 * @throws Error if name already exists or validation fails
 */
export async function createCategoryService(
  input: CreateCategoryServiceInput
): Promise<SkillCategory> {
  const { userId, name, color } = input;

  // Validate category name
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error(SKILL_MESSAGES_EN.invalidInput);
  }

  // Validate color format (hex color)
  if (!isValidHexColor(color)) {
    throw new Error('Invalid color format. Use hex format (e.g., #FF5733)');
  }

  try {
    // Create the category (data layer handles duplicate check)
    const category = await createSkillCategoryData({
      userId,
      name: trimmedName,
      color,
    });

    return category;
  } catch (error) {
    // Transform duplicate error message
    if (error instanceof Error && error.message.includes('already exists')) {
      throw new Error(SKILL_MESSAGES_EN.duplicateCategoryName);
    }
    throw error;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
