/**
 * CVListSidebar Component
 *
 * Displays a list of saved CV documents in the sidebar.
 * Allows selecting a CV to preview and deleting saved CVs.
 */

'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteCVAction } from '../actions/deleteCV.action';
import type { CVDocumentModel } from '../types/cv';

interface CVListSidebarProps {
  savedCVs: CVDocumentModel[];
  selectedCVId: string | null;
  onSelectCV: (cv: CVDocumentModel) => void;
  onDeleted: (cvId: string) => void;
  isTech: boolean;
  cardClassName: string;
  labelClassName: string;
  subHeadingClassName: string;
  dangerButtonClassName: string;
}

export function CVListSidebar({
  savedCVs,
  selectedCVId,
  onSelectCV,
  onDeleted,
  isTech,
  cardClassName,
  labelClassName,
  subHeadingClassName,
  dangerButtonClassName,
}: CVListSidebarProps) {
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(cvId: string, e: React.MouseEvent) {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this CV?')) return;

    startDeleteTransition(async () => {
      const result = await deleteCVAction({ cvId });

      if (result.hasError) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onDeleted(cvId);
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className={cn(cardClassName, 'p-4')}>
      <h3 className={cn(subHeadingClassName, 'mb-3')}>
        {isTech ? '> SAVED_CVS' : 'Saved CVs'}
      </h3>

      {savedCVs.length === 0 && (
        <p className={cn(labelClassName, 'py-4 text-center')}>
          {isTech ? 'No CVs generated yet.' : 'No saved CVs yet.'}
        </p>
      )}

      <div className="space-y-2">
        {savedCVs.map((cv) => (
          <button
            key={cv.id}
            type="button"
            onClick={() => onSelectCV(cv)}
            disabled={isDeleting}
            className={cn(
              'w-full text-left p-3 rounded transition-colors group',
              isTech
                ? cn(
                    'border border-[hsl(174,100%,50%,0.1)] hover:border-[hsl(174,100%,50%,0.3)]',
                    selectedCVId === cv.id
                      ? 'bg-[hsl(174,100%,50%,0.08)] border-[hsl(174,100%,50%,0.3)]'
                      : 'bg-[hsl(200,30%,9%)]',
                  )
                : cn(
                    'border border-gray-200 hover:border-blue-300',
                    selectedCVId === cv.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white',
                  ),
            )}
            aria-current={selectedCVId === cv.id ? 'true' : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <FileText
                  className={cn(
                    'h-4 w-4 mt-0.5 shrink-0',
                    isTech ? 'text-[#00D4FF]' : 'text-blue-500',
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                    )}
                  >
                    {cv.title}
                  </p>
                  {cv.targetJob && (
                    <p className={cn(labelClassName, 'truncate')}>
                      {cv.targetJob}
                    </p>
                  )}
                  <p className={cn(labelClassName, 'mt-0.5')}>
                    {formatDate(cv.updatedAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(cv.id, e)}
                disabled={isDeleting}
                className={cn(
                  dangerButtonClassName,
                  'opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                )}
                aria-label={`Delete ${cv.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
