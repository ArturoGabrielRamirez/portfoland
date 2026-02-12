'use client';

/**
 * ExperienceFormModal Component
 *
 * Modal wrapper for ExperienceForm.
 * Supports create and edit modes.
 */

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import type { Experience, CreateExperienceInput, UpdateExperienceInput } from '../types/experience';
import { ExperienceForm } from './ExperienceForm';

interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience;
  onSubmit: (data: CreateExperienceInput | UpdateExperienceInput) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ExperienceFormModal wraps ExperienceForm in a modal
 */
function ExperienceFormModalComponent({
  isOpen,
  onClose,
  experience,
  onSubmit,
  isLoading = false,
}: ExperienceFormModalProps) {
  const isEditMode = !!experience;

  // Handle submit and close on success
  const handleSubmit = useCallback(
    async (data: CreateExperienceInput | UpdateExperienceInput) => {
      await onSubmit(data);
      onClose();
    },
    [onSubmit, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative w-full max-w-lg max-h-[90vh] overflow-y-auto font-mono',
              'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,8%)]">
              <h2 className="text-lg font-semibold text-foreground">
                {isEditMode ? 'Edit Experience' : 'Add New Experience'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Accent line */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />

            {/* Form */}
            <div className="p-4">
              <ExperienceForm
                experience={experience}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isLoading={isLoading}
              />
            </div>

            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const ExperienceFormModal = memo(ExperienceFormModalComponent);
