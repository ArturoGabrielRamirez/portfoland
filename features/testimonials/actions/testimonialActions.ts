/**
 * Testimonial Server Actions
 *
 * Server actions for testimonial CRUD operations.
 * Each action validates input, checks auth, calls the service layer, and
 * revalidates the dashboard cache.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { TestimonialModel } from '../types/testimonial';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
} from '../schemas/testimonial.schema';
import {
  createTestimonialService,
  updateTestimonialService,
  deleteTestimonialService,
} from '../services/testimonial.service';
import { TESTIMONIAL_MESSAGES } from '../constants/messages';

// =============================================================================
// Create Testimonial Action
// =============================================================================

/**
 * Create a new testimonial for the authenticated user
 *
 * @param formData - Form data or plain object with testimonial fields
 * @returns ActionResponse with created testimonial
 */
export async function createTestimonialAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<TestimonialModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(TESTIMONIAL_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            clientName: formData.get('clientName'),
            clientTitle: formData.get('clientTitle') || undefined,
            content: formData.get('content'),
            rating: formData.get('rating')
              ? parseInt(formData.get('rating') as string, 10)
              : undefined,
            source: formData.get('source') || undefined,
            externalId: formData.get('externalId') || undefined,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
            published: formData.has('published')
              ? formData.get('published') === 'true'
              : undefined,
            imageUrl: formData.get('imageUrl') || undefined,
          }
        : formData;

    // Validate with Yup
    const data = await createTestimonialSchema.validate(rawData);

    // Call service layer
    const testimonial = await createTestimonialService({
      userId: session.user.id,
      clientName: data.clientName,
      clientTitle: data.clientTitle ?? null,
      content: data.content,
      rating: data.rating,
      source: data.source ?? null,
      externalId: data.externalId ?? null,
      order: data.order,
      published: data.published,
      imageUrl: data.imageUrl ?? null,
    });

    // Revalidate cache
    revalidatePath('/dashboard/testimonials');

    return {
      payload: testimonial,
      message: TESTIMONIAL_MESSAGES.CREATE_SUCCESS,
    };
  });
}

// =============================================================================
// Update Testimonial Action
// =============================================================================

/**
 * Update an existing testimonial for the authenticated user
 *
 * @param formData - Form data or plain object with testimonial fields
 * @returns ActionResponse with updated testimonial
 */
export async function updateTestimonialAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<TestimonialModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(TESTIMONIAL_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            clientName: formData.get('clientName') || undefined,
            clientTitle: formData.get('clientTitle') || undefined,
            content: formData.get('content') || undefined,
            rating: formData.get('rating')
              ? parseInt(formData.get('rating') as string, 10)
              : undefined,
            source: formData.get('source') || undefined,
            externalId: formData.get('externalId') || undefined,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
            published: formData.has('published')
              ? formData.get('published') === 'true'
              : undefined,
            imageUrl: formData.get('imageUrl') || undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updateTestimonialSchema.validate(rawData);

    // Call service layer
    const testimonial = await updateTestimonialService({
      id: data.id,
      userId: session.user.id,
      clientName: data.clientName,
      clientTitle: data.clientTitle,
      content: data.content,
      rating: data.rating,
      source: data.source,
      externalId: data.externalId,
      order: data.order,
      published: data.published,
      imageUrl: data.imageUrl,
    });

    // Revalidate cache
    revalidatePath('/dashboard/testimonials');

    return {
      payload: testimonial,
      message: TESTIMONIAL_MESSAGES.UPDATE_SUCCESS,
    };
  });
}

// =============================================================================
// Delete Testimonial Action
// =============================================================================

/**
 * Delete a testimonial for the authenticated user
 *
 * @param formData - Form data or plain object with testimonial id
 * @returns ActionResponse with deleted testimonial
 */
export async function deleteTestimonialAction(
  formData: FormData | { id: string }
) {
  return actionWrapper<TestimonialModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(TESTIMONIAL_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteTestimonialSchema.validate(rawData);

    // Call service layer
    const testimonial = await deleteTestimonialService(data.id, session.user.id);

    // Revalidate cache
    revalidatePath('/dashboard/testimonials');

    return {
      payload: testimonial,
      message: TESTIMONIAL_MESSAGES.DELETE_SUCCESS,
    };
  });
}
