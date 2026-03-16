'use client';

import { useCallback, useTransition, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle';
import { ProfileImageUpload } from '@/features/portfolio/components/ProfileImageUpload';
import { HUDPanel } from '@/features/dashboard/components/HUDPanel';
import { ImproveBioButton } from '@/features/ai/components/ImproveBioButton';
import { BioSkillSuggestions } from '@/features/portfolio/components/BioSkillSuggestions';
import { updateProfile } from '@/features/portfolio/actions/updateProfile';
import { updatePortfolioSettingsAction } from '@/features/portfolio-settings/actions/portfolioSettingsActions';
import { PortfolioViewSelector } from '@/features/portfolio-settings/components/PortfolioViewSelector';
import { LayoutVariantSelector } from '@/features/portfolio-settings/components/LayoutVariantSelector';
import { AnalyticsPanel } from '@/features/analytics/components/AnalyticsPanel';
import { CustomThemeBuilder, type CustomThemePayload } from '@/features/portfolio-settings/components/CustomThemeBuilder';
import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { GenerateCareerStory } from '@/features/portfolio/components/GenerateCareerStory';
import { ShareKit } from '@/features/portfolio/components/ShareKit';
import ReactMarkdown from 'react-markdown';
import type { PortfolioMode, PortfolioViewMode } from '@/features/portfolio/types/portfolio';
import type { PortfolioSettingsModel } from '@/features/portfolio-settings/types/portfolioSettings';
import type { ServiceModel } from '@/features/services/types/service';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';
import {
  Github, Linkedin, Plus, Trash2, Layers, History, Box, Save,
  Loader2, ExternalLink, User, Sparkles,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

type TabId = 'profile' | 'content' | 'theme' | 'analytics' | 'share';

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
  analytics?: import('@/features/analytics/types/analytics').PortfolioAnalytics;
  services?: ServiceModel[];
  galleryItems?: GalleryItemModel[];
  testimonials?: TestimonialModel[];
}

const DEFAULT_SECTION_ORDER = ['about', 'experience', 'skills', 'projects'];

// =============================================================================
// Tab Bar
// =============================================================================

function TabBar({
  activeTab,
  onChange,
  isClassic,
  portfolioMode,
}: {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  isClassic: boolean;
  portfolioMode: PortfolioMode;
}) {
  const isTech = portfolioMode === 'tech';
  const tabs: { id: TabId; label: string }[] = [
    { id: 'profile', label: isTech ? '[PROFILE]' : 'Profile' },
    { id: 'content', label: isTech ? '[CONTENT]' : 'Content' },
    { id: 'theme' as TabId, label: isTech ? '[THEME]' : 'Theme' },
    { id: 'analytics', label: isTech ? '[ANALYTICS]' : 'Analytics' },
    { id: 'share', label: isTech ? '[SHARE]' : 'Share' },
  ];

  return (
    <div className={cn(
      'flex items-center gap-1 border-b',
      isTech ? 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,6%)] px-6' : 'border-gray-200 bg-white px-6'
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-3 text-xs transition-all',
            isTech
              ? 'font-mono uppercase tracking-wider'
              : 'font-medium',
            activeTab === tab.id
              ? isTech
                ? 'text-[hsl(174,100%,50%)] border-b-2 border-[hsl(174,100%,50%)] -mb-px'
                : 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : isTech
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DashboardPortfolioView({
  user,
  oauthImage,
  portfolioSettings,
  analytics,
  services = [],
  galleryItems = [],
  testimonials = [],
}: DashboardPortfolioViewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard.portfolio');
  const [isPending, startTransition] = useTransition();
  const isClassic = user.portfolioMode === 'classic';
  const isTech = user.portfolioMode === 'tech';

  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile state
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [image, setImage] = useState<string | null>(user.image || null);

  // Content state
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    user.sectionOrder && user.sectionOrder.length > 0 ? user.sectionOrder : DEFAULT_SECTION_ORDER
  );
  const [contactLinks, setContactLinks] = useState<Record<string, any>>(
    user.contactLinks || { github: '', linkedin: '', email: user.email, custom: [] }
  );
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    user.sectionVisibility || { about: true, experience: true, skills: true, projects: true, gallery: true, services: true, testimonials: true }
  );

  // Theme state
  const [currentTheme, setCurrentTheme] = useState(portfolioSettings?.theme ?? 'default');
  const [themeTab, setThemeTab] = useState<'presets' | 'custom'>(
    portfolioSettings?.theme === 'custom' ? 'custom' : 'presets'
  );

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  }, [sectionOrder]);

  const toggleVisibility = useCallback((key: string) => {
    setSectionVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateFixedLink = (key: string, value: string) => {
    setContactLinks(prev => ({ ...prev, [key]: value }));
  };

  const addCustomLink = () => {
    setContactLinks(prev => ({ ...prev, custom: [...(prev.custom || []), { label: '', url: '' }] }));
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

  const handleThemeSelect = (presetId: string, customThemePayload?: CustomThemePayload) => {
    startTransition(async () => {
      const result = await updatePortfolioSettingsAction({
        theme: presetId,
        ...(customThemePayload ? { customTheme: customThemePayload as any } : {})
      });
      if (result.hasError) { toast.error(result.message); }
      else { setCurrentTheme(presetId); toast.success(presetId === 'custom' ? 'Custom theme saved' : 'Theme updated'); }
    });
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await updateProfile({ name, bio: bio || null, image: image || null, sectionOrder, contactLinks, sectionVisibility });
        if (!result.hasError) { toast.success(t('messages.updated')); }
        else { toast.error(t('messages.error')); }
      } catch {
        toast.error(t('messages.unexpectedError'));
      }
    });
  }, [name, bio, image, sectionOrder, contactLinks, sectionVisibility, t]);

  const inputClass = isTech
    ? 'w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all'
    : 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all';

  const labelClass = isTech
    ? 'text-[10px] font-bold font-mono text-gray-300 uppercase tracking-widest'
    : 'text-xs font-medium text-gray-700';

  return (
    <>
      {/* Page Header */}
      <div className={cn(
        'px-6 py-5 flex items-center justify-between',
        isTech ? 'border-b border-[hsl(174,100%,50%,0.1)]' : 'border-b border-gray-200 bg-white'
      )}>
        <div>
          <h1 className={cn('text-xl font-bold', isTech ? 'font-mono text-foreground' : 'text-gray-900')}>{t('title')}</h1>
          <p className={cn('text-xs mt-0.5', isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a href={`/${locale}/${user.username}`} target="_blank" rel="noopener noreferrer"
              className={cn('flex items-center gap-1.5 text-xs transition-colors', isTech ? 'font-mono text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-900')}>
              <ExternalLink className="w-3.5 h-3.5" />
              {t('viewPublic')}
            </a>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onChange={setActiveTab} isClassic={isClassic} portfolioMode={user.portfolioMode} />

      {/* Tab Content */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto px-6 py-8 pb-32 space-y-6">

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* About */}
              <HUDPanel title={t('sections.about')} icon={<User className="w-4 h-4" />}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className={labelClass}>{t('sections.displayName')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={t('sections.displayNamePlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>{t('sections.bio')}</label>
                      <div className="flex items-center gap-2">
                        <ImproveBioButton currentBio={bio} onImproved={setBio} mode={user.portfolioMode === 'tech' ? 'tech' : 'classic'} locale={locale} />
                        <span className={cn('text-[10px]', isTech ? 'text-[#00D4FF]/70 font-mono' : 'text-gray-400')}>{bio.length}/1000</span>
                      </div>
                    </div>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={8} maxLength={1000}
                      className={cn(inputClass, 'resize-none')} placeholder={t('sections.bioPlaceholder')} />
                    <BioSkillSuggestions bio={bio} />
                    {bio && (
                      <div className="mt-2 space-y-2">
                        <span className={cn('text-[9px] uppercase tracking-wider', isTech ? 'font-mono text-[#00D4FF]/60' : 'text-gray-400')}>{t('sections.markdownTip')}</span>
                        <div className={cn('p-3 rounded', isTech ? 'bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.15)]' : 'bg-gray-50 border border-gray-200')}>
                          <div className={cn('text-[9px] uppercase tracking-wider mb-2', isTech ? 'font-mono text-[#00D4FF]/50' : 'text-gray-400')}>{t('sections.previewLabel')}</div>
                          <div className={cn('text-sm prose prose-sm max-w-none', isTech ? 'text-gray-200 prose-invert prose-strong:text-[#00D4FF] prose-em:text-purple-400' : 'text-gray-700')}>
                            <ReactMarkdown>{bio}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>{t('sections.avatar')}</label>
                    <ProfileImageUpload value={image} onChange={setImage} oauthImage={oauthImage} />
                  </div>
                </div>
              </HUDPanel>

              {/* Career Story */}
              <HUDPanel title={isTech ? '[CAREER_STORY]' : 'Career Story'} icon={<Sparkles className="w-4 h-4" />}>
                <GenerateCareerStory
                  username={user.username}
                  portfolioMode={user.portfolioMode}
                  locale={locale}
                  onUseBio={(text) => setBio(text)}
                />
              </HUDPanel>

              {/* Social Links */}
              <HUDPanel title={t('sections.socialLinks')} icon={<ExternalLink className="w-4 h-4" />}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={cn(labelClass, 'flex items-center gap-2')}><Github className="w-3.5 h-3.5" /> GitHub</label>
                        <input type="url" value={contactLinks.github || ''} onChange={(e) => updateFixedLink('github', e.target.value)} className={inputClass} placeholder="https://github.com/..." />
                      </div>
                      <div className="space-y-2">
                        <label className={cn(labelClass, 'flex items-center gap-2')}><Linkedin className="w-3.5 h-3.5" /> LinkedIn</label>
                        <input type="url" value={contactLinks.linkedin || ''} onChange={(e) => updateFixedLink('linkedin', e.target.value)} className={inputClass} placeholder="https://linkedin.com/..." />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>{t('sections.externalChannels')}</label>
                        <button type="button" onClick={addCustomLink} className={cn('text-[10px] flex items-center gap-1', isTech ? 'font-mono text-[#00D4FF] hover:text-[#00D4FF]/80' : 'text-blue-600 hover:text-blue-700')}>
                          <Plus className="w-3 h-3" /> {t('sections.addNew')}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {contactLinks.custom?.map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-200">
                            <input placeholder={t('sections.label')} value={link.label} onChange={(e) => updateCustomLink(idx, 'label', e.target.value)}
                              className={cn(inputClass, 'flex-1')} />
                            <input placeholder={t('sections.url')} value={link.url} onChange={(e) => updateCustomLink(idx, 'url', e.target.value)}
                              className={cn(inputClass, 'flex-[2]')} />
                            <button type="button" onClick={() => removeCustomLink(idx)} className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(!contactLinks.custom || contactLinks.custom.length === 0) && (
                          <div className={cn('py-4 border border-dashed rounded flex items-center justify-center', isTech ? 'border-gray-800/50' : 'border-gray-200')}>
                            <span className={cn('text-[10px] uppercase', isTech ? 'font-mono text-gray-600' : 'text-gray-400')}>{t('sections.noLinks')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </HUDPanel>
            </div>
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Section Order & Visibility */}
              <HUDPanel title="Section Order & Visibility" icon={<Layers className="w-4 h-4" />}>
                <div className="space-y-2">
                  {sectionOrder.map((sectionKey, index) => {
                    const labels: Record<string, string> = {
                      about: t('sections.about'),
                      experience: t('sections.experience'),
                      skills: t('sections.skills'),
                      projects: t('sections.projects'),
                    };
                    const icons: Record<string, React.ReactNode> = {
                      about: <User className="w-3.5 h-3.5" />,
                      experience: <History className="w-3.5 h-3.5" />,
                      skills: <Layers className="w-3.5 h-3.5" />,
                      projects: <Box className="w-3.5 h-3.5" />,
                    };
                    return (
                      <div key={sectionKey} className={cn(
                        'flex items-center justify-between py-2.5 px-3 rounded',
                        isTech ? 'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.08)]' : 'bg-gray-50 border border-gray-100'
                      )}>
                        <div className="flex items-center gap-2">
                          <span className={isTech ? 'text-[hsl(174,100%,50%)] opacity-60' : 'text-gray-400'}>{icons[sectionKey]}</span>
                          <span className={cn('text-sm', isTech ? 'font-mono text-gray-200' : 'text-gray-700')}>{labels[sectionKey]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleVisibility(sectionKey)}
                            className={cn('text-xs px-2.5 py-1 rounded-sm border transition-colors',
                              sectionVisibility[sectionKey] !== false
                                ? isTech ? 'text-[hsl(150,100%,45%)] border-[hsl(150,100%,45%,0.3)] bg-[hsl(150,100%,45%,0.08)]' : 'text-green-600 border-green-200 bg-green-50'
                                : isTech ? 'text-gray-500 border-gray-700 bg-gray-800/50' : 'text-gray-400 border-gray-200'
                            )}>
                            {sectionVisibility[sectionKey] !== false ? 'Visible' : 'Hidden'}
                          </button>
                          <div className="flex gap-0.5">
                            <button type="button" onClick={() => moveSection(index, 'up')} disabled={index === 0}
                              className={cn('px-1.5 py-1 text-xs rounded transition-colors disabled:opacity-30',
                                isTech ? 'text-muted-foreground hover:text-foreground hover:bg-[hsl(174,100%,50%,0.08)]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              )}>↑</button>
                            <button type="button" onClick={() => moveSection(index, 'down')} disabled={index === sectionOrder.length - 1}
                              className={cn('px-1.5 py-1 text-xs rounded transition-colors disabled:opacity-30',
                                isTech ? 'text-muted-foreground hover:text-foreground hover:bg-[hsl(174,100%,50%,0.08)]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              )}>↓</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </HUDPanel>

              {/* Classic Sections visibility + CRUD */}
              {isClassic && (
                <>
                  {/* Visibility toggles for Classic sections */}
                  <HUDPanel title="Classic Sections Visibility" icon={<Layers className="w-4 h-4" />}>
                    <div>
                      {[
                        { key: 'gallery', label: 'Gallery' },
                        { key: 'services', label: 'Services' },
                        { key: 'testimonials', label: 'Testimonials' },
                      ].map(({ key, label }) => (
                        <div key={key} className={cn('flex items-center justify-between py-2.5 border-b last:border-0',
                          isTech ? 'border-[hsl(174,100%,50%,0.08)]' : 'border-gray-100')}>
                          <span className={cn('text-sm', isTech ? 'font-mono text-gray-200' : 'text-gray-700')}>{label}</span>
                          <button type="button" onClick={() => toggleVisibility(key)}
                            className={cn('text-xs px-2.5 py-1 rounded-sm border transition-colors',
                              sectionVisibility[key] !== false
                                ? isTech ? 'text-[hsl(150,100%,45%)] border-[hsl(150,100%,45%,0.3)] bg-[hsl(150,100%,45%,0.08)]' : 'text-green-600 border-green-200 bg-green-50'
                                : isTech ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-200'
                            )}>
                            {sectionVisibility[key] !== false ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </HUDPanel>

                  {/* Services CRUD */}
                  <HUDPanel title="Services" icon={<Layers className="w-4 h-4" />}>
                    <ServicesSection services={services} portfolioMode={user.portfolioMode} />
                  </HUDPanel>

                  {/* Gallery CRUD */}
                  <HUDPanel title="Gallery" icon={<Layers className="w-4 h-4" />}>
                    <GallerySection items={galleryItems} portfolioMode={user.portfolioMode} />
                  </HUDPanel>

                  {/* Testimonials CRUD */}
                  <HUDPanel title="Testimonials" icon={<Layers className="w-4 h-4" />}>
                    <TestimonialsSection testimonials={testimonials} portfolioMode={user.portfolioMode} />
                  </HUDPanel>
                </>
              )}
            </div>
          )}

          {/* ── THEME TAB ── */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <HUDPanel title={t('preferences.title')} icon={<Layers className="w-4 h-4" />}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className={cn('text-sm font-semibold', isTech ? 'font-mono text-gray-100 uppercase' : 'text-gray-900')}>{t('preferences.interface')}</p>
                    <p className={cn('text-[10px]', isTech ? 'font-mono text-gray-400 uppercase' : 'text-gray-500')}>{t('preferences.description')}</p>
                  </div>
                  <PortfolioModeToggle currentMode={user.portfolioMode} />
                </div>
              </HUDPanel>

              {/* View Mode — available for both Tech and Classic */}
              <PortfolioViewSelector
                currentViewMode={(portfolioSettings?.viewMode ?? 'sections') as PortfolioViewMode}
                portfolioMode={user.portfolioMode}
              />

              {/* Classic-only: Theme Presets + Custom Builder + Layout Variant */}
              {isClassic && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-1 bg-[#0D1421] border border-[hsl(174,100%,50%,0.15)] rounded-sm w-fit">
                      {(['presets', 'custom'] as const).map((tab) => (
                        <button key={tab} type="button" onClick={() => setThemeTab(tab)}
                          className={cn('px-4 py-1.5 text-xs font-mono rounded-sm transition-all',
                            themeTab === tab ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                          )}>
                          {tab === 'presets' ? 'Presets' : 'Custom Builder'}
                        </button>
                      ))}
                    </div>

                    {themeTab === 'presets' ? (
                      <HUDPanel title="Classic Mode Theme" icon={<Layers className="w-4 h-4" />}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.values(THEME_PRESETS).map((preset) => (
                            <button key={preset.id} type="button" onClick={() => handleThemeSelect(preset.id)}
                              className={cn('flex flex-col gap-2 p-3 border rounded-sm text-left transition-all',
                                currentTheme === preset.id
                                  ? 'border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]'
                                  : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]'
                              )}>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: preset.backgroundColor }} />
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                                {currentTheme === preset.id && (
                                  <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase ml-auto">Active</span>
                                )}
                              </div>
                              <span className="text-xs font-mono text-gray-200">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </HUDPanel>
                    ) : (
                      <CustomThemeBuilder
                        initialTheme={portfolioSettings?.customTheme as CustomThemePayload | null}
                        disabled={isPending}
                        onChange={(newTheme) => handleThemeSelect('custom', newTheme)}
                      />
                    )}
                  </div>

                  <LayoutVariantSelector currentVariant={portfolioSettings?.layoutVariant ?? 'bento'} />
                </>
              )}
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && analytics && (
            <AnalyticsPanel analytics={analytics} portfolioMode={user.portfolioMode} />
          )}
          {activeTab === 'analytics' && !analytics && (
            <div className={cn('text-center py-16', isTech ? 'font-mono text-muted-foreground' : 'text-gray-400')}>
              No analytics data yet. Share your portfolio to start tracking visits.
            </div>
          )}

          {/* ── SHARE TAB ── */}
          {activeTab === 'share' && (
            <ShareKit
              username={user.username}
              name={user.name}
              bio={user.bio}
              image={user.image}
              portfolioMode={user.portfolioMode}
            />
          )}

        </div>

        {/* Floating Save Button — hidden on analytics + share tabs */}
        {activeTab !== 'analytics' && activeTab !== 'share' && (
          <div className="fixed bottom-10 right-10 z-50">
            <button type="submit" disabled={isPending}
              className={cn(
                'flex items-center gap-3 px-8 py-4 font-mono text-sm font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
                'bg-[#00D4FF] text-[#0A0E1A] hover:bg-[#00B8E6] shadow-[0_0_30px_rgba(0,212,255,0.4)]'
              )}>
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isPending ? t('actions.syncing') : t('actions.save')}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
