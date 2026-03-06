'use client';

/**
 * AssessmentModal Component
 *
 * Full quiz flow modal for AI skill assessments.
 *
 * State machine:
 *   idle → loading (on open) → in_progress (on success) → submitting → result
 *
 * Screens:
 *   - loading: initialising + calling startAssessment action
 *   - in_progress: 5-question quiz with segmented progress bar
 *   - confirm: review screen after Q5 before final submit
 *   - submitting: calling submitAnswers action
 *   - result: pass (green) or fail (red) with XP / retry / cooldown info
 *
 * Security: correctIndex is NEVER rendered to the DOM — questions are
 * answered by position label only ([A][B][C][D]).
 */

import { useState, useTransition, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/features/shadcn/ui/dialog';
import { cn } from '@/lib/utils';
import { startAssessmentAction } from '@/features/assessment/actions/startAssessment.action';
import { submitAnswersAction } from '@/features/assessment/actions/submitAnswers.action';
import { MAX_ATTEMPTS_BEFORE_COOLDOWN } from '@/features/assessment/constants/tokens';
import type {
  AssessmentModalProps,
  AssessmentState,
  QuestionForClient,
  ReviewItem,
  ScoreResult,
} from '@/features/assessment/types/assessment';

// =============================================================================
// Option labels
// =============================================================================

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// =============================================================================
// Sub-components
// =============================================================================

/** Collapsible review panel showing per-question explanations */
function ReviewPanel({ items }: { items: ReviewItem[] }) {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {items.map((item) => (
        <div
          key={item.questionIndex}
          className={cn(
            'p-3 border-l-2 text-xs font-mono space-y-1',
            item.isCorrect
              ? 'border-[#22C55E] bg-[#22C55E]/5'
              : 'border-red-500 bg-red-500/5',
          )}
        >
          <p className="text-gray-300 leading-relaxed">{item.questionText}</p>
          <div className="space-y-0.5 mt-1">
            {item.options.map((opt, i) => {
              const isCorrect = i === item.correctIndex;
              const isSelected = i === item.selectedIndex;
              return (
                <p
                  key={i}
                  className={cn(
                    isCorrect
                      ? 'text-[#22C55E]'
                      : isSelected
                        ? 'text-red-400 line-through'
                        : 'text-gray-600',
                  )}
                >
                  [{OPTION_LABELS[i]}] {opt}
                  {isCorrect && ' ✓'}
                  {!isCorrect && isSelected && ' ✗'}
                </p>
              );
            })}
          </div>
          {item.explanation && (
            <p className="text-gray-400 leading-relaxed border-t border-gray-800 pt-1 mt-1">
              {item.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Five-segment progress bar — filled segments in cyan, empty segments dark */
function ProgressBar({ filledCount }: { filledCount: number }) {
  return (
    <div className="flex gap-1 mb-4" role="progressbar" aria-valuenow={filledCount} aria-valuemin={0} aria-valuemax={5}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 transition-colors duration-200',
            i < filledCount
              ? 'bg-[#00D4FF]'
              : 'bg-[#0A0E1A] border border-[#00D4FF]/20',
          )}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * AssessmentModal — quiz flow dialog for AI skill assessments.
 *
 * Opens when triggered by AssessmentWidget. On close, all internal state
 * resets to 'idle' so subsequent opens start fresh.
 *
 * @param open - Controlled open state from parent
 * @param onOpenChange - Parent state setter (also handles close reset)
 * @param skillSlug - Slug used to start the assessment action
 * @param skillName - Human-readable name shown in the loading header
 * @param skillLevel - Numeric level passed to the action (1–5)
 * @param onPassComplete - Optional callback fired after user closes a pass result
 */
export function AssessmentModal({
  open,
  onOpenChange,
  skillSlug,
  skillName,
  onPassComplete,
}: AssessmentModalProps) {
  // ---------------------------------------------------------------------------
  // State machine
  // ---------------------------------------------------------------------------

  const [assessmentState, setAssessmentState] = useState<AssessmentState>('idle');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionForClient[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  /** Maps questionIndex → selectedOptionIndex */
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** True when the user has answered Q5 and hit "Next" — shows confirm screen */
  const [showConfirm, setShowConfirm] = useState(false);

  const [showReview, setShowReview] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ---------------------------------------------------------------------------
  // Reset helper
  // ---------------------------------------------------------------------------

  const resetState = useCallback(() => {
    setAssessmentState('idle');
    setAssessmentId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScoreResult(null);
    setErrorMessage(null);
    setShowConfirm(false);
    setShowReview(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Trigger startAssessment when the dialog opens
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    // Only initialise on a fresh open (idle state)
    if (assessmentState !== 'idle') return;

    setAssessmentState('loading');
    setErrorMessage(null);

    startTransition(async () => {
      const result = await startAssessmentAction({ skillSlug });

      if (result.hasError || !result.payload) {
        setErrorMessage(result.message ?? 'Failed to start assessment. Please try again.');
        // Remain in 'loading' screen but show error + Close button
        return;
      }

      setAssessmentId(result.payload.assessmentId);
      setQuestions(result.payload.questions);
      setAssessmentState('in_progress');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ---------------------------------------------------------------------------
  // Close handler — resets all state before calling parent onOpenChange
  // ---------------------------------------------------------------------------

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Small delay ensures animation completes before reset to avoid flicker
    setTimeout(resetState, 200);
  }, [onOpenChange, resetState]);

  // ---------------------------------------------------------------------------
  // Pass close handler — fires callback then closes
  // ---------------------------------------------------------------------------

  const handlePassClose = useCallback(() => {
    onPassComplete?.();
    handleClose();
  }, [onPassComplete, handleClose]);

  // ---------------------------------------------------------------------------
  // Answer selection
  // ---------------------------------------------------------------------------

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // ---------------------------------------------------------------------------
  // Navigation: Next button
  // ---------------------------------------------------------------------------

  const handleNext = () => {
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Q5 complete — show confirm screen
      setShowConfirm(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit answers
  // ---------------------------------------------------------------------------

  const handleSubmit = () => {
    if (!assessmentId) return;

    setAssessmentState('submitting');
    setShowConfirm(false);

    const answers = Object.entries(selectedAnswers).map(([qIndex, sIndex]) => ({
      questionIndex: Number(qIndex),
      selectedIndex: sIndex,
    }));

    startTransition(async () => {
      const result = await submitAnswersAction({ assessmentId, answers });

      if (result.hasError || !result.payload) {
        setErrorMessage(result.message ?? 'Failed to submit answers. Please try again.');
        setAssessmentState('in_progress');
        return;
      }

      setScoreResult(result.payload);
      setAssessmentState('result');
    });
  };

  // ---------------------------------------------------------------------------
  // Try Again — reset to idle so useEffect re-triggers startAssessment
  // ---------------------------------------------------------------------------

  const handleTryAgain = () => {
    resetState();
    // After reset, assessmentState = 'idle'; the useEffect will fire again
    // because open is still true and state returned to idle.
    setAssessmentState('loading');
    setErrorMessage(null);

    startTransition(async () => {
      const result = await startAssessmentAction({ skillSlug });

      if (result.hasError || !result.payload) {
        setErrorMessage(result.message ?? 'Failed to start assessment. Please try again.');
        return;
      }

      setAssessmentId(result.payload.assessmentId);
      setQuestions(result.payload.questions);
      setAssessmentState('in_progress');
    });
  };

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const selectedForCurrent = selectedAnswers[currentQuestionIndex] ?? null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const hasCooldown = scoreResult?.cooldownEndsAt != null;
  const attemptsLeft =
    scoreResult != null
      ? MAX_ATTEMPTS_BEFORE_COOLDOWN - scoreResult.attemptsUsed
      : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent
        className={cn(
          'bg-[#0A0E1A] border border-[#00D4FF]/30 font-mono',
          'max-w-lg w-full',
        )}
        showCloseButton={false}
      >
        {/* ------------------------------------------------------------------ */}
        {/* LOADING SCREEN                                                       */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'loading' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [ASSESSMENT_MODULE]
              </DialogTitle>
            </DialogHeader>

            {errorMessage ? (
              /* Error within loading — show message + Close */
              <div className="space-y-4">
                <p className="font-mono text-xs text-red-400 leading-relaxed">
                  {errorMessage}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full font-mono text-xs py-2 border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                >
                  [ CLOSE ]
                </button>
              </div>
            ) : (
              /* Normal loading state */
              <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
                <p className="font-mono text-sm text-gray-300 text-center">
                  [INITIALIZING]: Generating assessment for{' '}
                  <span className="text-[#00D4FF]">{skillName}</span>...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* IN-PROGRESS SCREEN                                                   */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'in_progress' && !showConfirm && currentQuestion && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [ASSESSMENT]: {skillName}
              </DialogTitle>
            </DialogHeader>

            {/* Progress bar */}
            <ProgressBar filledCount={currentQuestionIndex} />

            {/* Question counter */}
            <p className="font-mono text-xs text-muted-foreground">
              [Q {currentQuestionIndex + 1}/5]
            </p>

            {/* Question text */}
            <p className="font-mono text-sm text-white leading-relaxed">
              <span className="text-[#00D4FF] mr-2">&gt;</span>
              {currentQuestion.questionText}
            </p>

            {/* Answer options */}
            <div className="space-y-2" role="radiogroup" aria-label="Answer options">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedForCurrent === i;
                return (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectAnswer(i)}
                    className={cn(
                      'w-full text-left px-3 py-2 font-mono text-sm transition-all duration-150',
                      'border',
                      isSelected
                        ? 'border-l-4 border-[#00D4FF] bg-[#00D4FF]/10 text-white'
                        : 'border-[#00D4FF]/20 text-gray-300 hover:bg-[#00D4FF]/10 hover:border-l-2 hover:border-[#00D4FF]',
                    )}
                  >
                    <span className="text-[#00D4FF] mr-2">[{OPTION_LABELS[i]}]</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Error message (inline, non-blocking) */}
            {errorMessage && (
              <p className="font-mono text-xs text-red-400">{errorMessage}</p>
            )}

            {/* Action row */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleClose}
                className="font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                [ ABORT ]
              </button>
              <button
                onClick={handleNext}
                disabled={selectedForCurrent === null}
                className={cn(
                  'font-mono text-xs py-2 px-4 border transition-colors',
                  selectedForCurrent !== null
                    ? 'border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10'
                    : 'border-gray-800 text-gray-700 cursor-not-allowed',
                )}
              >
                {currentQuestionIndex < 4 ? '[ NEXT ]' : '[ FINISH ]'}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CONFIRM SCREEN (after Q5, before submit)                             */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'in_progress' && showConfirm && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [CONFIRM_SUBMIT]
              </DialogTitle>
            </DialogHeader>

            <ProgressBar filledCount={5} />

            <p className="font-mono text-sm text-gray-300">
              Ready to submit? You answered{' '}
              <span className="text-[#00D4FF]">{answeredCount}/5</span> questions.
            </p>

            {errorMessage && (
              <p className="font-mono text-xs text-red-400">{errorMessage}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 font-mono text-xs py-2 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
              >
                [ REVIEW ANSWERS ]
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 font-mono text-xs py-2 border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
              >
                [ CONFIRM &amp; SUBMIT ]
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUBMITTING SCREEN                                                    */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'submitting' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [EVALUATING]
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
              <p className="font-mono text-sm text-gray-300">
                [PROCESSING]: Scoring your answers...
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RESULT SCREEN — PASS                                                 */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'result' && scoreResult?.passed && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [RESULT]
              </DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-3 py-4">
              {/* Pass label */}
              <p className="font-mono text-2xl text-[#22C55E] font-bold tracking-widest">
                [PASS]
              </p>

              {/* Score */}
              <p className="font-mono text-lg text-[#22C55E]">
                {scoreResult.score}/100
              </p>

              {/* XP award — fades in */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="font-mono text-sm text-[#00D4FF] tracking-widest">
                  +200 XP AWARDED
                </p>
              </motion.div>

              {/* Validated flag */}
              <p className="font-mono text-xs text-gray-500 mt-2">
                [SKILL_VALIDATED]: aiAssessmentValidated: true
              </p>
            </div>

            {/* Review toggle */}
            {scoreResult.reviewItems.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowReview((v) => !v)}
                  className="w-full font-mono text-xs py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
                >
                  {showReview ? '[ HIDE REVIEW ]' : '[ REVIEW ANSWERS ]'}
                </button>
                {showReview && <ReviewPanel items={scoreResult.reviewItems} />}
              </div>
            )}

            <button
              onClick={handlePassClose}
              className="w-full font-mono text-xs py-2 border border-[#22C55E]/40 text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
            >
              [ CLOSE ]
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RESULT SCREEN — FAIL                                                 */}
        {/* ------------------------------------------------------------------ */}
        {assessmentState === 'result' && scoreResult && !scoreResult.passed && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#00D4FF] text-sm tracking-wider">
                [RESULT]
              </DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-3 py-4">
              {/* Fail label */}
              <p className="font-mono text-2xl text-red-500 font-bold tracking-widest">
                [FAIL]
              </p>

              {/* Score */}
              <p className="font-mono text-lg text-red-400">
                {scoreResult.score}/100
              </p>

              {/* Correct count */}
              <p className="font-mono text-sm text-gray-400">
                Correct: {scoreResult.correctCount}/5
              </p>

              {/* Attempts info */}
              <p className="font-mono text-xs text-gray-500">
                Attempts used: {scoreResult.attemptsUsed} / {MAX_ATTEMPTS_BEFORE_COOLDOWN}
              </p>

              {/* Cooldown message */}
              {hasCooldown && scoreResult.cooldownEndsAt && (
                <p className="font-mono text-xs text-red-400 mt-1">
                  Next attempt available:{' '}
                  {new Date(scoreResult.cooldownEndsAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Review toggle */}
            {scoreResult.reviewItems.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowReview((v) => !v)}
                  className="w-full font-mono text-xs py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
                >
                  {showReview ? '[ HIDE REVIEW ]' : '[ REVIEW ANSWERS ]'}
                </button>
                {showReview && <ReviewPanel items={scoreResult.reviewItems} />}
              </div>
            )}

            {/* CTA buttons */}
            {!hasCooldown && attemptsLeft > 0 ? (
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 font-mono text-xs py-2 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
                >
                  [ CLOSE ]
                </button>
                <button
                  onClick={handleTryAgain}
                  disabled={isPending}
                  className="flex-1 font-mono text-xs py-2 border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? '[ LOADING... ]' : '[ TRY AGAIN ]'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleClose}
                className="w-full font-mono text-xs py-2 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
              >
                [ CLOSE ]
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
