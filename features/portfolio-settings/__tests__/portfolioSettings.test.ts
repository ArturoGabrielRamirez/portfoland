/**
 * PortfolioSettings Feature Tests
 *
 * Tests for the service layer business logic and data layer functions
 * for the PortfolioSettings feature.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    portfolioSettings: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// =============================================================================
// Imports (after mocks)
// =============================================================================

import { prisma } from '@/lib/prisma';

import { getPortfolioSettingsData } from '../data/getPortfolioSettings.data';
import {
  getPortfolioSettingsService,
  updatePortfolioSettingsService,
} from '../services/portfolioSettings.service';
import { PORTFOLIO_SETTINGS_MESSAGES } from '../constants/messages';
import { THEME_PRESETS } from '../constants/themes';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';

const mockDefaultSettings = {
  id: 'clsettings123456789',
  userId: mockUserId,
  theme: 'default',
  layoutVariant: 'bento',
  accentColor: null,
  fontFamily: null,
  heroStyle: 'standard',
  showBranding: true,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

// =============================================================================
// Task 5.1a: getPortfolioSettings lazy-creates default settings on first access
// =============================================================================

describe('getPortfolioSettingsData — lazy creation via upsert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls upsert with correct where, create, and update args to lazy-create settings', async () => {
    vi.mocked(prisma.portfolioSettings.upsert).mockResolvedValue(mockDefaultSettings);

    const result = await getPortfolioSettingsData(mockUserId);

    expect(prisma.portfolioSettings.upsert).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      create: { userId: mockUserId },
      update: {},
    });

    expect(result.userId).toBe(mockUserId);
    expect(result.theme).toBe('default');
    expect(result.layoutVariant).toBe('bento');
    expect(result.heroStyle).toBe('standard');
    expect(result.showBranding).toBe(true);
  });

  it('returns existing settings unchanged when they already exist', async () => {
    const existingSettings = {
      ...mockDefaultSettings,
      theme: 'warm',
      layoutVariant: 'stacked',
      accentColor: '#d97706',
    };

    vi.mocked(prisma.portfolioSettings.upsert).mockResolvedValue(existingSettings);

    const result = await getPortfolioSettingsService(mockUserId);

    expect(result.theme).toBe('warm');
    expect(result.layoutVariant).toBe('stacked');
    expect(result.accentColor).toBe('#d97706');
  });
});

// =============================================================================
// Task 5.1b: updatePortfolioSettings validates theme ID exists in THEME_PRESETS
// =============================================================================

describe('updatePortfolioSettingsService — theme validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws INVALID_THEME error when theme is not in THEME_PRESETS', async () => {
    await expect(
      updatePortfolioSettingsService(mockUserId, { theme: 'non-existent-theme' })
    ).rejects.toThrow(PORTFOLIO_SETTINGS_MESSAGES.INVALID_THEME);
  });

  it('accepts all valid THEME_PRESETS keys without throwing', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue(mockDefaultSettings);

    for (const themeKey of Object.keys(THEME_PRESETS)) {
      await expect(
        updatePortfolioSettingsService(mockUserId, { theme: themeKey })
      ).resolves.not.toThrow();
    }
  });
});

// =============================================================================
// Task 5.1c: updatePortfolioSettings validates layoutVariant allowed values
// =============================================================================

describe('updatePortfolioSettingsService — layoutVariant validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws INVALID_LAYOUT error when layoutVariant is not in allowed list', async () => {
    await expect(
      updatePortfolioSettingsService(mockUserId, { layoutVariant: 'grid' })
    ).rejects.toThrow(PORTFOLIO_SETTINGS_MESSAGES.INVALID_LAYOUT);
  });

  it('accepts "bento" as a valid layoutVariant', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue(mockDefaultSettings);

    await expect(
      updatePortfolioSettingsService(mockUserId, { layoutVariant: 'bento' })
    ).resolves.not.toThrow();
  });

  it('accepts "stacked" as a valid layoutVariant', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue({
      ...mockDefaultSettings,
      layoutVariant: 'stacked',
    });

    await expect(
      updatePortfolioSettingsService(mockUserId, { layoutVariant: 'stacked' })
    ).resolves.not.toThrow();
  });

  it('accepts "sidebar" as a valid layoutVariant', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue({
      ...mockDefaultSettings,
      layoutVariant: 'sidebar',
    });

    await expect(
      updatePortfolioSettingsService(mockUserId, { layoutVariant: 'sidebar' })
    ).resolves.not.toThrow();
  });
});

// =============================================================================
// Task 5.1d: updatePortfolioSettings validates heroStyle allowed values
// =============================================================================

describe('updatePortfolioSettingsService — heroStyle validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws INVALID_HERO_STYLE error when heroStyle is not in allowed list', async () => {
    await expect(
      updatePortfolioSettingsService(mockUserId, { heroStyle: 'fullscreen' })
    ).rejects.toThrow(PORTFOLIO_SETTINGS_MESSAGES.INVALID_HERO_STYLE);
  });

  it('accepts "standard" as a valid heroStyle', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue(mockDefaultSettings);

    await expect(
      updatePortfolioSettingsService(mockUserId, { heroStyle: 'standard' })
    ).resolves.not.toThrow();
  });

  it('accepts "minimal" as a valid heroStyle', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue({
      ...mockDefaultSettings,
      heroStyle: 'minimal',
    });

    await expect(
      updatePortfolioSettingsService(mockUserId, { heroStyle: 'minimal' })
    ).resolves.not.toThrow();
  });

  it('accepts "cover" as a valid heroStyle', async () => {
    vi.mocked(prisma.portfolioSettings.update).mockResolvedValue({
      ...mockDefaultSettings,
      heroStyle: 'cover',
    });

    await expect(
      updatePortfolioSettingsService(mockUserId, { heroStyle: 'cover' })
    ).resolves.not.toThrow();
  });
});
