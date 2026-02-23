/**
 * AI Narrator Data Layer
 *
 * Pure database query functions for the AI Narrator feature.
 */

export {
  getNarrativeData,
  getUserMetaForCache,
  getCachedNarrative,
  NARRATIVE_CACHE_DURATION_MS,
} from './getNarrativeData.data';

export { setNarrativeCache } from './setNarrativeCache.data';
