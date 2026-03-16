'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  isLoading?: boolean;
  portfolioMode?: PortfolioMode;
}

function DeleteConfirmModalComponent({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  portfolioMode = 'tech',
}: DeleteConfirmModalProps) {
  const isTech = portfolioMode === 'tech';

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative w-full max-w-sm overflow-hidden shadow-2xl',
              isTech
                ? 'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm font-mono'
                : 'bg-white border border-gray-200 rounded-xl'
            )}
          >
            {/* Accent line */}
            <div className="h-1 bg-red-500" />

            {/* Content */}
            <div className="p-6 text-center">
              {/* Warning icon */}
              <div className={cn(
                'flex items-center justify-center w-12 h-12 mx-auto mb-4',
                isTech ? 'rounded-sm bg-red-500/20' : 'rounded-full bg-red-50'
              )}>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              {/* Title */}
              <h3 className={cn(
                'text-lg font-semibold mb-2',
                isTech ? 'text-foreground' : 'text-gray-900'
              )}>
                {title}
              </h3>

              {/* Description */}
              <p className={cn(
                'text-sm mb-6',
                isTech ? 'text-muted-foreground' : 'text-gray-600'
              )}>
                {description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-sm transition-colors disabled:opacity-50',
                    isTech
                      ? 'border border-[hsl(174,100%,50%,0.3)] text-muted-foreground font-mono text-xs hover:border-[hsl(174,100%,50%,0.6)]'
                      : 'border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50'
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2',
                    isTech
                      ? 'bg-red-500 text-white font-mono text-xs hover:bg-red-600'
                      : 'bg-red-600 text-white rounded-md hover:bg-red-700'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>

            {/* Corner accents (Tech only) */}
            {isTech && (
              <>
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-red-500/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-red-500/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-red-500/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-red-500/50" />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const DeleteConfirmModal = memo(DeleteConfirmModalComponent);
