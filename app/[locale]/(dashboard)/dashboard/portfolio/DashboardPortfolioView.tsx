'use client';

/**
 * DashboardPortfolioView Component - Cyberpunk V2
 *
 * Client component for the dashboard portfolio edit page with cyberpunk design.
 */

import { useCallback, useTransition, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle';
import { ProfileImageUpload } from '@/features/portfolio/components/ProfileImageUpload';
import { HUDPanel } from '@/features/dashboard/components/HUDPanel';
import { AIChatContainer } from '@/features/dashboard/components/ai/AIChatContainer';
import { ImproveBioButton } from '@/features/ai/components/ImproveBioButton';
import { updateProfile } from '@/features/portfolio/actions/updateProfile';
import { updatePortfolioSettingsAction } from '@/features/portfolio-settings/actions/portfolioSettingsActions';
import { PortfolioViewSelector } from '@/features/portfolio-settings/components/PortfolioViewSelector';
import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import ReactMarkdown from 'react-markdown';
import type { PortfolioMode, PortfolioViewMode } from '@/features/portfolio/types/portfolio';
import type { PortfolioSettingsModel } from '@/features/portfolio-settings/types/portfolioSettings';
import {
  Github,
  Linkedin,
  Mail,
  Plus,
  Trash2,
  Layers,
  History,
  Box,
  Save,
  Loader2,
  ExternalLink,
  User,
  Bot,
  Sparkles
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface DashboardPortfolioViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
    bio: string | null;
    portfolioMode: PortfolioMode;
    sectionOrder?: string[];
    contactLinks?: Record<string, any>;
    sectionVisibility?: Record<string, boolean>;
  };
  oauthImage?: string | null;
  portfolioSettings?: PortfolioSettingsModel | null;
}

const DEFAULT_SECTION_ORDER = ['about', 'experience', 'skills', 'projects'];

// =============================================================================
// Main Component
// =============================================================================

