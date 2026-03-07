"use client"

import { createContext, useContext } from "react"

export interface CRTTriggers {
  triggerXPGain: () => void
  triggerLifeLoss: () => void
  triggerSearching: () => void
}

export const CRTTriggerContext = createContext<CRTTriggers | null>(null)

export function useCRTTriggers(): CRTTriggers {
  const ctx = useContext(CRTTriggerContext)
  if (!ctx) {
    return {
      triggerXPGain: () => {},
      triggerLifeLoss: () => {},
      triggerSearching: () => {},
    }
  }
  return ctx
}
