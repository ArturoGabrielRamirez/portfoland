'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Twitter, Linkedin, MessageCircle, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioMode } from '../types/portfolio';

// =============================================================================
// Helpers
// =============================================================================

function getPortfolioUrl(username: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
  const isDev = process.env.NODE_ENV !== 'production';
  const protocol = isDev ? 'http' : 'https';
  const port = isDev ? `:${process.env.PORT || '3000'}` : '';
  return `${protocol}://${username}.${domain}${port}`;
}

function getQRUrl(url: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&format=svg&data=${encodeURIComponent(url)}`;
}

// =============================================================================
// Props
// =============================================================================

interface ShareKitProps {
  username: string | null;
  name: string | null;
  bio: string | null;
  image: string | null;
  portfolioMode: PortfolioMode;
}

// =============================================================================
// Component
// =============================================================================

export function ShareKit({ username, name, bio, image, portfolioMode }: ShareKitProps) {
  const isTech = portfolioMode === 'tech';
  const [copied, setCopied] = useState<string | null>(null);

  if (!username) {
    return (
      <div className={cn(
        'p-5 text-sm',
        isTech ? 'font-mono text-muted-foreground' : 'text-gray-400'
      )}>
        {isTech
          ? '> USERNAME_REQUIRED — Set a username to get your share kit.'
          : 'Set a username first to access your Share Kit.'}
      </div>
    );
  }

  const portfolioUrl = getPortfolioUrl(username);
  const qrUrl = getQRUrl(portfolioUrl);

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(portfolioUrl)}&text=${encodeURIComponent(`Check out ${name ?? username}'s portfolio on Portfoland!`)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out ${name ?? username}'s portfolio: ${portfolioUrl}`)}`;

  const badgeMarkdown = `[![Portfolio](https://img.shields.io/badge/Portfolio-Portfoland-blue?style=flat-square)](${portfolioUrl})`;

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const containerClass = isTech
    ? 'space-y-4 p-5'
    : 'space-y-4 p-5';

  const panelClass = isTech
    ? 'border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,6%)] p-4'
    : 'border border-gray-200 bg-white rounded-lg p-4';

  const labelClass = isTech
    ? 'text-[10px] font-mono uppercase tracking-widest text-[hsl(174,100%,50%)] mb-2 block'
    : 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block';

  const inputClass = isTech
    ? 'flex-1 bg-transparent border border-[hsl(174,100%,50%,0.2)] px-3 py-2 text-xs font-mono text-gray-300 outline-none'
    : 'flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 outline-none';

  const copyBtnClass = isTech
    ? 'flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-bold hover:shadow-[0_0_8px_hsl(174_100%_50%_/_0.4)] transition-shadow'
    : 'flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors';

  const shareButtonBase = isTech
    ? 'flex items-center gap-2 px-3 py-2 text-[10px] font-mono border transition-colors'
    : 'flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-md transition-colors';

  return (
    <div className={containerClass}>
      {/* Portfolio URL */}
      <div className={panelClass}>
        <span className={labelClass}>{isTech ? '> PORTFOLIO_URL' : 'Your Portfolio URL'}</span>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={portfolioUrl}
            className={inputClass}
          />
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(copyBtnClass, 'no-underline')}
            title="Open portfolio"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => copyText(portfolioUrl, 'url')}
            className={copyBtnClass}
          >
            {copied === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'url'
              ? (isTech ? 'COPIED' : 'Copied!')
              : (isTech ? 'COPY' : 'Copy')}
          </button>
        </div>
      </div>

      {/* QR Code + OG Preview side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* QR Code */}
        <div className={panelClass}>
          <span className={labelClass}>{isTech ? '> QR_CODE' : 'QR Code'}</span>
          <div className={cn(
            'flex items-center justify-center p-3',
            isTech ? 'bg-white' : 'bg-gray-50 rounded-md'
          )}>
            <img
              src={qrUrl}
              alt={`QR code for ${portfolioUrl}`}
              width={140}
              height={140}
              className="block"
            />
          </div>
        </div>

        {/* OG Preview Card */}
        <div className={panelClass}>
          <span className={labelClass}>{isTech ? '> OG_PREVIEW' : 'Open Graph Preview'}</span>
          <div className={cn(
            'border overflow-hidden',
            isTech
              ? 'border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)]'
              : 'border-gray-200 rounded-md bg-white'
          )}>
            {/* OG Image area */}
            <div className={cn(
              'h-16 flex items-center justify-center',
              isTech ? 'bg-[hsl(200,30%,8%)]' : 'bg-gray-100'
            )}>
              {image ? (
                <img src={image} alt={name ?? ''} className="h-full w-full object-cover" />
              ) : (
                <span className={cn(
                  'text-2xl font-bold',
                  isTech ? 'text-[hsl(174,100%,50%,0.3)] font-mono' : 'text-gray-300'
                )}>
                  {name?.[0] ?? '?'}
                </span>
              )}
            </div>
            {/* OG Text area */}
            <div className="p-2">
              <p className={cn(
                'text-[11px] font-semibold line-clamp-1',
                isTech ? 'font-mono text-white' : 'text-gray-900'
              )}>
                {name ?? username} — Portfolio
              </p>
              {bio && (
                <p className={cn(
                  'text-[10px] mt-0.5 line-clamp-2',
                  isTech ? 'font-mono text-gray-400' : 'text-gray-500'
                )}>
                  {bio}
                </p>
              )}
              <p className={cn(
                'text-[9px] mt-1',
                isTech ? 'font-mono text-[hsl(174,100%,50%,0.4)]' : 'text-gray-400'
              )}>
                portfoland.com/{username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className={panelClass}>
        <span className={labelClass}>{isTech ? '> SHARE_TO' : 'Share on'}</span>
        <div className="flex flex-wrap gap-2">
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              shareButtonBase,
              isTech
                ? 'border-[hsl(174,100%,50%,0.2)] text-[hsl(174,100%,50%,0.7)] hover:bg-[hsl(174,100%,50%,0.08)]'
                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
            )}
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn
          </a>
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              shareButtonBase,
              isTech
                ? 'border-[hsl(174,100%,50%,0.2)] text-[hsl(174,100%,50%,0.7)] hover:bg-[hsl(174,100%,50%,0.08)]'
                : 'border-sky-200 text-sky-700 hover:bg-sky-50'
            )}
          >
            <Twitter className="w-3.5 h-3.5" />
            Twitter / X
          </a>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              shareButtonBase,
              isTech
                ? 'border-[hsl(174,100%,50%,0.2)] text-[hsl(174,100%,50%,0.7)] hover:bg-[hsl(174,100%,50%,0.08)]'
                : 'border-green-200 text-green-700 hover:bg-green-50'
            )}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* GitHub README Badge */}
      <div className={panelClass}>
        <span className={labelClass}>{isTech ? '> README_BADGE' : 'GitHub README Badge'}</span>
        <p className={cn(
          'mb-2',
          isTech ? 'text-[10px] font-mono text-gray-400' : 'text-xs text-gray-500'
        )}>
          {isTech
            ? '> Paste this markdown in your GitHub README:'
            : 'Add this to your GitHub README:'}
        </p>
        <div className="flex items-start gap-2">
          <code className={cn(
            'flex-1 block p-3 text-[10px] font-mono break-all',
            isTech
              ? 'bg-[hsl(200,30%,4%)] border border-[hsl(174,100%,50%,0.1)] text-gray-300'
              : 'bg-gray-50 border border-gray-200 rounded-md text-gray-700'
          )}>
            {badgeMarkdown}
          </code>
          <button
            type="button"
            onClick={() => copyText(badgeMarkdown, 'badge')}
            className={cn(copyBtnClass, 'flex-shrink-0')}
          >
            {copied === 'badge' ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            {copied === 'badge'
              ? (isTech ? 'COPIED' : 'Copied!')
              : (isTech ? 'COPY' : 'Copy')}
          </button>
        </div>
        {/* Badge preview */}
        <div className="mt-2">
          <img
            src={`https://img.shields.io/badge/Portfolio-Portfoland-blue?style=flat-square`}
            alt="Portfolio badge preview"
            className="h-5"
          />
        </div>
      </div>
    </div>
  );
}
