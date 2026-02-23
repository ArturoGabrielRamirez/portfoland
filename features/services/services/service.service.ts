/**
 * Service Service Layer
 *
 * Business logic for service operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { PriceType } from '@/app/generated/prisma/enums';
import type { ServiceModel } from '../types/service';
import {
  createServiceData,
  updateServiceData,
  deleteServiceData,
  getServiceByIdData,
  getServicesByUserIdData,
} from '../data';
import { SERVICE_MESSAGES } from '../constants/messages';
import { MAX_SERVICES_PER_USER } from '../constants/limits';
import { invalidateNarrativeCache } from '@/features/ai-narrator';
import { prisma } from '@/lib/prisma';

/**
 * Input for creating a service via service layer
 */
export interface CreateServiceServiceInput {
  userId: string;
  title: string;
  description: string;
  priceType: PriceType | string;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  order?: number;
  published?: boolean;
  imageUrl?: string | null;
}

/**
 * Input for updating a service via service layer
 */
export interface UpdateServiceServiceInput {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  priceType?: PriceType | string;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  order?: number;
  published?: boolean;
  imageUrl?: string | null;
}

/**
 * Create a new service
 *
 * Enforces the MAX_SERVICES_PER_USER limit before creating.
 *
 * @param input - The service data including userId
 * @returns The created service
 * @throws Error if user has reached the service limit
 */
export async function createServiceService(
  input: CreateServiceServiceInput
): Promise<ServiceModel> {
  // Enforce per-user service limit
  const currentCount = await prisma.service.count({
    where: { userId: input.userId },
  });

  if (currentCount >= MAX_SERVICES_PER_USER) {
    throw new Error(
      `You have reached the maximum of ${MAX_SERVICES_PER_USER} services`
    );
  }

  const service = await createServiceData({
    userId: input.userId,
    title: input.title.trim(),
    description: input.description.trim(),
    priceType: input.priceType as PriceType,
    priceMin: input.priceMin ?? null,
    priceMax: input.priceMax ?? null,
    currency: input.currency ?? 'USD',
    durationMinutes: input.durationMinutes ?? null,
    order: input.order ?? 0,
    published: input.published ?? true,
    imageUrl: input.imageUrl ?? null,
  });

  invalidateNarrativeCache(input.userId).catch(() => {});
  return service;
}

/**
 * Update an existing service
 *
 * Verifies ownership before applying the update.
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated service
 * @throws Error if not found or not authorized
 */
export async function updateServiceService(
  input: UpdateServiceServiceInput
): Promise<ServiceModel> {
  const { id, userId, ...updateFields } = input;

  // Check ownership
  const existing = await getServiceByIdData(id);
  if (!existing) {
    throw new Error(SERVICE_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(SERVICE_MESSAGES.UNAUTHORIZED);
  }

  // Build update data, trimming strings
  const updateData: Record<string, unknown> = { id };
  if (updateFields.title !== undefined) updateData.title = updateFields.title.trim();
  if (updateFields.description !== undefined)
    updateData.description = updateFields.description.trim();
  if (updateFields.priceType !== undefined) updateData.priceType = updateFields.priceType;
  if (updateFields.priceMin !== undefined) updateData.priceMin = updateFields.priceMin;
  if (updateFields.priceMax !== undefined) updateData.priceMax = updateFields.priceMax;
  if (updateFields.currency !== undefined) updateData.currency = updateFields.currency;
  if (updateFields.durationMinutes !== undefined)
    updateData.durationMinutes = updateFields.durationMinutes;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;

  const service = await updateServiceData(
    updateData as unknown as Parameters<typeof updateServiceData>[0]
  );

  invalidateNarrativeCache(userId).catch(() => {});
  return service;
}

/**
 * Delete a service
 *
 * Verifies ownership before deleting.
 *
 * @param id - The service ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted service
 * @throws Error if not found or not authorized
 */
export async function deleteServiceService(
  id: string,
  userId: string
): Promise<ServiceModel> {
  // Check ownership
  const existing = await getServiceByIdData(id);
  if (!existing) {
    throw new Error(SERVICE_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(SERVICE_MESSAGES.UNAUTHORIZED);
  }

  const service = await deleteServiceData(id);
  invalidateNarrativeCache(userId).catch(() => {});
  return service;
}

/**
 * Get all services for a user (dashboard view)
 *
 * @param userId - The user ID
 * @returns Array of services
 */
export async function getServicesService(userId: string): Promise<ServiceModel[]> {
  return getServicesByUserIdData(userId);
}
