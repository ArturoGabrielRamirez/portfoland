/**
 * Bio Skill Suggestions Types
 *
 * Type definitions for the AI-powered bio skill suggestion feature.
 */

// =============================================================================
// Data Types
// =============================================================================

/**
 * A single skill suggestion returned by the AI from bio analysis
 */
export interface BioSkillSuggestion {
  name: string;
  category: string; // e.g. "Frontend", "Backend", "Languages", "Tools"
  reason: string;   // Brief reason why this skill was suggested (max 80 chars)
}

/**
 * The full response from the suggest-skills API endpoint
 */
export interface BioSkillSuggestionsResponse {
  suggestions: BioSkillSuggestion[];
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the BioSkillSuggestions component
 */
export interface BioSkillSuggestionsProps {
  /** Current bio text from the parent controlled input */
  bio: string;
  /** Optional callback invoked after a skill has been successfully added */
  onSkillAdded?: () => void;
}
