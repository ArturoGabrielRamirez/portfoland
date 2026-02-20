/**
 * Create Testimonial
 *
 * Creates a new testimonial in the database.
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Input for creating a testimonial at the data layer
 */
export interface CreateTestimonialData {
  userId: string;
  clientName: string;
  clientTitle?: string | null;
  content: string;
  rating: number;
  imageUrl?: string | null;
  source?: string | null;
  externalId?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Create a new testimonial
 *
 * @param data - The testimonial data
 * @returns The created testimonial
 */
export async function createTestimonialData(data: CreateTestimonialData): Promise<TestimonialModel> {
  const testimonial = await prisma.testimonial.create({
    data: {
      userId: data.userId,
      clientName: data.clientName,
      clientTitle: data.clientTitle ?? null,
      content: data.content,
      rating: data.rating,
      imageUrl: data.imageUrl ?? null,
      source: data.source ?? null,
      externalId: data.externalId ?? null,
      order: data.order ?? 0,
      published: data.published ?? true,
    },
  });

  return testimonial;
}
