'use client';

/**
 * DashboardTimelineView Component
 *
 * Client component for the dashboard timeline with editing capabilities.
 */

import { useState, useCallback, useMemo, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import type {
  TimelineData,
  Experience,
  CreateExperienceInput,
  UpdateExperienceInput,
} from '@/features/timeline/types/experience';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import {
  TimelineMap,
  TimelineFilter,
  TimelineStats,
  MobileTimelineEvent,
  ExperienceFormModal,
  DeleteConfirmModal,
  ExperienceCard,
} from '@/features/timeline/components';
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from '@/features/timeline/actions';
import type { FilterOption } from '@/features/timeline/constants/xp';

interface DashboardTimelineViewProps {
  data: TimelineData;
  user: {
    id: string;
    name: string;
    username: string | null;
  };
}

export function DashboardTimelineView({ data, user }: DashboardTimelineViewProps) {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter experiences by type
  const filteredExperiences = useMemo(() => {
    if (activeFilter === 'ALL') {
      return data.experiences;
    }
    return data.experiences.filter((exp) => exp.type === activeFilter);
  }, [data.experiences, activeFilter]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: data.experiences.length,
      WORK: 0,
      EDUCATION: 0,
      PROJECT: 0,
      CERTIFICATION: 0,
    };

    data.experiences.forEach((exp) => {
      counts[exp.type]++;
    });

    return counts as Record<FilterOption, number>;
  }, [data.experiences]);

  // Handle experience selection
  const handleExperienceSelect = useCallback((experience: Experience | null) => {
    setSelectedExperience(experience);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: ExperienceType | 'ALL') => {
    setActiveFilter(filter);
    setSelectedExperience(null);
  }, []);

  // Open create modal
  const handleOpenCreate = useCallback(() => {
    setEditingExperience(undefined);
    setIsFormModalOpen(true);
  }, []);

  // Open edit modal
  const handleOpenEdit = useCallback((experience: Experience) => {
    setEditingExperience(experience);
    setIsFormModalOpen(true);
    setSelectedExperience(null);
  }, []);

  // Open delete modal
  const handleOpenDelete = useCallback((experienceId: string) => {
    const experience = data.experiences.find((e) => e.id === experienceId);
    if (experience) {
      setDeletingExperience(experience);
      setIsDeleteModalOpen(true);
      setSelectedExperience(null);
    }
  }, [data.experiences]);

  // Handle form submit (create or update)
  const handleFormSubmit = useCallback(
    async (formData: CreateExperienceInput | UpdateExperienceInput) => {
      startTransition(async () => {
        try {
          if ('id' in formData) {
            // Update - cast to Record<string, unknown> for server action
            const result = await updateExperience(formData as unknown as Record<string, unknown>);
            if (result.hasError) {
              toast.error(result.message);
            } else {
              toast.success(result.message);
            }
          } else {
            // Create - cast to Record<string, unknown> for server action
            const result = await createExperience(formData as unknown as Record<string, unknown>);
            if (result.hasError) {
              toast.error(result.message);
            } else {
              toast.success(result.message);
            }
          }
        } catch (error) {
          toast.error('An error occurred');
        }
      });
    },
    []
  );

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingExperience) return;

    startTransition(async () => {
      try {
        const result = await deleteExperience({ id: deletingExperience.id });
        if (result.hasError) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
        }
      } catch (error) {
        toast.error('An error occurred');
      }
    });
  }, [deletingExperience]);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Timeline</h1>
              <p className="text-slate-400">Manage your professional journey</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Public link */}
              {user.username && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  asChild
                >
                  <a href={`/timeline/${user.username}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public
                  </a>
                </Button>
              )}

              {/* Add experience button */}
              <Button
                onClick={handleOpenCreate}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="border-b border-[#1E293B] bg-[#0D1421]/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <TimelineStats stats={data.stats} />
        </div>
      </section>

      {/* Filter */}
      <section className="border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <TimelineFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            counts={filterCounts}
          />
        </div>
      </section>

      {/* Main content */}
      <main className="relative">
        {/* Desktop: Map view */}
        <div className="hidden lg:block h-[calc(100vh-380px)] min-h-[500px]">
          <TimelineMap
            experiences={filteredExperiences}
            selectedExperience={selectedExperience}
            onExperienceSelect={handleExperienceSelect}
            isEditable={true}
          />

          {/* Experience card with edit/delete */}
          {selectedExperience && (
            <div className="absolute top-4 right-4 z-10">
              <ExperienceCard
                experience={selectedExperience}
                isEditable={true}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onClose={() => setSelectedExperience(null)}
              />
            </div>
          )}
        </div>

        {/* Mobile: List view */}
        <div className="lg:hidden">
          <div className="max-w-lg mx-auto px-4 py-6">
            {filteredExperiences.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No experiences yet</p>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Experience
                </Button>
              </motion.div>
            ) : (
              <div>
                {filteredExperiences.map((experience, index) => (
                  <MobileTimelineEvent
                    key={experience.id}
                    experience={experience}
                    isFirst={index === 0}
                    isLast={index === filteredExperiences.length - 1}
                    onClick={handleOpenEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <ExperienceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingExperience(undefined);
        }}
        experience={editingExperience}
        onSubmit={handleFormSubmit}
        isLoading={isPending}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExperience(null);
        }}
        onConfirm={handleDeleteConfirm}
        experienceTitle={deletingExperience?.title || ''}
        isLoading={isPending}
      />
    </div>
  );
}
