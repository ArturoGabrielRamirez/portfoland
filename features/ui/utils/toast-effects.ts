/**
 * Toast Effects Utilities
 *
 * Helper functions to trigger visual feedback for toast notifications
 */

type ToastType = 'error' | 'success' | 'warning' | 'info';

/**
 * Trigger border and corner effects for a toast notification
 *
 * @param type - The type of toast (error, success, warning, info)
 */
export function triggerToastEffect(type: ToastType) {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('toast-show', {
    detail: { type },
  });

  window.dispatchEvent(event);
}

/**
 * Wrapper functions for common toast patterns
 */
export const toastEffects = {
  error: () => triggerToastEffect('error'),
  success: () => triggerToastEffect('success'),
  warning: () => triggerToastEffect('warning'),
  info: () => triggerToastEffect('info'),
};
