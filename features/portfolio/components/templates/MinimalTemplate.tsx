/**
 * MinimalTemplate
 *
 * A self-contained minimal portfolio: avatar, name, bio, top 5 skills, contact links.
 * No section imports. Works for both Classic and Tech mode.
 */

'use client';

import type { PortfolioMode, PortfolioData } from '../../types/portfolio';
import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';

// =============================================================================
// Component
// =============================================================================

interface MinimalTemplateProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

export function MinimalTemplate({ data, mode }: MinimalTemplateProps) {
  const isClassic = mode === 'classic';
  const { user, skills } = data;

  // Top 5 skills sorted descending by level
  const topSkills = [...(skills?.skills ?? [])]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  // Render contact links
  const contactLinks = user.contactLinks as Record<string, string>;
  const contactEntries: { label: string; href: string; value: string }[] = [];
  if (contactLinks.email) {
    contactEntries.push({ label: 'Email', href: `mailto:${contactLinks.email}`, value: contactLinks.email });
  }
  if (contactLinks.github) {
    contactEntries.push({ label: 'GitHub', href: contactLinks.github.startsWith('http') ? contactLinks.github : `https://github.com/${contactLinks.github}`, value: contactLinks.github });
  }
  if (contactLinks.linkedin) {
    contactEntries.push({ label: 'LinkedIn', href: contactLinks.linkedin.startsWith('http') ? contactLinks.linkedin : `https://linkedin.com/in/${contactLinks.linkedin}`, value: contactLinks.linkedin });
  }
  if (contactLinks.website) {
    contactEntries.push({ label: 'Website', href: contactLinks.website, value: contactLinks.website });
  }
  // Custom entries
  if (contactLinks.custom && Array.isArray(contactLinks.custom)) {
    for (const entry of contactLinks.custom as Array<{ label: string; url: string }>) {
      contactEntries.push({ label: entry.label, href: entry.url, value: entry.url });
    }
  }

  // Resolve Theme
  const isCustomTheme = data.settings?.theme === 'custom' && !!data.settings?.customTheme;
  const preset = isCustomTheme
    ? (data.settings!.customTheme as any) // Shape matches ThemePreset's color fields
    : (THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default']);

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  if (isClassic) {
    return (
      <div
        className="min-h-screen flex items-start justify-center py-16 px-4 bg-white"
        style={isCustomTheme ? {
          '--portfolio-text': preset.textColor,
          '--portfolio-accent': preset.accentColor,
          '--portfolio-border': preset.borderColor,
          '--portfolio-card-bg': preset.cardBackground,
          fontFamily: preset.fontFamily,
        } as React.CSSProperties : undefined}
      >
        <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
          {/* Identity Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {user.image ? (
                <img src={user.image} alt={user.name} className="rounded-full w-20 h-20 object-cover" />
              ) : (
                <div className="rounded-full w-20 h-20 bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.username && <p className="text-sm text-gray-500">@{user.username}</p>}
              </div>
            </div>
            {user.bio && (
              <p className="text-gray-600 text-sm line-clamp-3">{user.bio}</p>
            )}
          </div>

          {/* Top Skills */}
          {topSkills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Skills</h2>
              <div className="flex flex-wrap gap-2">
                {topSkills.map(skill => (
                  <span key={skill.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {skill.skill.name}
                    <span className="text-blue-400">Lv.{skill.level}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Links */}
          {contactEntries.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</h2>
              <div className="flex flex-col gap-2">
                {contactEntries.map(entry => (
                  <a
                    key={entry.label}
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1.5"
                  >
                    <span className="font-medium text-gray-500">{entry.label}:</span>
                    {entry.value}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tech Mode
  return (
    <div
      className="min-h-screen flex items-start justify-center py-16 px-4 bg-[#0A0E1A] relative overflow-x-hidden"
      style={isCustomTheme ? {
        '--portfolio-text': preset.textColor,
        '--portfolio-accent': preset.accentColor,
        '--portfolio-border': preset.borderColor,
        '--portfolio-card-bg': preset.cardBackground,
        fontFamily: preset.fontFamily,
      } as React.CSSProperties : undefined}
    >
      {/* CRT Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        <div className="crt-lines absolute inset-0 opacity-[0.03]" />
        <div className="crt-scanner" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/[0.02] to-transparent animate-scanline-flash opacity-20" />
      </div>

      <div className="w-full max-w-lg mx-auto flex flex-col gap-6 relative z-10">
        {/* Identity Card */}
        <div className="bg-[#0D1421] border border-[#00D4FF]/30 rounded-sm p-8 font-mono flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img src={user.image} alt={user.name} className="rounded-full w-20 h-20 object-cover border border-[#00D4FF]/30" />
            ) : (
              <div className="rounded-full w-20 h-20 bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center text-2xl font-bold font-mono text-[#00D4FF]">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-mono font-bold text-[#00D4FF]">{user.name}</h1>
              {user.username && <p className="text-xs text-gray-400 font-mono">@{user.username}</p>}
            </div>
          </div>
          {user.bio && (
            <p className="text-gray-400 text-sm line-clamp-3 font-mono">{user.bio}</p>
          )}
        </div>

        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div className="bg-[#0D1421] border border-[#00D4FF]/30 rounded-sm p-6 font-mono flex flex-col gap-3">
            <h2 className="text-[10px] font-mono text-[#D946EF] uppercase tracking-wider">// SKILL_TREE</h2>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(skill => (
                <span key={skill.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-mono border border-[#00D4FF]/20">
                  {skill.skill.name}
                  <span className="text-[#D946EF]">Lv.{skill.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Links */}
        {contactEntries.length > 0 && (
          <div className="bg-[#0D1421] border border-[#00D4FF]/30 rounded-sm p-6 font-mono flex flex-col gap-3">
            <h2 className="text-[10px] font-mono text-[#D946EF] uppercase tracking-wider">// CONTACT</h2>
            <div className="flex flex-col gap-2">
              {contactEntries.map(entry => (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00D4FF] hover:text-white text-sm font-mono flex items-center gap-1.5"
                >
                  <span className="text-[#D946EF]">{entry.label}:</span>
                  {entry.value}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
