/**
 * generatePortfolioMeta
 *
 * Pure utility for generating SEO meta tag values from portfolio data.
 * Template-based (no AI call) — fast, deterministic, no quota cost.
 *
 * Returns structured values consumed by Next.js generateMetadata.
 */

import type { PortfolioData } from '../types/portfolio';

export interface PortfolioMetaValues {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
}

// Character limits for SEO best practices
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/**
 * Truncate a string to a max length, appending ellipsis if truncated.
 */
function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

/**
 * Derive the top N skill names from portfolio data, ordered by totalXP descending.
 */
function getTopSkillNames(data: PortfolioData, count: number): string[] {
  if (!data.skills?.skills?.length) return [];

  const sorted = [...data.skills.skills].sort((a, b) => b.totalXP - a.totalXP);
  return sorted.slice(0, count).map((us) => us.skill.name);
}

/**
 * Extract the first sentence from a bio string.
 */
function firstSentence(bio: string): string {
  const match = bio.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : bio.split('\n')[0].trim();
}

/**
 * Generate SEO meta values from portfolio data.
 *
 * - title: kept under 60 chars
 * - description: kept under 160 chars
 * - ogTitle/ogDescription: can be slightly richer
 * - keywords: skill names + name + generic terms
 *
 * All fields degrade gracefully when data is missing.
 */
export function generatePortfolioMeta(
  data: PortfolioData,
  locale: string
): PortfolioMetaValues {
  const { user } = data;
  const name = user.name?.trim() || user.username;
  const topSkills = getTopSkillNames(data, 5);
  const topSkill = topSkills[0] ?? null;
  const skillCount = data.skills?.stats?.totalSkills ?? 0;
  const experienceCount = data.experiences?.experiences?.length ?? 0;

  // --- Title (< 60 chars) ---
  // Pattern: "{name} — {topSkill} Developer | Portfoland"
  // Fallback: "{name} | Portfolio | Portfoland"
  let titleRaw: string;
  if (topSkill) {
    titleRaw = `${name} — ${topSkill} Developer | Portfoland`;
  } else {
    titleRaw = `${name} | Portfolio | Portfoland`;
  }
  const title = truncate(titleRaw, TITLE_MAX);

  // --- Description (< 160 chars) ---
  // Pattern: first 120 chars of bio + " | Skills: {top 5 skills}"
  // Fallback when no bio: "Developer portfolio of {name}. Skills: {skills}"
  let descriptionRaw: string;
  if (user.bio?.trim()) {
    const bioChunk = user.bio.trim().slice(0, 120).trimEnd();
    if (topSkills.length > 0) {
      descriptionRaw = `${bioChunk} | Skills: ${topSkills.join(', ')}`;
    } else {
      descriptionRaw = bioChunk;
    }
  } else if (topSkills.length > 0) {
    descriptionRaw = `Developer portfolio of ${name}. Skills: ${topSkills.join(', ')}`;
  } else {
    descriptionRaw = `Developer portfolio of ${name} on Portfoland.`;
  }
  const description = truncate(descriptionRaw, DESCRIPTION_MAX);

  // --- OG Title ---
  // Slightly expanded — same pattern as title with a wider character limit
  let ogTitleRaw: string;
  if (topSkill) {
    ogTitleRaw = `${name} — ${topSkill} Developer | Portfoland`;
  } else {
    ogTitleRaw = `${name} | Portfolio | Portfoland`;
  }
  const ogTitle = truncate(ogTitleRaw, 70);

  // --- OG Description ---
  // Full first sentence of bio + skill count + experience count
  let ogDescriptionRaw: string;
  const bioSentence = user.bio?.trim() ? firstSentence(user.bio.trim()) : null;

  const statsFragments: string[] = [];
  if (skillCount > 0) statsFragments.push(`${skillCount} skill${skillCount !== 1 ? 's' : ''}`);
  if (experienceCount > 0) statsFragments.push(`${experienceCount} experience${experienceCount !== 1 ? 's' : ''}`);
  const statsStr = statsFragments.length > 0 ? ` · ${statsFragments.join(', ')}` : '';

  if (bioSentence) {
    ogDescriptionRaw = `${bioSentence}${statsStr}`;
  } else {
    ogDescriptionRaw = `Portfolio of ${name} on Portfoland${statsStr}.`;
  }
  const ogDescription = truncate(ogDescriptionRaw, 200);

  // --- Keywords ---
  const keywords = [
    name,
    ...topSkills,
    'portfolio',
    'developer',
    'portfoland',
  ].filter(Boolean);

  return { title, description, ogTitle, ogDescription, keywords };
}
