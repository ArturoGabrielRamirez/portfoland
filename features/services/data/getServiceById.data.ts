/**
 * Get Service by ID
 *
 * Retrieves a single service by its ID.
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';

/**
 * Get a single service by ID
 *
 * @param id - The service ID
 * @returns The service or null if not found
 */
export async function getServiceByIdData(id: string): Promise<ServiceModel | null> {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  return service;
}
