'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';
import type { ServiceModel } from '@/features/services/types/service';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Formats the duration in minutes to a human-readable string.
 * - Less than 60 minutes: "30 min"
 * - 60+ minutes: "1h" or "1h 30min"
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
}

// =============================================================================
// Component
// =============================================================================

export function ClassicServices({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');

  const services = (data.services ?? []).filter((s: ServiceModel) => s.published);

  /**
   * Formats the price for display based on the service's priceType.
   * Defined inside component to access the translations function `t`.
   */
  function formatPrice(service: ServiceModel): string {
    switch (service.priceType) {
      case 'CONTACT':
        return t('sections.services.classic.priceContact');
      case 'FIXED':
        return `$${service.priceMin} ${service.currency}`;
      case 'RANGE':
        return `$${service.priceMin} \u2013 $${service.priceMax} ${service.currency}`;
      case 'STARTING_FROM':
        return `From $${service.priceMin} ${service.currency}`;
      default:
        return '';
    }
  }

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.services.classic.title')}
      </h2>

      {services.length === 0 ? (
        <p className="text-gray-400" data-testid="services-empty-state">
          {t('sections.services.classic.emptyState')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service: ServiceModel) => {
            const priceDisplay = formatPrice(service);
            return (
              <div
                key={service.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm"
                data-testid="service-card"
              >
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                {service.description && (
                  <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                )}
                {priceDisplay && (
                  <p className="mt-2 text-sm font-medium text-gray-800">{priceDisplay}</p>
                )}
                {service.durationMinutes && (
                  <p className="text-xs text-gray-500">{formatDuration(service.durationMinutes)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
