'use client';

/**
 * CreateCategoryModal Component
 *
 * Modal for creating a new skill category with name and color picker.
 */

import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GamingButton, GamingInput, GamingCard, Spinner } from '@/features/gaming';
import type { CreateCategoryInput } from '../types/skill';

/**
 * Predefined color swatches for quick selection
 */
const COLOR_SWATCHES = [
  { name: 'Cyan', color: '#00D4FF' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Green', color: '#22C55E' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Indigo', color: '#6366F1' },
  { name: 'Lime', color: '#84CC16' },
  { name: 'Amber', color: '#F59E0B' },
];

/**
 * Props for CreateCategoryModal
 */
interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CreateCategoryModal renders a modal for creating new categories
 */
function CreateCategoryModalComponent({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_SWATCHES[0].color);
  const [customColor, setCustomColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor(COLOR_SWATCHES[0].color);
      setCustomColor('');
      setError(null);
      // Focus input after modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (name.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    if (name.trim().length > 30) {
      setError('Category name must be less than 30 characters');
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setError('Invalid color format');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), color });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-md"
          >
            <GamingCard variant="glow" className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
                <h2 className="text-lg font-bold text-white">
                  Create Category
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
                    {error}
                  </div>
                )}

                {/* Category Name */}
                <div className="space-y-2">
                  <label htmlFor="category-name" className="text-sm font-medium text-white">
                    Category Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <GamingInput
                    ref={inputRef}
                    id="category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Machine Learning, Security"
                    disabled={isLoading}
                    error={!!error && !name.trim()}
                    aria-required="true"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    Category Color <span className="text-[#EF4444]">*</span>
                  </label>

                  {/* Color Swatches */}
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => setColor(swatch.color)}
                        className={cn(
                          'w-full aspect-square rounded-lg transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0E1A] focus:ring-[#00D4FF]',
                          color === swatch.color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0E1A] scale-110'
                            : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: swatch.color }}
                        title={swatch.name}
                        aria-label={`Select ${swatch.name} color`}
                        aria-pressed={color === swatch.color}
                      >
                        {color === swatch.color && (
                          <Check className="w-4 h-4 text-white mx-auto" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748B]">Or custom:</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          setColor(e.target.value);
                          setCustomColor(e.target.value);
                        }}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        disabled={isLoading}
                      />
                      <GamingInput
                        value={customColor}
                        onChange={(e) => handleCustomColorChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 text-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}60`,
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {name || 'Category Name'}
                      </p>
                      <p className="text-xs text-[#64748B]">Preview</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
                  <GamingButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </GamingButton>
                  <GamingButton
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        Creating...
                      </>
                    ) : (
                      'Create Category'
                    )}
                  </GamingButton>
                </div>
              </form>
            </GamingCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const CreateCategoryModal = memo(CreateCategoryModalComponent);
