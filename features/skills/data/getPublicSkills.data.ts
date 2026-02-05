/**
 * Get Public Skills by Username
 *
 * Retrieves a user's public skills data by their username.
 * Used for the public /[username]/skills page.
 */

import { prisma } from '@/lib/prisma';
import type { UserSkillWithDetails, SkillCategory, SkillsByCategory } from '../types/skill';

/**
 * Public skills data returned for a username
 */
export interface PublicSkillsData {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  skills: UserSkillWithDetails[];
  categories: SkillCategory[];
  groupedByCategory: SkillsByCategory[];
  stats: {
    totalSkills: number;
    totalXP: number;
    masterSkills: number;
    categoriesUsed: number;
  };
}

/**
 * Get public skills data for a username
 *
 * @param username - The user's username
 * @returns Public skills data or null if user not found
 */
export async function getPublicSkillsByUsername(
  username: string
): Promise<PublicSkillsData | null> {
  // First find the user by username
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  });

  if (!user || !user.username) {
    return null;
  }

  // Fetch user's skills with full details
  const skills = await prisma.userSkill.findMany({
    where: { userId: user.id },
    include: {
      skill: {
        include: { category: true },
      },
      sources: {
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: [
      { totalXP: 'desc' },
      { skill: { name: 'asc' } },
    ],
  });

  // Fetch categories available to user
  const categories = await prisma.skillCategory.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: user.id },
      ],
    },
    orderBy: { name: 'asc' },
  });

  // Group skills by category
  const groupedByCategory = groupSkillsByCategory(skills, categories);

  // Calculate stats
  const totalSkills = skills.length;
  const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);
  const masterSkills = skills.filter((s) => s.level === 5).length;
  const categoriesUsed = new Set(skills.map((s) => s.skill.categoryId)).size;

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    },
    skills,
    categories,
    groupedByCategory,
    stats: {
      totalSkills,
      totalXP,
      masterSkills,
      categoriesUsed,
    },
  };
}

/**
 * Group skills by their category
 */
function groupSkillsByCategory(
  skills: UserSkillWithDetails[],
  categories: SkillCategory[]
): SkillsByCategory[] {
  // Create a map of category ID to skills
  const categoryMap = new Map<string, UserSkillWithDetails[]>();

  // Initialize map with all categories
  for (const category of categories) {
    categoryMap.set(category.id, []);
  }

  // Group skills by category
  for (const skill of skills) {
    const categoryId = skill.skill.categoryId;
    const categorySkills = categoryMap.get(categoryId) || [];
    categorySkills.push(skill);
    categoryMap.set(categoryId, categorySkills);
  }

  // Build result array (only include categories with skills)
  const result: SkillsByCategory[] = [];

  for (const category of categories) {
    const categorySkills = categoryMap.get(category.id) || [];
    if (categorySkills.length > 0) {
      result.push({
        category,
        skills: categorySkills,
        totalXP: categorySkills.reduce((sum, s) => sum + s.totalXP, 0),
      });
    }
  }

  // Sort by total XP descending
  result.sort((a, b) => b.totalXP - a.totalXP);

  return result;
}
