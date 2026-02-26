// =============================================================================
// Portfolio Mode Toggle Component
// =============================================================================
// Client component for switching between classic and tech portfolio modes.
// Shows a confirmation warning before committing the switch.
// =============================================================================

'use client'

import React, { useTransition, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Briefcase, Terminal, LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { togglePortfolioMode } from '../actions/togglePortfolioMode'
import { PORTFOLIO_MODES } from '../constants/messages'
import type { PortfolioModeToggleProps } from '../types/portfolio'

import { Button } from '@/features/shadcn/ui/button'

// =============================================================================
// Component
// =============================================================================

export function PortfolioModeToggle({ currentMode }: PortfolioModeToggleProps) {
  const [mounted, setMounted] = React.useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

  const isClassic = currentMode === PORTFOLIO_MODES.CLASSIC
  const nextMode = isClassic
    ? PORTFOLIO_MODES.TECH
    : PORTFOLIO_MODES.CLASSIC

  const handleToggle = () => {
    setShowConfirm(true)
  }

  const confirmToggle = () => {
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
      } finally {
        setShowConfirm(false)
      }
    })
  }

  const modeLabel = isClassic
    ? t('modeToggle.classic')
    : t('modeToggle.tech')

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={`${t('modeToggle.label')}: ${modeLabel}`}
        className={cn(
          'gap-2 rounded-lg text-sm font-medium transition-all',
          'text-slate-400 hover:text-white hover:bg-[#1E293B]',
          isClassic && 'hover:text-[#00D4FF]',
          !isClassic && 'hover:text-[#D946EF]',
          isPending && 'pointer-events-none opacity-50'
        )}
      >
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" data-testid="loading-spinner" />
        ) : isClassic ? (
          <Briefcase className="h-4 w-4" data-testid="icon-briefcase" />
        ) : (
          <Terminal className="h-4 w-4" data-testid="icon-terminal" />
        )}
        <span className="hidden sm:inline">{modeLabel}</span>
      </Button>

      {showConfirm && (
        <div className="mt-3 p-3 border border-[hsl(52,100%,50%,0.3)] bg-[hsl(52,100%,50%,0.05)] rounded-sm">
          <p className="text-[10px] font-mono text-[#FCD34D] mb-3">
            {t('modeToggle.switchWarning')}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmToggle}
              disabled={isPending}
              className="px-3 py-1 text-[10px] font-mono font-bold uppercase bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] rounded-sm hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] disabled:opacity-50"
            >
              {t('modeToggle.confirm')}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 text-[10px] font-mono text-[#64748B] hover:text-foreground"
            >
              {t('modeToggle.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
