'use client';

/**
 * SkillEnhancementPanel Component
 *
 * Renders AI-generated skill enhancement suggestions:
 * - Next level focus
 * - Validation CTAs (GitHub, Assessment)
 * - Related skills (with add buttons)
 * - Learning resources (with broken link reporting)
 */

import { useState } from 'react';
import { BookOpen, Sparkles, Link2, ClipboardCheck, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { RelatedSkillCard } from './RelatedSkillCard';
import { LearningResourceCard } from './LearningResourceCard';
import { replaceResourceAction } from '../actions/replaceResource.action';
import type { SkillEnhancement, LearningResource } from '../types/enhancement';
import { SKILL_LEVEL_NAMES } from '@/features/skills/constants/xp';

interface SkillEnhancementPanelProps {
  enhancement: SkillEnhancement;
  onAddSkill: (skillName: string) => void;
  addingSkill: string | null;
}

export function SkillEnhancementPanel({
  enhancement,
  onAddSkill,
  addingSkill,
}: SkillEnhancementPanelProps) {
  const { currentLevel, nextLevelFocus, relatedSkills, validationStatus } = enhancement;

  // Resources managed as local state so replacements can be swapped in
  const [resources, setResources] = useState<LearningResource[]>(enhancement.resources);
  const [reportingUrl, setReportingUrl] = useState<string | null>(null);

  const isMaster = currentLevel >= 5;
  const nextLevel = Math.min(currentLevel + 1, 5) as 1 | 2 | 3 | 4 | 5;
  const nextLevelName = SKILL_LEVEL_NAMES[nextLevel];

  const handleReportBroken = async (url: string, type: LearningResource['type']) => {
    setReportingUrl(url);
    try {
      const result = await replaceResourceAction({
        skillName: enhancement.skillName,
        skillLevel: currentLevel,
        brokenUrl: url,
        resourceType: type,
      });

      if (!result.hasError && result.payload) {
        // Swap broken resource with replacement
        setResources(prev =>
          prev.map(r => r.url === url ? result.payload! : r)
        );
        toast.success('Broken link replaced with a working resource');
      } else {
        toast.error(result.message ?? 'Could not find a replacement');
      }
    } catch {
      toast.error('Could not find a replacement');
    } finally {
      setReportingUrl(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Next Level Focus */}
      {!isMaster ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
            <h4 className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider">
              To reach {nextLevelName} (Level {nextLevel})
            </h4>
          </div>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{nextLevelFocus}</p>
        </div>
      ) : (
        <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/40">
          <p className="text-sm text-[#F59E0B]">
            ⭐ You&apos;ve reached Master level! Focus on teaching others and open source contributions.
          </p>
        </div>
      )}

      {/* Validation CTAs */}
      {(!validationStatus.githubConnected || (validationStatus.assessmentAvailable && !validationStatus.assessmentPassed)) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-[#D946EF]" />
            <h4 className="text-xs font-semibold text-[#D946EF] uppercase tracking-wider">
              Validate your skills
            </h4>
          </div>

          {!validationStatus.githubConnected && (
            <a
              href="/dashboard/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm border border-[#1E293B] hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/5 transition-colors text-[#94A3B8] hover:text-[#00D4FF]"
            >
              <Link2 className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="font-medium">Connect GitHub</div>
                <div className="text-xs opacity-70">Validate your skills with real code</div>
              </div>
            </a>
          )}

          {validationStatus.assessmentAvailable && !validationStatus.assessmentPassed && (
            <a
              href="/dashboard/skills"
              className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm border border-[#1E293B] hover:border-[#D946EF]/40 hover:bg-[#D946EF]/5 transition-colors text-[#94A3B8] hover:text-[#D946EF]"
            >
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="font-medium">Take Assessment</div>
                <div className="text-xs opacity-70">Earn a Verified badge</div>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Related Skills */}
      {relatedSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#D946EF]" />
            <h4 className="text-xs font-semibold text-[#D946EF] uppercase tracking-wider">
              Related Skills
            </h4>
          </div>
          <div className="flex flex-col gap-2">
            {relatedSkills.map((skill) => (
              <RelatedSkillCard
                key={skill.name}
                skill={skill}
                onAdd={onAddSkill}
                isAdding={addingSkill === skill.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Learning Resources */}
      {resources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#00D4FF]" />
            <h4 className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider">
              Learning Resources
            </h4>
          </div>
          <div className="flex flex-col gap-2">
            {resources.map((resource, i) => (
              <LearningResourceCard
                key={`${resource.url}-${i}`}
                resource={resource}
                onReport={handleReportBroken}
                isReporting={reportingUrl === resource.url}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
