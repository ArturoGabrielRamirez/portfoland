'use client';

import { useTranslations } from 'next-intl';
import { Mail, Github, Linkedin, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';

function getInitials(name: string | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

export function ClassicHero({ data, className }: PortfolioSectionProps) {
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

      {/* Name and Developer-centric Role */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
        <div className="flex items-center gap-2 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
          <span className="opacity-50">const</span>
          <span className="font-semibold text-blue-700">ROLE</span>
          <span className="opacity-50">=</span>
          <span className="text-orange-600">'Fullstack Developer'</span>
          <span className="opacity-50">;</span>
        </div>
      </div>

      {/* Terminal-style Bio */}
      {user.bio && (
        <div className="w-full max-w-xl terminal-window mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500/80" />
            <div className="terminal-dot bg-yellow-500/80" />
            <div className="terminal-dot bg-green-500/80" />
            <span className="ml-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest">bio.md — bash — 80x24</span>
          </div>
          <div className="terminal-content bg-[#0D1117] min-h-[100px] leading-relaxed">
            <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap italic">
              <span className="text-[#58a6ff] mr-2">➜</span>
              {user.bio}
            </p>
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={`mailto:${user.email}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <Mail className="h-4 w-4" />
          {user.email}
        </a>

        {user.contactLinks?.github && (
          <a
            href={user.contactLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        )}

        {user.contactLinks?.linkedin && (
          <a
            href={user.contactLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
        )}

        {/* Custom Links */}
        {user.contactLinks?.custom?.map((link: any, idx: number) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Link className="h-4 w-4" />
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}
