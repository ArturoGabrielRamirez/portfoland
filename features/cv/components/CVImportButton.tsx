/**
 * CVImportButton Component
 *
 * Trigger button that opens a Dialog containing the CVImportPanel.
 * Self-contained — no state leaks to parent; dialog close resets panel.
 */

'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/features/shadcn/ui/dialog';
import { CVImportPanel } from './CVImportPanel';
import type { CVImportButtonProps } from '../types/cvImport';

export function CVImportButton({ portfolioMode }: CVImportButtonProps) {
  const mc = modeClasses(portfolioMode);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(mc.cancelButton, 'flex items-center gap-1.5')}
      >
        <Upload className="h-3.5 w-3.5" />
        {mc.isTech ? 'IMPORT_CV' : 'Import CV'}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={mc.isTech ? 'font-mono text-[#00D4FF]' : ''}>
              {mc.isTech ? '> IMPORT_CV' : 'Import CV'}
            </DialogTitle>
          </DialogHeader>

          {/* CVImportPanel mounts/unmounts with the dialog — resets state on close */}
          {open && <CVImportPanel portfolioMode={portfolioMode} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
