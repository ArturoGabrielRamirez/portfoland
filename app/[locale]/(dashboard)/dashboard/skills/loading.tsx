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
        'animate-pulse rounded-md bg-slate-800/50',
        className
      )}
      style={style}
    />
  );
}

function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0D1421]/80 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
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
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header skeleton */}
      <header className="border-b border-[#1E293B] bg-[#0D1421]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </header>

      {/* Stats skeleton */}
      <section className="border-b border-[#1E293B] bg-[#0D1421]/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        </div>
      </section>

      {/* Main content skeleton */}
      <main className="relative">
        {/* Desktop: Galaxy visualization skeleton */}
        <div className="hidden md:block h-[calc(100vh-280px)] min-h-[500px] relative overflow-hidden">
          {/* Starfield background placeholder */}
          <div className="absolute inset-0 bg-[#0A0E1A]">
            {/* Animated stars */}
            {[...Array(20)].map((_, i) => {
              const top = (Math.random() * 100).toFixed(2);
              const left = (Math.random() * 100).toFixed(2);
              const delay = (Math.random() * 2).toFixed(2);
              
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Category clusters placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Central cluster */}
            <div className="relative">
              <Skeleton className="h-20 w-20 rounded-xl opacity-60" />
            </div>
            {/* Orbital clusters */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${50 + Math.sin((i * 72 * Math.PI) / 180) * 35}%`,
                  left: `${50 + Math.cos((i * 72 * Math.PI) / 180) * 35}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Skeleton className="h-14 w-14 rounded-xl opacity-40" />
              </div>
            ))}
          </div>

          {/* Zoom controls placeholder */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
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
      </main>
    </div>
  );
}
