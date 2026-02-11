/**
 * Public Skills Page
 *
 * Displays a user's public skill tree.
 * Read-only view accessible without authentication.
 */

import { notFound } from 'next/navigation';
import { getPublicSkillsByUsername } from '@/features/skills/data';
import { PublicSkillsView } from './PublicSkillsView';

interface PublicSkillsPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function PublicSkillsPage({ params }: PublicSkillsPageProps) {
  const { username } = await params;

  // Fetch public skills data
  const skillsData = await getPublicSkillsByUsername(username);

  // 404 if user not found
  if (!skillsData) {
    notFound();
  }

  return <PublicSkillsView data={skillsData} />;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PublicSkillsPageProps) {
  const { username } = await params;
  const skillsData = await getPublicSkillsByUsername(username);

  if (!skillsData) {
    return {
      title: 'Skill Tree Not Found',
    };
  }

  const { user, stats } = skillsData;
  const masterText = stats.masterSkills > 0
    ? ` including ${stats.masterSkills} mastered`
    : '';

  return {
    title: `${user.name}'s Skill Tree | Portfoland`,
    description: `Explore ${user.name}'s professional skills: ${stats.totalSkills} skills${masterText} with ${stats.totalXP.toLocaleString()} total XP.`,
  };
}
