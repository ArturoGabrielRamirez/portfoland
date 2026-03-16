'use client';

/**
 * SkillTreeView Component
 *
 * Responsive container component that switches between:
 * - Tech Mode desktop: CRTSkillCanvas (hexagonal)
 * - Tech Mode mobile: MobileSkillList
 * - Classic Mode (all sizes): MobileSkillList (list view)
 */

import { memo, useState, useCallback, useEffect, useTransition } from 'react';
import { GitBranch, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SkillTreeViewProps, UserSkillWithDetails } from '../types/skill';
import { CRTSkillCanvas } from './CRTSkillCanvas';
import { MobileSkillList } from './MobileSkillList';
import { SkillDetailCard } from './SkillDetailCard';
import { ManualSkillModal } from './ManualSkillModal';
import { AddSkillFAB } from './AddSkillFAB';
import { DeleteConfirmModal } from '@/features/ui/components/DeleteConfirmModal';
import { deleteSkill } from '../actions/deleteSkill';

/**
 * Custom hook for media query matching
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * SkillTreeView renders the appropriate view based on screen size and portfolioMode
 */
function SkillTreeViewComponent({
  userSkills,
  categories,
  isEditable = false,
  onAddSkill,
  className,
  githubConnected = false,
  locale = 'en',
  portfolioMode = 'tech',
}: SkillTreeViewProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isClassic = portfolioMode === 'classic';

  const [selectedSkill, setSelectedSkill] = useState<UserSkillWithDetails | null>(null);
  const [selectedSkillPosition, setSelectedSkillPosition] = useState<{ x: number; y: number; color?: string } | null>(null);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<UserSkillWithDetails | null>(null);
  const [prefilledCategoryId, setPrefilledCategoryId] = useState<string | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleSkillClick = useCallback((skill: UserSkillWithDetails, position?: { x: number; y: number; color?: string }) => {
    setSelectedSkill(skill);
    setSelectedSkillPosition(position || null);
    setIsDetailCardOpen(true);
  }, []);

  const handleAddSkill = useCallback((categoryId?: string) => {
    setPrefilledCategoryId(categoryId);
    if (onAddSkill) {
      onAddSkill();
    } else {
      setIsAddModalOpen(true);
    }
  }, [onAddSkill]);

  const handleCloseDetailCard = useCallback(() => {
    setIsDetailCardOpen(false);
    setTimeout(() => setSelectedSkill(null), 300);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setSkillToEdit(null);
    setPrefilledCategoryId(undefined);
  }, []);

  const handleAddSuccess = useCallback(() => {
    handleCloseAddModal();
  }, [handleCloseAddModal]);

  const handleEditSkill = useCallback(() => {
    if (selectedSkill) {
      setSkillToEdit(selectedSkill);
      setIsEditMode(true);
      setIsAddModalOpen(true);
      setIsDetailCardOpen(false);
    }
  }, [selectedSkill]);

  const handleDeleteSkill = useCallback(() => {
    if (!selectedSkill) return;

    const hasExperienceSources = selectedSkill.sources?.some(
      (source) => source.sourceType === 'EXPERIENCE'
    );

    if (hasExperienceSources) {
      toast.error('Cannot delete skills linked to experiences. Remove the skill from the experience first.');
      return;
    }

    setIsDeleteModalOpen(true);
  }, [selectedSkill]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedSkill) return;
    startDeleteTransition(async () => {
      const result = await deleteSkill({ id: selectedSkill.id });
      if (result.hasError) {
        toast.error(result.message || 'Failed to delete skill');
      } else {
        toast.success(result.message || 'Skill deleted successfully');
        setIsDetailCardOpen(false);
        setSelectedSkill(null);
      }
      setIsDeleteModalOpen(false);
    });
  }, [selectedSkill]);

  // Classic Mode or Mobile: always show list view
  const showListView = isClassic || !isDesktop;

  return (
    <div
      data-testid="skill-tree-view"
      className={cn('relative w-full h-full', className)}
    >
      {!showListView ? (
        /* Tech Mode Desktop: CRT hexagonal canvas */
        <div className="relative w-full h-full">
          <CRTSkillCanvas
            userSkills={userSkills}
            categories={categories}
            onSkillClick={handleSkillClick}
            onAddSkill={handleAddSkill}
            className="w-full h-full"
          />

          {/* Empty state overlay — Tech Mode only, when no skills */}
          {userSkills.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <GitBranch className="w-12 h-12 text-[hsl(174,100%,50%,0.3)] mb-4" />
              <p className="font-mono text-muted-foreground text-sm mb-3">No skills yet</p>
              {isEditable && (
                <button
                  onClick={() => handleAddSkill()}
                  className="flex items-center gap-1.5 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add your first skill
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Classic Mode or Mobile: list view */
        <div className={cn(
          'w-full h-full overflow-y-auto',
          isClassic ? 'p-0' : 'p-4 pb-20'
        )}>
          {userSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <GitBranch className={cn('w-12 h-12 mb-4', isClassic ? 'text-gray-300' : 'text-[hsl(174,100%,50%,0.3)]')} />
              <p className={cn('text-sm mb-3', isClassic ? 'text-gray-500' : 'font-mono text-muted-foreground')}>No skills yet</p>
              {isEditable && (
                <button
                  onClick={() => handleAddSkill()}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
                    isClassic
                      ? 'bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                      : 'bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-mono text-xs font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow'
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add your first skill
                </button>
              )}
            </div>
          ) : (
            <MobileSkillList
              userSkills={userSkills}
              categories={categories}
              onSkillClick={handleSkillClick}
            />
          )}
        </div>
      )}

      {/* Indicator Line (from selected node to detail card — Tech desktop only) */}
      {selectedSkill && isDetailCardOpen && selectedSkillPosition && !showListView && (() => {
        const lineColor = selectedSkillPosition.color || 'hsl(174,100%,50%)';
        return (
          <svg className="fixed inset-0 pointer-events-none z-40" style={{ width: '100vw', height: '100vh' }}>
            <defs>
              <filter id="indicator-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={`M ${selectedSkillPosition.x} ${selectedSkillPosition.y} Q ${selectedSkillPosition.x + 100} ${selectedSkillPosition.y - 50} ${typeof window !== 'undefined' ? window.innerWidth - 200 : 800} ${80}`}
              stroke={lineColor}
              strokeWidth="2"
              fill="none"
              strokeDasharray="8,4"
              opacity="0.7"
              filter="url(#indicator-glow)"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite" />
            </path>
            <circle cx={selectedSkillPosition.x} cy={selectedSkillPosition.y} r="8" fill="none" stroke={lineColor} strokeWidth="2" opacity="0.8">
              <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={typeof window !== 'undefined' ? window.innerWidth - 200 : 800} cy={80} r="4" fill={lineColor} opacity="0.8">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        );
      })()}

      {/* Skill Detail Card */}
      {selectedSkill && (
        <SkillDetailCard
          userSkill={selectedSkill}
          isOpen={isDetailCardOpen}
          onClose={handleCloseDetailCard}
          isEditable={isEditable}
          onEdit={isEditable ? handleEditSkill : undefined}
          onDelete={isEditable ? handleDeleteSkill : undefined}
          githubConnected={githubConnected}
          locale={locale}
        />
      )}

      {/* Add Skill FAB (mobile only, Tech Mode) */}
      {!isDesktop && !isClassic && (
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${selectedSkill?.skill?.name}"?`}
        description="This action cannot be undone. The skill and all its assessment history will be permanently removed."
        isLoading={isDeleting}
        portfolioMode={portfolioMode}
      />
    </div>
  );
}

export const SkillTreeView = memo(SkillTreeViewComponent);
