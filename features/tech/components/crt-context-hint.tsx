'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CRT_HINTS } from '../constants/crtHints'
import type { PageContext } from '../types/page-context'
import type { PortfolioMode } from '@/features/portfolio/types/portfolio'

interface CRTContextHintProps {
  pageContext: PageContext
  portfolioMode: PortfolioMode
  onPromptClick: (text: string) => void
  className?: string
}

/**
 * Renders contextual prompt chips below the CRT panel.
 * Dismissed state is persisted per-page in localStorage.
 */
export function CRTContextHint({
  pageContext,
  portfolioMode,
  onPromptClick,
  className,
}: CRTContextHintProps) {
  const dismissKey = `crt-hint-dismissed-${pageContext}`
  const isTech = portfolioMode === 'tech'
  const hints = CRT_HINTS[pageContext]

  const [dismissed, setDismissed] = useState(true) // start hidden, read from localStorage

  useEffect(() => {
    setDismissed(!!localStorage.getItem(dismissKey))
  }, [dismissKey])

  if (!hints || hints.length === 0 || dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, '1')
    setDismissed(true)
  }

  if (isTech) {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap px-1', className)}>
        <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
          [NEURAL_LINK]: ask me —
        </span>
        {hints.map((hint) => (
          <button
            key={hint}
            onClick={() => onPromptClick(hint)}
            className="text-[10px] font-mono text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.3)] px-2 py-0.5 hover:bg-[hsl(174,100%,50%,0.08)] hover:border-[hsl(174,100%,50%,0.6)] transition-colors"
          >
            {hint}
          </button>
        ))}
        <button
          onClick={handleDismiss}
          className="ml-auto text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          aria-label="Dismiss hints"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap px-1', className)}>
      <span className="text-xs text-gray-400 shrink-0">Tip: Try asking —</span>
      {hints.map((hint) => (
        <button
          key={hint}
          onClick={() => onPromptClick(hint)}
          className="text-xs text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          {hint}
        </button>
      ))}
      <button
        onClick={handleDismiss}
        className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Dismiss hints"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
