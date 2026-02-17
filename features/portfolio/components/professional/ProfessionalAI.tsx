'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Github, Mail, Linkedin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

export function ProfessionalAI({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const [narrative, setNarrative] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadNarrative() {
      try {
        const username = data?.user?.username;
        if (!username) {
          setError('Username not found');
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/ai/narrate-portfolio?username=${username}&mode=professional&locale=${locale}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Failed to load narrative');
        }

        setNarrative(result.narrative);
      } catch (err: any) {
        console.error('PROFESSIONAL_AI_ERROR:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadNarrative();
  }, [data?.user?.username, locale]);

  // Calculate stats
  const stats = useMemo(() => {
    const experiences = data?.experiences?.experiences || [];
    const projects = data?.projects || [];
    const skills = data?.skills?.skills || [];

    // Calculate years of experience with fallbacks
    let yearsOfExperience = 0;

    // Prefer WORK experiences
    const workExperiences = experiences.filter(exp => exp.type === 'WORK');
    if (workExperiences.length > 0) {
      const oldestExp = workExperiences.reduce((oldest, exp) =>
        new Date(exp.startDate) < new Date(oldest.startDate) ? exp : oldest
      );
      yearsOfExperience = Math.floor((Date.now() - new Date(oldestExp.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    // Fallback: use ANY experience type
    else if (experiences.length > 0) {
      const oldestExp = experiences.reduce((oldest, exp) =>
        new Date(exp.startDate) < new Date(oldest.startDate) ? exp : oldest
      );
      yearsOfExperience = Math.floor((Date.now() - new Date(oldestExp.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    // Fallback: use oldest skill
    else if (skills.length > 0) {
      const oldestSkill = skills.reduce((oldest, skill) =>
        new Date(skill.createdAt) < new Date(oldest.createdAt) ? skill : oldest
      );
      yearsOfExperience = Math.floor((Date.now() - new Date(oldestSkill.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    return {
      yearsOfExperience,
      totalProjects: projects.length,
      projectsCompleted: projects.filter(p => p.status === 'COMPLETED').length,
      projectsInProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      skillsMastered: skills.length,
    };
  }, [data]);

  // Featured projects (top 3 featured or most recent)
  const featuredProjects = useMemo(() => {
    const projects = data?.projects || [];
    const featured = projects.filter(p => p.featured).slice(0, 3);
    if (featured.length >= 3) return featured;
    return projects.slice(0, 3);
  }, [data?.projects]);

  // Quick access links
  const contactLinks = data?.user?.contactLinks || {};

  return (
    <section className={cn('py-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('sections.ai.professional.title')}
        </h2>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse"
                data-testid="pulsing-dot"
              />
              <span className="text-sm text-gray-500" data-testid="generating-summary">
                {locale === 'es' ? 'Generando resumen profesional...' : 'Generating professional summary...'}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">
              {locale === 'es' ? 'Error al cargar resumen' : 'Failed to load summary'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="flex flex-col gap-6">
            {/* AI Narrative */}
            {narrative && (
              <div className="prose prose-gray prose-sm max-w-none prose-strong:text-blue-600 prose-p:text-gray-700 prose-p:leading-relaxed">
                <ReactMarkdown>{narrative}</ReactMarkdown>
              </div>
            )}

            {/* Quick Stats */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {locale === 'es' ? 'Resumen' : 'Summary'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.yearsOfExperience === 0 ? '< 1' : `${stats.yearsOfExperience}+`}
                  </span>
                  <span className="text-[10px] text-gray-600 text-center">
                    {locale === 'es' ? 'años exp' : 'years exp'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="text-2xl font-bold text-blue-600">{stats.totalProjects}</span>
                  <span className="text-[10px] text-gray-600 text-center">
                    {locale === 'es' ? 'proyectos' : 'projects'}
                  </span>
                  <span className="text-[9px] text-blue-600/60 text-center mt-1">
                    {stats.projectsCompleted} {locale === 'es' ? 'completados' : 'completed'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="text-2xl font-bold text-blue-600">{stats.skillsMastered}</span>
                  <span className="text-[10px] text-gray-600 text-center">
                    {locale === 'es' ? 'skills' : 'skills'}
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  {locale === 'es' ? 'Proyectos Destacados' : 'Featured Projects'}
                </h3>
                <div className="flex flex-col gap-3">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
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
                            className="text-blue-600 hover:text-blue-700 transition-colors"
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
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {locale === 'es' ? 'Contacto' : 'Contact'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {contactLinks.github && (
                  <a
                    href={contactLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
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
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
                {data?.user?.email && (
                  <a
                    href={`mailto:${data.user.email}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
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
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
