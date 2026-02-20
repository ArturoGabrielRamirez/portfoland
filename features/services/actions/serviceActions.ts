/**
 * Service Server Actions
 *
 * Server actions for service CRUD operations.
 * Each action validates input, checks auth, calls the service layer, and
 * revalidates the dashboard cache.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { ServiceModel } from '../types/service';
import {
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
} from '../schemas/service.schema';
import {
  createServiceService,
  updateServiceService,
  deleteServiceService,
} from '../services/service.service';
import { SERVICE_MESSAGES } from '../constants/messages';
import type { PriceType } from '@/app/generated/prisma/enums';

// =============================================================================
// Create Service Action
// =============================================================================

/**
 * Create a new service for the authenticated user
 *
 * @param formData - Form data or plain object with service fields
 * @returns ActionResponse with created service
 */
export async function createServiceAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<ServiceModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(SERVICE_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            title: formData.get('title'),
            description: formData.get('description'),
            priceType: formData.get('priceType'),
            priceMin: formData.get('priceMin')
              ? parseFloat(formData.get('priceMin') as string)
              : undefined,
            priceMax: formData.get('priceMax')
              ? parseFloat(formData.get('priceMax') as string)
              : undefined,
            currency: formData.get('currency') || undefined,
            durationMinutes: formData.get('durationMinutes')
              ? parseInt(formData.get('durationMinutes') as string, 10)
              : undefined,
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
    const data = await createServiceSchema.validate(rawData);

    // Call service layer
    const service = await createServiceService({
      userId: session.user.id,
      title: data.title,
      description: data.description,
      priceType: data.priceType as PriceType,
      priceMin: data.priceMin ?? null,
      priceMax: data.priceMax ?? null,
      currency: data.currency,
      durationMinutes: data.durationMinutes ?? null,
      order: data.order,
      published: data.published,
      imageUrl: data.imageUrl ?? null,
    });

    // Revalidate cache
    revalidatePath('/dashboard/services');

    return {
      payload: service,
      message: SERVICE_MESSAGES.CREATE_SUCCESS,
    };
  });
}

// =============================================================================
// Update Service Action
// =============================================================================

/**
 * Update an existing service for the authenticated user
 *
 * @param formData - Form data or plain object with service fields
 * @returns ActionResponse with updated service
 */
export async function updateServiceAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<ServiceModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(SERVICE_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            title: formData.get('title') || undefined,
            description: formData.get('description') || undefined,
            priceType: formData.get('priceType') || undefined,
            priceMin: formData.get('priceMin')
              ? parseFloat(formData.get('priceMin') as string)
              : undefined,
            priceMax: formData.get('priceMax')
              ? parseFloat(formData.get('priceMax') as string)
              : undefined,
            currency: formData.get('currency') || undefined,
            durationMinutes: formData.get('durationMinutes')
              ? parseInt(formData.get('durationMinutes') as string, 10)
              : undefined,
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
    const data = await updateServiceSchema.validate(rawData);

    // Call service layer
    const service = await updateServiceService({
      id: data.id,
      userId: session.user.id,
      title: data.title,
      description: data.description,
      priceType: data.priceType as PriceType | undefined,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      currency: data.currency,
      durationMinutes: data.durationMinutes,
      order: data.order,
      published: data.published,
      imageUrl: data.imageUrl,
    });

    // Revalidate cache
    revalidatePath('/dashboard/services');

    return {
      payload: service,
      message: SERVICE_MESSAGES.UPDATE_SUCCESS,
    };
  });
}

// =============================================================================
// Delete Service Action
// =============================================================================

/**
 * Delete a service for the authenticated user
 *
 * @param formData - Form data or plain object with service id
 * @returns ActionResponse with deleted service
 */
export async function deleteServiceAction(
  formData: FormData | { id: string }
) {
  return actionWrapper<ServiceModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(SERVICE_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteServiceSchema.validate(rawData);

    // Call service layer
    const service = await deleteServiceService(data.id, session.user.id);

    // Revalidate cache
    revalidatePath('/dashboard/services');

    return {
      payload: service,
      message: SERVICE_MESSAGES.DELETE_SUCCESS,
    };
  });
}
