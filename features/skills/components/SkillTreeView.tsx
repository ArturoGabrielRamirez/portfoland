'use client';

/**
 * SkillTreeView Component
 *
 * Responsive container component that switches between:
 * - Desktop (>=768px): GalaxyCanvas
 * - Mobile (<768px): MobileSkillList
 */

import { memo, useState, useCallback, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SkillTreeViewProps, UserSkillWithDetails } from '../types/skill';
import { GalaxyCanvas } from './GalaxyCanvas';
import { MobileSkillList } from './MobileSkillList';
import { SkillDetailCard } from './SkillDetailCard';
import { ManualSkillModal } from './ManualSkillModal';
import { AddSkillFAB } from './AddSkillFAB';
import { deleteSkill } from '../actions/deleteSkill';

/**
 * Custom hook for media query matching
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * SkillTreeView renders the appropriate view based on screen size
 */
function SkillTreeViewComponent({
  userSkills,
  categories,
  isEditable = false,
  onAddSkill,
  className,
}: SkillTreeViewProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedSkill, setSelectedSkill] = useState<UserSkillWithDetails | null>(null);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<UserSkillWithDetails | null>(null);
  const [prefilledCategoryId, setPrefilledCategoryId] = useState<string | undefined>();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Handle skill click
  const handleSkillClick = useCallback((skill: UserSkillWithDetails) => {
    setSelectedSkill(skill);
    setIsDetailCardOpen(true);
  }, []);

  // Handle add skill
  const handleAddSkill = useCallback((categoryId?: string) => {
    setPrefilledCategoryId(categoryId);
    if (onAddSkill) {
      onAddSkill();
    } else {
      setIsAddModalOpen(true);
    }
  }, [onAddSkill]);

  // Handle close detail card
  const handleCloseDetailCard = useCallback(() => {
    setIsDetailCardOpen(false);
    // Delay clearing selected skill to allow animation
    setTimeout(() => setSelectedSkill(null), 300);
  }, []);

  // Handle close add modal
  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setSkillToEdit(null);
    setPrefilledCategoryId(undefined);
  }, []);

  // Handle add modal success
  const handleAddSuccess = useCallback(() => {
    handleCloseAddModal();
    // Refresh would typically happen via revalidation
  }, [handleCloseAddModal]);

  // Handle edit skill
  const handleEditSkill = useCallback(() => {
    if (selectedSkill) {
      setSkillToEdit(selectedSkill);
      setIsEditMode(true);
      setIsAddModalOpen(true);
      setIsDetailCardOpen(false);
    }
  }, [selectedSkill]);

  // Handle delete skill
  const handleDeleteSkill = useCallback(() => {
    if (!selectedSkill) return;

    // Check if skill has experience sources
    const hasExperienceSources = selectedSkill.sources?.some(
      (source) => source.sourceType === 'EXPERIENCE'
    );

    if (hasExperienceSources) {
      toast.error('Cannot delete skills linked to experiences. Remove the skill from the experience first.');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedSkill.skill?.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteSkill({ id: selectedSkill.id });

      if (result.hasError) {
        toast.error(result.message || 'Failed to delete skill');
      } else {
        toast.success(result.message || 'Skill deleted successfully');
        setIsDetailCardOpen(false);
        setSelectedSkill(null);
      }
    });
  }, [selectedSkill]);

  return (
    <div
      data-testid="skill-tree-view"
      className={cn('relative w-full h-full min-h-[400px]', className)}
    >
      {/* Desktop: Galaxy Canvas */}
      {isDesktop ? (
        <GalaxyCanvas
          userSkills={userSkills}
          categories={categories}
          onSkillClick={handleSkillClick}
          onAddSkill={handleAddSkill}
          className="w-full h-full"
        />
      ) : (
        /* Mobile: Skill List */
        <div className="w-full h-full overflow-y-auto p-4 pb-20">
          <MobileSkillList
            userSkills={userSkills}
            categories={categories}
            onSkillClick={handleSkillClick}
          />
        </div>
      )}

      {/* Skill Detail Card (shown when skill is selected) */}
      {selectedSkill && (
        <SkillDetailCard
          userSkill={selectedSkill}
          isOpen={isDetailCardOpen}
          onClose={handleCloseDetailCard}
          isEditable={isEditable}
          onEdit={isEditable ? handleEditSkill : undefined}
          onDelete={isEditable ? handleDeleteSkill : undefined}
        />
      )}

      {/* Add Skill FAB (mobile only) */}
      {!isDesktop && (
        <AddSkillFAB onClick={() => handleAddSkill()} />
      )}

      {/* Add/Edit Skill Modal */}
      <ManualSkillModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
        categories={categories}
        skillToEdit={isEditMode ? skillToEdit : undefined}
      />
    </div>
  );
}

export const SkillTreeView = memo(SkillTreeViewComponent);
