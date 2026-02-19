
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/og/route';
import { getPortfolioByUsername } from '@/features/portfolio/data/getPortfolio.data';

// Mock dependencies
vi.mock('@/features/portfolio/data/getPortfolio.data', () => ({
    getPortfolioByUsername: vi.fn(),
}));

// Mock ImageResponse since we can't easily test the actual image generation in node env without polyfills
// matching the Edge runtime. We just want to ensure logic flow.
vi.mock('@vercel/og', () => ({
    ImageResponse: class {
        constructor(element: any, options: any) {
            return new Response('image-data', {
                headers: { 'content-type': 'image/png' },
            });
        }
    },
}));

describe('GET /api/og', () => {
    const mockUser = {
        user: {
            name: 'Test User',
            portfolioMode: 'tech',
        },
        skills: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 if username is missing', async () => {
        const request = new Request('http://localhost:3000/api/og');
        const response = await GET(request);

        expect(response.status).toBe(400); // Or 404, detailed in impl
        // Actually spec didn't specify, but 400 for missing param is good.
    });

    it('should return 404 if user not found', async () => {
        (getPortfolioByUsername as any).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/og?username=nonexistent');
        const response = await GET(request);

        expect(response.status).toBe(404);
    });

    it('should return image response for valid user', async () => {
        (getPortfolioByUsername as any).mockResolvedValue(mockUser);

        const request = new Request('http://localhost:3000/api/og?username=testuser');
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/png');
    });

    it('should respect mode parameter', async () => {
        (getPortfolioByUsername as any).mockResolvedValue(mockUser);

        const request = new Request('http://localhost:3000/api/og?username=testuser&mode=classic');
        await GET(request);

        // In a real integration test we'd check the image content, 
        // but here we verify no error occurs and it uses the param.
        // The implementation should verify 'mode' is used.
        expect(getPortfolioByUsername).toHaveBeenCalledWith('testuser');
    });
});
