'use client';

/**
 * PublicTimelineView Component
 *
 * Client component for rendering the public timeline.
 * Handles responsive layout (map on desktop, list on mobile).
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicTimelineData, Experience } from '@/features/timeline/types/experience';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import {
  TimelineMap,
  TimelineFilter,
  TimelineStats,
  MobileTimelineEvent,
} from '@/features/timeline/components';
import type { FilterOption } from '@/features/timeline/constants/xp';

interface PublicTimelineViewProps {
  data: PublicTimelineData;
}

export function PublicTimelineView({ data }: PublicTimelineViewProps) {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');

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

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* User avatar */}
            {data.user.image ? (
              <img
                src={data.user.image}
                alt={data.user.name}
                className="w-16 h-16 rounded-full border-2 border-cyan-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border-2 border-cyan-500">
                <span className="text-2xl font-bold text-cyan-400">
                  {data.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* User info */}
            <div>
              <h1 className="text-2xl font-bold text-white">{data.user.name}</h1>
              <p className="text-slate-400">@{data.user.username}</p>
            </div>

            {/* XP badge */}
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-500/30">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-lg font-bold text-cyan-400">
                {data.stats.totalXP.toLocaleString()} XP
              </span>
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
        <div className="hidden lg:block h-[calc(100vh-320px)] min-h-[500px]">
          <TimelineMap
            experiences={filteredExperiences}
            selectedExperience={selectedExperience}
            onExperienceSelect={handleExperienceSelect}
            isEditable={false}
          />
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
                <p className="text-slate-400">No experiences found</p>
              </motion.div>
            ) : (
              <div>
                {filteredExperiences.map((experience, index) => (
                  <MobileTimelineEvent
                    key={experience.id}
                    experience={experience}
                    isFirst={index === 0}
                    isLast={index === filteredExperiences.length - 1}
                    onClick={handleExperienceSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-slate-500">
            Powered by{' '}
            <span className="text-cyan-400 font-medium">Portfoland</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
