/**
 * CVAnalysisPanel Component
 *
 * Shows 6 analysis type cards with the ability to run each analysis.
 * Displays results with severity badges, issues, impact, and fix suggestions.
 */

'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Target,
  TrendingUp,
  Search,
  AlertTriangle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeCVAction } from '../actions/analyzeCV.action';
import { CV_ANALYSIS_LABELS } from '../constants/prompts';
import type { CVAnalysisType, CVAnalysisResult } from '../types/cv';

interface CVAnalysisPanelProps {
  cvId: string;
  jobDescription: string;
  isTech: boolean;
  cardClassName: string;
  subHeadingClassName: string;
  labelClassName: string;
}

const ANALYSIS_ICONS: Record<CVAnalysisType, typeof Shield> = {
  reality_check: Shield,
  ats_optimization: Target,
  impact_improvement: TrendingUp,
  keyword_gap: Search,
  weakness_detection: AlertTriangle,
  differentiation: Sparkles,
};

const SEVERITY_STYLES = {
  critical: {
    tech: 'bg-red-500/20 text-red-400 border-red-500/30',
    classic: 'bg-red-50 text-red-700 border-red-200',
  },
  warning: {
    tech: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    classic: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  info: {
    tech: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    classic: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export function CVAnalysisPanel({
  cvId,
  jobDescription,
  isTech,
  cardClassName,
  subHeadingClassName,
  labelClassName,
}: CVAnalysisPanelProps) {
  const [results, setResults] = useState<Partial<Record<CVAnalysisType, CVAnalysisResult>>>({});
  const [loadingType, setLoadingType] = useState<CVAnalysisType | null>(null);
  const [expandedType, setExpandedType] = useState<CVAnalysisType | null>(null);
  const [isPending, startTransition] = useTransition();

  const analysisTypes = Object.keys(CV_ANALYSIS_LABELS) as CVAnalysisType[];

  function handleRunAnalysis(type: CVAnalysisType) {
    setLoadingType(type);

    startTransition(async () => {
      const result = await analyzeCVAction({
        cvId,
        analysisType: type,
        jobDescription: jobDescription || undefined,
      });

      setLoadingType(null);

      if (result.hasError) {
        toast.error(result.message);
        return;
      }

      setResults((prev) => ({ ...prev, [type]: result.payload }));
      setExpandedType(type);
      toast.success('Analysis complete');
    });
  }

  function toggleExpanded(type: CVAnalysisType) {
    setExpandedType((prev) => (prev === type ? null : type));
  }

  const mode = isTech ? 'tech' : 'classic';

  return (
    <div className={cn(cardClassName, 'p-4')}>
      <h3 className={cn(subHeadingClassName, 'mb-3')}>
        {isTech ? '> CV_ANALYSIS' : 'CV Analysis'}
      </h3>

      <div className="space-y-2">
        {analysisTypes.map((type) => {
          const label = CV_ANALYSIS_LABELS[type];
          const Icon = ANALYSIS_ICONS[type];
          const isLoading = loadingType === type && isPending;
          const hasResult = !!results[type];
          const isExpanded = expandedType === type;
          const isDisabled =
            label.requiresJobDescription && !jobDescription.trim();

          return (
            <div key={type}>
              {/* Analysis card button */}
              <button
                type="button"
                onClick={() =>
                  hasResult ? toggleExpanded(type) : handleRunAnalysis(type)
                }
                disabled={isDisabled || isLoading}
                className={cn(
                  'w-full text-left p-3 rounded transition-colors',
                  isTech
                    ? cn(
                        'border border-[hsl(174,100%,50%,0.1)] hover:border-[hsl(174,100%,50%,0.3)]',
                        isDisabled && 'opacity-40 cursor-not-allowed hover:border-[hsl(174,100%,50%,0.1)]',
                        hasResult && 'border-[hsl(174,100%,50%,0.25)]',
                      )
                    : cn(
                        'border border-gray-200 hover:border-blue-300',
                        isDisabled && 'opacity-40 cursor-not-allowed hover:border-gray-200',
                        hasResult && 'border-blue-200 bg-blue-50/50',
                      ),
                )}
                aria-label={label.name.en}
                aria-expanded={hasResult ? isExpanded : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isLoading ? (
                      <Loader2
                        className={cn(
                          'h-4 w-4 shrink-0 animate-spin',
                          isTech ? 'text-[#00D4FF]' : 'text-blue-500',
                        )}
                      />
                    ) : (
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isTech ? 'text-[#00D4FF]' : 'text-blue-500',
                        )}
                      />
                    )}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                        )}
                      >
                        {label.name.en}
                      </p>
                      <p className={cn(labelClassName, 'text-[11px] truncate')}>
                        {label.description.en}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isDisabled && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          isTech
                            ? 'font-mono bg-[hsl(200,30%,12%)] text-gray-500'
                            : 'bg-gray-100 text-gray-400',
                        )}
                      >
                        Needs JD
                      </span>
                    )}
                    {hasResult && (
                      <>
                        {results[type]?.score !== undefined && (
                          <span
                            className={cn(
                              'text-[11px] font-bold px-1.5 py-0.5 rounded',
                              isTech
                                ? 'font-mono bg-[hsl(174,100%,50%,0.1)] text-[#00D4FF]'
                                : 'bg-blue-100 text-blue-700',
                            )}
                          >
                            {results[type]!.score}%
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded results */}
              {hasResult && isExpanded && results[type] && (
                <div
                  className={cn(
                    'mt-1 p-3 rounded space-y-3',
                    isTech
                      ? 'bg-[hsl(200,30%,6%)] border border-[hsl(174,100%,50%,0.1)]'
                      : 'bg-gray-50 border border-gray-200',
                  )}
                >
                  {/* Issues */}
                  {results[type]!.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-2.5 rounded border',
                        SEVERITY_STYLES[issue.severity][mode],
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                            SEVERITY_STYLES[issue.severity][mode],
                          )}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-sm mb-1',
                          isTech ? 'font-mono text-gray-200' : 'text-gray-800',
                        )}
                      >
                        {issue.issue}
                      </p>
                      <p
                        className={cn(
                          'text-xs mb-1.5',
                          isTech ? 'font-mono text-gray-400' : 'text-gray-500',
                        )}
                      >
                        <span className="font-medium">Impact:</span>{' '}
                        {issue.impact}
                      </p>
                      <p
                        className={cn(
                          'text-xs',
                          isTech
                            ? 'font-mono text-[hsl(150,100%,55%)]'
                            : 'text-green-700',
                        )}
                      >
                        <span className="font-medium">Fix:</span> {issue.fix}
                      </p>
                    </div>
                  ))}

                  {/* Keywords (for ATS and keyword gap) */}
                  {results[type]!.keywords &&
                    results[type]!.keywords!.length > 0 && (
                      <div>
                        <p
                          className={cn(
                            'text-xs font-medium mb-1.5',
                            isTech ? 'font-mono text-gray-400' : 'text-gray-500',
                          )}
                        >
                          Keywords:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {results[type]!.keywords!.map((kw, i) => (
                            <span
                              key={i}
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded border',
                                kw.found
                                  ? isTech
                                    ? 'bg-[hsl(150,100%,45%,0.1)] text-[hsl(150,100%,55%)] border-[hsl(150,100%,45%,0.3)]'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                  : isTech
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-red-50 text-red-600 border-red-200',
                              )}
                            >
                              {kw.keyword}
                              {!kw.found && ' (missing)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
