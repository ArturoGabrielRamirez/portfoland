/**
 * TerminalTemplate
 *
 * Tech Mode only — full CRT terminal aesthetic with boot screen and 5 panels.
 * Guard enforced at PortfolioLayout level (never rendered for Classic Mode).
 */

'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CRTMonitor } from '@/features/tech/components/crt-monitor';
import type { PortfolioMode, PortfolioData } from '../../types/portfolio';

// =============================================================================
// Component
// =============================================================================

interface TerminalTemplateProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

export function TerminalTemplate({ data }: TerminalTemplateProps) {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const { user, skills, projects, experiences } = data;

  // Skills grouped by category
  const skillsByCategory = (skills?.skills ?? []).reduce<Record<string, NonNullable<typeof skills>['skills']>>((acc, userSkill) => {
    const cat = userSkill.skill.category?.name ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(userSkill);
    return acc;
  }, {});

  // Contact links
  const contactLinks = user.contactLinks as Record<string, string>;
  const contactEntries: { label: string; href: string; value: string }[] = [];
  if (contactLinks.email) contactEntries.push({ label: 'EMAIL', href: `mailto:${contactLinks.email}`, value: contactLinks.email });
  if (contactLinks.github) contactEntries.push({ label: 'GITHUB', href: contactLinks.github.startsWith('http') ? contactLinks.github : `https://github.com/${contactLinks.github}`, value: contactLinks.github });
  if (contactLinks.linkedin) contactEntries.push({ label: 'LINKEDIN', href: contactLinks.linkedin.startsWith('http') ? contactLinks.linkedin : `https://linkedin.com/in/${contactLinks.linkedin}`, value: contactLinks.linkedin });
  if (contactLinks.website) contactEntries.push({ label: 'WEBSITE', href: contactLinks.website, value: contactLinks.website });

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white font-mono overflow-x-hidden relative">
      {/* CRT Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        <div className="crt-lines absolute inset-0 opacity-[0.03]" />
        <div className="crt-scanner" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/[0.02] to-transparent animate-scanline-flash opacity-20" />
      </div>

      {/* Boot Screen */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0E1A] font-mono text-[#00D4FF]"
          >
            <div className="flex flex-col gap-2 w-64">
              <div className="text-xs uppercase tracking-widest opacity-60">Initializing System...</div>
              <div className="h-1 w-full bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#00D4FF] animate-boot-line" />
              </div>
              <div className="text-[10px] text-[#64748B] flex justify-between">
                <span>BOOT_SEQUENCE_v0.4.0</span>
                <span className="animate-pulse">LOADING...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main terminal content */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6 relative z-10">

        {/* IDENT panel */}
        <CRTMonitor title="IDENT">
          <p className="text-[#00D4FF] text-sm">{user.name}</p>
          {user.username && <p className="text-[#00D4FF] text-sm">@{user.username}</p>}
          {user.bio && <p className="text-gray-400 text-xs mt-1">{user.bio}</p>}
        </CRTMonitor>

        {/* SKILL_TREE panel */}
        <CRTMonitor title="SKILL_TREE">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} className="mb-3">
              <p className="text-[#D946EF] text-xs font-bold mb-1">[{category}]</p>
              {categorySkills.map(userSkill => (
                <div key={userSkill.id} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-300 w-28 truncate">{userSkill.skill.name}</span>
                  <span className="text-[#00D4FF]">
                    {'█'.repeat(Math.round(userSkill.level / 10))}
                    <span className="text-gray-600">{'░'.repeat(10 - Math.round(userSkill.level / 10))}</span>
                  </span>
                  <span className="text-gray-500">Lv.{userSkill.level}</span>
                </div>
              ))}
            </div>
          ))}
        </CRTMonitor>

        {/* PROJECTS panel */}
        <CRTMonitor title="PROJECTS">
          {(projects ?? []).slice(0, 10).map(project => (
            <div key={project.id} className="mb-3">
              <p className="text-[#00D4FF] text-sm font-bold">{project.title}</p>
              {project.technologies?.length > 0 && (
                <p className="text-gray-400 text-xs">{project.technologies.join(' · ')}</p>
              )}
              <div className="flex gap-3 mt-0.5">
                {(project.links as Record<string, string>)?.github && (
                  <a href={(project.links as Record<string, string>).github} target="_blank" rel="noopener noreferrer" className="text-[#D946EF] text-xs hover:underline">
                    GitHub ↗
                  </a>
                )}
                {(project.links as Record<string, string>)?.live && (
                  <a href={(project.links as Record<string, string>).live} target="_blank" rel="noopener noreferrer" className="text-[#D946EF] text-xs hover:underline">
                    Live ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </CRTMonitor>

        {/* TIMELINE panel */}
        <CRTMonitor title="TIMELINE">
          {(experiences?.experiences ?? []).map(exp => {
            const startYear = new Date(exp.startDate).getFullYear();
            const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : 'present';
            return (
              <p key={exp.id} className="text-xs text-gray-300">
                <span className="text-[#00D4FF]">[{startYear}–{endYear}]</span>{' '}
                {exp.company} — {exp.title}
              </p>
            );
          })}
        </CRTMonitor>

        {/* CONTACT panel */}
        <CRTMonitor title="CONTACT">
          {contactEntries.map(entry => (
            <p key={entry.label} className="text-xs">
              <span className="text-[#D946EF]">{entry.label}: </span>
              <a href={entry.href} target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
                {entry.value}
              </a>
            </p>
          ))}
        </CRTMonitor>
      </div>
    </div>
  );
}
