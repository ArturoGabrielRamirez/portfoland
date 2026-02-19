'use client';

/**
 * DashboardTimelineView Component - Cyberpunk V2
 *
 * Client component for the dashboard timeline with cyberpunk hexagonal design.
 */

import { useState, useCallback, useMemo, useTransition } from 'react';
import { Plus, MapPin, ExternalLink, Zap, Flag, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { HexBadge, DashboardNav } from '@/features/tech';
import { useParams } from 'next/navigation';
import type {
  TimelineData,
  Experience,
  CreateExperienceInput,
  UpdateExperienceInput,
} from '@/features/timeline/types/experience';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import {
  TimelineMap,
  TimelineFilter,
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
    email: string;
    username: string | null;
    image: string | null;
    portfolioMode: PortfolioMode;
  };
}

export function DashboardTimelineView({ data, user }: DashboardTimelineViewProps) {
  const params = useParams();
  const locale = params.locale as string;

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
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Main Navigation */}
      <DashboardNav locale={locale} user={user} />

      {/* Page Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">My Timeline</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">Manage your professional journey</p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/timeline/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public
            </a>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Experience
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[hsl(174,100%,50%,0.1)]">
        {[
          { value: data.stats.totalXP.toLocaleString(), label: "TOTAL XP", color: "cyan" as const, icon: <Zap className="w-4 h-4" /> },
          { value: data.stats.milestones.toString(), label: "MILESTONES", color: "magenta" as const, icon: <Flag className="w-4 h-4" /> },
          { value: data.stats.totalExperiences.toString(), label: "EXPERIENCES", color: "yellow" as const, icon: <Star className="w-4 h-4" /> },
          { value: data.stats.achievements?.toString() || "0", label: "ACHIEVEMENTS", color: "green" as const, icon: <Trophy className="w-4 h-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
            <HexBadge color={stat.color} size="sm" filled>
              {stat.icon}
            </HexBadge>
            <div>
              <div className={cn(
                "text-xl font-mono font-bold",
                stat.color === "cyan" && "text-[hsl(174,100%,50%)]",
                stat.color === "magenta" && "text-[hsl(330,100%,65%)]",
                stat.color === "yellow" && "text-[hsl(60,100%,50%)]",
                stat.color === "green" && "text-[hsl(150,100%,45%)]"
              )}>
                {stat.value}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="px-6 py-4 border-b border-[hsl(174,100%,50%,0.1)]">
        <TimelineFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={filterCounts}
        />
      </div>

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
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-[hsl(174,100%,50%,0.3)] mx-auto mb-4" />
                <p className="text-muted-foreground font-mono mb-4">No experiences yet</p>
                <button
                  onClick={handleOpenCreate}
                  className="bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Experience
                </button>
              </div>
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
