'use client';

/**
 * DashboardSkillsView Component
 *
 * Client component for the dashboard skills page with editing capabilities.
 */

import { useCallback, useTransition, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Sparkles, Trophy, Zap, Grid3X3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { 
  SkillTreeView,
  ManualSkillModal 
} from '@/features/skills/components';
import type { UserSkillWithDetails, SkillCategory } from '@/features/skills/types/skill';

// =============================================================================
// Types
// =============================================================================

interface DashboardSkillsViewProps {
  skills: UserSkillWithDetails[];
  categories: SkillCategory[];
  stats: {
    totalSkills: number;
    totalXP: number;
    masterSkills: number;
    categoriesUsed: number;
  };
  user: {
    id: string;
    name: string;
    username: string | null;
  };
}

// =============================================================================
// Stats Card Component
// =============================================================================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  delay?: number;
}

function StatsCard({ icon, label, value, color, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative rounded-xl border border-[#1E293B] bg-[#0D1421]/80 p-4',
        'overflow-hidden'
      )}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DashboardSkillsView({
  skills,
  categories,
  stats,
  user,
}: DashboardSkillsViewProps) {
  const t = useTranslations('skills');
  const tCommon = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Handle add skill callback
  const handleAddSkill = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  // Handle close add modal
  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  // Handle add modal success
  const handleAddSuccess = useCallback(() => {
    handleCloseAddModal();
    // Refresh would typically happen via revalidation
  }, [handleCloseAddModal]);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('pageTitle')}</h1>
                <p className="text-slate-400">{t('pageSubtitle')}</p>
              </div>
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
                  <Link
                    href={`/${user.username}/skills`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('viewPublic')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-b border-[#1E293B] bg-[#0D1421]/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon={<Sparkles className="h-5 w-5" />}
              label={t('stats.totalSkills')}
              value={stats.totalSkills}
              color="#00D4FF"
              delay={0}
            />
            <StatsCard
              icon={<Zap className="h-5 w-5" />}
              label={t('stats.totalXP')}
              value={stats.totalXP.toLocaleString()}
              color="#A855F7"
              delay={0.1}
            />
            <StatsCard
              icon={<Trophy className="h-5 w-5" />}
              label={t('stats.masterSkills')}
              value={stats.masterSkills}
              color="#EAB308"
              delay={0.2}
            />
            <StatsCard
              icon={<Grid3X3 className="h-5 w-5" />}
              label={t('stats.categories')}
              value={stats.categoriesUsed}
              color="#22C55E"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Main content - Skill Tree View */}
      <main className="relative">
        {skills.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E293B] mb-6">
              <Sparkles className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('emptyState.title')}
            </h2>
            <p className="text-slate-400 text-center max-w-md mb-6">
              {t('emptyState.description')}
            </p>
            <p className="text-sm text-slate-500 text-center max-w-md mb-6">
              {t('emptyState.hint')}
            </p>
            <Button
              onClick={handleAddSkill}
              className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </Button>
          </motion.div>
        ) : (
          // Skill Tree View
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <SkillTreeView
              userSkills={skills}
              categories={categories}
              isEditable={true}
              onAddSkill={handleAddSkill}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Add Skill Modal */}
        <ManualSkillModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={handleAddSuccess}
          categories={categories}
        />
      </main>
    </div>
  );
}
