'use client';

/**
 * LayoutVariantSelector
 *
 * Dashboard UI for selecting the Classic Mode layout variant.
 * Only rendered for Classic Mode users.
 * Offers 3 profession-specific template options alongside a "Default" option.
 */

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Camera, Pen, Palette, LayoutGrid } from 'lucide-react';

import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/dashboard/components/HUDPanel';
import { updateLayoutVariantAction } from '@/features/portfolio-settings/actions/portfolioSettingsActions';

// =============================================================================
// Types
// =============================================================================

export type ClassicLayoutVariant = 'default' | 'photographer' | 'designer' | 'writer';

interface LayoutVariantSelectorProps {
  currentVariant: string;
}

// =============================================================================
// Card Definitions
// =============================================================================

const VARIANT_CARDS: Array<{
  id: ClassicLayoutVariant;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'default',
    label: 'Default',
    description: 'Standard tabbed layout for general professionals',
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    id: 'photographer',
    label: 'Photographer',
    description: 'Gallery-first layout with services and contact CTA',
    icon: <Camera className="w-5 h-5" />,
  },
  {
    id: 'designer',
    label: 'Designer',
    description: 'Portfolio + tools grid layout for visual creatives',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    id: 'writer',
    label: 'Writer',
    description: 'Bio-first layout with timeline of published works',
    icon: <Pen className="w-5 h-5" />,
  },
];

// =============================================================================
// Component
// =============================================================================

export function LayoutVariantSelector({ currentVariant }: LayoutVariantSelectorProps) {
  const [isPending, startTransition] = useTransition();
  // Normalise stored DB value: 'bento' / 'stacked' / 'sidebar' → 'default'
  const normaliseVariant = (v: string): ClassicLayoutVariant => {
    if (v === 'photographer' || v === 'designer' || v === 'writer') return v;
    return 'default';
  };

  const [activeVariant, setActiveVariant] = useState<ClassicLayoutVariant>(
    normaliseVariant(currentVariant)
  );

  function handleSelect(variant: ClassicLayoutVariant) {
    if (variant === activeVariant) return;

    setActiveVariant(variant);
    startTransition(async () => {
      // 'default' maps to 'bento' which is the DB default value
      const dbValue = variant === 'default' ? 'bento' : variant;
      const result = await updateLayoutVariantAction(dbValue);
      if (result.hasError) {
        toast.error(result.message);
        setActiveVariant(normaliseVariant(currentVariant)); // revert on error
      } else {
        toast.success('Template updated');
      }
    });
  }

  return (
    <HUDPanel title="Classic Template" icon={<LayoutGrid className="w-4 h-4" />}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VARIANT_CARDS.map((card) => {
          const isActive = activeVariant === card.id;

          return (
            <button
              key={card.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(card.id)}
              className={cn(
                'flex flex-col gap-2 p-3 border rounded-sm text-left transition-all',
                isActive
                  ? 'border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]'
                  : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]',
                isPending && 'opacity-70'
              )}
            >
              {/* Icon + Active badge row */}
              <div className="flex items-center gap-1.5 text-[#00D4FF]">
                {card.icon}
                {isActive && (
                  <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase ml-auto">
                    Active
                  </span>
                )}
              </div>
              {/* Label */}
              <span className="text-xs font-mono text-gray-200">{card.label}</span>
              {/* Description */}
              <span className="text-[10px] font-mono text-gray-400 leading-tight">
                {card.description}
              </span>
            </button>
          );
        })}
      </div>
    </HUDPanel>
  );
}
