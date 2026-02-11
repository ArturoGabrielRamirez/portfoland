/**
 * Reserved Subdomains Tests
 *
 * Tests for the reserved subdomains constant and validation utility:
 * - RESERVED_SUBDOMAINS array contains all 18 required entries
 * - isReservedSubdomain returns true for reserved names (case-insensitive)
 * - isReservedSubdomain returns false for valid non-reserved usernames
 */

import { describe, it, expect } from 'vitest';

import {
  RESERVED_SUBDOMAINS,
  isReservedSubdomain,
} from '../constants/reservedSubdomains';

// =============================================================================
// Tests
// =============================================================================

describe('Reserved Subdomains', () => {
  it('contains all 18 required reserved subdomain entries', () => {
    const requiredEntries = [
      'www',
      'app',
      'api',
      'admin',
      'mail',
      'staging',
      'dev',
      'test',
      'beta',
      'status',
      'docs',
      'help',
      'support',
      'blog',
      'cdn',
      'static',
      'assets',
      'media',
    ];

    for (const entry of requiredEntries) {
      expect(RESERVED_SUBDOMAINS).toContain(entry);
    }

    expect(RESERVED_SUBDOMAINS).toHaveLength(requiredEntries.length);
  });

  it('returns true for reserved names regardless of casing', () => {
    expect(isReservedSubdomain('www')).toBe(true);
    expect(isReservedSubdomain('WWW')).toBe(true);
    expect(isReservedSubdomain('Www')).toBe(true);
    expect(isReservedSubdomain('API')).toBe(true);
    expect(isReservedSubdomain('Admin')).toBe(true);
    expect(isReservedSubdomain('STAGING')).toBe(true);
  });

  it('returns false for valid non-reserved usernames', () => {
    expect(isReservedSubdomain('john')).toBe(false);
    expect(isReservedSubdomain('janedoe')).toBe(false);
    expect(isReservedSubdomain('portfoland-user')).toBe(false);
  });
});
