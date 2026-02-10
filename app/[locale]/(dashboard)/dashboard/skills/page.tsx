/**
 * Dashboard Skills Page
 *
 * Authenticated user's skill tree with editing capabilities.
 * Allows viewing, adding, and managing skills.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { getUserSkillsData, getSkillCategoriesData } from '@/features/skills/data';
import { DashboardSkillsView } from './DashboardSkillsView';

export default async function DashboardSkillsPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get translations
  const t = await getTranslations('skills');

  // Fetch user's skills and categories data
  const [skills, categories] = await Promise.all([
    getUserSkillsData(session.user.id).catch(() => []),
    getSkillCategoriesData(session.user.id).catch(() => []),
  ]);

  // Calculate stats
  const totalSkills = skills.length;
  const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);
  const masterSkills = skills.filter((s) => s.level === 5).length;
  const categoriesUsed = new Set(skills.map((s) => s.skill.categoryId)).size;

  return (
    <DashboardSkillsView
      skills={skills}
      categories={categories}
      stats={{
        totalSkills,
        totalXP,
        masterSkills,
        categoriesUsed,
      }}
      user={{
        id: session.user.id,
        name: session.user.name,
        username: (session.user as { username?: string }).username || null,
      }}
    />
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'My Skill Tree | Portfoland',
  description: 'View and manage your professional skills with an interactive skill tree.',
};