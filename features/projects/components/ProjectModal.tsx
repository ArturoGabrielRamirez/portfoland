'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectForm } from './ProjectForm';
import type { Project } from '../types/project';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  portfolioMode?: PortfolioMode;
}

function ProjectModalComponent({ isOpen, onClose, project, portfolioMode = 'tech' }: ProjectModalProps) {
  const isTech = portfolioMode === 'tech';
  const isEdit = !!project;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/70 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative w-full max-w-2xl shadow-2xl mb-12',
              isTech
                ? 'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm'
                : 'bg-white border border-gray-200 rounded-xl'
            )}
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between px-6 py-4 border-b',
              isTech ? 'border-[hsl(174,100%,50%,0.1)]' : 'border-gray-200'
            )}>
              <h2 className={cn(
                'font-semibold',
                isTech ? 'font-mono text-foreground text-sm uppercase tracking-widest' : 'text-gray-900 text-base'
              )}>
                {isEdit ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  'p-1.5 transition-colors',
                  isTech
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-gray-400 hover:text-gray-700'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <ProjectForm
                project={project}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const ProjectModal = memo(ProjectModalComponent);
