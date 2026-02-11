/**
 * Seed Default Categories
 *
 * Creates default skill categories if they don't exist.
 * Should be called when the app starts or when needed.
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../constants/categories';

/**
 * Seed default skill categories
 *
 * Creates the predefined categories with isDefault: true
 * and userId: null (system-wide categories).
 *
 * @returns Array of created/existing categories
 */
export async function seedDefaultCategories() {
  const results = [];

  for (const category of DEFAULT_CATEGORIES) {
    const color = CATEGORY_COLORS[category.slug as keyof typeof CATEGORY_COLORS];

    // First, try to find an existing default category
    let existingCategory = await prisma.skillCategory.findFirst({
      where: {
        slug: category.slug,
        userId: null,
      },
    });

    let upsertedCategory;
    if (existingCategory) {
      // Update existing
      upsertedCategory = await prisma.skillCategory.update({
        where: { id: existingCategory.id },
        data: {
          name: category.name,
          color,
          isDefault: true,
        },
      });
    } else {
      // Create new
      upsertedCategory = await prisma.skillCategory.create({
        data: {
          slug: category.slug,
          name: category.name,
          color,
          isDefault: true,
        },
      });
    }

    results.push(upsertedCategory);
  }

  return results;
}

/**
 * Ensure default categories exist
 *
 * Checks if default categories exist and creates them if needed.
 * Safe to call multiple times.
 */
export async function ensureDefaultCategories() {
  try {
    console.log('Checking for default skill categories...');
    const existingCount = await prisma.skillCategory.count({
      where: { isDefault: true },
    });

    console.log(`Found ${existingCount} default categories`);

    if (existingCount === 0) {
      console.log('Creating default skill categories...');
      const result = await seedDefaultCategories();
      console.log('Default skill categories created successfully:', result.length);
    }
  } catch (error) {
    console.error('Error in ensureDefaultCategories:', error);
    throw error;
  }
}