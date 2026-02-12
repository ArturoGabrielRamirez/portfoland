'use client';

/**
 * CategorySelect Component
 *
 * Dropdown for selecting skill categories.
 * Shows color indicators and supports creating new categories.
 */

import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategorySelectProps } from '../types/skill';

/**
 * CategorySelect renders a dropdown for category selection
 */
function CategorySelectComponent({
  value,
  onChange,
  categories,
  onCreateNew,
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected category
  const selectedCategory = categories.find((cat) => cat.id === value);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNew?.();
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 rounded-sm border',
          'bg-[#0D1421] text-sm transition-all duration-200',
          'hover:border-[#334155]',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0E1A] focus:ring-[#00D4FF]',
          isOpen ? 'border-[#00D4FF]' : 'border-[#1E293B]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          {selectedCategory ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-white">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-[#64748B]">Select a category...</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#64748B] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-2 rounded-sm border border-[#1E293B] bg-[#0D1421]',
              'shadow-lg shadow-black/20 overflow-hidden'
            )}
            role="listbox"
          >
            {/* Category List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {/* Clear selection option */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-2.5 text-sm text-left',
                  'hover:bg-[#1E293B] transition-colors',
                  !value && 'text-[#00D4FF]'
                )}
                role="option"
                aria-selected={!value}
              >
                <span className="text-[#64748B]">No category</span>
                {!value && <Check className="w-4 h-4 text-[#00D4FF]" />}
              </button>

              {/* Divider */}
              <div className="h-px bg-[#1E293B] my-1" />

              {/* Categories */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category.id)}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-2.5 text-sm text-left',
                    'hover:bg-[#1E293B] transition-colors',
                    value === category.id && 'bg-[#00D4FF]/10'
                  )}
                  role="option"
                  aria-selected={value === category.id}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={cn(
                      value === category.id ? 'text-[#00D4FF]' : 'text-white'
                    )}>
                      {category.name}
                    </span>
                    {!category.isDefault && (
                      <span className="text-xs text-[#64748B]">(custom)</span>
                    )}
                  </div>
                  {value === category.id && (
                    <Check className="w-4 h-4 text-[#00D4FF]" />
                  )}
                </button>
              ))}
            </div>

            {/* Create New Option */}
            {onCreateNew && (
              <>
                <div className="h-px bg-[#1E293B]" />
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className={cn(
                    'flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left',
                    'text-[#00D4FF] hover:bg-[#1E293B] transition-colors'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Create new category
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const CategorySelect = memo(CategorySelectComponent);
