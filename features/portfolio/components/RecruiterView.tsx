'use client';

import { Mail, Github, Linkedin, ExternalLink, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioData, PortfolioMode } from '../types/portfolio';

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

function formatDateRange(startDate?: Date | string | null, endDate?: Date | string | null): string {
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  if (!startDate) return '';
  return endDate ? `${fmt(startDate)} – ${fmt(endDate)}` : `${fmt(startDate)} – Present`;
}

// =============================================================================
// Props
// =============================================================================

interface RecruiterViewProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

// =============================================================================
// Component
// =============================================================================

export function RecruiterView({ data, mode }: RecruiterViewProps) {
  const { user, skills, experiences } = data;
  const isTech = mode === 'tech';

  // Top 6 skills by level
  const topSkills = (skills?.skills ?? [])
    .slice()
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .slice(0, 6);

  // 3 most recent work experiences
  const recentExperiences = (experiences?.experiences ?? [])
    .filter(e => e.type === 'WORK' || e.type === 'EDUCATION')
    .slice()
    .sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 3);

  if (isTech) {
    return (
      <div className="flex-1 overflow-y-auto p-6 font-mono">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* ATS Header */}
          <div className="border border-[hsl(174,100%,50%,0.3)] bg-[hsl(200,30%,4%)] p-5">
            <div className="text-[10px] text-[hsl(174,100%,50%,0.5)] uppercase tracking-widest mb-3">
              &gt; ATS_FRIENDLY_VIEW // RECRUITER_MODE
            </div>
            <div className="flex items-center gap-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-16 w-16 border border-[hsl(174,100%,50%,0.3)] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center border border-[hsl(174,100%,50%,0.3)] bg-[hsl(200,30%,8%)] text-xl font-bold text-[hsl(174,100%,50%)]">
                  {getInitials(user.name)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{user.name}</h1>
                {user.username && (
                  <p className="text-[10px] text-[hsl(174,100%,50%,0.6)] mt-0.5">
                    @{user.username} · portfoland.com/{user.username}
                  </p>
                )}
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-gray-300 leading-relaxed border-l-2 border-[hsl(174,100%,50%,0.3)] pl-3">
                {user.bio}
              </p>
            )}

            {/* Contact row */}
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={`mailto:${user.email}`} className="flex items-center gap-1 text-[11px] text-[hsl(174,100%,50%)] hover:underline">
                <Mail className="w-3 h-3" />{user.email}
              </a>
              {user.contactLinks?.github && (
                <a href={user.contactLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-[hsl(174,100%,50%)] hover:underline">
                  <Github className="w-3 h-3" />GitHub
                </a>
              )}
              {user.contactLinks?.linkedin && (
                <a href={user.contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-[hsl(174,100%,50%)] hover:underline">
                  <Linkedin className="w-3 h-3" />LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Top Skills */}
          {topSkills.length > 0 && (
            <div className="border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)] p-5">
              <p className="text-[10px] text-[hsl(174,100%,50%)] uppercase tracking-widest mb-3">
                &gt; TOP_SKILLS [{topSkills.length}]
              </p>
              <div className="flex flex-wrap gap-2">
                {topSkills.map(s => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 text-[11px] border border-[hsl(174,100%,50%,0.25)] text-[hsl(174,100%,50%,0.8)] bg-[hsl(200,30%,6%)]"
                  >
                    {s.skill?.name ?? s.skillId}
                    {s.level != null && (
                      <span className="ml-1.5 text-[hsl(174,100%,50%,0.4)]">Lv.{s.level}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Experience */}
          {recentExperiences.length > 0 && (
            <div className="border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)] p-5">
              <p className="text-[10px] text-[hsl(174,100%,50%)] uppercase tracking-widest mb-3">
                &gt; RECENT_EXPERIENCE
              </p>
              <div className="space-y-4">
                {recentExperiences.map(exp => (
                  <div key={exp.id} className="border-l border-[hsl(174,100%,50%,0.2)] pl-3 space-y-1">
                    <p className="text-sm font-bold text-white">{exp.title}</p>
                    {exp.address && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />{exp.address}
                      </p>
                    )}
                    <p className="text-[10px] text-[hsl(174,100%,50%,0.5)] flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.5)] transition-shadow"
            >
              <Mail className="w-4 h-4" />
              CONTACT_{user.name?.split(' ')[0]?.toUpperCase()}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Classic mode
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-16 w-16 rounded-full border border-gray-100 object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 flex-shrink-0">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.username && (
                <p className="text-sm text-gray-400 mt-0.5">portfoland.com/{user.username}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Mail className="w-3.5 h-3.5" />{user.email}
                </a>
                {user.contactLinks?.github && (
                  <a href={user.contactLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <Github className="w-3.5 h-3.5" />GitHub
                  </a>
                )}
                {user.contactLinks?.linkedin && (
                  <a href={user.contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <Linkedin className="w-3.5 h-3.5" />LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed border-l-4 border-blue-100 pl-4">
              {user.bio}
            </p>
          )}
        </div>

        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Top Skills</h2>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(s => (
                <span
                  key={s.id}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium"
                >
                  {s.skill?.name ?? s.skillId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Experience */}
        {recentExperiences.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-4">
              {recentExperiences.map(exp => (
                <div key={exp.id} className="border-l-2 border-blue-200 pl-4 space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                  {exp.address && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{exp.address}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href={`mailto:${user.email}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact {user.name?.split(' ')[0]}
          </a>
        </div>
      </div>
    </div>
  );
}
