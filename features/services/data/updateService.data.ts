/**
 * Update Service
 *
 * Updates an existing service by ID.
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';
import type { PriceType } from '@/app/generated/prisma/enums';

/**
 * Input for updating a service at the data layer
 */
export interface UpdateServiceData {
  id: string;
  title?: string;
  description?: string;
  priceType?: PriceType;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  order?: number;
  published?: boolean;
  imageUrl?: string | null;
}

/**
 * Update an existing service
 *
 * @param data - The update data (id is required, other fields optional)
 * @returns The updated service
 */
export async function updateServiceData(data: UpdateServiceData): Promise<ServiceModel> {
  const { id, ...updateFields } = data;

  const updateData: Record<string, unknown> = {};

  if (updateFields.title !== undefined) updateData.title = updateFields.title;
  if (updateFields.description !== undefined) updateData.description = updateFields.description;
  if (updateFields.priceType !== undefined) updateData.priceType = updateFields.priceType;
  if (updateFields.priceMin !== undefined) updateData.priceMin = updateFields.priceMin;
  if (updateFields.priceMax !== undefined) updateData.priceMax = updateFields.priceMax;
  if (updateFields.currency !== undefined) updateData.currency = updateFields.currency;
  if (updateFields.durationMinutes !== undefined) updateData.durationMinutes = updateFields.durationMinutes;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;

  const service = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  return service;
}
