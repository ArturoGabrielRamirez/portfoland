'use client';

/**
 * DashboardSkillsView Component - Cyberpunk V2
 *
 * Client component for the dashboard skills page with cyberpunk hexagonal design.
 * Includes the GitHubSyncPanel (TG9) and AssessmentWidget (TG10) between the
 * legend row and the skill tree.
 */

import { useCallback, useTransition, useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Sparkles, Trophy, Zap, Grid3X3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { HexBadge } from '@/features/tech';
import { useCRTTriggers } from '@/features/tech/context/crt-triggers';
import {
  SkillTreeView,
  ManualSkillModal
} from '@/features/skills/components';
import { GitHubSyncPanel } from '@/features/github/components';
import { AssessmentWidget } from '@/features/assessment/components/AssessmentWidget';
import type { UserSkillWithDetails, SkillCategory } from '@/features/skills/types/skill';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import type { GitHubStats } from '@/features/github/types/github';
import type { AssessmentTokenInfo, SkillAssessmentSummary } from '@/features/assessment/types/assessment';

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
    email: string;
    username: string | null;
    image: string | null;
    portfolioMode: PortfolioMode;
  };
  /** Timestamp of the last GitHub sync; null if never synced (TG9) */
  githubSyncedAt: Date | null;
  /** Persisted summary stats from the last GitHub sync; null if no sync has run (TG9) */
  githubStats: GitHubStats | null;
  /** True when an Account record with providerId='github' exists for the user (TG9) */
  isGitHubConnected: boolean;
  /** Assessment token balance read from User.meta (TG10) */
  assessmentTokens: AssessmentTokenInfo;
  /** User skills pre-filtered to ASSESSMENT_SUPPORTED_SKILL_SLUGS (TG10) */
  supportedUserSkills: UserSkillWithDetails[];
  /** Per-skill history summary (best score + attempts) for inline display */
  assessmentHistory?: Record<string, SkillAssessmentSummary>;
}

// =============================================================================
// Main Component
// =============================================================================

export function DashboardSkillsView({
  skills,
  categories,
  stats,
  user,
  githubSyncedAt,
  githubStats,
  isGitHubConnected,
  assessmentTokens,
  supportedUserSkills,
  assessmentHistory,
}: DashboardSkillsViewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard.skills');
  const tLegend = useTranslations('dashboard.skills.legend');
  const tStats = useTranslations('dashboard.skills.stats');
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // CRT trigger callbacks from DashboardPageLayout context
  const { triggerXPGain, triggerLifeLoss, triggerSearching } = useCRTTriggers();

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
  }, [handleCloseAddModal]);

  /**
   * Fires when an assessment is passed.
   * Triggers the CRT AIEye xp_gain animation via context.
   */
  const handleAssessmentPass = useCallback(() => {
    triggerXPGain();
  }, [triggerXPGain]);

  return (
    <>
      {/* Page Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">{t('title')}</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/${user.username}/skills`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('viewPublic')}
            </a>
          )}
          <button
            onClick={handleAddSkill}
            className="flex items-center gap-1.5 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addSkill')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
          <HexBadge color="cyan" size="sm" filled>
            <Sparkles className="w-4 h-4" />
          </HexBadge>
          <div>
            <div className="text-xl font-mono font-bold text-[hsl(174,100%,50%)]">{stats.totalSkills}</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{tStats('totalSkills')}</div>
          </div>
        </div>
        <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
          <HexBadge color="yellow" size="sm" filled>
            <Zap className="w-4 h-4" />
          </HexBadge>
          <div>
            <div className="text-xl font-mono font-bold text-[hsl(60,100%,50%)]">{stats.totalXP.toLocaleString()}</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{tStats('totalXP')}</div>
          </div>
        </div>
        <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
          <HexBadge color="magenta" size="sm" filled>
            <Trophy className="w-4 h-4" />
          </HexBadge>
          <div>
            <div className="text-xl font-mono font-bold text-[hsl(330,100%,65%)]">{stats.masterSkills}</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{tStats('mastered')}</div>
          </div>
        </div>
        <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
          <HexBadge color="green" size="sm" filled>
            <Grid3X3 className="w-4 h-4" />
          </HexBadge>
          <div>
            <div className="text-xl font-mono font-bold text-[hsl(150,100%,45%)]">{stats.categoriesUsed}</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{tStats('categories')}</div>
          </div>
        </div>
      </div>

      {/* Legend Row */}
      <div className="px-6 py-2 flex items-center gap-4 border-b border-[hsl(174,100%,50%,0.1)]">
        <button onClick={handleAddSkill} className="flex items-center gap-1 text-[10px] font-mono text-[hsl(174,100%,50%)] hover:underline">
          <Plus className="w-3 h-3" /> {t('addSkill')}
        </button>
        <div className="flex items-center gap-3 ml-auto">
          {/* Category color dots */}
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(330,100%,65%)]" /> {tLegend('core')}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(150,100%,45%)]" /> {tLegend('backend')}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(174,100%,50%)]" /> {tLegend('frontend')}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(60,100%,50%)]" /> {tLegend('tools')}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(280,100%,70%)]" /> {tLegend('softSkills')}
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          {skills.length} skills &middot; {stats.totalXP.toLocaleString()} XP
        </span>
      </div>

      {/* GITHUB_VALIDATOR — GitHub Expansion Module / Sync Status Panel (TG9) */}
      <div className="px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <GitHubSyncPanel
          userId={user.id}
          isGitHubConnected={isGitHubConnected}
          githubSyncedAt={githubSyncedAt}
          githubStats={githubStats}
          onSearchingTrigger={triggerSearching}
          onXPGainTrigger={triggerXPGain}
          onLifeLossTrigger={triggerLifeLoss}
        />
      </div>

      {/* ASSESSMENT_MODULE — AI Skill Assessment Widget (TG10) */}
      <div className="px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <AssessmentWidget
          userSkills={supportedUserSkills}
          assessmentTokens={assessmentTokens}
          assessmentHistory={assessmentHistory}
          onAssessmentPass={handleAssessmentPass}
        />
      </div>

      {/* Main Content - Skill Tree View */}
      <section className="px-4 py-6">
        <div style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          <SkillTreeView
            userSkills={skills}
            categories={categories}
            isEditable={true}
            onAddSkill={handleAddSkill}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* Modals */}
      <ManualSkillModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
        categories={categories}
      />
    </>
  );
}
