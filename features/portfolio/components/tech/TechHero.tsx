'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  TechCard,
  TechAvatar,
  TechBadge,
  LevelBadge,
} from '@/features/tech';
import { calculateGlobalLevel } from '@/lib/utils/xp';
import type { PortfolioSectionProps } from '../../types/portfolio';

function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

export function TechHero({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  // Compute real global level from skill stats XP
  const globalLevel = calculateGlobalLevel(data.skills?.stats?.totalXP ?? 0);

  return (
    <TechCard variant="featured" className={cn('p-6', className)} data-testid="tech-hero-card">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar with legendary frame and noise overlay */}
        <div className="relative holographic-noise rounded-full p-1">
          <TechAvatar
            src={user.image ?? undefined}
            alt={user.name}
            fallback={getInitials(user.name)}
            size="xl"
            frame="legendary"
          />
        </div>

        {/* Level Badge — computed from real XP */}
        <div className="animate-pulse">
          <LevelBadge level={globalLevel} size="sm" />
        </div>

        {/* Name with glitch effect */}
        <h1
          className="glitch-text text-3xl font-bold text-white tracking-tighter"
          style={{ textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' }}
        >
          {user.name}
        </h1>

        {/* Username with digital flicker */}
        <p className="text-[#64748B] font-mono text-sm animate-digital-flicker tracking-widest">
          {'>'} USER_UID: @{user.username}
        </p>
        {/* Terminal cursor — blinks via animate-pulse */}
        <span className="font-mono text-[hsl(174,100%,50%)] animate-pulse ml-0.5">|</span>

        {/* Social link badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a href={`mailto:${user.email}`}>
            <TechBadge color="cyan" className="hover:opacity-80 transition-opacity">
              {user.email}
            </TechBadge>
          </a>

          {user.contactLinks?.github && (
            <a href={user.contactLinks.github} target="_blank" rel="noopener noreferrer">
              <TechBadge color="purple" className="hover:opacity-80 transition-opacity">
                GitHub
              </TechBadge>
            </a>
          )}

          {user.contactLinks?.linkedin && (
            <a href={user.contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <TechBadge color="magenta" className="hover:opacity-80 transition-opacity">
                LinkedIn
              </TechBadge>
            </a>
          )}

          {/* Custom Links */}
          {user.contactLinks?.custom?.map((link: any, idx: number) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
              <TechBadge color="yellow" className="hover:opacity-80 transition-opacity">
                {link.label}
              </TechBadge>
            </a>
          ))}
        </div>
      </div>
    </TechCard>
  );
}
