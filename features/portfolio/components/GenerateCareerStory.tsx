'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { PortfolioMode } from '../types/portfolio';

interface GenerateCareerStoryProps {
  username: string | null;
  portfolioMode: PortfolioMode;
  locale: string;
  /** Called when user clicks "Use as Bio" — populates the bio textarea */
  onUseBio: (text: string) => void;
}

export function GenerateCareerStory({
  username,
  portfolioMode,
  locale,
  onUseBio,
}: GenerateCareerStoryProps) {
  const isTech = portfolioMode === 'tech';
  const [narrative, setNarrative] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const containerClass = isTech
    ? 'border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,6%)] p-5 space-y-4'
    : 'border border-gray-200 bg-gray-50 rounded-lg p-5 space-y-4';

  const headingClass = isTech
    ? 'text-xs font-mono uppercase tracking-widest text-[hsl(174,100%,50%)] flex items-center gap-2'
    : 'text-sm font-semibold text-gray-900 flex items-center gap-2';

  const subtitleClass = isTech
    ? 'text-[10px] font-mono text-muted-foreground'
    : 'text-xs text-gray-500';

  const generateBtnClass = isTech
    ? 'flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow disabled:opacity-50'
    : 'flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50';

  const secondaryBtnClass = isTech
    ? 'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono border border-[hsl(174,100%,50%,0.3)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)] transition-colors'
    : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors';

  const narrativeClass = isTech
    ? 'text-sm prose prose-sm max-w-none prose-invert text-gray-200 prose-strong:text-[hsl(174,100%,50%)] prose-em:text-purple-400'
    : 'text-sm prose prose-sm max-w-none text-gray-700';

  const narrativeBgClass = isTech
    ? 'p-4 bg-[hsl(200,30%,4%)] border border-[hsl(174,100%,50%,0.1)]'
    : 'p-4 bg-white border border-gray-200 rounded-md';

  async function handleGenerate() {
    if (!username) return;
    setIsLoading(true);
    setError('');
    setNarrative('');
    try {
      const res = await fetch(
        `/api/ai/narrate-portfolio?username=${encodeURIComponent(username)}&mode=${portfolioMode}&locale=${locale}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setNarrative(data.narrative || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!narrative) return;
    await navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!username) {
    return (
      <div className={containerClass}>
        <p className={cn(subtitleClass, 'italic')}>
          {isTech
            ? '> USERNAME_REQUIRED — Set a username to generate your career story.'
            : 'Set a username first to generate your career story.'}
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className={headingClass}>
            <Sparkles className="w-3.5 h-3.5" />
            {isTech ? '[CAREER_STORY]' : 'Career Story'}
          </p>
          <p className={subtitleClass}>
            {isTech
              ? '> AI generates a 120-word executive summary from your skills, experience & projects.'
              : 'AI generates a professional summary from your skills, experience & projects.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className={generateBtnClass}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isLoading
            ? (isTech ? 'GENERATING...' : 'Generating...')
            : narrative
              ? (isTech ? 'REGENERATE' : 'Regenerate')
              : (isTech ? 'GENERATE' : 'Generate')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className={cn('text-xs', isTech ? 'font-mono text-red-400' : 'text-red-600')}>
          {isTech ? `> ERR: ${error}` : `Error: ${error}`}
        </p>
      )}

      {/* Narrative output */}
      {narrative && (
        <div className="space-y-3">
          <div className={narrativeBgClass}>
            <div className={narrativeClass}>
              <ReactMarkdown>{narrative}</ReactMarkdown>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className={secondaryBtnClass}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied
                ? (isTech ? 'COPIED' : 'Copied!')
                : (isTech ? 'COPY' : 'Copy')}
            </button>
            <button
              type="button"
              onClick={() => onUseBio(narrative)}
              className={secondaryBtnClass}
            >
              <FileText className="w-3.5 h-3.5" />
              {isTech ? 'USE_AS_BIO' : 'Use as bio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
