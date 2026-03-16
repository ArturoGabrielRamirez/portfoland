'use client';

import { useState } from 'react';
import { Mic, ChevronRight, Check, AlertCircle, Star, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface InterviewQuestion {
  id: number;
  type: 'behavioral' | 'technical' | 'situational';
  question: string;
  hint: string;
}

interface QuestionEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  idealElements: string;
  verdict: 'strong' | 'good' | 'needs_work';
}

interface AnsweredQuestion {
  question: InterviewQuestion;
  answer: string;
  evaluation: QuestionEvaluation | null;
}

interface InterviewSimulatorProps {
  targetJob?: string;
  isTech: boolean;
  cardClassName: string;
  subHeadingClassName: string;
  labelClassName: string;
}

// =============================================================================
// Helpers
// =============================================================================

const TYPE_BADGE: Record<string, string> = {
  behavioral: 'BEHAVIORAL',
  technical: 'TECHNICAL',
  situational: 'SITUATIONAL',
};

const VERDICT_COLOR = {
  strong: 'text-green-500',
  good: 'text-yellow-500',
  needs_work: 'text-red-400',
};

const VERDICT_LABEL = {
  strong: 'Strong answer',
  good: 'Good answer',
  needs_work: 'Needs improvement',
};

// =============================================================================
// Component
// =============================================================================

