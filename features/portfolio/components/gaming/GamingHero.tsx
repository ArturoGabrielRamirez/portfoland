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
        {/* Avatar with legendary frame */}
        <GamingAvatar
          src={user.image ?? undefined}
          alt={user.name}
          fallback={getInitials(user.name)}
          size="xl"
          frame="legendary"
        />

        {/* Level Badge */}
        <LevelBadge level={1} size="sm" />

        {/* Name with neon glow */}
        <h1
          className="text-3xl font-bold text-white"
          style={{ textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' }}
        >
          {user.name}
        </h1>

        {/* Username */}
        <p className="text-[#64748B]">@{user.username}</p>

        {/* Social link badges */}
        <div className="flex items-center gap-2">
          <GamingBadge color="cyan">{user.email}</GamingBadge>
          <GamingBadge color="purple">GitHub</GamingBadge>
          <GamingBadge color="magenta">LinkedIn</GamingBadge>
        </div>
      </div>
    </GamingCard>
  );
}
