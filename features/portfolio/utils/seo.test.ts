import { describe, expect, test, it, beforeEach, afterEach, vi } from 'vitest';
import { generatePortfolioMetadata } from './seo';
import type { PortfolioData } from '../types/portfolio';

describe('generatePortfolioMetadata', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv, NODE_ENV: 'development', NEXT_PUBLIC_APP_DOMAIN: 'localhost' };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const mockData: PortfolioData = {
        user: {
            id: '1',
            name: 'John Doe',
            username: 'johndoe',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            bio: 'A great developer.',
            portfolioMode: 'classic',
            locale: 'en',
        },
        skills: {
            user: { id: '1', name: 'John Doe', username: 'johndoe', image: null },
            skills: [],
            categories: [],
            groupedByCategory: [],
            stats: { totalSkills: 0, totalXP: 0, masterSkills: 0, categoriesUsed: 0 }
        },
        projects: [],
        experiences: {
            user: { id: '1', name: 'John Doe', username: 'johndoe', image: null },
            experiences: [],
            stats: { totalXP: 0, totalExperiences: 0, countByType: {} as any, milestones: 0, achievements: 0 },
        },
    };

    const mockT = (key: string, params?: any) => {
        if (key === 'defaultRole') return 'Professional';
        if (key === 'titleTemplate') return `${params.name} - ${params.role} | Portfoland`;
        if (key === 'descriptionTemplate') return `Discover ${params.name}.`;
        return key;
    };

    it('should generate correct metadata', () => {
        const metadata = generatePortfolioMetadata(mockData, mockT, 'en');

        // Title
        expect(metadata.title).toBe('John Doe - Professional | Portfoland');

        // Description
        expect(metadata.description).toBe('A great developer.');

        // Canonical
        expect(metadata.alternates?.canonical).toBe('http://johndoe.localhost:3000');
        expect(metadata.alternates?.languages?.['en']).toBe('http://johndoe.localhost:3000/en');

        // OpenGraph
        const og = metadata.openGraph;
        expect(og?.title).toBe('John Doe - Professional | Portfoland');
        expect(og?.description).toBe('A great developer.');
        expect(og?.url).toBe('http://johndoe.localhost:3000');
        expect(og?.locale).toBe('en');

        // OG Image
        const ogImage = og?.images?.[0];
        // We verify the URL construction
        expect(ogImage?.url).toContain('/api/og');
        expect(ogImage?.url).toContain('username=johndoe');
        expect(ogImage?.url).toContain('mode=classic');
        expect(ogImage?.url).toContain('locale=en');
    });

    it('should use tech parameters when mode is tech', () => {
        const techData: PortfolioData = {
            ...mockData,
            user: { ...mockData.user, portfolioMode: 'tech' },
        };

        const metadata = generatePortfolioMetadata(techData, mockT, 'en');

        const ogImage = metadata.openGraph?.images?.[0];
        expect(ogImage?.url).toContain('mode=tech');
    });
});
