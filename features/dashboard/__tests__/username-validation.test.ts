/**
 * Username Validation Tests
 *
 * Tests for username validation against reserved subdomains:
 * - Rejects reserved subdomain names (e.g., 'api')
 * - Rejects reserved names case-insensitively (e.g., 'Admin')
 * - Accepts valid non-reserved usernames (e.g., 'johndoe')
 */

import { describe, it, expect } from 'vitest';

import { usernameSchema } from '../schemas/username.schema';

// =============================================================================
// Tests
// =============================================================================

describe('Username Validation', () => {
  it('rejects reserved subdomain name "api" with a clear error message', async () => {
    await expect(
      usernameSchema.validate({ username: 'api' })
    ).rejects.toThrow('This username is reserved and cannot be used');
  });

  it('rejects reserved name "Admin" with case-insensitive check', async () => {
    await expect(
      usernameSchema.validate({ username: 'admin' })
    ).rejects.toThrow('This username is reserved and cannot be used');
  });

  it('accepts valid non-reserved username "johndoe"', async () => {
    const result = await usernameSchema.validate({ username: 'johndoe' });
    expect(result.username).toBe('johndoe');
  });
});
