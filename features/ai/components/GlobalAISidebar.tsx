'use client';

import React from 'react';
import { useAIContext } from '../context/AIContext';
import { AIChatContainer } from '@/features/dashboard/components/ai/AIChatContainer';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalAISidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useAIContext();

  return (
    <div
      className={cn(
        "fixed top-[61px] right-0 bottom-0 z-40 bg-[#0A0E1A] border-l border-[hsl(174,100%,50%,0.2)] shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 w-[320px]",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full relative">
        {/* Mobile Close Button (Optional if top nav handles it, but good for UX) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute -left-10 top-4 p-2 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.2)] border-r-0 rounded-l-md text-cyan-500"
        >
          <X size={16} />
        </button>

        <div className="flex-1 p-4 h-full flex flex-col min-h-0">
          <AIChatContainer className="h-full border-none" />
        </div>
      </div>
    </div>
  );
}
