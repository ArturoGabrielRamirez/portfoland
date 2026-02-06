'use client'

/**
 * AnimatedSection Component
 *
 * Wrapper component for dashboard sections with entrance animations
 * and cyberpunk styling effects.
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
}

export function AnimatedSection({ 
  children, 
  delay = 0, 
  className = '',
  animation = 'fadeInUp'
}: AnimatedSectionProps) {
  const animationProps = {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: delay, duration: 0.6 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: delay, duration: 0.6 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: delay, duration: 0.6 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { delay: delay, duration: 0.6 }
    }
  }

  const props = animationProps[animation]

  return (
    <motion.div
      className={className}
      {...props}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}