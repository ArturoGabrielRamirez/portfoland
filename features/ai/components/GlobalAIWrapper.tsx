'use client';

import React, { ReactNode } from 'react';
import { useAIContext } from '../context/AIContext';
import { GlobalAISidebar } from './GlobalAISidebar';
import { cn } from '@/lib/utils';

interface GlobalAIWrapperProps {
  children: ReactNode;
}

export function GlobalAIWrapper({ children }: GlobalAIWrapperProps) {
  const { isSidebarOpen } = useAIContext();

  return (
    <div className="flex-1 flex min-h-0 relative overflow-hidden">
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out h-full overflow-y-auto",
          isSidebarOpen ? "md:mr-[320px]" : "md:mr-0"
        )}
      >
        {children}
      </div>
      <GlobalAISidebar />
    </div>
  );
}
