'use client';

/**
 * CustomThemeBuilder
 *
 * Provides a UI for selecting a custom color palette and font family.
 * Emits changes as a customTheme object compatible with ThemePreset.
 */

import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Baseline } from 'lucide-react';

import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/dashboard/components/HUDPanel';

// =============================================================================
// Types
// =============================================================================

export interface CustomThemePayload {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  cardBackground: string;
  fontFamily: string;
}

interface CustomThemeBuilderProps {
  initialTheme?: CustomThemePayload | null;
  onChange: (theme: CustomThemePayload) => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CUSTOM_THEME: CustomThemePayload = {
  backgroundColor: '#ffffff',
  textColor: '#111827',
  accentColor: '#2563eb',
  borderColor: '#e5e7eb',
  cardBackground: '#f9fafb',
  fontFamily: 'Inter',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Sans-serif)' },
  { value: 'Roboto', label: 'Roboto (Sans-serif)' },
  { value: 'Playfair Display', label: 'Playfair (Serif)' },
  { value: 'Georgia', label: 'Georgia (Serif)' },
  { value: 'Fira Code', label: 'Fira Code (Monospace)' },
  { value: 'Space Mono', label: 'Space Mono (Monospace)' },
];

const COLOR_FIELDS = [
  { key: 'backgroundColor', label: 'Background' },
  { key: 'textColor', label: 'Text' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'cardBackground', label: 'Card Surface' },
  { key: 'borderColor', label: 'Borders' },
] as const;

// =============================================================================
// Helper Component: Click-Away Popover Picker
// =============================================================================

function ColorPickerPopover({
  color,
  onChange,
  label,
  disabled
}: {
  color: string;
  onChange: (c: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1 relative" ref={popoverRef}>
      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-8 h-8 rounded border border-[hsl(174,100%,50%,0.3)] shadow-sm transition-transform cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-2 py-1.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.2)] rounded font-mono text-xs text-gray-200 uppercase"
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-14 left-0 z-50 p-3 bg-[#0D1421] border border-[hsl(174,100%,50%,0.4)] rounded shadow-xl">
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CustomThemeBuilder({ initialTheme, onChange, disabled }: CustomThemeBuilderProps) {
  const [theme, setTheme] = useState<CustomThemePayload>(() => {
    if (initialTheme && Object.keys(initialTheme).length > 0) {
      // Ensure all fields exist by merging with defaults
      return { ...DEFAULT_CUSTOM_THEME, ...initialTheme };
    }
    return DEFAULT_CUSTOM_THEME;
  });

  // Debounce onChange to avoid spamming server actions while dragging color picker
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateField = (key: keyof CustomThemePayload, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newTheme);
    }, 400); // 400ms debounce
  };

  return (
    <HUDPanel title="Custom Theme Builder" icon={<Palette className="w-4 h-4" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Color Pickers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Color Palette</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {COLOR_FIELDS.map(field => (
              <ColorPickerPopover
                key={field.key}
                label={field.label}
                color={theme[field.key]}
                onChange={(c) => updateField(field.key, c)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Baseline className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Typography</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateField('fontFamily', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-[#0D1421] border border-[hsl(174,100%,50%,0.2)] rounded font-mono text-sm text-gray-200 focus:outline-none focus:border-[#00D4FF]"
            >
              {FONT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[9px] font-mono text-gray-500 mt-1">
              Select a web-safe font or Google Font. Ensure the font looks good in your selected view mode.
            </p>
          </div>

          {/* Mini Live Preview inside builder */}
          <div className="mt-4 p-4 border rounded-sm" style={{ 
            backgroundColor: theme.backgroundColor, 
            borderColor: theme.borderColor,
            fontFamily: theme.fontFamily,
          }}>
            <div className="p-3 shadow-sm rounded-sm" style={{ backgroundColor: theme.cardBackground }}>
              <h4 className="text-sm font-bold m-0" style={{ color: theme.textColor }}>Preview Heading</h4>
              <p className="text-xs mt-1" style={{ color: theme.textColor, opacity: 0.8 }}>
                This is how your text and <span style={{ color: theme.accentColor, fontWeight: 'bold' }}>accent colors</span> will look on your selected card background.
              </p>
            </div>
          </div>

        </div>

      </div>
    </HUDPanel>
  );
}
