/**
 * Testimonial Service Layer
 *
 * Business logic for testimonial operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { TestimonialModel } from '../types/testimonial';
import {
  createTestimonialData,
  updateTestimonialData,
  deleteTestimonialData,
  getTestimonialByIdData,
  getTestimonialsByUserIdData,
} from '../data';
import { TESTIMONIAL_MESSAGES } from '../constants/messages';
import { MAX_TESTIMONIALS_PER_USER } from '../constants/limits';
import { invalidateNarrativeCache } from '@/features/ai-narrator';
import { prisma } from '@/lib/prisma';

/**
 * Input for creating a testimonial via service layer
 */
export interface CreateTestimonialServiceInput {
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
 * Input for updating a testimonial via service layer
 */
export interface UpdateTestimonialServiceInput {
  id: string;
  userId: string;
  clientName?: string;
  clientTitle?: string | null;
  content?: string;
  rating?: number;
  imageUrl?: string | null;
  source?: string | null;
  externalId?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Create a new testimonial
 *
 * Enforces the MAX_TESTIMONIALS_PER_USER limit before creating.
 *
 * @param input - The testimonial data including userId
 * @returns The created testimonial
 * @throws Error if user has reached the testimonial limit
 */
export async function createTestimonialService(
  input: CreateTestimonialServiceInput
): Promise<TestimonialModel> {
  // Enforce per-user testimonial limit
  const currentCount = await prisma.testimonial.count({
    where: { userId: input.userId },
  });

  if (currentCount >= MAX_TESTIMONIALS_PER_USER) {
    throw new Error(
      `You have reached the maximum of ${MAX_TESTIMONIALS_PER_USER} testimonials`
    );
  }

  const testimonial = await createTestimonialData({
    userId: input.userId,
    clientName: input.clientName.trim(),
    clientTitle: input.clientTitle ?? null,
    content: input.content.trim(),
    rating: input.rating,
    imageUrl: input.imageUrl ?? null,
    source: input.source ?? null,
    externalId: input.externalId ?? null,
    order: input.order ?? 0,
    published: input.published ?? true,
  });

  invalidateNarrativeCache(input.userId).catch(() => {});
  return testimonial;
}

/**
 * Update an existing testimonial
 *
 * Verifies ownership before applying the update.
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated testimonial
 * @throws Error if not found or not authorized
 */
export async function updateTestimonialService(
  input: UpdateTestimonialServiceInput
): Promise<TestimonialModel> {
  const { id, userId, ...updateFields } = input;

  // Check ownership
  const existing = await getTestimonialByIdData(id);
  if (!existing) {
    throw new Error(TESTIMONIAL_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(TESTIMONIAL_MESSAGES.UNAUTHORIZED);
  }

  // Build update data, trimming strings
  const updateData: Record<string, unknown> = { id };
  if (updateFields.clientName !== undefined)
    updateData.clientName = updateFields.clientName.trim();
  if (updateFields.clientTitle !== undefined)
    updateData.clientTitle = updateFields.clientTitle;
  if (updateFields.content !== undefined)
    updateData.content = updateFields.content.trim();
  if (updateFields.rating !== undefined) updateData.rating = updateFields.rating;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.source !== undefined) updateData.source = updateFields.source;
  if (updateFields.externalId !== undefined) updateData.externalId = updateFields.externalId;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;

  const testimonial = await updateTestimonialData(
    updateData as unknown as Parameters<typeof updateTestimonialData>[0]
  );

  invalidateNarrativeCache(userId).catch(() => {});
  return testimonial;
}

/**
 * Delete a testimonial
 *
 * Verifies ownership before deleting.
 *
 * @param id - The testimonial ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted testimonial
 * @throws Error if not found or not authorized
 */
export async function deleteTestimonialService(
  id: string,
  userId: string
): Promise<TestimonialModel> {
  // Check ownership
  const existing = await getTestimonialByIdData(id);
  if (!existing) {
    throw new Error(TESTIMONIAL_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(TESTIMONIAL_MESSAGES.UNAUTHORIZED);
  }

  const testimonial = await deleteTestimonialData(id);
  invalidateNarrativeCache(userId).catch(() => {});
  return testimonial;
}

/**
 * Get all testimonials for a user (dashboard view)
 *
 * @param userId - The user ID
 * @returns Array of testimonials
 */
export async function getTestimonialsService(userId: string): Promise<TestimonialModel[]> {
  return getTestimonialsByUserIdData(userId);
}
