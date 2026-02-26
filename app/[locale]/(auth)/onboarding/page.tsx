'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Terminal, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { completeOnboarding } from '@/features/onboarding/actions/completeOnboarding';
import { TechButton, Spinner } from '@/features/tech';

export default function OnboardingPage() {
  const [selectedMode, setSelectedMode] = useState<'tech' | 'classic' | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();

  const handleContinue = () => {
    if (!selectedMode) return;
    startTransition(async () => {
      const result = await completeOnboarding({ mode: selectedMode });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center font-mono relative overflow-hidden">
      {/* Hex grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 0 L30 7.5 L30 22.5 L15 30 L0 22.5 L0 7.5 Z" fill="none" stroke="#00D4FF" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2.5" />
              <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="44" fontWeight="bold" fontFamily="monospace">P</text>
            </svg>
            <span className="font-mono font-bold text-lg tracking-[0.15em] text-foreground uppercase">
              {tCommon('appName')}
            </span>
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground text-center">
          {t('title')}
        </h1>
        <p className="text-sm font-mono text-[#94A3B8] text-center mt-2 mb-8">
          {t('subtitle')}
        </p>

        {/* Mode selection cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Digital / Tech card */}
          <button
            type="button"
            onClick={() => setSelectedMode('tech')}
            className={cn(
              'flex flex-col items-start gap-3 p-6 border rounded-sm text-left transition-all',
              selectedMode === 'tech'
                ? 'border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]'
            )}
          >
            <Terminal className="w-8 h-8 text-[#00D4FF]" />
            <div>
              <p className="text-lg font-mono font-bold text-foreground">{t('digitalTitle')}</p>
              <p className="text-xs font-mono text-[#94A3B8] mt-1">{t('digitalDescription')}</p>
            </div>
          </button>

          {/* In-person / Classic card */}
          <button
            type="button"
            onClick={() => setSelectedMode('classic')}
            className={cn(
              'flex flex-col items-start gap-3 p-6 border rounded-sm text-left transition-all',
              selectedMode === 'classic'
                ? 'border-[#D946EF] bg-[#D946EF]/10 shadow-[0_0_20px_rgba(217,70,239,0.15)]'
                : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]'
            )}
          >
            <Briefcase className="w-8 h-8 text-[#D946EF]" />
            <div>
              <p className="text-lg font-mono font-bold text-foreground">{t('serviceTitle')}</p>
              <p className="text-xs font-mono text-[#94A3B8] mt-1">{t('serviceDescription')}</p>
            </div>
          </button>
        </div>

        {/* Continue button */}
        <div className="flex justify-center mt-6">
          <TechButton
            type="button"
            variant="primary"
            className="w-full max-w-xs uppercase tracking-[0.2em]"
            disabled={!selectedMode || isPending}
            onClick={handleContinue}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner />
                <span>{tCommon('loading')}</span>
              </span>
            ) : (
              t('continue')
            )}
          </TechButton>
        </div>

        <p className="text-[10px] font-mono text-[#64748B] text-center mt-3">
          {t('changeLater')}
        </p>
      </div>
    </div>
  );
}
