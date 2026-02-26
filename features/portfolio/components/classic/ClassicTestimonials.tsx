'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Computes initials from a full name.
 * - "Jane Smith" → "JS"
 * - "Madonna" → "M"
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (
    words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase()
  );
}

// =============================================================================
// Component
// =============================================================================

export function ClassicTestimonials({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');

  const testimonials = (data.testimonials ?? []).filter(
    (item: TestimonialModel) => item.published
  );

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.testimonials.classic.title')}
      </h2>

      {testimonials.length === 0 ? (
        <p className="text-gray-400" data-testid="testimonials-empty-state">
          {t('sections.testimonials.classic.emptyState')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item: TestimonialModel) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm"
              data-testid="testimonial-card"
            >
              {/* Star rating — always 5 stars, filled up to item.rating */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={i <= item.rating ? 'text-amber-400' : 'text-gray-200'}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-2 text-sm italic text-gray-600">
                &ldquo;{item.content}&rdquo;
              </blockquote>

              {/* Client name and title */}
              <p className="mt-3 font-semibold text-gray-900">{item.clientName}</p>
              {item.clientTitle && (
                <p className="text-xs text-gray-500">{item.clientTitle}</p>
              )}

              {/* Client avatar row */}
              <div className="mt-3 flex items-center gap-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.clientName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {getInitials(item.clientName)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
