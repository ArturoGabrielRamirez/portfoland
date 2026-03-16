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
import { Plus, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
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
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const mc = modeClasses(user.portfolioMode);

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
      <div className={cn('px-6 py-6 flex items-center justify-between', mc.headerBorder)}>
        <div>
          <h1 className={mc.heading}>{t('title')}</h1>
          <p className={cn('text-xs mt-1', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/${user.username}/skills`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('flex items-center gap-1.5 text-xs transition-colors', mc.isTech ? 'font-mono text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-900')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('viewPublic')}
            </a>
          )}
          <button onClick={handleAddSkill} className={mc.primaryButton}>
            <Plus className="w-3.5 h-3.5" />
            {t('addSkill')}
          </button>
        </div>
      </div>

      {/* Legend Row — category color reference */}
      <div className={cn('px-6 py-2 flex items-center gap-3', mc.headerBorder)}>
        {[
          { color: 'bg-[hsl(330,100%,65%)]', label: tLegend('core') },
          { color: 'bg-[hsl(150,100%,45%)]', label: tLegend('backend') },
          { color: 'bg-[hsl(174,100%,50%)]', label: tLegend('frontend') },
          { color: 'bg-[hsl(60,100%,50%)]',  label: tLegend('tools') },
          { color: 'bg-[hsl(280,100%,70%)]', label: tLegend('softSkills') },
        ].map(({ color, label }) => (
          <span key={label} className={cn('flex items-center gap-1', mc.isTech ? 'text-[9px] font-mono text-muted-foreground' : 'text-[10px] text-gray-500')}>
            <span className={cn('w-2 h-2 rounded-full', color)} /> {label}
          </span>
        ))}
      </div>

      {/* GITHUB_VALIDATOR — GitHub Expansion Module / Sync Status Panel (TG9) */}
      <div className={cn('px-6 py-3', mc.headerBorder)}>
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
      <div className={cn('px-6 py-3', mc.headerBorder)}>
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
            githubConnected={isGitHubConnected}
            locale={locale}
            portfolioMode={user.portfolioMode}
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
