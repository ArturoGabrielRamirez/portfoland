'use client';

/**
 * DeleteConfirmModal Component
 *
 * Confirmation dialog for deleting an experience.
 */

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  experienceTitle: string;
  isLoading?: boolean;
}

/**
 * DeleteConfirmModal asks for confirmation before deleting
 */
function DeleteConfirmModalComponent({
  isOpen,
  onClose,
  onConfirm,
  experienceTitle,
  isLoading = false,
}: DeleteConfirmModalProps) {
  // Handle confirm and close on success
  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  // Handle backdrop click
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
              'relative w-full max-w-sm font-mono',
              'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm shadow-2xl',
              'overflow-hidden'
            )}
          >
            {/* Red accent line */}
            <div className="h-1 bg-red-500" />

            {/* Content */}
            <div className="p-6 text-center">
              {/* Warning icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-2">Delete Experience?</h3>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete{' '}
                <span className="text-white font-medium">"{experienceTitle}"</span>? This action
                cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-red-500/50" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-red-500/50" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-red-500/50" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-red-500/50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const DeleteConfirmModal = memo(DeleteConfirmModalComponent);
