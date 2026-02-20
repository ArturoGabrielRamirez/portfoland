/**
 * Create Service
 *
 * Creates a new service in the database.
 */

import { prisma } from '@/lib/prisma';
import type { ServiceModel } from '../types/service';
import type { PriceType } from '@/app/generated/prisma/enums';

/**
 * Input for creating a service at the data layer
 */
export interface CreateServiceData {
  userId: string;
  title: string;
  description: string;
  priceType: PriceType;
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
 * @param data - The service data
 * @returns The created service
 */
export async function createServiceData(data: CreateServiceData): Promise<ServiceModel> {
  const service = await prisma.service.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      priceType: data.priceType,
      priceMin: data.priceMin ?? null,
      priceMax: data.priceMax ?? null,
      currency: data.currency ?? 'USD',
      durationMinutes: data.durationMinutes ?? null,
      order: data.order ?? 0,
      published: data.published ?? true,
      imageUrl: data.imageUrl ?? null,
    },
  });

  return service;
}
