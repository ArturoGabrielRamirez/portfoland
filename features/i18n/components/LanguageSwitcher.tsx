// =============================================================================
// Language Switcher Component
// =============================================================================
// A dropdown component for switching between supported locales.
// Updates the URL to the new locale and optionally saves the preference
// to the user's database record if authenticated.
// =============================================================================

'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, Check, ChevronDown } from 'lucide-react'

import { useRouter, usePathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'
import { updateUserLocale } from '../actions/updateUserLocale'
import type { LanguageSwitcherProps, LanguageOption } from '../types/locale'

import { Button } from '@/features/shadcn/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shadcn/ui/dropdown-menu'

// =============================================================================
// Constants
// =============================================================================

/**
 * Available language options with display information.
 */
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
]

// =============================================================================
// Component
// =============================================================================

/**
 * Language switcher dropdown for changing the application locale.
 *
 * Features:
 * - Displays current locale with flag indicator
 * - Dropdown menu with all supported locales
 * - Updates URL to include new locale prefix
 * - Optionally saves preference to database for authenticated users
 * - Gaming-themed styling with dark backgrounds and cyan accents
 *
 * @example
 * ```tsx
 * // In a header component
 * <LanguageSwitcher isAuthenticated={!!session} />
 *
 * // With custom styling
 * <LanguageSwitcher className="ml-4" variant="dropdown" />
 * ```
 */
export function LanguageSwitcher({
  className,
  isAuthenticated = false,
  variant = 'dropdown',
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('languageSwitcher')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Get current language option
  const currentLanguage =
    LANGUAGE_OPTIONS.find((lang) => lang.code === locale) ?? LANGUAGE_OPTIONS[0]

  /**
   * Handles locale change by updating the URL and optionally saving to database.
   */
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return

    startTransition(async () => {
      // Navigate to the same path with the new locale
      router.replace(pathname, { locale: newLocale })

      // Save preference to database if authenticated
      if (isAuthenticated) {
        await updateUserLocale(newLocale)
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 gap-2 px-3',
            'border border-[#1E293B] bg-transparent',
            'text-[#94A3B8] hover:text-white',
            'hover:border-[#00D4FF]/50 hover:bg-[#1A2332]',
            'transition-all duration-200',
            'focus-visible:ring-[#00D4FF]/50',
            isPending && 'pointer-events-none opacity-50',
            className
          )}
          aria-label={t('label')}
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLanguage.flag}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-[160px] border-[#334155] bg-[#0D1421] text-white"
        align="end"
      >
        {LANGUAGE_OPTIONS.map((language) => {
          const isSelected = language.code === locale

          return (
            <DropdownMenuItem
              key={language.code}
              className={cn(
                'cursor-pointer gap-3 px-3 py-2',
                'text-[#94A3B8] focus:bg-[#1A2332] focus:text-white',
                isSelected && 'bg-[#1A2332]/50 text-white'
              )}
              onClick={() => handleLocaleChange(language.code)}
              disabled={isPending}
            >
              {/* Flag indicator */}
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded text-xs font-bold',
                  isSelected
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF]'
                    : 'bg-[#1E293B] text-[#64748B]'
                )}
              >
                {language.flag}
              </span>

              {/* Language name */}
              <span className="flex-1">
                {tCommon(`languages.${language.code}`)}
              </span>

              {/* Check mark for selected */}
              {isSelected && (
                <Check className="h-4 w-4 text-[#00D4FF]" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
