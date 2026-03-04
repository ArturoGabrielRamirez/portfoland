/**
 * GitHub Constants Tests
 *
 * Tests for GitHub feature constants:
 * - GITHUB_LANGUAGE_MAP contains 19 required language entries and maps correctly
 * - GITHUB_XP_MULTIPLIER equals 1.3 exactly (single source of truth)
 */

import { describe, it, expect } from 'vitest';

import { GITHUB_LANGUAGE_MAP } from '../constants/github-mappings';
import { GITHUB_XP_MULTIPLIER } from '../constants/xp';

// =============================================================================
// Tests
// =============================================================================

describe('GitHub Constants', () => {
  it('GITHUB_LANGUAGE_MAP contains 19 entries and maps languages to slugs correctly', () => {
    const requiredEntries: Array<[string, string]> = [
      ['TypeScript', 'typescript'],
      ['JavaScript', 'javascript'],
      ['Python', 'python'],
      ['Jupyter Notebook', 'python'],
      ['Shell', 'bash'],
      ['C++', 'cpp'],
      ['C', 'c'],
      ['Go', 'go'],
      ['Rust', 'rust'],
      ['Java', 'java'],
      ['Kotlin', 'kotlin'],
      ['Swift', 'swift'],
      ['Ruby', 'ruby'],
      ['PHP', 'php'],
      ['CSS', 'css'],
      ['HTML', 'html'],
      ['Vue', 'vue'],
      ['Svelte', 'svelte'],
      ['Dart', 'dart'],
    ];

    expect(Object.keys(GITHUB_LANGUAGE_MAP)).toHaveLength(19);

    for (const [githubLanguage, expectedSlug] of requiredEntries) {
      expect(GITHUB_LANGUAGE_MAP[githubLanguage]).toBe(expectedSlug);
    }

    // Spot-check the two aliased mappings explicitly called out in the spec
    expect(GITHUB_LANGUAGE_MAP['Jupyter Notebook']).toBe('python');
    expect(GITHUB_LANGUAGE_MAP['C++']).toBe('cpp');
  });

  it('GITHUB_XP_MULTIPLIER equals 1.3 exactly', () => {
    expect(GITHUB_XP_MULTIPLIER).toBe(1.3);
  });
});
