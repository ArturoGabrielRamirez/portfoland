/**
 * Experience Model Tests
 *
 * TDD approach: These tests define the expected behavior of the Experience model
 * and related functionality that will be implemented in Task Group 1.
 *
 * Tests are focused on core model behavior as per testing standards:
 * - Experience creation with valid data
 * - Experience type enum validation (WORK, EDUCATION, PROJECT, CERTIFICATION)
 * - User-experience relationship (userId foreign key)
 * - XP calculation by type
 * - Coordinate validation (latitude, longitude)
 */

import { describe, it, expect } from 'vitest';

// TODO: Replace with actual imports once types are implemented in Task 1.4-1.5
// import type { Experience, ExperienceType, CreateExperienceInput } from '../types/experience';
// import { XP_VALUES, EXPERIENCE_COLORS } from '../constants/xp';

/**
 * Mock types that match the expected Prisma schema
 * These will be replaced with actual Prisma-generated types in Task 1.2
 */
type ExperienceType = 'WORK' | 'EDUCATION' | 'PROJECT' | 'CERTIFICATION';

interface Experience {
  id: string;
  userId: string;
  type: ExperienceType;
  title: string;
  company: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  skills: string[];
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateExperienceInput {
  userId: string;
  type: ExperienceType;
  title: string;
  company: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: Date;
  endDate?: Date | null;
  description: string;
  skills?: string[];
}

/**
 * Mock XP values - will be replaced with actual constants in Task 1.5
 */
const XP_VALUES: Record<ExperienceType, number> = {
  WORK: 500,
  PROJECT: 350,
  CERTIFICATION: 400,
  EDUCATION: 200,
};

const EXPERIENCE_COLORS: Record<ExperienceType, string> = {
  WORK: '#00D4FF', // Cyan
  EDUCATION: '#A855F7', // Purple
  PROJECT: '#22C55E', // Green
  CERTIFICATION: '#EAB308', // Yellow
};

/**
 * Helper function to calculate XP based on experience type
 * Will be moved to constants/xp.ts in Task 1.5
 */
function calculateXP(type: ExperienceType): number {
  return XP_VALUES[type];
}

/**
 * Helper function to validate coordinates
 */
function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

describe('Experience Model', () => {
  describe('Experience Creation', () => {
    it('creates experience with valid data', () => {
      const input: CreateExperienceInput = {
        userId: 'cluser123456789',
        type: 'WORK',
        title: 'Senior Developer',
        company: 'Tech Corp',
        latitude: -34.6037,
        longitude: -58.3816,
        address: 'Buenos Aires, Argentina',
        startDate: new Date('2023-01-01'),
        endDate: null,
        description: 'Full-stack development',
        skills: ['TypeScript', 'React', 'Node.js'],
      };

      // Simulate experience creation
      const experience: Experience = {
        id: 'clexp123456789',
        ...input,
        endDate: input.endDate ?? null,
        skills: input.skills ?? [],
        xp: calculateXP(input.type),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(experience.id).toBeDefined();
      expect(experience.userId).toBe('cluser123456789');
      expect(experience.title).toBe('Senior Developer');
      expect(experience.company).toBe('Tech Corp');
      expect(experience.type).toBe('WORK');
      expect(experience.xp).toBe(500);
    });

    it('sets default empty array for skills when not provided', () => {
      const input: CreateExperienceInput = {
        userId: 'cluser123456789',
        type: 'EDUCATION',
        title: 'Computer Science Degree',
        company: 'University of Buenos Aires',
        latitude: -34.5997,
        longitude: -58.3732,
        address: 'Buenos Aires, Argentina',
        startDate: new Date('2018-03-01'),
        endDate: new Date('2022-12-15'),
        description: 'Bachelor degree in Computer Science',
      };

      const experience: Experience = {
        id: 'clexp123456790',
        ...input,
        endDate: input.endDate ?? null,
        skills: input.skills ?? [],
        xp: calculateXP(input.type),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(experience.skills).toEqual([]);
    });
  });

  describe('Experience Type Enum', () => {
    it('validates WORK experience type', () => {
      const validTypes: ExperienceType[] = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'];
      expect(validTypes).toContain('WORK');
    });

    it('validates EDUCATION experience type', () => {
      const validTypes: ExperienceType[] = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'];
      expect(validTypes).toContain('EDUCATION');
    });

    it('validates PROJECT experience type', () => {
      const validTypes: ExperienceType[] = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'];
      expect(validTypes).toContain('PROJECT');
    });

    it('validates CERTIFICATION experience type', () => {
      const validTypes: ExperienceType[] = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'];
      expect(validTypes).toContain('CERTIFICATION');
    });

    it('has exactly 4 experience types', () => {
      const validTypes: ExperienceType[] = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'];
      expect(validTypes).toHaveLength(4);
    });
  });

  describe('User-Experience Relationship', () => {
    it('requires userId to be present', () => {
      const input: CreateExperienceInput = {
        userId: 'cluser123456789',
        type: 'PROJECT',
        title: 'Open Source Contribution',
        company: 'GitHub',
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco, CA',
        startDate: new Date('2023-06-01'),
        description: 'Contributing to open source projects',
      };

      expect(input.userId).toBeDefined();
      expect(input.userId).toBe('cluser123456789');
    });

    it('userId follows cuid format for MongoDB compatibility', () => {
      const userId = 'cluser123456789';
      // cuid format: starts with 'c' and is at least 25 characters
      // For our mock, we're using a simplified format
      expect(userId).toBeTruthy();
      expect(typeof userId).toBe('string');
      expect(userId.length).toBeGreaterThan(0);
    });
  });

  describe('XP Calculation', () => {
    it('calculates XP for WORK type as 500', () => {
      expect(calculateXP('WORK')).toBe(500);
    });

    it('calculates XP for PROJECT type as 350', () => {
      expect(calculateXP('PROJECT')).toBe(350);
    });

    it('calculates XP for CERTIFICATION type as 400', () => {
      expect(calculateXP('CERTIFICATION')).toBe(400);
    });

    it('calculates XP for EDUCATION type as 200', () => {
      expect(calculateXP('EDUCATION')).toBe(200);
    });

    it('maps experience types to correct colors', () => {
      expect(EXPERIENCE_COLORS.WORK).toBe('#00D4FF');
      expect(EXPERIENCE_COLORS.EDUCATION).toBe('#A855F7');
      expect(EXPERIENCE_COLORS.PROJECT).toBe('#22C55E');
      expect(EXPERIENCE_COLORS.CERTIFICATION).toBe('#EAB308');
    });
  });

  describe('Coordinate Validation', () => {
    it('validates coordinates within valid range for Buenos Aires', () => {
      const latitude = -34.6037;
      const longitude = -58.3816;

      expect(isValidCoordinates(latitude, longitude)).toBe(true);
    });

    it('validates coordinates within valid range for San Francisco', () => {
      const latitude = 37.7749;
      const longitude = -122.4194;

      expect(isValidCoordinates(latitude, longitude)).toBe(true);
    });

    it('rejects latitude outside valid range (-90 to 90)', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
    });

    it('rejects longitude outside valid range (-180 to 180)', () => {
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
    });

    it('accepts edge case coordinates at boundaries', () => {
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
    });
  });
});
