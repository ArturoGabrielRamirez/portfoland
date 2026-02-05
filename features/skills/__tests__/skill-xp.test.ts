/**
 * Skill XP Calculation Tests
 *
 * Tests for XP calculation and level determination functions.
 * Covers duration-weighted XP, self-assessment XP, level thresholds,
 * and XP aggregation.
 */

import { describe, it, expect } from 'vitest';

import {
  calculateDurationXP,
  calculateLevelFromXP,
  calculateMonthsDuration,
  getSelfAssessmentXP,
  aggregateTotalXP,
  calculateLevelProgress,
  getXPToNextLevel,
  SELF_ASSESSMENT_XP_VALUES,
  DURATION_XP_VALUES,
  SKILL_LEVEL_NAMES,
  getSkillLevelName,
} from '../constants/xp';

// =============================================================================
// Duration-Weighted XP Calculation Tests
// =============================================================================

describe('Duration-weighted XP calculation', () => {
  it('returns 100 XP for 1-6 months duration', () => {
    // 3 months duration
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-04-01');

    const xp = calculateDurationXP(startDate, endDate);

    expect(xp).toBe(100);
  });

  it('returns 250 XP for 6-12 months duration', () => {
    // 9 months duration
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-10-01');

    const xp = calculateDurationXP(startDate, endDate);

    expect(xp).toBe(250);
  });

  it('returns 500 XP for 1-2 years duration', () => {
    // 18 months duration
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-07-01');

    const xp = calculateDurationXP(startDate, endDate);

    expect(xp).toBe(500);
  });

  it('returns 750 XP for 2+ years duration', () => {
    // 30 months duration
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2024-07-01');

    const xp = calculateDurationXP(startDate, endDate);

    expect(xp).toBe(750);
  });

  it('calculates duration correctly with null endDate (current date)', () => {
    // Using a date far enough in the past to ensure > 24 months
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    const xp = calculateDurationXP(startDate, null);

    expect(xp).toBe(750);
  });

  it('calculates months duration between dates correctly', () => {
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-07-15');

    const months = calculateMonthsDuration(startDate, endDate);

    expect(months).toBe(6);
  });
});

// =============================================================================
// Self-Assessment XP Tests
// =============================================================================

describe('Self-assessment XP values', () => {
  it('returns 100 XP for Beginner level', () => {
    const xp = getSelfAssessmentXP('BEGINNER');

    expect(xp).toBe(100);
    expect(xp).toBe(SELF_ASSESSMENT_XP_VALUES.BEGINNER);
  });

  it('returns 300 XP for Intermediate level', () => {
    const xp = getSelfAssessmentXP('INTERMEDIATE');

    expect(xp).toBe(300);
    expect(xp).toBe(SELF_ASSESSMENT_XP_VALUES.INTERMEDIATE);
  });

  it('returns 600 XP for Advanced level', () => {
    const xp = getSelfAssessmentXP('ADVANCED');

    expect(xp).toBe(600);
    expect(xp).toBe(SELF_ASSESSMENT_XP_VALUES.ADVANCED);
  });
});

// =============================================================================
// Level Threshold Tests
// =============================================================================

describe('Level threshold determination', () => {
  it('returns level 1 (Novice) for 0-199 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1);
    expect(calculateLevelFromXP(100)).toBe(1);
    expect(calculateLevelFromXP(199)).toBe(1);
  });

  it('returns level 2 (Apprentice) for 200-499 XP', () => {
    expect(calculateLevelFromXP(200)).toBe(2);
    expect(calculateLevelFromXP(350)).toBe(2);
    expect(calculateLevelFromXP(499)).toBe(2);
  });

  it('returns level 3 (Journeyman) for 500-999 XP', () => {
    expect(calculateLevelFromXP(500)).toBe(3);
    expect(calculateLevelFromXP(750)).toBe(3);
    expect(calculateLevelFromXP(999)).toBe(3);
  });

  it('returns level 4 (Expert) for 1000-1999 XP', () => {
    expect(calculateLevelFromXP(1000)).toBe(4);
    expect(calculateLevelFromXP(1500)).toBe(4);
    expect(calculateLevelFromXP(1999)).toBe(4);
  });

  it('returns level 5 (Master) for 2000+ XP', () => {
    expect(calculateLevelFromXP(2000)).toBe(5);
    expect(calculateLevelFromXP(3000)).toBe(5);
    expect(calculateLevelFromXP(10000)).toBe(5);
  });

  it('returns correct level names', () => {
    expect(SKILL_LEVEL_NAMES[1]).toBe('Novice');
    expect(SKILL_LEVEL_NAMES[2]).toBe('Apprentice');
    expect(SKILL_LEVEL_NAMES[3]).toBe('Journeyman');
    expect(SKILL_LEVEL_NAMES[4]).toBe('Expert');
    expect(SKILL_LEVEL_NAMES[5]).toBe('Master');
  });

  it('returns localized level names', () => {
    expect(getSkillLevelName(1, 'en')).toBe('Novice');
    expect(getSkillLevelName(1, 'es')).toBe('Novato');
    expect(getSkillLevelName(5, 'en')).toBe('Master');
    expect(getSkillLevelName(5, 'es')).toBe('Maestro');
  });
});

// =============================================================================
// XP Aggregation Tests
// =============================================================================

describe('XP aggregation from multiple sources', () => {
  it('aggregates XP from multiple experience sources', () => {
    // Two work experiences
    const xpAmounts = [500, 250]; // 18mo + 9mo

    const totalXP = aggregateTotalXP(xpAmounts);

    expect(totalXP).toBe(750);
  });

  it('aggregates XP from mixed sources (experience + manual)', () => {
    // Work experience (12mo = 250 XP) + Self-assessment (Intermediate = 300 XP)
    const xpAmounts = [250, 300];

    const totalXP = aggregateTotalXP(xpAmounts);

    expect(totalXP).toBe(550);
  });

  it('returns 0 for empty array', () => {
    const totalXP = aggregateTotalXP([]);

    expect(totalXP).toBe(0);
  });

  it('handles single source correctly', () => {
    const totalXP = aggregateTotalXP([100]);

    expect(totalXP).toBe(100);
  });

  it('correctly determines level from aggregated XP', () => {
    // Aggregate multiple sources to reach Expert level
    const xpAmounts = [500, 250, 300]; // 1050 total

    const totalXP = aggregateTotalXP(xpAmounts);
    const level = calculateLevelFromXP(totalXP);

    expect(totalXP).toBe(1050);
    expect(level).toBe(4); // Expert level
  });
});

// =============================================================================
// Level Progress Tests
// =============================================================================

describe('Level progress calculation', () => {
  it('calculates progress within a level correctly', () => {
    // 300 XP in Apprentice level (200-499, range of 300)
    // Progress: (300-200) / 300 = 33%
    const progress = calculateLevelProgress(300);

    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('returns XP needed to reach next level', () => {
    // At 300 XP (Apprentice), need 200 more to reach 500 (Journeyman)
    const xpNeeded = getXPToNextLevel(300);

    expect(xpNeeded).toBe(200);
  });

  it('returns 0 XP needed at max level', () => {
    const xpNeeded = getXPToNextLevel(3000);

    expect(xpNeeded).toBe(0);
  });
});
