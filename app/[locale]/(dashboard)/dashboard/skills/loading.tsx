/**
 * Skills Page Loading State
 *
 * Skeleton loading UI for the skills dashboard page.
 * Shows placeholders for both galaxy (desktop) and list (mobile) views.
 */

import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

// =============================================================================
// Skeleton Components
// =============================================================================

function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-sm bg-[hsl(174,100%,50%,0.1)]',
        className
      )}
      style={style}
    />
  );
}

function StatsCardSkeleton() {
  return (
    <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-3 flex items-center gap-3">
      <Skeleton className="h-8 w-8 clip-hexagon" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function CategoryClusterSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="absolute"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="relative">
        {/* Central hexagon */}
        <Skeleton className="h-16 w-16 rounded-lg opacity-50" />
        {/* Surrounding hexagons */}
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="absolute h-12 w-12 rounded-lg opacity-30"
            style={{
              top: `${Math.sin((i * 72 * Math.PI) / 180) * 50 + 10}px`,
              left: `${Math.cos((i * 72 * Math.PI) / 180) * 50 + 10}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MobileSkillItemSkeleton() {
  return (
    <div className="border-b border-[#1E293B] p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function MobileCategorySkeleton() {
  return (
    <div className="border-b border-[#1E293B]">
      {/* Category header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      {/* Skill items */}
      <div className="pl-4">
        <MobileSkillItemSkeleton />
        <MobileSkillItemSkeleton />
      </div>
    </div>
  );
}

// =============================================================================
// Main Loading Component
// =============================================================================

export default function SkillsLoading() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Nav skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <div className="flex items-center gap-6">
          <Skeleton className="h-7 w-32" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-8 w-8 clip-hexagon" />
        </div>
      </div>

      {/* Page header skeleton */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>

      {/* Stats skeleton */}
      <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Main content skeleton */}
      <section className="px-4 py-6">
        {/* Desktop: CRT Canvas skeleton */}
        <div className="hidden md:block relative rounded-sm border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)] overflow-hidden" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          {/* CRT effects */}
          <div className="absolute inset-0 pointer-events-none crt-lines opacity-30" />
          <div className="crt-scanner" />

          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
            <defs>
              <pattern id="grid-skeleton" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-skeleton)" />
          </svg>

          {/* Hexagonal nodes skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const radius = 120 + (i % 2) * 60;
              const x = 50 + Math.cos(angle) * (radius / 8);
              const y = 50 + Math.sin(angle) * (radius / 8);

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Skeleton className="h-16 w-16 clip-hexagon opacity-40" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <Skeleton className="h-9 w-9 rounded-sm" />
            <Skeleton className="h-9 w-9 rounded-sm" />
            <Skeleton className="h-9 w-9 rounded-sm" />
          </div>
        </div>

        {/* Mobile: List view skeleton */}
        <div className="md:hidden">
          <div className="p-4 pb-20">
            <MobileCategorySkeleton />
            <MobileCategorySkeleton />
            <MobileCategorySkeleton />
          </div>

          {/* FAB skeleton */}
          <div className="fixed bottom-6 right-6">
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
