'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ExternalLink,
  Github,
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
  X,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/features/shadcn/ui/dialog';
import {
  HUDPanel,
  GamingBadge,
  GamingButton,
} from '@/features/gaming';
import type { ProjectDetailProps } from '../types/project';
import type { ProjectLink } from '../types/project';

// =============================================================================
// Constants
// =============================================================================

const LINK_TYPE_ICONS: Record<string, React.ReactNode> = {
  LIVE: <ExternalLink className="h-4 w-4" />,
  REPO: <Github className="h-4 w-4" />,
  DOCS: <FileText className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  CASE_STUDY: <BookOpen className="h-4 w-4" />,
  OTHER: <LinkIcon className="h-4 w-4" />,
};

// =============================================================================
// Helpers
// =============================================================================

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

// =============================================================================
// Professional Mode Modal
// =============================================================================

function ProfessionalModal({
  project,
  isOpen,
  onClose,
  t,
}: ProjectDetailProps & { t: (key: string) => string }) {
  const links = (project.links ?? []) as unknown as ProjectLink[];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-xl text-gray-900">
              {project.title}
            </DialogTitle>
            {project.featured && (
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                {t('ui.featured')}
              </span>
            )}
          </div>
          <DialogDescription className="sr-only">
            {project.shortDescription || project.title}
          </DialogDescription>
        </DialogHeader>

        {/* Cover image */}
        {project.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}

        {/* Status and dates */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              project.status === 'COMPLETED' &&
                'bg-green-50 text-green-700',
              project.status === 'IN_PROGRESS' &&
                'bg-yellow-50 text-yellow-700',
              project.status === 'ARCHIVED' &&
                'bg-gray-100 text-gray-500'
            )}
          >
            {t(`ui.statusLabels.${project.status}`)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.startDate)}
            {project.endDate && ` — ${formatDate(project.endDate)}`}
          </span>
        </div>

        {/* Full description */}
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
          {project.description}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {t('ui.technologies')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {t('ui.links')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                  {LINK_TYPE_ICONS[link.type] || LINK_TYPE_ICONS.OTHER}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Gaming Mode Modal
// =============================================================================

function GamingModal({
  project,
  isOpen,
  onClose,
  t,
}: ProjectDetailProps & { t: (key: string) => string }) {
  const links = (project.links ?? []) as unknown as ProjectLink[];
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap: focus the modal container when opened
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto outline-none"
          >
            <HUDPanel>
              {/* Close button */}
              <button
                onClick={onClose}
                data-testid="modal-close-button"
                className="absolute right-4 top-4 z-10 rounded-lg border border-[#1E293B] bg-[#0D1421] p-1.5 text-[#94A3B8] transition-colors hover:border-[#00D4FF] hover:text-[#00D4FF]"
                aria-label={t('ui.closeModal')}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Cover image */}
              {project.imageUrl && (
                <div className="relative -mx-5 -mt-5 mb-4 h-56 overflow-hidden rounded-t-xl">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#D946EF]/20" />
                </div>
              )}

              {/* Title and featured badge */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-white">
                  {project.title}
                </h2>
                {project.featured && (
                  <GamingBadge color="yellow">
                    {t('ui.featured')}
                  </GamingBadge>
                )}
              </div>

              {/* Status and dates */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <GamingBadge
                  color={
                    project.status === 'COMPLETED'
                      ? 'green'
                      : project.status === 'IN_PROGRESS'
                        ? 'yellow'
                        : 'gray'
                  }
                >
                  {t(`ui.statusLabels.${project.status}`)}
                </GamingBadge>
                <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Calendar className="h-3 w-3" />
                  {formatDate(project.startDate)}
                  {project.endDate &&
                    ` — ${formatDate(project.endDate)}`}
                </span>
              </div>

              {/* Full description */}
              <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-[#94A3B8]">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologies &&
                project.technologies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      {t('ui.technologies')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech: string) => (
                        <GamingBadge key={tech} color="cyan">
                          {tech}
                        </GamingBadge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Links */}
              {links.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    {t('ui.links')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {links.map((link, index) => (
                      <GamingButton
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            link.url,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        {LINK_TYPE_ICONS[link.type] ||
                          LINK_TYPE_ICONS.OTHER}
                        <span>{link.label}</span>
                      </GamingButton>
                    ))}
                  </div>
                </div>
              )}
            </HUDPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Exported Component
// =============================================================================

export function ProjectDetailModal({
  project,
  mode,
  isOpen,
  onClose,
}: ProjectDetailProps) {
  const t = useTranslations('portfolio');

  if (mode === 'professional') {
    return (
      <ProfessionalModal
        project={project}
        mode={mode}
        isOpen={isOpen}
        onClose={onClose}
        t={t}
      />
    );
  }

  return (
    <GamingModal
      project={project}
      mode={mode}
      isOpen={isOpen}
      onClose={onClose}
      t={t}
    />
  );
}
