'use client';

import { useTranslations } from 'next-intl';
import { Mail, Github, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

export function ProfessionalHero({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');
  const { user } = data;

  return (
    <header className={cn('flex flex-col items-center gap-6 py-8', className)}>
      {/* Avatar */}
      {user.image ? (
        <img
          src={user.image}
          alt={user.name}
          className="h-24 w-24 rounded-full border-2 border-gray-100 object-cover"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600"
          data-testid="avatar-initials"
        >
          {getInitials(user.name)}
        </div>
      )}

      {/* Name */}
      <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>

      {/* Title/Role - using bio as subtitle when available */}
      {user.bio && (
        <p className="max-w-md text-center text-gray-600">{user.bio}</p>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-4">
        <a
          href={`mailto:${user.email}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <Mail className="h-4 w-4" />
          {user.email}
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
      </div>
    </header>
  );
}
