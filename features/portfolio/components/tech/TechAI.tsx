'use client';

import { useTranslations, useLocale } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Github, Mail, Linkedin, Globe } from 'lucide-react';
import { HUDPanel } from '@/features/tech';
import type { PortfolioSectionProps } from '../../types/portfolio';
import { usePortfolioNarrative } from '../../hooks/usePortfolioNarrative';

export function TechAI({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const { narrative, isLoading, error, stats, featuredProjects, contactLinks } =
    usePortfolioNarrative({ data, mode: 'tech' });

  return (
    <HUDPanel className={className}>
      <div className="relative flex flex-col gap-6 overflow-hidden py-8 px-6">
        {/* Title with neon glow */}
        <h2
          className="text-2xl font-bold text-[#00D4FF] text-center"
          style={{ textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' }}
        >
          {t('sections.ai.gaming.title')}
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-full bg-[#00D4FF] animate-pulse"
                data-testid="pulsing-dot"
              />
              <span className="font-mono text-sm text-[#64748B]" data-testid="system-initializing">
                {locale === 'es' ? 'Inicializando sistema de IA...' : 'Initializing AI system...'}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">
              {locale === 'es' ? 'Error al cargar resumen' : 'Failed to load summary'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="flex flex-col gap-6">
            {/* AI Narrative */}
            {narrative && (
              <div className="prose prose-invert prose-sm max-w-none prose-strong:text-[#00D4FF] prose-em:text-purple-400 prose-p:text-gray-300 prose-p:leading-relaxed">
                <ReactMarkdown>{narrative}</ReactMarkdown>
              </div>
            )}

            {/* Quick Stats */}
            <div className="border-t border-[#00D4FF]/20 pt-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#00D4FF]/60 mb-3">
                {locale === 'es' ? '⚡ Stats Rápidas' : '⚡ Quick Stats'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-[#00D4FF]/5 rounded border border-[#00D4FF]/20">
                  <span className="text-2xl font-bold text-[#00D4FF]">
                    {stats.yearsOfExperience === 0 ? '< 1' : `${stats.yearsOfExperience}+`}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 text-center">
                    {locale === 'es' ? 'años exp' : 'years exp'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-[#00D4FF]/5 rounded border border-[#00D4FF]/20">
                  <span className="text-2xl font-bold text-[#00D4FF]">{stats.totalProjects}</span>
                  <span className="text-[10px] font-mono text-gray-400 text-center">
                    {locale === 'es' ? 'proyectos' : 'projects'}
                  </span>
                  <span className="text-[9px] font-mono text-[#00D4FF]/60 text-center mt-1">
                    {stats.projectsCompleted} {locale === 'es' ? 'completados' : 'completed'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-[#00D4FF]/5 rounded border border-[#00D4FF]/20">
                  <span className="text-2xl font-bold text-[#00D4FF]">{stats.skillsMastered}</span>
                  <span className="text-[10px] font-mono text-gray-400 text-center">
                    {locale === 'es' ? 'skills' : 'skills'}
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="border-t border-[#00D4FF]/20 pt-6">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#00D4FF]/60 mb-3">
                  {locale === 'es' ? '🚀 Proyectos Destacados' : '🚀 Featured Projects'}
                </h3>
                <div className="flex flex-col gap-3">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between gap-3 p-3 bg-[#00D4FF]/5 rounded border border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{project.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {project.technologies?.slice(0, 3).join(', ') || 'No tech specified'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {project.links && Array.isArray(project.links) && project.links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                            title={link.label}
                          >
                            {link.type === 'github' ? (
                              <Github className="w-4 h-4" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Access */}
            <div className="border-t border-[#00D4FF]/20 pt-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#00D4FF]/60 mb-3">
                {locale === 'es' ? '🔗 Acceso Rápido' : '🔗 Quick Access'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {contactLinks.github && (
                  <a
                    href={contactLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded text-xs font-mono text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                )}
                {contactLinks.linkedin && (
                  <a
                    href={contactLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded text-xs font-mono text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
                {data?.user?.email && (
                  <a
                    href={`mailto:${data.user.email}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded text-xs font-mono text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                )}
                {contactLinks.website && (
                  <a
                    href={contactLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded text-xs font-mono text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scanline effect overlay */}
        <div
          className="scanline-overlay absolute inset-0 pointer-events-none opacity-10"
          data-testid="scanline-overlay"
        />
      </div>
    </HUDPanel>
  );
}
