/**
 * CVGeneratorView Component
 *
 * Main orchestrator for the CV Generator page.
 * Manages the flow: form -> generation -> preview -> analysis -> download.
 */

'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';
import { FileText, Download, Loader2, Sparkles, Plus, Upload, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import type { CVContent, CVDocumentModel } from '../types/cv';
import { generateCVAction } from '../actions/generateCV.action';
import { CVPreview } from './CVPreview';
import { CVAnalysisPanel } from './CVAnalysisPanel';
import { CVListSidebar } from './CVListSidebar';
import { CVImportPanel } from './CVImportPanel';
import { JobDescriptionInput } from './JobDescriptionInput';

// =============================================================================
// Types
// =============================================================================

interface CVGeneratorViewProps {
  portfolioMode: PortfolioMode;
  savedCVs: CVDocumentModel[];
  locale: string;
  userId: string;
}

type ViewState = 'idle' | 'generating' | 'previewing' | 'analyzing';

// =============================================================================
// Component
// =============================================================================

export function CVGeneratorView({
  portfolioMode,
  savedCVs: initialSavedCVs,
  locale,
}: CVGeneratorViewProps) {
  const mc = modeClasses(portfolioMode);

  // Form state
  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // CV state
  const [viewState, setViewState] = useState<ViewState>(
    initialSavedCVs.length > 0 ? 'idle' : 'idle',
  );
  const [currentCV, setCurrentCV] = useState<CVContent | null>(null);
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const [savedCVs, setSavedCVs] = useState<CVDocumentModel[]>(initialSavedCVs);

  // CV Import panel toggle
  const [showImport, setShowImport] = useState(false);

  // Transition for async actions
  const [isGenerating, startGenerateTransition] = useTransition();

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleGenerate = useCallback(() => {
    setViewState('generating');

    startGenerateTransition(async () => {
      const result = await generateCVAction({
        targetJob: targetJob.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
      });

      if (result.hasError) {
        toast.error(result.message);
        setViewState('idle');
        return;
      }

      const { cvId, cvContent, title } = result.payload;

      setCurrentCV(cvContent);
      setCurrentCVId(cvId);
      setViewState('previewing');
      toast.success('CV generated successfully');

      // Add to local saved list
      setSavedCVs((prev) => [
        {
          id: cvId,
          userId: '',
          title,
          targetJob: targetJob.trim() || null,
          jobDescription: jobDescription.trim() || null,
          content: cvContent,
          analysisResults: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ]);
    });
  }, [targetJob, jobDescription, startGenerateTransition]);

  const handleSelectCV = useCallback((cv: CVDocumentModel) => {
    setCurrentCV(cv.content);
    setCurrentCVId(cv.id);
    setTargetJob(cv.targetJob || '');
    setJobDescription(cv.jobDescription || '');
    setViewState('previewing');
  }, []);

  const handleDeletedCV = useCallback(
    (cvId: string) => {
      setSavedCVs((prev) => prev.filter((cv) => cv.id !== cvId));

      if (currentCVId === cvId) {
        setCurrentCV(null);
        setCurrentCVId(null);
        setViewState('idle');
      }
    },
    [currentCVId],
  );

  const handleDownload = useCallback(() => {
    if (!currentCVId) return;
    window.open(`/api/cv/${currentCVId}/pdf`, '_blank');
  }, [currentCVId]);

  const handleNewCV = useCallback(() => {
    setCurrentCV(null);
    setCurrentCVId(null);
    setTargetJob('');
    setJobDescription('');
    setViewState('idle');
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isPreviewing = viewState === 'previewing' || viewState === 'analyzing';

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      {/* Sidebar — saved CVs */}
      <div className="w-full lg:w-64 xl:w-72 shrink-0">
        <CVListSidebar
          savedCVs={savedCVs}
          selectedCVId={currentCVId}
          onSelectCV={handleSelectCV}
          onDeleted={handleDeletedCV}
          isTech={mc.isTech}
          cardClassName={mc.card}
          labelClassName={mc.label}
          subHeadingClassName={mc.subHeading}
          dangerButtonClassName={mc.dangerButton}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header with New CV button */}
        {isPreviewing && (
          <div className="flex items-center justify-between">
            <h2 className={mc.heading}>
              {mc.isTech ? '> CV_PREVIEW' : 'CV Preview'}
            </h2>
            <button
              type="button"
              onClick={handleNewCV}
              className={mc.primaryButton}
            >
              <Plus className="h-3.5 w-3.5" />
              {mc.isTech ? 'NEW_CV' : 'New CV'}
            </button>
          </div>
        )}

        {/* Generator form */}
        {!isPreviewing && (
          <div className={cn(mc.card, 'p-5')}>
            <h2 className={cn(mc.subHeading, 'mb-4')}>
              {mc.isTech ? '> GENERATE_CV' : 'Generate CV'}
            </h2>

            <div className="space-y-3">
              {/* Target job input */}
              <div>
                <label className={cn(mc.label, 'mb-1 block')}>
                  {mc.isTech ? '> TARGET_JOB (OPTIONAL)' : 'Target Job (optional)'}
                </label>
                <input
                  type="text"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  placeholder={
                    mc.isTech
                      ? 'e.g. Senior Frontend Developer'
                      : 'e.g. Senior Frontend Developer'
                  }
                  className={mc.input}
                  disabled={isGenerating}
                  aria-label="Target job title"
                />
              </div>

              {/* Job description textarea (collapsible) */}
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                inputClassName={mc.input}
                labelClassName={mc.label}
                isTech={mc.isTech}
              />

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn(mc.saveButton, 'w-full flex items-center justify-center gap-2')}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mc.isTech ? 'GENERATING...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {mc.isTech ? 'GENERATE_CV' : 'Generate CV'}
                  </>
                )}
              </button>
            </div>

            {/* Empty state hint */}
            {savedCVs.length === 0 && (
              <div
                className={cn(
                  'mt-4 flex items-center gap-2 p-3 rounded',
                  mc.isTech
                    ? 'bg-[hsl(174,100%,50%,0.05)] border border-[hsl(174,100%,50%,0.1)]'
                    : 'bg-blue-50 border border-blue-100',
                )}
              >
                <FileText
                  className={cn(
                    'h-5 w-5 shrink-0',
                    mc.isTech ? 'text-[#00D4FF]/60' : 'text-blue-400',
                  )}
                />
                <p
                  className={cn(
                    'text-xs',
                    mc.isTech ? 'font-mono text-gray-400' : 'text-gray-500',
                  )}
                >
                  {mc.isTech
                    ? 'Your portfolio data will be compiled into a professional CV. Add a target job to tailor it.'
                    : 'Generate your first CV from your portfolio data. Optionally add a target job to tailor it.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Import CV section — collapsible, shown when not previewing */}
        {!isPreviewing && (
          <div className={cn(mc.card)}>
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-2">
                <Upload className={cn('h-4 w-4', mc.isTech ? 'text-[#00D4FF]' : 'text-blue-500')} />
                <span className={cn(mc.subHeading)}>
                  {mc.isTech ? '> IMPORT_FROM_CV' : 'Import from existing CV'}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  mc.isTech ? 'text-gray-400' : 'text-gray-500',
                  showImport && 'rotate-180',
                )}
              />
            </button>
            {showImport && (
              <div className="px-5 pb-5">
                <p className={cn('text-xs mb-4', mc.label)}>
                  {mc.isTech
                    ? 'UPLOAD A PDF OR DOCX — AI WILL EXTRACT SKILLS, EXPERIENCES, AND PROJECTS INTO YOUR PORTFOLIO'
                    : 'Upload your PDF or DOCX CV and the AI will extract skills, experiences, and projects into your portfolio.'}
                </p>
                <CVImportPanel portfolioMode={portfolioMode} />
              </div>
            )}
          </div>
        )}

        {/* CV Preview */}
        {isPreviewing && currentCV && (
          <>
            <CVPreview
              cvContent={currentCV}
              isTech={mc.isTech}
              cardClassName={mc.card}
            />

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className={cn(mc.saveButton, 'flex items-center gap-2')}
              >
                <Download className="h-4 w-4" />
                {mc.isTech ? 'DOWNLOAD_PDF' : 'Download PDF'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewState((s) =>
                    s === 'analyzing' ? 'previewing' : 'analyzing',
                  )
                }
                className={cn(mc.cancelButton, 'flex items-center gap-2')}
              >
                <Sparkles className="h-4 w-4" />
                {mc.isTech ? 'ANALYZE' : 'Analyze CV'}
              </button>
            </div>
          </>
        )}

        {/* Analysis Panel */}
        {viewState === 'analyzing' && currentCVId && (
          <CVAnalysisPanel
            cvId={currentCVId}
            jobDescription={jobDescription}
            isTech={mc.isTech}
            cardClassName={mc.card}
            subHeadingClassName={mc.subHeading}
            labelClassName={mc.label}
          />
        )}
      </div>
    </div>
  );
}
