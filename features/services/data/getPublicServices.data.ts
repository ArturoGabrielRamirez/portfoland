/**
 * Get Public Services
 *
 * Retrieves only published services for a user, ordered by order asc.
 * Used for the public portfolio view.
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';

/**
 * Get published services for a user (public portfolio view)
 *
 * @param userId - The user's ID
 * @returns Array of published services ordered by order asc
 */
export async function getPublicServicesData(userId: string): Promise<ServiceModel[]> {
  const services = await prisma.service.findMany({
    where: { userId, published: true },
    orderBy: [{ order: 'asc' }],
  });

  return services;
}
