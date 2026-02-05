'use client';

/**
 * PublicSkillsView Component
 *
 * Read-only view of a user's skill tree for public sharing.
 * No edit capabilities.
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Zap, Grid3X3, User } from 'lucide-react';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { SkillTreeView } from '@/features/skills/components';
import type { PublicSkillsData } from '@/features/skills/data';

// =============================================================================
// Types
// =============================================================================

interface PublicSkillsViewProps {
  data: PublicSkillsData;
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
        'relative rounded-xl border border-[#1E293B] bg-[#0D1421]/80 p-3 sm:p-4',
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

      <div className="relative flex items-center gap-2 sm:gap-3">
        <div
          className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-bold text-white">{value}</p>
          <p className="text-xs sm:text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PublicSkillsView({ data }: PublicSkillsViewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const { user, skills, categories, stats } = data;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header with user info */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* User avatar */}
              <div className="relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-[#00D4FF]/50"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#00D4FF]/50 bg-[#1E293B]">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                {/* Level indicator */}
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00D4FF] text-[10px] font-bold text-black">
                  {Math.max(1, Math.floor(stats.totalXP / 500))}
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user.name}'s Skill Tree
                </h1>
                <p className="text-slate-400 text-sm">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* View timeline link */}
            <Link
              href={`/${locale}/timeline/${user.username}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              View Timeline
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-b border-[#1E293B] bg-[#0D1421]/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Total Skills"
              value={stats.totalSkills}
              color="#00D4FF"
              delay={0}
            />
            <StatsCard
              icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Total XP"
              value={stats.totalXP.toLocaleString()}
              color="#A855F7"
              delay={0.1}
            />
            <StatsCard
              icon={<Trophy className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Master Skills"
              value={stats.masterSkills}
              color="#EAB308"
              delay={0.2}
            />
            <StatsCard
              icon={<Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Categories"
              value={stats.categoriesUsed}
              color="#22C55E"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Main content - Skill Tree View (read-only) */}
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
              No Skills Yet
            </h2>
            <p className="text-slate-400 text-center max-w-md">
              {user.name} hasn't added any skills to their skill tree yet.
            </p>
          </motion.div>
        ) : (
          // Skill Tree View (read-only)
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <SkillTreeView
              userSkills={skills}
              categories={categories}
              isEditable={false}
              className="w-full h-full"
            />
          </div>
        )}
      </main>
    </div>
  );
}
