'use client';

/**
 * ManualSkillModal Component
 *
 * Modal wrapper for ManualSkillForm.
 * Supports pre-filled skill name from suggestions.
 */

import { memo, useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GamingCard } from '@/features/gaming';
import type { CreateSkillInput, SkillCategory, UserSkillWithDetails } from '../types/skill';
import { ManualSkillForm } from './ManualSkillForm';
import { CreateCategoryModal } from './CreateCategoryModal';
import { createSkill } from '../actions/createSkill';
import { updateSkill } from '../actions/updateSkill';
import { createCategory } from '../actions/createCategory';

/**
 * Props for ManualSkillModal
 */
interface ManualSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefilledSkillName?: string;
  categories: SkillCategory[];
  /** Skill to edit (enables edit mode) */
  skillToEdit?: UserSkillWithDetails | null;
}

/**
 * ManualSkillModal renders a modal for adding manual skills
 */
function ManualSkillModalComponent({
  isOpen,
  onClose,
  onSuccess,
  prefilledSkillName,
  categories,
  skillToEdit,
}: ManualSkillModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);

  const modalRef = useRef<HTMLDivElement>(null);

  // Determine if we're in edit mode
  const isEditMode = !!skillToEdit;

  // Update local categories when prop changes
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !isCategoryModalOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isCategoryModalOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCategoryModalOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isCategoryModalOpen]);

  const handleSubmit = async (data: CreateSkillInput) => {
    startTransition(async () => {
      if (isEditMode && skillToEdit) {
        // Update existing skill
        const result = await updateSkill({
          id: skillToEdit.id,
          selfAssessmentLevel: data.selfAssessmentLevel,
          learningSources: data.learningSources || undefined,
        });

        if (result.hasError) {
          toast.error(result.message);
        } else {
          toast.success(result.message || 'Skill updated successfully');
          onSuccess?.();
          onClose();
        }
      } else {
        // Create new skill
        const result = await createSkill({
          name: data.name,
          selfAssessmentLevel: data.selfAssessmentLevel,
          categoryId: data.categoryId || undefined,
          learningSources: data.learningSources || undefined,
          dateStarted: data.dateStarted ? new Date(data.dateStarted).toISOString() : undefined,
        });

        if (result.hasError) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
          onSuccess?.();
          onClose();
        }
      }
    });
  };

  const handleCreateCategory = async (data: { name: string; color: string }) => {
    const result = await createCategory(data);

    if (result.hasError) {
      throw new Error(result.message);
    }

    // Add new category to local list
    if (result.payload) {
      setLocalCategories((prev) => [...prev, result.payload!]);
    }

    toast.success('Category created successfully');
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md max-h-[90vh] overflow-hidden"
            >
              <GamingCard variant="glow" className="overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                    <h2 className="text-lg font-bold text-white">
                      {isEditMode ? 'Edit Skill' : 'Add New Skill'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
                  <ManualSkillForm
                    initialData={
                      isEditMode && skillToEdit
                        ? {
                            name: skillToEdit.skill?.name || '',
                            selfAssessmentLevel: ((skillToEdit.sources?.find(
                              (s) => s.sourceType === 'MANUAL'
                            )?.metadata as Record<string, unknown> | null)?.selfAssessmentLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | undefined) || 'BEGINNER',
                            categoryId: skillToEdit.skill?.categoryId,
                            learningSources: (skillToEdit.sources?.find(
                              (s) => s.sourceType === 'MANUAL'
                            )?.metadata as Record<string, unknown> | null)?.learningSources as string | undefined,
                          }
                        : prefilledSkillName
                        ? { name: prefilledSkillName }
                        : undefined
                    }
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={isPending}
                    categories={localCategories}
                    onCreateCategory={() => setIsCategoryModalOpen(true)}
                    isEditMode={isEditMode}
                  />
                </div>
              </GamingCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </>
  );
}

export const ManualSkillModal = memo(ManualSkillModalComponent);
