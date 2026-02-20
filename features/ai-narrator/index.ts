/**
 * AI Narrator Feature
 *
 * Provides AI-generated narrative summaries for user portfolios.
 *
 * Architecture:
 * - data/: Pure database queries
 * - services/: Business logic (narrative generation, cache)
 * - actions/: Server actions
 * - types/: TypeScript definitions
 */

export * from './data';
export * from './services';
export * from './actions';
export * from './types/narrative';