export function DashboardPortfolioView({ user, oauthImage, portfolioSettings }: DashboardPortfolioViewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard.portfolio');
  const tCommon = useTranslations('common');
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [image, setImage] = useState<string | null>(user.image || null);

  // New State for ordering, links, and visibility
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    user.sectionOrder && user.sectionOrder.length > 0
      ? user.sectionOrder
      : DEFAULT_SECTION_ORDER
  );

  const [contactLinks, setContactLinks] = useState<Record<string, any>>(
    user.contactLinks || { github: '', linkedin: '', email: user.email, custom: [] }
  );

  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    user.sectionVisibility || {
      about: true,
      experience: true,
      skills: true,
      projects: true,
      gallery: true,
      services: true,
      testimonials: true,
    }
  );

  const [currentTheme, setCurrentTheme] = useState(portfolioSettings?.theme ?? 'default');

  // Helper: Move section in order
  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  }, [sectionOrder]);

  // Helper: Toggle visibility
  const toggleVisibility = useCallback((key: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Helper: Manage Social Links
  const updateFixedLink = (key: string, value: string) => {
    setContactLinks(prev => ({ ...prev, [key]: value }));
  };

  const addCustomLink = () => {
    setContactLinks(prev => ({
      ...prev,
      custom: [...(prev.custom || []), { label: '', url: '' }]
    }));
  };

  const updateCustomLink = (index: number, field: string, value: string) => {
    const newCustom = [...(contactLinks.custom || [])];
    newCustom[index] = { ...newCustom[index], [field]: value };
    setContactLinks(prev => ({ ...prev, custom: newCustom }));
  };

  const removeCustomLink = (index: number) => {
    const newCustom = [...(contactLinks.custom || [])];
    newCustom.splice(index, 1);
    setContactLinks(prev => ({ ...prev, custom: newCustom }));
  };

  // Handle theme selection
  const handleThemeSelect = (presetId: string) => {
    startTransition(async () => {
      const result = await updatePortfolioSettingsAction({ theme: presetId });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        setCurrentTheme(presetId);
        toast.success('Theme updated');
      }
    });
  };

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      startTransition(async () => {
        try {
          const result = await updateProfile({
            name,
            bio: bio || null,
            image: image || null,
            sectionOrder,
            contactLinks,
            sectionVisibility,
          });

          if (!result.hasError) {
            toast.success(t('messages.updated'));
          } else {
            toast.error(t('messages.error'));
          }
        } catch (error) {
          console.error('Error updating profile:', error);
          toast.error(t('messages.unexpectedError'));
        }
      });
    },
    [name, bio, image, sectionOrder, contactLinks, sectionVisibility, t]
  );

  return (
    <>
      {/* Page Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">{t('title')}</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/${locale}/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('viewPublic')}
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <div className="space-y-8">
          {/* AI ASSISTANT HUD PANEL */}
          <HUDPanel
            title={t('ai.assistantTitle')}
            icon={<Bot className="w-4 h-4" />}
            className="border-[#00D4FF]/40 shadow-[0_0_15px_rgba(0,212,255,0.1)]"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-[10px] text-gray-400 font-mono uppercase">{t('ai.guidanceActive')}</span>
              </div>
              <AIChatContainer />
            </div>
          </HUDPanel>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Draggable/Reorderable Sections Container */}
            <div className="space-y-6">
              {sectionOrder.map((sectionKey, index) => {
                // ABOUT SECTION
                if (sectionKey === 'about') {
                  return (
                    <HUDPanel
                      key="about"
                      title={t('sections.about')}
                      icon={<User className="w-4 h-4" />}
                      isVisible={sectionVisibility.about}
                      onToggleVisibility={() => toggleVisibility('about')}
                      onMoveUp={() => moveSection(index, 'up')}
                      onMoveDown={() => moveSection(index, 'down')}
                    >
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold font-mono text-gray-300 uppercase tracking-widest">{t('sections.displayName')}</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all"
                            placeholder={t('sections.displayNamePlaceholder')}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold font-mono text-gray-300 uppercase tracking-widest">
                              {t('sections.bio')}
                            </label>
                            <div className="flex items-center gap-2">
                              <ImproveBioButton
                                currentBio={bio}
                                onImproved={(improvedBio) => setBio(improvedBio)}
                                mode="tech"
                                locale={locale}
                              />
                              <span className="text-[10px] text-[#00D4FF]/70 font-mono">{bio.length}/1000</span>
                            </div>
                          </div>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={8}
                            maxLength={1000}
                            className="w-full px-4 py-3 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none resize-none transition-all"
                            placeholder={t('sections.bioPlaceholder')}
                          />

                          {/* Markdown Preview & Hint */}
                          {bio && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-[#00D4FF]/60 uppercase tracking-wider">
                                  {t('sections.markdownTip')}
                                </span>
                              </div>
                              <div className="p-3 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.15)] rounded">
                                <div className="text-[9px] font-mono text-[#00D4FF]/50 uppercase tracking-wider mb-2">
                                  {t('sections.previewLabel')}
                                </div>
                                <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none prose-strong:text-[#00D4FF] prose-em:text-purple-400">
                                  <ReactMarkdown>
                                    {bio}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold font-mono text-gray-300 uppercase tracking-widest">{t('sections.avatar')}</label>
                          <ProfileImageUpload
                            value={image}
                            onChange={setImage}
                            oauthImage={oauthImage}
                          />
                        </div>
                      </div>
                    </HUDPanel>
                  );
                }

                // EXPERIENCE SECTION
                if (sectionKey === 'experience') {
                  return (
                    <HUDPanel
                      key="experience"
                      title={t('sections.experience')}
                      icon={<History className="w-4 h-4" />}
                      isVisible={sectionVisibility.experience}
                      onToggleVisibility={() => toggleVisibility('experience')}
                      onMoveUp={() => moveSection(index, 'up')}
                      onMoveDown={() => moveSection(index, 'down')}
                    >
                      <div className="flex flex-col items-center justify-center py-10 bg-[#0D1421]/50 border-2 border-dashed border-[hsl(174,100%,50%,0.1)] rounded group hover:border-[hsl(174,100%,50%,0.2)] transition-colors">
                        <History className="w-10 h-10 text-[#00D4FF]/30 mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm text-gray-300 font-mono font-bold">{t('sections.experienceNote')}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-2 uppercase tracking-tight">{t('sections.experienceNote2')}</p>
                      </div>
                    </HUDPanel>
                  );
                }

                // SKILLS SECTION
                if (sectionKey === 'skills') {
                  return (
                    <HUDPanel
                      key="skills"
                      title={t('sections.skills')}
                      icon={<Layers className="w-4 h-4" />}
                      isVisible={sectionVisibility.skills}
                      onToggleVisibility={() => toggleVisibility('skills')}
                      onMoveUp={() => moveSection(index, 'up')}
                      onMoveDown={() => moveSection(index, 'down')}
                    >
                      <div className="flex flex-col items-center justify-center py-10 bg-[#0D1421]/50 border-2 border-dashed border-[hsl(174,100%,50%,0.1)] rounded group hover:border-[hsl(174,100%,50%,0.2)] transition-colors">
                        <Layers className="w-10 h-10 text-[#00D4FF]/30 mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm text-gray-300 font-mono font-bold">{t('sections.skillsNote')}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-2 uppercase tracking-tight">{t('sections.experienceNote2')}</p>
                      </div>
                    </HUDPanel>
                  );
                }

                // PROJECTS SECTION
                if (sectionKey === 'projects') {
                  return (
                    <HUDPanel
                      key="projects"
                      title={t('sections.projects')}
                      icon={<Box className="w-4 h-4" />}
                      isVisible={sectionVisibility.projects}
                      onToggleVisibility={() => toggleVisibility('projects')}
                      onMoveUp={() => moveSection(index, 'up')}
                      onMoveDown={() => moveSection(index, 'down')}
                    >
                      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[hsl(174,100%,50%,0.05)] rounded">
                        <Box className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-sm text-muted-foreground font-mono">{t('sections.projectsNote')}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1 opacity-60">{t('sections.experienceNote2')}</p>
                      </div>
                    </HUDPanel>
                  );
                }

                return null;
              })}

              {/* CLASSIC SECTIONS VISIBILITY (Only for Classic Mode users) */}
              {user.portfolioMode === 'classic' && (
                <HUDPanel title="Classic Sections" icon={<Layers className="w-4 h-4" />}>
                  <div>
                    {[
                      { key: 'gallery', label: 'Images / Gallery' },
                      { key: 'services', label: 'Services' },
                      { key: 'testimonials', label: 'Testimonials' },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-[hsl(174,100%,50%,0.08)] last:border-0"
                      >
                        <span className="text-sm font-mono text-gray-200">{label}</span>
                        <button
                          type="button"
                          onClick={() => toggleVisibility(key)}
                          className={cn(
                            'text-xs font-mono px-3 py-1 rounded-sm border transition-colors',
                            sectionVisibility[key] !== false
                              ? 'text-[hsl(150,100%,45%)] border-[hsl(150,100%,45%,0.3)] bg-[hsl(150,100%,45%,0.08)]'
                              : 'text-[#64748B] border-[#64748B]/30 bg-[#64748B]/08'
                          )}
                        >
                          {sectionVisibility[key] !== false ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    ))}
                  </div>
                </HUDPanel>
              )}

              {/* STATIC SOCIAL LINKS SECTION (Not part of section order) */}
              <HUDPanel
                title={t('sections.socialLinks')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Fixed Links */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black font-mono text-gray-300 flex items-center gap-2 tracking-[0.2em] uppercase">
                          <Github className="w-3.5 h-3.5 text-[#00D4FF]" /> {t('sections.github').toUpperCase()}_KEY
                        </label>
                        <input
                          type="url"
                          value={contactLinks.github || ''}
                          onChange={(e) => updateFixedLink('github', e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.2)] rounded font-mono text-xs text-gray-100 placeholder:text-gray-700 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20 focus:outline-none transition-all"
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black font-mono text-gray-300 flex items-center gap-2 tracking-[0.2em] uppercase">
                          <Linkedin className="w-3.5 h-3.5 text-[#00D4FF]" /> {t('sections.linkedin').toUpperCase()}_KEY
                        </label>
                        <input
                          type="url"
                          value={contactLinks.linkedin || ''}
                          onChange={(e) => updateFixedLink('linkedin', e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.2)] rounded font-mono text-xs text-gray-100 placeholder:text-gray-700 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20 focus:outline-none transition-all"
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                    </div>

                    {/* Custom Links */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black font-mono text-gray-300 uppercase tracking-[0.2em]">{t('sections.externalChannels').toUpperCase()}</label>
                        <button
                          type="button"
                          onClick={addCustomLink}
                          className="text-[10px] font-mono font-black text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" /> {t('sections.addNew').toUpperCase()}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {contactLinks.custom?.map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-200">
                            <input
                              placeholder={t('sections.label')}
                              value={link.label}
                              onChange={(e) => updateCustomLink(idx, 'label', e.target.value)}
                              className="flex-1 px-3 py-2 bg-[#0D1421] border border-[hsl(174,100%,50%,0.1)] rounded font-mono text-[10px] text-gray-100 placeholder:text-gray-700 focus:border-[#00D4FF] focus:outline-none"
                            />
                            <input
                              placeholder={t('sections.url')}
                              value={link.url}
                              onChange={(e) => updateCustomLink(idx, 'url', e.target.value)}
                              className="flex-[2] px-3 py-2 bg-[#0D1421] border border-[hsl(174,100%,50%,0.1)] rounded font-mono text-[10px] text-gray-100 placeholder:text-gray-700 focus:border-[#00D4FF] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeCustomLink(idx)}
                              className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(!contactLinks.custom || contactLinks.custom.length === 0) && (
                          <div className="py-4 border border-dashed border-gray-800/50 rounded flex items-center justify-center">
                            <span className="text-[10px] font-mono text-gray-600 uppercase">{t('sections.noLinks')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </HUDPanel>

              {/* Theme & Display HUD */}
              <HUDPanel title={t('preferences.title')} icon={<Layers className="w-4 h-4" />}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-100 font-black tracking-wide uppercase">{t('preferences.interface')}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">{t('preferences.description')}</p>
                  </div>
                  <PortfolioModeToggle currentMode={user.portfolioMode} />
                </div>
              </HUDPanel>

              {/* CLASSIC MODE THEME PICKER */}
              {user.portfolioMode === 'classic' && (
                <HUDPanel title="Classic Mode Theme" icon={<Layers className="w-4 h-4" />}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.values(THEME_PRESETS).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleThemeSelect(preset.id)}
                        className={cn(
                          'flex flex-col gap-2 p-3 border rounded-sm text-left transition-all',
                          currentTheme === preset.id
                            ? 'border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]'
                            : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-white/10"
                            style={{ backgroundColor: preset.backgroundColor }}
                          />
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                          {currentTheme === preset.id && (
                            <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase ml-auto">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-200">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </HUDPanel>
              )}

              {/* View Mode Selector */}
              <PortfolioViewSelector
                currentViewMode={(portfolioSettings?.viewMode ?? 'sections') as PortfolioViewMode}
                portfolioMode={user.portfolioMode}
              />
            </div>

            {/* Floating Action Button for Saving */}
            <div className="fixed bottom-10 right-10 z-50">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 bg-[#00D4FF] text-[#0A0E1A] font-mono text-sm font-bold',
                  'rounded-lg hover:bg-[#00B8E6] transition-all transform hover:scale-105',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-[0_0_30px_rgba(0,212,255,0.4)]',
                )}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isPending ? t('actions.syncing') : t('actions.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
