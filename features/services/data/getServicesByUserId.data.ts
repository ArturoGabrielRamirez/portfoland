/**
 * Get Services by User ID
 *
 * Retrieves all services for a user ordered by order asc.
 * Used for the dashboard view (includes unpublished items).
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';

/**
 * Get all services for a user (dashboard view, includes unpublished)
 *
 * @param userId - The user's ID
 * @returns Array of services ordered by order asc
 */
export async function getServicesByUserIdData(userId: string): Promise<ServiceModel[]> {
  const services = await prisma.service.findMany({
    where: { userId },
    orderBy: [{ order: 'asc' }],
  });

  return services;
}
