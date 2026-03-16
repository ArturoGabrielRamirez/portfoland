/**
 * Notification Service
 *
 * Internal service for creating notifications. Called by other features
 * (quests, analytics, CV generator) to trigger in-app notifications.
 */

import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/app/generated/prisma/enums';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: CreateNotificationParams): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: (metadata ?? {}) as object,
    },
  });
}

/**
 * Notify user about portfolio views (batched — only if last view notification
 * was more than 1 hour ago to avoid spam).
 */
export async function notifyPortfolioViews(userId: string, viewCount: number): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentViewNotification = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'PORTFOLIO_VIEW',
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentViewNotification) return;

  await createNotification({
    userId,
    type: 'PORTFOLIO_VIEW',
    title: 'Portfolio viewed!',
    message: viewCount === 1
      ? 'Someone visited your portfolio.'
      : `Your portfolio received ${viewCount} new views.`,
    metadata: { viewCount },
  });
}

/**
 * Notify user that their streak is at risk (last activity was 20+ hours ago).
 */
export async function notifyStreakAtRisk(userId: string, streakDays: number): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentStreakNotification = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'STREAK_AT_RISK',
      createdAt: { gte: oneDayAgo },
    },
  });

  if (recentStreakNotification) return;

  await createNotification({
    userId,
    type: 'STREAK_AT_RISK',
    title: '🔥 Streak at risk!',
    message: `Log in today to keep your ${streakDays}-day streak alive.`,
    metadata: { streakDays },
  });
}
