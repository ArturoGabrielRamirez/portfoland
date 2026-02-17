'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  GamingCard,
  GamingAvatar,
  GamingBadge,
  LevelBadge,
} from '@/features/gaming';
import type { PortfolioSectionProps } from '../../types/portfolio';

function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

export function GamingHero({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <GamingCard variant="featured" className={cn('p-6', className)} data-testid="gaming-hero-card">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar with legendary frame and noise overlay */}
        <div className="relative holographic-noise rounded-full p-1">
          <GamingAvatar
            src={user.image ?? undefined}
            alt={user.name}
            fallback={getInitials(user.name)}
            size="xl"
            frame="legendary"
          />
        </div>

        {/* Level Badge */}
        <div className="animate-pulse">
          <LevelBadge level={1} size="sm" />
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

        {/* Social link badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a href={`mailto:${user.email}`}>
            <GamingBadge color="cyan" className="hover:opacity-80 transition-opacity">
              {user.email}
            </GamingBadge>
          </a>

          {user.contactLinks?.github && (
            <a href={user.contactLinks.github} target="_blank" rel="noopener noreferrer">
              <GamingBadge color="purple" className="hover:opacity-80 transition-opacity">
                GitHub
              </GamingBadge>
            </a>
          )}

          {user.contactLinks?.linkedin && (
            <a href={user.contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <GamingBadge color="magenta" className="hover:opacity-80 transition-opacity">
                LinkedIn
              </GamingBadge>
            </a>
          )}

          {/* Custom Links */}
          {user.contactLinks?.custom?.map((link: any, idx: number) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
              <GamingBadge color="yellow" className="hover:opacity-80 transition-opacity">
                {link.label}
              </GamingBadge>
            </a>
          ))}
        </div>
      </div>
    </GamingCard>
  );
}
