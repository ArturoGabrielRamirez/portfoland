/**
 * Format Utility Functions
 *
 * Pure utility functions for formatting dates and other values
 * for display in the Tech Mode dashboard.
 */

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Returns a human-readable relative time string for a past date.
 * All output is in Spanish to match the Tech Mode dashboard locale.
 *
 * - < 60 minutes → "hace X minutos"
 * - < 24 hours   → "hace X horas"
 * - 1 day ago    → "AYER"
 * - Older        → "hace X días"
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} minutos`
  }

  if (diffHours < 24) {
    return `hace ${diffHours} horas`
  }

  if (diffDays === 1) {
    return "AYER"
  }

  return `hace ${diffDays} días`
}
