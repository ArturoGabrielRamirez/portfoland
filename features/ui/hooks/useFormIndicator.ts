'use client';

/**
 * useFormIndicator - Hook to manage form indicator state
 *
 * Simplifies state management for FormWithIndicator component
 */

import { useState, useCallback } from 'react';
import type { IndicatorStatus } from '../components/FormWithIndicator';

export function useFormIndicator(initialStatus: IndicatorStatus = 'idle') {
  const [status, setStatus] = useState<IndicatorStatus>(initialStatus);

  const setIdle = useCallback(() => setStatus('idle'), []);
  const setLoading = useCallback(() => setStatus('loading'), []);
  const setError = useCallback(() => setStatus('error'), []);
  const setSuccess = useCallback(() => setStatus('success'), []);

  // Auto-reset to idle after a delay (useful for success/error states)
  const setTemporary = useCallback((tempStatus: 'error' | 'success', duration = 3000) => {
    setStatus(tempStatus);
    setTimeout(() => setStatus('idle'), duration);
  }, []);

  return {
    status,
    setStatus,
    setIdle,
    setLoading,
    setError,
    setSuccess,
    setTemporary,
  };
}
