/**
 * Delete Service
 *
 * Deletes a service by ID.
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';

/**
 * Delete a service by ID
 *
 * @param id - The service ID to delete
 * @returns The deleted service
 */
export async function deleteServiceData(id: string): Promise<ServiceModel> {
  const service = await prisma.service.delete({
    where: { id },
  });

  return service;
}
