// =============================================================================
// Update User Locale Server Action
// =============================================================================
// Server action to persist the user's locale preference to the database.
// Called when an authenticated user changes their language preference.
// =============================================================================

'use server'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidLocale, type Locale } from '@/i18n/config'

// =============================================================================
// Types
// =============================================================================

interface UpdateLocaleResult {
  success: boolean
  message?: string
}

// =============================================================================
// Server Action
// =============================================================================

/**
 * Updates the authenticated user's locale preference in the database.
 *
 * This action:
 * 1. Validates the user is authenticated
 * 2. Validates the locale is supported
 * 3. Updates the user's locale field in the database
 *
 * @param locale - The locale code to set (e.g., 'en', 'es')
 * @returns Result object indicating success or failure
 */
export async function updateUserLocale(
  locale: string
): Promise<UpdateLocaleResult> {
  try {
    // Validate locale
    if (!isValidLocale(locale)) {
      return {
        success: false,
        message: 'Invalid locale',
      }
    }

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    // If not authenticated, still return success (locale change via URL is valid)
    if (!session?.user?.id) {
      return {
        success: true,
        message: 'Locale updated (not persisted - user not authenticated)',
      }
    }

    // Update user's locale preference in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale: locale as Locale },
    })

    return {
      success: true,
      message: 'Locale preference saved',
    }
  } catch (error) {
    console.error('Failed to update user locale:', error)
    return {
      success: false,
      message: 'Failed to save locale preference',
    }
  }
}
