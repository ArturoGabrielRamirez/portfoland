'use client'

/**
 * AIAssistantFloat — Persistent floating AI chat widget for dashboard pages.
 *
 * Renders a fixed bottom-right button (Tech: AIEye hex, Classic: chat icon).
 * Click to expand a real chat panel connected to /api/chat via useChat.
 * Auto-hides on pages that already embed CRTWithAI (dashboard home, skills).
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from 'ai/react'
import { MessageSquare, Send, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AIEye } from './crt-with-ai'
import type { AIState } from './crt-with-ai'
import type { PortfolioMode } from '@/features/portfolio/types/portfolio'

// =============================================================================
// Constants
// =============================================================================

/**
 * Normalized path segments (after stripping locale) where CRTWithAI already
 * exists — the float should not render on these pages.
 */
const SKIP_SEGMENTS = ['/dashboard', '/dashboard/skills']

// =============================================================================
// Props
// =============================================================================

interface AIAssistantFloatProps {
  portfolioMode: PortfolioMode
  locale: string
}

// =============================================================================
// Component
// =============================================================================

export function AIAssistantFloat({ portfolioMode, locale }: AIAssistantFloatProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Strip locale prefix from pathname to get the route segment
  // e.g. "/en/dashboard/projects" → "/dashboard/projects"
  const segment = pathname.replace(new RegExp(`^/${locale}`), '') || '/'

  // Call useChat unconditionally (rules of hooks)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { locale },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          locale === 'es'
            ? '¿Necesitas ayuda con tu portfolio? Puedo ayudarte a mejorar tu bio, agregar skills o generar contenido.'
            : "Need help with your portfolio? I can help improve your bio, add skills, or generate content.",
      },
    ],
  })

  // Derive AIState from chat loading state
  const aiState: AIState = isLoading ? 'thinking' : isOpen ? 'awake' : 'sleeping'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Hide on pages that already have CRTWithAI
  const shouldHide = SKIP_SEGMENTS.includes(segment)
  if (shouldHide) return null

  const isTech = portfolioMode === 'tech'

  // ---------------------------------------------------------------------------
  // Classic Mode variant — minimal chat button
  // ---------------------------------------------------------------------------
  if (!isTech) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="w-72 rounded border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-medium text-gray-700">AI Assistant</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64 min-h-32">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'text-xs p-2 rounded',
                    m.role === 'assistant'
                      ? 'bg-blue-50 text-blue-900'
                      : 'bg-gray-100 text-gray-800 ml-4',
                  )}
                >
                  {m.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-xs text-gray-400 animate-pulse">Thinking...</div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t border-gray-100">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask something…"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors',
            isOpen ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-gray-200',
          )}
          title="AI Assistant"
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Tech Mode variant — AIEye hex button + terminal chat panel
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Chat panel — shown above the eye button */}
      {isOpen && (
        <div className="w-80 flex flex-col border border-[hsl(174,100%,50%,0.3)] bg-[hsl(200,30%,6%)] shadow-[0_0_20px_hsl(174,100%,50%,0.1)]">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(174,100%,50%,0.15)]">
            <span className="font-mono text-[10px] text-[hsl(174,100%,50%)] opacity-70 uppercase tracking-widest">
              // AI_ASSISTANT.exe
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="font-mono text-[10px] text-gray-500 hover:text-[hsl(174,100%,50%)] transition-colors"
            >
              [×]
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64 min-h-32">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'font-mono text-[10px] p-2',
                  m.role === 'assistant'
                    ? 'bg-[hsl(174,100%,50%,0.05)] border border-[hsl(174,100%,50%,0.15)] text-gray-300'
                    : 'bg-[hsl(200,30%,10%)] text-gray-400 ml-4',
                )}
              >
                <span
                  className={
                    m.role === 'assistant'
                      ? 'text-[hsl(174,100%,50%)]'
                      : 'text-gray-600'
                  }
                >
                  {m.role === 'assistant' ? '> ' : '$ '}
                </span>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="font-mono text-[10px] text-[hsl(174,100%,50%)] animate-pulse">
                &gt; Processing...
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-2 border-t border-[hsl(174,100%,50%,0.15)]"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask something…"
              className="flex-1 font-mono text-[10px] bg-[hsl(200,20%,10%)] border border-[hsl(174,100%,50%,0.2)] text-gray-200 px-2 py-1.5 focus:outline-none focus:border-[hsl(174,100%,50%,0.5)] placeholder:text-gray-700"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-1.5 bg-[hsl(174,100%,50%,0.15)] border border-[hsl(174,100%,50%,0.3)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.25)] disabled:opacity-30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* AIEye toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="transition-opacity hover:opacity-90"
        title="AI Assistant"
      >
        <AIEye state={aiState} mouseOffset={{ x: 0, y: 0 }} isBlinking={false} />
      </button>
    </div>
  )
}
