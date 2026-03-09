'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AIContextState {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  highlightedSkills: string[];
  setHighlightedSkills: (skills: string[]) => void;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [highlightedSkills, setHighlightedSkills] = useState<string[]>([]);

  return (
    <AIContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        highlightedSkills,
        setHighlightedSkills,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    return {
      isSidebarOpen: false,
      setIsSidebarOpen: () => {},
      highlightedSkills: [],
      setHighlightedSkills: () => {},
    };
  }
  return context;
}

