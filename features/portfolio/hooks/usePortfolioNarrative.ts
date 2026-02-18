'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { PortfolioData, PortfolioMode } from '../types/portfolio';

interface UsePortfolioNarrativeParams {
  data: PortfolioData;
  mode: PortfolioMode;
}

interface UsePortfolioNarrativeResult {
  narrative: string;
  isLoading: boolean;
  error: string;
  stats: {
    yearsOfExperience: number;
    totalProjects: number;
    projectsCompleted: number;
    projectsInProgress: number;
    skillsMastered: number;
  };
  featuredProjects: PortfolioData['projects'];
  contactLinks: Record<string, any>;
}

export function usePortfolioNarrative({
  data,
  mode,
}: UsePortfolioNarrativeParams): UsePortfolioNarrativeResult {
  const locale = useLocale();
  const [narrative, setNarrative] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadNarrative() {
      try {
        const username = data?.user?.username;
        if (!username) {
          setError('Username not found');
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `/api/ai/narrate-portfolio?username=${username}&mode=${mode}&locale=${locale}`,
          { signal: controller.signal }
        );
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Failed to load narrative');
        }

        setNarrative(result.narrative);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadNarrative();

    return () => controller.abort();
  }, [data?.user?.username, locale, mode]);

  const stats = useMemo(() => {
    const experiences = data?.experiences?.experiences || [];
    const projects = data?.projects || [];
    const skills = data?.skills?.skills || [];

    let yearsOfExperience = 0;

    const workExperiences = experiences.filter((exp) => exp.type === 'WORK');
    if (workExperiences.length > 0) {
      const oldestExp = workExperiences.reduce((oldest, exp) =>
        new Date(exp.startDate) < new Date(oldest.startDate) ? exp : oldest
      );
      yearsOfExperience = Math.floor(
        (Date.now() - new Date(oldestExp.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
    } else if (experiences.length > 0) {
      const oldestExp = experiences.reduce((oldest, exp) =>
        new Date(exp.startDate) < new Date(oldest.startDate) ? exp : oldest
      );
      yearsOfExperience = Math.floor(
        (Date.now() - new Date(oldestExp.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
    } else if (skills.length > 0) {
      const oldestSkill = skills.reduce((oldest, skill) =>
        new Date(skill.createdAt) < new Date(oldest.createdAt) ? skill : oldest
      );
      yearsOfExperience = Math.floor(
        (Date.now() - new Date(oldestSkill.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
    }

    return {
      yearsOfExperience,
      totalProjects: projects.length,
      projectsCompleted: projects.filter((p) => p.status === 'COMPLETED').length,
      projectsInProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
      skillsMastered: skills.length,
    };
  }, [data]);

  const featuredProjects = useMemo(() => {
    const projects = data?.projects || [];
    const featured = projects.filter((p) => p.featured).slice(0, 3);
    return featured.length >= 3 ? featured : projects.slice(0, 3);
  }, [data?.projects]);

  const contactLinks = data?.user?.contactLinks || {};

  return { narrative, isLoading, error, stats, featuredProjects, contactLinks };
}
