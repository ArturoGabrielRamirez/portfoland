'use client';

/**
 * DashboardTimelineView Component - Cyberpunk V2
 *
 * Client component for the dashboard timeline with cyberpunk hexagonal design.
 */

import { useState, useCallback, useMemo, useTransition } from 'react';
import { Plus, MapPin, ExternalLink, Zap, Flag, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HexBadge } from '@/features/tech';
import { useParams } from 'next/navigation';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
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
  TimelineSidebar,
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
  const t = useTranslations('dashboard.timeline');
  const tCommon = useTranslations('common');
  const mc = modeClasses(user.portfolioMode);

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null);
  const [isPending, startTransition] = useTransition();
  // Task 4.2: sidebar open/collapsed state (open by default)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter experiences by type
  const filteredExperiences = useMemo(() => {
    if (activeFilter === 'ALL') {
      return data.experiences;
    }
    return data.experiences.filter((exp) => exp.type === activeFilter);
  }, [data.experiences, activeFilter]);

  // Experiences sorted newest-first for the sidebar
  const sortedExperiences = useMemo(
    () =>
      [...filteredExperiences].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ),
    [filteredExperiences]
  );

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
          toast.error(t('messages.error'));
        }
      });
    },
    [t]
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
        toast.error(t('messages.error'));
      }
    });
  }, [deletingExperience, t]);

  return (
    <>
      {/* Page Header */}
      <div className={cn('px-6 py-6 flex items-center justify-between', mc.headerBorder)}>
        <div>
          <h1 className={mc.heading}>{t('title')}</h1>
          <p className={cn('text-xs mt-1', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/timeline/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('flex items-center gap-1.5 text-xs transition-colors', mc.isTech ? 'font-mono text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-900')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('viewPublic')}
            </a>
          )}
          <button onClick={handleOpenCreate} className={mc.primaryButton}>
            <Plus className="w-3.5 h-3.5" />
            {t('addExperience')}
          </button>
        </div>
      </div>

      {/* Stats — Tech Mode: hex badges; Classic Mode: simple text summary */}
      {mc.isTech ? (
        <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[hsl(174,100%,50%,0.1)]">
          {[
            { value: data.stats.totalXP.toLocaleString(), label: t('stats.totalXP'), color: "cyan" as const, icon: <Zap className="w-4 h-4" /> },
            { value: data.stats.milestones.toString(), label: t('stats.milestones'), color: "magenta" as const, icon: <Flag className="w-4 h-4" /> },
            { value: data.stats.totalExperiences.toString(), label: t('stats.experiences'), color: "yellow" as const, icon: <Star className="w-4 h-4" /> },
            { value: data.stats.achievements?.toString() || "0", label: t('stats.achievements'), color: "green" as const, icon: <Trophy className="w-4 h-4" /> },
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
      ) : (
        <div className="px-6 py-3 flex items-center gap-6 border-b border-gray-200 text-sm text-gray-600">
          <span><strong className="text-gray-900">{data.stats.totalExperiences}</strong> experiences</span>
          <span><strong className="text-gray-900">{data.stats.totalXP.toLocaleString()}</strong> XP earned</span>
          <span><strong className="text-gray-900">{data.stats.milestones}</strong> milestones</span>
        </div>
      )}

      {/* Filter */}
      <div className="px-6 py-4 border-b border-[hsl(174,100%,50%,0.1)]">
        <TimelineFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={filterCounts}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Desktop: Map + Sidebar flex row */}
        <div
          className="hidden lg:flex flex-1 min-h-0"
          style={{ minHeight: '500px', maxHeight: 'calc(100vh - 380px)' }}
        >
          {/* Map container — relative so the ExperienceCard overlay anchors here */}
          <div className="relative flex-1 min-h-0 min-w-0">
            <TimelineMap
              experiences={filteredExperiences}
              selectedExperience={selectedExperience}
              onExperienceSelect={handleExperienceSelect}
              isEditable={true}
              focusedExperienceId={selectedExperience?.id}
            />

            {/* Empty state overlay on desktop map */}
            {filteredExperiences.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                <MapPin className={cn('w-12 h-12 mb-4', mc.isTech ? 'text-[hsl(174,100%,50%,0.4)]' : 'text-gray-400')} />
                <p className={cn('mb-4 text-sm', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-600')}>{t('empty.title')}</p>
                <button onClick={handleOpenCreate} className={mc.primaryButton}>
                  <Plus className="w-4 h-4" />
                  {t('empty.addFirst')}
                </button>
              </div>
            )}

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

          {/* Task 4.4: Chronological sidebar */}
          <TimelineSidebar
            experiences={sortedExperiences}
            selectedExperienceId={selectedExperience?.id}
            onSelect={(exp) => setSelectedExperience(exp)}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((o) => !o)}
          />
        </div>

        {/* Mobile: List view */}
        <div className="lg:hidden">
          <div className="max-w-lg mx-auto px-4 py-6">
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className={cn('w-12 h-12 mx-auto mb-4', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
                <p className={cn('mb-4 text-sm', mc.isTech ? 'text-muted-foreground font-mono' : 'text-gray-500')}>{t('empty.title')}</p>
                <button onClick={handleOpenCreate} className={cn(mc.primaryButton, 'mx-auto')}>
                  <Plus className="w-4 h-4" />
                  {t('empty.addFirst')}
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
    </>
  );
}
