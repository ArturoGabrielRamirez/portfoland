/**
 * Generate Assessment Questions Service
 *
 * Calls Claude via the AI SDK to produce exactly 5 multiple-choice questions
 * for a given skill and level. Validates the raw JSON response before returning.
 *
 * NOTE: `correctIndex` and `explanation` are stored in the DB but NEVER returned
 * to the client — stripping happens in the action layer (startAssessment.action).
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { ASSESSMENT_MESSAGES } from '../constants/messages';
import { QUESTIONS_PER_ASSESSMENT } from '../constants/tokens';

// =============================================================================
// Types
// =============================================================================

/**
 * Shape of each question object returned by the Claude JSON response.
 * Local to this file — the action layer projects this into AssessmentQuestion
 * and QuestionForClient types before touching the DB or the client.
 */
export interface GeneratedQuestion {
  questionText: string;
  /** Exactly 4 answer option strings */
  options: string[];
  /** 0-indexed position of the correct option */
  correctIndex: number;
  /** 1-2 sentence rationale stored server-side only */
  explanation: string;
}

// =============================================================================
// Client initialisation
// =============================================================================

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// =============================================================================
// Prompts
// =============================================================================

const SYSTEM_PROMPT =
  'You are a strict technical interviewer generating assessment questions for software developer skill validation. Return ONLY valid JSON with no markdown fencing.';

function buildUserPrompt(skillName: string, levelName: string): string {
  return (
    `Generate exactly 5 multiple-choice questions to assess a developer's knowledge of ${skillName} ` +
    `at the ${levelName} level. ` +
    `Return a JSON array of 5 objects, each with: ` +
    `questionText (string), ` +
    `options (array of exactly 4 strings), ` +
    `correctIndex (integer 0-3, index of the correct option), ` +
    `explanation (string, 1-2 sentences explaining why the answer is correct). ` +
    `Calibrate difficulty: ` +
    `Level 1 (Novice) = basic syntax/concepts, ` +
    `Level 2 (Apprentice) = common patterns, ` +
    `Level 3 (Journeyman) = architectural decisions, ` +
    `Level 4 (Expert) = performance/edge cases, ` +
    `Level 5 (Master) = internals/advanced optimization.`
  );
}

// =============================================================================
// Service function
// =============================================================================

/**
 * Generate exactly 5 MCQ assessment questions for a given skill and level.
 *
 * @param skillName - Human-readable skill name, e.g. "TypeScript"
 * @param levelName - Level display name from SKILL_LEVEL_NAMES, e.g. "Journeyman"
 * @returns Array of exactly 5 validated GeneratedQuestion objects
 * @throws Error with ASSESSMENT_MESSAGES.GENERATION_ERROR on parse/validation failure
 */
export async function generateQuestionsService(
  skillName: string,
  levelName: string
): Promise<GeneratedQuestion[]> {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(skillName, levelName),
  });

  // -------------------------------------------------------------------------
  // Parse — throw typed error so actionWrapper surfaces it cleanly
  // -------------------------------------------------------------------------
  let parsed: unknown;
  try {
    parsed = JSON.parse(result.text);
  } catch {
    throw new Error(ASSESSMENT_MESSAGES.GENERATION_ERROR);
  }

  // -------------------------------------------------------------------------
  // Validate structure: must be an array of exactly QUESTIONS_PER_ASSESSMENT
  // items, each with 4 options and required fields
  // -------------------------------------------------------------------------
  if (!Array.isArray(parsed) || parsed.length !== QUESTIONS_PER_ASSESSMENT) {
    throw new Error(ASSESSMENT_MESSAGES.GENERATION_ERROR);
  }

  for (const item of parsed) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.questionText !== 'string' ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      typeof item.correctIndex !== 'number' ||
      item.correctIndex < 0 ||
      item.correctIndex > 3 ||
      typeof item.explanation !== 'string'
    ) {
      throw new Error(ASSESSMENT_MESSAGES.GENERATION_ERROR);
    }
  }

  return parsed as GeneratedQuestion[];
}
