/**
 * Get Skills Server Action
 *
 * Retrieves all skills for the authenticated user, grouped by category.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { UserSkillWithDetails, SkillsByCategory, SkillCategory } from '../types/skill';
import { getUserSkillsData, getSkillCategoriesData } from '../data';

/**
 * Response type for getSkills action
 */
export interface GetSkillsResponse {
  skills: UserSkillWithDetails[];
  categories: SkillCategory[];
  groupedByCategory: SkillsByCategory[];
  totalCount: number;
  totalXP: number;
}

/**
 * Get all skills for the current user
 *
 * Fetches user's skills with categories and returns them grouped by category.
 *
 * @returns ActionResponse with skills data grouped by category
 */
export async function getSkills() {
  return actionWrapper<GetSkillsResponse>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to view your skills');
    }

    // Get user's skills and categories
    const [skills, categories] = await Promise.all([
      getUserSkillsData(session.user.id),
      getSkillCategoriesData(session.user.id),
    ]);

    // Group skills by category
    const groupedByCategory = groupSkillsByCategory(skills, categories);

    // Calculate totals
    const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);

    return {
      payload: {
        skills,
        categories,
        groupedByCategory,
        totalCount: skills.length,
        totalXP,
      },
      message: 'Skills loaded',
    };
  });
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

  // Build result array
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
