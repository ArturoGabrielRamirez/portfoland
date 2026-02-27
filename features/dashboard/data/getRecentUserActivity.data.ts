/**
 * Get Recent User Activity
 *
 * Fetches the 5 most recent user activity events across experiences, projects,
 * and skills for the SYS_LOG panel in the Tech Mode dashboard.
 * All three sources are queried in parallel for performance.
 */

import { prisma } from '@/lib/prisma'
import type { ActivityEvent } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Inner helper — 1-second threshold for "created vs updated" detection
// =============================================================================

const ONE_SECOND_MS = 1000

// =============================================================================
// Main export
// =============================================================================

/**
 * Fetches the 5 most recent activity events for a user across experiences,
 * projects, and skills. Events are sorted by timestamp descending.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of up to 5 ActivityEvent objects, newest first
 */
export async function getRecentUserActivity(userId: string): Promise<ActivityEvent[]> {
  // Fetch all three sources in parallel
  const [experiences, projects, userSkills] = await Promise.all([
    prisma.experience.findMany({
      where: { userId },
      select: { id: true, title: true, type: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    prisma.userSkill.findMany({
      where: { userId },
      select: {
        id: true,
        skill: { select: { name: true } },
        aiValidated: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])

  // ---------------------------------------------------------------------------
  // Map experiences to ActivityEvent
  // ---------------------------------------------------------------------------

  const experienceEvents: ActivityEvent[] = experiences.map((exp) => {
    const diffMs = exp.updatedAt.getTime() - exp.createdAt.getTime()
    const isNew = diffMs <= ONE_SECOND_MS

    return {
      id: exp.id,
      title: exp.title,
      xp: isNew ? 200 : 50,
      type: isNew ? 'experience' : 'experience_updated',
      timestamp: exp.updatedAt,
    }
  })

  // ---------------------------------------------------------------------------
  // Map projects to ActivityEvent — only COMPLETED projects appear in the log
  // ---------------------------------------------------------------------------

  const projectEvents: ActivityEvent[] = projects
    .filter((project) => project.status === 'COMPLETED')
    .map((project) => ({
      id: project.id,
      title: project.title,
      xp: 300,
      type: 'project_completed',
      timestamp: project.updatedAt,
    }))

  // ---------------------------------------------------------------------------
  // Map user skills to ActivityEvent
  // ---------------------------------------------------------------------------

  const skillEvents: ActivityEvent[] = userSkills.map((userSkill) => ({
    id: userSkill.id,
    title: userSkill.skill.name,
    xp: userSkill.aiValidated ? 150 : 50,
    type: userSkill.aiValidated ? 'skill_ai' : 'skill_manual',
    timestamp: userSkill.updatedAt,
  }))

  // ---------------------------------------------------------------------------
  // Merge, sort by timestamp descending, return top 5
  // ---------------------------------------------------------------------------

  const allEvents = [...experienceEvents, ...projectEvents, ...skillEvents]
  allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return allEvents.slice(0, 5)
}
