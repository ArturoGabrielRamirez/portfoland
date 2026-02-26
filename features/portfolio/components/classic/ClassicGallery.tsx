'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PortfolioSectionProps } from '../../types/portfolio';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';

// =============================================================================
// Component
// =============================================================================

export function ClassicGallery({ data, className }: PortfolioSectionProps) {
  const t = useTranslations('portfolio');

  const items = (data.gallery ?? []).filter((item: GalleryItemModel) => item.published);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Extract distinct non-null category values
  const categories = Array.from(
    new Set(items.map((item: GalleryItemModel) => item.category).filter((c): c is string => c !== null))
  );

  const filteredItems = activeCategory
    ? items.filter((i: GalleryItemModel) => i.category === activeCategory)
    : items;

  return (
    <section className={cn('py-6', className)}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {t('sections.gallery.classic.title')}
      </h2>

      {/* Category filter bar — render only when items have non-null categories */}
      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={
              activeCategory === null
                ? 'bg-blue-600 text-white rounded-full px-3 py-1 text-sm'
                : 'bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm hover:bg-gray-200'
            }
            onClick={() => setActiveCategory(null)}
          >
            {t('sections.gallery.classic.filterAll')}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category
                  ? 'bg-blue-600 text-white rounded-full px-3 py-1 text-sm'
                  : 'bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm hover:bg-gray-200'
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <p className="text-gray-400" data-testid="gallery-empty-state">
          {t('sections.gallery.classic.emptyState')}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="gallery-grid">
          {filteredItems.map((item: GalleryItemModel) => (
            <div key={item.id}>
              <img
                src={item.imageUrl}
                alt={item.altText ?? item.caption ?? ''}
                className="w-full h-48 object-cover rounded-lg"
              />
              {item.caption && (
                <p className="mt-1 text-xs text-gray-500 text-center">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
