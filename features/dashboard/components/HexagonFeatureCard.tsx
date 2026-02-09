'use client'

/**
 * HexagonFeatureCard Component
 * 
 * Hexagonal feature card for cyberpunk dashboard:
 * - Uses HexagonStatCard as base
 * - Consistent with dashboard hexagon design
 * - Hover effects with cyberpunk glow
 * - Maintains cyberpunk aesthetic
 */

import { useState } from 'react'
import { HexagonStatCard } from '@/features/dashboard/components'
import Link from 'next/link'

interface HexagonFeatureCardProps {
  title: string
  description: string
  status: string
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  href: string
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function HexagonFeatureCard({
  title,
  description,
  status,
  color,
  href,
  icon,
  size = 'lg'
}: HexagonFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = () => {
    switch (color) {
      case 'magenta': return 'bg-[#D946EF]/20 text-[#D946EF]'
      case 'green': return 'bg-[#22C55E]/20 text-[#22C55E]'
      case 'yellow': return 'bg-[#EAB308]/20 text-[#EAB308]'
      default: return 'bg-[#00D4FF]/20 text-[#00D4FF]'
    }
  }

  const getHexagonSize = () => {
    switch (size) {
      case 'sm': return 'sm'
      case 'md': return 'md'
      default: return 'lg'
    }
  }

  return (
    <Link href={href}>
      <div 
        className="relative h-full group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(circle at center, ${color === 'magenta' ? '#D946EF' : color === 'green' ? '#22C55E' : color === 'yellow' ? '#EAB308' : '#00D4FF'}20 0%, transparent 70%)`,
          }}
        />

        <div className="h-full flex flex-col items-center justify-center text-center p-8 relative z-10">
          {/* Main Hexagon Icon */}
          <div className="mb-6 transform transition-all duration-300 group-hover:scale-110 scale-150">
            <HexagonStatCard
              value=""
              label=""
              color={color}
              icon={icon}
              size={getHexagonSize()}
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 transition-colors group-hover:opacity-90">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#94A3B8] mb-4 leading-relaxed group-hover:text-[#CBD5E1] transition-colors">
            {description}
          </p>

          {/* Status Badge */}
          <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold transition-all group-hover:scale-105 ${getStatusColor()}`}>
            {status}
          </div>

          {/* Hover details - appears on hover */}
          <div className={`absolute bottom-4 left-0 right-0 text-center transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="text-xs text-[#64748B]">
              Click to enter →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}