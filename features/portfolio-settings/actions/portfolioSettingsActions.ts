/**
 * PortfolioSettings Server Actions
 *
 * Server actions for updating portfolio settings.
 * Uses actionWrapper for consistent error handling.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { PortfolioSettingsModel } from '../types/portfolioSettings';
import { updatePortfolioSettingsSchema } from '../schemas/portfolioSettings.schema';
import { updatePortfolioSettingsService } from '../services/portfolioSettings.service';
import { PORTFOLIO_SETTINGS_MESSAGES } from '../constants/messages';

/**
 * Update portfolio settings for the authenticated user
 *
 * @param formData - Form data or plain object with settings fields
 * @returns ActionResponse with updated settings
 */
export async function updatePortfolioSettingsAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<PortfolioSettingsModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please log in to continue');
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            theme: formData.get('theme') || undefined,
            layoutVariant: formData.get('layoutVariant') || undefined,
            accentColor: formData.get('accentColor') || undefined,
            fontFamily: formData.get('fontFamily') || undefined,
            heroStyle: formData.get('heroStyle') || undefined,
            showBranding:
              formData.has('showBranding')
                ? formData.get('showBranding') === 'true'
                : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updatePortfolioSettingsSchema.validate(rawData);

    // Call service (business logic validation + data persistence)
    const settings = await updatePortfolioSettingsService(session.user.id, {
      theme: data.theme,
      layoutVariant: data.layoutVariant,
      accentColor: data.accentColor,
      fontFamily: data.fontFamily,
      heroStyle: data.heroStyle,
      showBranding: data.showBranding,
    });

    // Revalidate cache
    revalidatePath('/dashboard/settings');

    return {
      payload: settings,
      message: PORTFOLIO_SETTINGS_MESSAGES.UPDATE_SUCCESS,
    };
  });
}

/**
 * Update portfolio view mode for the authenticated user
 *
 * @param viewMode - The new view mode value
 * @returns ActionResponse with updated settings
 */
export async function updatePortfolioViewModeAction(viewMode: string) {
  return actionWrapper<PortfolioSettingsModel>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please log in to continue');
    }

    const data = await updatePortfolioSettingsSchema.validate({ viewMode });

    const settings = await updatePortfolioSettingsService(session.user.id, {
      viewMode: data.viewMode,
    });

    revalidatePath('/dashboard/portfolio');

    return {
      payload: settings,
      message: PORTFOLIO_SETTINGS_MESSAGES.UPDATE_SUCCESS,
    };
  });
}

/**
 * Update portfolio layout variant for the authenticated user.
 * Only meaningful for Classic Mode users — controls which Classic template is used.
 *
 * @param layoutVariant - One of: 'bento', 'stacked', 'sidebar', 'photographer', 'designer', 'writer'
 * @returns ActionResponse with updated settings
 */
export async function updateLayoutVariantAction(layoutVariant: string) {
  return actionWrapper<PortfolioSettingsModel>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please log in to continue');
    }

    const data = await updatePortfolioSettingsSchema.validate({ layoutVariant });

    const settings = await updatePortfolioSettingsService(session.user.id, {
      layoutVariant: data.layoutVariant,
    });

    revalidatePath('/dashboard/portfolio');

    return {
      payload: settings,
      message: PORTFOLIO_SETTINGS_MESSAGES.UPDATE_SUCCESS,
    };
  });
}
