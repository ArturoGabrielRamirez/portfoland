/**
 * useCyberpunkToast - Enhanced toast with cyberpunk visual effects
 *
 * Wraps Sonner toast with automatic border/corner effects
 */

import { toast } from 'sonner';
import { triggerToastEffect } from '../utils/toast-effects';

export function useCyberpunkToast() {
  return {
    error: (message: string, description?: string) => {
      triggerToastEffect('error');
      return toast.error(message, { description });
    },

    success: (message: string, description?: string) => {
      triggerToastEffect('success');
      return toast.success(message, { description });
    },

    warning: (message: string, description?: string) => {
      triggerToastEffect('warning');
      return toast.warning(message, { description });
    },

    info: (message: string, description?: string) => {
      triggerToastEffect('info');
      return toast.info(message, { description });
    },

    // Standard toast without effect
    message: (message: string, description?: string) => {
      return toast(message, { description });
    },
  };
}