export function InterviewSimulator({
  targetJob,
  isTech,
  cardClassName,
  subHeadingClassName,
  labelClassName,
}: InterviewSimulatorProps) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'answering' | 'done'>('idle');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentIndex] ?? null;
  const totalScore = answered.length > 0
    ? Math.round(answered.reduce((sum, a) => sum + (a.evaluation?.score ?? 0), 0) / answered.length)
    : 0;

  async function handleStartInterview() {
    setPhase('loading');
    setError('');
    setAnswered([]);
    setCurrentIndex(0);
    setCurrentAnswer('');

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', targetJob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
      setQuestions(data.questions);
      setPhase('answering');
    } catch (err: any) {
      setError(err.message);
      setPhase('idle');
    }
  }

  async function handleSubmitAnswer() {
    if (!currentQuestion || !currentAnswer.trim()) return;
    setIsEvaluating(true);
    setError('');

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          question: currentQuestion.question,
          answer: currentAnswer.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate answer');

      const answeredQuestion: AnsweredQuestion = {
        question: currentQuestion,
        answer: currentAnswer.trim(),
        evaluation: data.evaluation,
      };

      const newAnswered = [...answered, answeredQuestion];
      setAnswered(newAnswered);
      setCurrentAnswer('');

      if (currentIndex + 1 >= questions.length) {
        setPhase('done');
      } else {
        setCurrentIndex(i => i + 1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleReset() {
    setPhase('idle');
    setQuestions([]);
    setAnswered([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setError('');
  }

  // ---------------------------------------------------------------------------
  // Idle state
  // ---------------------------------------------------------------------------
  if (phase === 'idle') {
    return (
      <div className={cn(cardClassName, 'p-5 space-y-3')}>
        <div className="flex items-center gap-2">
          <Mic className={cn('w-4 h-4', isTech ? 'text-[hsl(174,100%,50%)]' : 'text-blue-600')} />
          <h3 className={subHeadingClassName}>
            {isTech ? '> INTERVIEW_PREP' : 'Interview Prep'}
          </h3>
        </div>
        <p className={cn(labelClassName, 'text-xs')}>
          {isTech
            ? '> AI generates 5 personalized questions (behavioral + technical + situational) with instant feedback.'
            : 'Practice with 5 AI-generated questions tailored to your portfolio. Get instant feedback on each answer.'}
        </p>
        {error && (
          <p className={cn('text-xs', isTech ? 'font-mono text-red-400' : 'text-red-500')}>
            {isTech ? `> ERR: ${error}` : error}
          </p>
        )}
        <button
          type="button"
          onClick={handleStartInterview}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
            isTech
              ? 'font-mono text-xs bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-bold hover:shadow-[0_0_10px_hsl(174_100%_50%_/_0.4)]'
              : 'bg-blue-600 text-white rounded-md hover:bg-blue-700'
          )}
        >
          <Mic className="w-3.5 h-3.5" />
          {isTech ? 'START_INTERVIEW' : 'Start Interview'}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (phase === 'loading') {
    return (
      <div className={cn(cardClassName, 'p-5 flex items-center gap-3')}>
        <Loader2 className={cn('w-4 h-4 animate-spin', isTech ? 'text-[hsl(174,100%,50%)]' : 'text-blue-600')} />
        <p className={cn(labelClassName, 'text-xs')}>
          {isTech ? '> GENERATING_QUESTIONS...' : 'Generating your personalized questions...'}
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Answering state
  // ---------------------------------------------------------------------------
  if (phase === 'answering' && currentQuestion) {
    const typeBadge = TYPE_BADGE[currentQuestion.type] ?? currentQuestion.type.toUpperCase();

    return (
      <div className={cn(cardClassName, 'p-5 space-y-4')}>
        {/* Progress */}
        <div className="flex items-center justify-between">
          <h3 className={subHeadingClassName}>
            {isTech ? '> INTERVIEW_PREP' : 'Interview Prep'}
          </h3>
          <span className={cn('text-xs', isTech ? 'font-mono text-muted-foreground' : 'text-gray-400')}>
            {isTech
              ? `Q${currentIndex + 1}/${questions.length}`
              : `Question ${currentIndex + 1} of ${questions.length}`}
          </span>
        </div>

        {/* Progress bar */}
        <div className={cn('h-1 w-full rounded-full', isTech ? 'bg-[hsl(200,30%,12%)]' : 'bg-gray-100')}>
          <div
            className={cn('h-full rounded-full transition-all', isTech ? 'bg-[hsl(174,100%,50%)]' : 'bg-blue-600')}
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className={cn(
          'p-4 space-y-2',
          isTech
            ? 'border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)]'
            : 'border border-gray-200 bg-gray-50 rounded-md'
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-wider',
              isTech
                ? 'bg-[hsl(174,100%,50%,0.15)] text-[hsl(174,100%,50%)]'
                : currentQuestion.type === 'behavioral'
                  ? 'bg-purple-100 text-purple-700 rounded'
                  : currentQuestion.type === 'technical'
                    ? 'bg-blue-100 text-blue-700 rounded'
                    : 'bg-orange-100 text-orange-700 rounded'
            )}>
              {typeBadge}
            </span>
          </div>
          <p className={cn('text-sm font-medium', isTech ? 'text-white font-mono' : 'text-gray-900')}>
            {currentQuestion.question}
          </p>
          <p className={cn('text-xs italic', isTech ? 'font-mono text-gray-500' : 'text-gray-400')}>
            💡 {currentQuestion.hint}
          </p>
        </div>

        {/* Answer textarea */}
        <textarea
          value={currentAnswer}
          onChange={e => setCurrentAnswer(e.target.value)}
          rows={5}
          placeholder={isTech ? '> Type your answer here...' : 'Type your answer here...'}
          className={cn(
            'w-full resize-none text-sm outline-none p-3',
            isTech
              ? 'bg-[hsl(200,30%,4%)] border border-[hsl(174,100%,50%,0.2)] font-mono text-gray-200 placeholder:text-gray-600'
              : 'bg-white border border-gray-200 rounded-md text-gray-800 placeholder:text-gray-400'
          )}
          disabled={isEvaluating}
        />

        {error && (
          <p className={cn('text-xs', isTech ? 'font-mono text-red-400' : 'text-red-500')}>
            {isTech ? `> ERR: ${error}` : error}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !currentAnswer.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
              isTech
                ? 'font-mono text-xs bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-bold'
                : 'bg-blue-600 text-white rounded-md hover:bg-blue-700'
            )}
          >
            {isEvaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            {isEvaluating
              ? (isTech ? 'EVALUATING...' : 'Evaluating...')
              : currentIndex + 1 === questions.length
                ? (isTech ? 'FINISH' : 'Finish')
                : (isTech ? 'NEXT_QUESTION' : 'Next Question')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
              isTech
                ? 'font-mono text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <RotateCcw className="w-3 h-3" />
            {isTech ? 'RESTART' : 'Restart'}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Done state — show all answers + evaluations + final score
  // ---------------------------------------------------------------------------
  if (phase === 'done') {
    const verdictCount = { strong: 0, good: 0, needs_work: 0 };
    answered.forEach(a => {
      if (a.evaluation?.verdict) verdictCount[a.evaluation.verdict]++;
    });

    return (
      <div className={cn(cardClassName, 'p-5 space-y-4')}>
        {/* Score summary */}
        <div className="flex items-center justify-between">
          <h3 className={subHeadingClassName}>
            {isTech ? '> INTERVIEW_COMPLETE' : 'Interview Complete'}
          </h3>
          <div className="flex items-center gap-1.5">
            <Star className={cn('w-4 h-4', isTech ? 'text-[hsl(174,100%,50%)]' : 'text-yellow-500')} />
            <span className={cn('text-sm font-bold', isTech ? 'font-mono text-white' : 'text-gray-900')}>
              {totalScore}/10
            </span>
          </div>
        </div>

        <div className="flex gap-3 text-xs">
          <span className={cn(isTech ? 'font-mono text-green-400' : 'text-green-600')}>
            {verdictCount.strong} strong
          </span>
          <span className={cn(isTech ? 'font-mono text-yellow-400' : 'text-yellow-600')}>
            {verdictCount.good} good
          </span>
          <span className={cn(isTech ? 'font-mono text-red-400' : 'text-red-500')}>
            {verdictCount.needs_work} need work
          </span>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {answered.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 space-y-2',
                isTech
                  ? 'border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,4%)]'
                  : 'border border-gray-200 bg-gray-50 rounded-md'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-xs font-medium', isTech ? 'font-mono text-gray-300' : 'text-gray-700')}>
                  Q{idx + 1}: {item.question.question}
                </p>
                {item.evaluation && (
                  <span className={cn(
                    'text-xs font-mono font-bold flex-shrink-0',
                    VERDICT_COLOR[item.evaluation.verdict]
                  )}>
                    {item.evaluation.score}/10
                  </span>
                )}
              </div>
              {item.evaluation && (
                <div className="space-y-1">
                  {item.evaluation.strengths.length > 0 && (
                    <div className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className={cn('text-[11px]', isTech ? 'font-mono text-green-400' : 'text-green-700')}>
                        {item.evaluation.strengths.join(' · ')}
                      </p>
                    </div>
                  )}
                  {item.evaluation.improvements.length > 0 && (
                    <div className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className={cn('text-[11px]', isTech ? 'font-mono text-gray-400' : 'text-gray-600')}>
                        {item.evaluation.improvements.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
            isTech
              ? 'font-mono text-xs border border-[hsl(174,100%,50%,0.3)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.08)]'
              : 'border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100'
          )}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isTech ? 'NEW_INTERVIEW' : 'Start New Interview'}
        </button>
      </div>
    );
  }

  return null;
}
