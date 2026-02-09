'use client'

/**
 * QuickAccessWithSpotlights Component
 * 
 * Quick access with individual spotlight effects below each hexagon:
 * - Individual spotlight/foco below each hexagon
 * - Sequential vertical light beam effect
 * - Color-matched to hexagon colors
 * - Perfect tooltip background effect
 */

import { useState } from 'react'
import { HexagonStatCard, CyberpunkTooltip, CyberpunkSpotlight } from '@/features/dashboard/components'
import Link from 'next/link'

interface QuickAccessProps {
  locale: string
  userId: string
}

interface QuickAccessItem {
  id: number
  href: string
  tooltip: string
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  icon: React.ReactNode
  label: string
}

export function QuickAccessWithSpotlights({ locale, userId }: QuickAccessProps) {
  const [activeSpotlight, setActiveSpotlight] = useState<number | null>(null)

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: 0,
      href: `/${locale}/dashboard/timeline`,
      tooltip: "Add Timeline Events",
      color: "cyan",
      icon: <PlusIcon className="h-4 w-4" />,
      label: ""
    },
    {
      id: 1,
      href: `/${locale}/dashboard/skills`,
      tooltip: "Edit Skills Profile",
      color: "magenta",
      icon: <EditIcon className="h-4 w-4" />,
      label: ""
    },
    {
      id: 2,
      href: `/${locale}/dashboard/my-cv`,
      tooltip: "Download CV",
      color: "green",
      icon: <DownloadIcon className="h-4 w-4" />,
      label: ""
    },
    {
      id: 3,
      href: `/${locale}/portfolio/${userId}`,
      tooltip: "View Portfolio",
      color: "yellow",
      icon: <ShareIcon className="h-4 w-4" />,
      label: ""
    }
  ]

  const handleHexagonHover = (item: QuickAccessItem) => {
    setActiveSpotlight(item.id)
  }

  const handleHexagonLeave = () => {
    setActiveSpotlight(null)
  }

  return (
    <div className="space-y-8">
      {/* Quick Access Hexagons with Individual Spotlights Below */}
      <div className="flex gap-4 justify-center">
        {quickAccessItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-3">
            {/* Hexagon with tooltip */}
            <Link href={item.href}>
              <div 
                className="group cursor-pointer transform transition-all hover:scale-110 hover:rotate-6"
                onMouseEnter={() => handleHexagonHover(item)}
                onMouseLeave={handleHexagonLeave}
              >
                <CyberpunkTooltip 
                  content={item.tooltip}
                  color={item.color}
                  position="top"
                  size="sm"
                >
                  <div className={activeSpotlight === item.id ? 'scale-110 transition-transform duration-300' : 'transition-transform duration-300'}>
                    <HexagonStatCard
                      value={item.label}
                      label={item.label}
                      color={item.color}
                      icon={item.icon}
                      size="sm"
                    />
                  </div>
                </CyberpunkTooltip>
              </div>
            </Link>
            
            {/* Individual Spotlight Below Each Hexagon */}
            <CyberpunkSpotlight
              isActive={activeSpotlight === item.id}
              color={item.color}
              delay={item.id * 100} // Faster sequential delay for spotlight turn-on effect
              size="md"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Icons needed
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}