/**
 * Public Skills Types
 *
 * Standalone type definitions for public-facing skills data.
 * Kept separate from getPublicSkills.data.ts so these types can be safely
 * imported by client-side files (e.g. portfolio/types/portfolio.ts) without
 * pulling lib/prisma.ts into the client bundle.
 */

import type { UserSkillWithDetails, SkillCategory, SkillsByCategory } from './skill';

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
