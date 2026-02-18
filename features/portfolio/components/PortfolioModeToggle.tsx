// =============================================================================
// Portfolio Mode Toggle Component
// =============================================================================
// Client component for switching between professional and gaming portfolio modes.
// Uses the useTransition + server action + toast pattern from UserMenu.
// =============================================================================

'use client'

import React, { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Briefcase, Gamepad2, LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { togglePortfolioMode } from '../actions/togglePortfolioMode'
import { PORTFOLIO_MODES } from '../constants/messages'
import type { PortfolioModeToggleProps } from '../types/portfolio'

import { Button } from '@/features/shadcn/ui/button'

// =============================================================================
// Component
// =============================================================================

/**
 * Toggle button for switching portfolio mode between professional and gaming.
 *
 * Displays the current mode icon (briefcase or gamepad) and switches
 * to the opposite mode on click. Shows loading state during transition
 * and provides toast feedback on completion.
 */
export function PortfolioModeToggle({ currentMode }: PortfolioModeToggleProps) {
  const [mounted, setMounted] = React.useState(false)
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const [isPending, startTransition] = useTransition()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800/50" />
    )
  }

  const isProfessional = currentMode === PORTFOLIO_MODES.PROFESSIONAL
  const nextMode = isProfessional
    ? PORTFOLIO_MODES.GAMING
    : PORTFOLIO_MODES.PROFESSIONAL

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await togglePortfolioMode({ mode: nextMode })

        if (result.hasError) {
          toast.error(result.message)
        } else {
          toast.success(t('modeToggle.success'))
        }
      } catch {
        toast.error(tCommon('errors.unexpected'))
      }
    })
  }

  const modeLabel = isProfessional
    ? t('modeToggle.professional')
    : t('modeToggle.gaming')

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`${t('modeToggle.label')}: ${modeLabel}`}
      className={cn(
        'gap-2 rounded-lg text-sm font-medium transition-all',
        'text-slate-400 hover:text-white hover:bg-[#1E293B]',
        isProfessional && 'hover:text-[#00D4FF]',
        !isProfessional && 'hover:text-[#D946EF]',
        isPending && 'pointer-events-none opacity-50'
      )}
    >
      {isPending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" data-testid="loading-spinner" />
      ) : isProfessional ? (
        <Briefcase className="h-4 w-4" data-testid="icon-briefcase" />
      ) : (
        <Gamepad2 className="h-4 w-4" data-testid="icon-gamepad" />
      )}
      <span className="hidden sm:inline">{modeLabel}</span>
    </Button>
  )
}
