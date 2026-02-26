/**
 * Classic Mode New Section Component Tests
 *
 * Tests for the three new Classic Mode section components introduced in TG2:
 * - ClassicGallery: grid render + empty state
 * - ClassicServices: price formatting variants + empty state
 * - ClassicTestimonials: star rating + empty state
 *
 * Follows the same pattern as portfolio-classic.test.tsx:
 * vi.mock for next-intl, dynamic import inside each it() block.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl with all translation keys used by the three new components
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.gallery.classic.title': 'Gallery',
      'sections.gallery.classic.emptyState': 'No gallery items yet',
      'sections.gallery.classic.filterAll': 'All',
      'sections.services.classic.title': 'Services',
      'sections.services.classic.emptyState': 'No services yet',
      'sections.services.classic.priceContact': 'Contact us',
      'sections.testimonials.classic.title': 'Testimonials',
      'sections.testimonials.classic.emptyState': 'No testimonials yet',
    };
    return translations[key] ?? key;
  },
}));

// Mock next/image as a plain <img> element
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// =============================================================================
// Test Data
// =============================================================================

const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  image: null,
  bio: null,
  portfolioMode: 'classic' as const,
  locale: 'en',
  sectionOrder: [],
  contactLinks: {},
  sectionVisibility: {},
};

const mockData: PortfolioData = {
  user: mockUser,
  experiences: null,
  skills: null,
  projects: [],
  services: [],
  testimonials: [],
  gallery: [],
  settings: null,
};

// =============================================================================
// ClassicGallery Tests
// =============================================================================

describe('ClassicGallery', () => {
  it('ClassicGallery renders gallery grid with items', async () => {
    const galleryData = {
      ...mockData,
      gallery: [
        {
          id: 'g1',
          userId: 'user-1',
          imageUrl: '/img1.jpg',
          altText: 'First photo',
          caption: null,
          category: null,
          order: 0,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'g2',
          userId: 'user-1',
          imageUrl: '/img2.jpg',
          altText: null,
          caption: 'Second photo',
          category: null,
          order: 1,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any,
    };

    const { ClassicGallery } = await import('../components/classic/ClassicGallery');
    render(<ClassicGallery data={galleryData} />);

    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();
    expect(screen.getByText('Second photo')).toBeInTheDocument();
  });

  it('ClassicGallery shows empty state when no gallery items', async () => {
    const { ClassicGallery } = await import('../components/classic/ClassicGallery');
    render(<ClassicGallery data={mockData} />);

    const emptyState = screen.getByTestId('gallery-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('No gallery items yet');
  });
});

// =============================================================================
// ClassicServices Tests
// =============================================================================

describe('ClassicServices', () => {
  it('ClassicServices renders service cards with all price types', async () => {
    const servicesData = {
      ...mockData,
      services: [
        {
          id: 's1',
          userId: 'user-1',
          title: 'Consultation',
          priceType: 'CONTACT',
          priceMin: null,
          priceMax: null,
          currency: 'USD',
          durationMinutes: 30,
          description: null,
          published: true,
          order: 0,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 's2',
          userId: 'user-1',
          title: 'Haircut',
          priceType: 'FIXED',
          priceMin: 50,
          priceMax: null,
          currency: 'USD',
          durationMinutes: 45,
          description: null,
          published: true,
          order: 1,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 's3',
          userId: 'user-1',
          title: 'Retouching',
          priceType: 'RANGE',
          priceMin: 100,
          priceMax: 200,
          currency: 'USD',
          durationMinutes: 90,
          description: null,
          published: true,
          order: 2,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 's4',
          userId: 'user-1',
          title: 'Design',
          priceType: 'STARTING_FROM',
          priceMin: 300,
          priceMax: null,
          currency: 'USD',
          durationMinutes: null,
          description: null,
          published: true,
          order: 3,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any,
    };

    const { ClassicServices } = await import('../components/classic/ClassicServices');
    render(<ClassicServices data={servicesData} />);

    // All four service cards are rendered
    const cards = screen.getAllByTestId('service-card');
    expect(cards).toHaveLength(4);

    // CONTACT type shows the i18n string "Contact us"
    expect(screen.getByText('Contact us')).toBeInTheDocument();

    // FIXED type shows "$50 USD"
    expect(screen.getByText('$50 USD')).toBeInTheDocument();

    // RANGE type shows "$100 – $200 USD" (en-dash U+2013 separator)
    expect(screen.getByText('$100 \u2013 $200 USD')).toBeInTheDocument();

    // STARTING_FROM type shows "From $300 USD"
    expect(screen.getByText('From $300 USD')).toBeInTheDocument();
  });

  it('ClassicServices shows empty state when no services', async () => {
    const { ClassicServices } = await import('../components/classic/ClassicServices');
    render(<ClassicServices data={mockData} />);

    const emptyState = screen.getByTestId('services-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('No services yet');
  });
});

// =============================================================================
// ClassicTestimonials Tests
// =============================================================================

describe('ClassicTestimonials', () => {
  it('ClassicTestimonials renders testimonial cards with star rating and content', async () => {
    const testimonialsData = {
      ...mockData,
      testimonials: [
        {
          id: 't1',
          userId: 'user-1',
          clientName: 'Jane Smith',
          clientTitle: 'CEO',
          content: 'Great work',
          rating: 4,
          imageUrl: null,
          source: null,
          externalId: null,
          order: 0,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any,
    };

    const { ClassicTestimonials } = await import('../components/classic/ClassicTestimonials');
    render(<ClassicTestimonials data={testimonialsData} />);

    // Testimonial card is rendered
    expect(screen.getByTestId('testimonial-card')).toBeInTheDocument();

    // Content appears inside blockquote (with surrounding curly-quote HTML entities)
    expect(screen.getByText(/Great work/)).toBeInTheDocument();

    // Client name is rendered
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Star rating: rating=4 → 4 filled (text-amber-400) + 1 unfilled (text-gray-200)
    const filledStars = document.querySelectorAll('.text-amber-400');
    expect(filledStars).toHaveLength(4);

    const unfilledStars = document.querySelectorAll('.text-gray-200');
    expect(unfilledStars).toHaveLength(1);
  });

  it('ClassicTestimonials shows empty state when no testimonials', async () => {
    const { ClassicTestimonials } = await import('../components/classic/ClassicTestimonials');
    render(<ClassicTestimonials data={mockData} />);

    const emptyState = screen.getByTestId('testimonials-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('No testimonials yet');
  });
});
