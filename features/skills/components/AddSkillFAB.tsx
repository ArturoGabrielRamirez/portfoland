'use client';

/**
 * AddSkillFAB Component
 *
 * Floating action button for adding skills on mobile.
 * Fixed position at bottom-right.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for AddSkillFAB
 */
interface AddSkillFABProps {
  /** Callback when FAB is clicked */
  onClick: () => void;
  /** Custom className */
  className?: string;
}

/**
 * AddSkillFAB renders a floating action button for adding skills
 */
function AddSkillFABComponent({ onClick, className }: AddSkillFABProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full',
        'flex items-center justify-center',
        'bg-[#00D4FF] text-[#0A0E1A]',
        'shadow-lg shadow-[#00D4FF]/30',
        'hover:bg-[#00D4FF]/90 hover:shadow-[#00D4FF]/50 hover:shadow-xl',
        'focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#0A0E1A]',
        'transition-all duration-200',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-label="Add skill"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
}

export const AddSkillFAB = memo(AddSkillFABComponent);
