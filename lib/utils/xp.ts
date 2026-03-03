/**
 * XP Utility Functions
 *
 * Pure utility functions for computing user level from XP.
 * Used by both the dashboard stats data layer and portfolio components.
 */

/**
 * Calculates the global user level from total XP.
 * Formula: floor(sqrt(totalXP / 100))
 *
 * @param totalXP - The user's total accumulated XP
 * @returns The computed global level as an integer
 */
export function calculateGlobalLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}
