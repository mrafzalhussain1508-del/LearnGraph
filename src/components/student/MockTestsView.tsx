'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  ShieldAlert, 
  Layers, 
  BookOpen,
  Send,
  X,
  HelpCircle,
  Check
} from 'lucide-react';
import { MockTest, MockTestSubmission } from '@/lib/mockTestDb';
import { useAuth } from '@/context/AuthContext';

interface MockTestsViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export default function MockTestsView({ onNavigateTab }: MockTestsViewProps) {
  const { user } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // View mode: 'hub' | 'exam' | 'results'
  const [viewMode, setViewMode] = useState<'hub' | 'exam' | 'results'>('hub');
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [latestResult, setLatestResult] = useState<MockTestSubmission | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeSpentSecondsRef = useRef(0);

  // Load tests
  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const studentId = user?.id || 'st-01';
      const cohort = user?.grade && user?.section ? `${user.grade} • ${user.section}` : 'Grade 10 • Section A';
      const res = await fetch(`/api/mock-tests?cohort=${encodeURIComponent(cohort)}&studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTests(data.tests || []);
        }
      }
    } catch (err) {
      console.error('Failed to load mock tests for student:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [user]);

  // Start exam
  const handleStartExam = async (testId: string) => {
    try {
      const res = await fetch(`/api/mock-tests/${testId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.test) {
          setActiveTest(data.test);
          setActiveQuestionIndex(0);
          setAnswers({});
          const totalSecs = (data.test.durationMinutes || 15) * 60;
          setSecondsRemaining(totalSecs);
          timeSpentSecondsRef.current = 0;
          setIsTimerRunning(true);
          setViewMode('exam');
          setShowSubmitModal(false);
        }
      }
    } catch (err) {
      console.error('Failed to start exam:', err);
    }
  };

  // Timer interval
  useEffect(() => {
    if (isTimerRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        timeSpentSecondsRef.current += 1;
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            // Auto submit when time runs out
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, secondsRemaining]);

  // Handle submit exam
  const handleSubmitExam = async (isAuto = false) => {
    if (!activeTest) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/mock-tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id || 'st-02',
          studentName: user?.name || 'Lingjensthaibi',
          studentUsername: user?.username || 'lingjensthaibi',
          studentEmail: user?.email || 'lingjensthaibi@student.learngraph.edu',
          cohort: user?.grade && user?.section ? `${user.grade} • ${user.section}` : 'Grade 12 • Section A',
          answers,
          timeSpentSeconds: timeSpentSecondsRef.current,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submission) {
          setLatestResult(data.submission);
          setViewMode('results');
          setShowSubmitModal(false);
          // Refresh list in background
          fetchTests();
          // Notify teacher portal via event
          window.dispatchEvent(new Event('learngraph_mock_test_submitted'));
        }
      }
    } catch (err) {
      console.error('Failed to submit mock test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestionCount = activeTest?.questions?.length || 0;

  // Filtered tests for hub
  const filteredTests = tests.filter((t) => {
    if (filter === 'pending') return !t.hasSubmitted;
    if (filter === 'completed') return t.hasSubmitted;
    return true;
  });

  // Time formatter
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // 1. EXAM RUNNER MODE
  // -------------------------------------------------------------
  if (viewMode === 'exam' && activeTest) {
    const currentQ = activeTest.questions[activeQuestionIndex];
    const isUnderThreeMins = secondsRemaining < 180;
    const isUnderOneMin = secondsRemaining < 60;

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        {/* Sticky Exam Bar */}
        <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                {activeTest.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Question {activeQuestionIndex + 1} of {totalQuestionCount}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md mt-0.5">
              {activeTest.title}
            </h2>
          </div>

          {/* Live Timer & Submit */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                isUnderOneMin
                  ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 text-rose-600 dark:text-rose-400 animate-pulse'
                  : isUnderThreeMins
                  ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>Submit Test</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Exam Layout: Question Palette + Active Question */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left: Question Navigation Palette */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Question Palette
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {answeredCount}/{totalQuestionCount}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 gap-2">
              {activeTest.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === activeQuestionIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400 dark:ring-rose-500 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700"></span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Right: Active Question Card */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-6 shadow-sm flex flex-col justify-between min-h-[420px]">
            <div className="space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs border border-rose-200 dark:border-rose-900/40">
                  Question {activeQuestionIndex + 1}
                </span>
                <span className="text-xs text-slate-400">1 Mark</span>
              </div>

              {/* Question Prompt */}
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </p>

              {/* Options Grid */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center space-x-3.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 gap-2">
              <button
                type="button"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => {
                    const copy = { ...prev };
                    delete copy[currentQ.id];
                    return copy;
                  });
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear choice
              </button>

              {activeQuestionIndex < totalQuestionCount - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveQuestionIndex((prev) => Math.min(totalQuestionCount - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-sm"
                >
                  <span>Review & Finish</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Submit Mock Test?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You have answered <span className="font-bold text-rose-600 dark:text-rose-400">{answeredCount}</span> of{' '}
                  <span className="font-bold">{totalQuestionCount}</span> questions.
                </p>
              </div>

              {answeredCount < totalQuestionCount && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Warning: You have {totalQuestionCount - answeredCount} unanswered question(s). Unanswered questions will receive 0 marks.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitExam(false)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Evaluating...' : 'Yes, Submit Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. INSTANT EVALUATION & RESULTS REVIEW MODE
  // -------------------------------------------------------------
  if (viewMode === 'results' && latestResult) {
    const mins = Math.floor(latestResult.timeSpentSeconds / 60);
    const secs = latestResult.timeSpentSeconds % 60;
    const isMastered = latestResult.percentage >= 75;

    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
        {/* Scorecard Hero Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-emerald-500 to-indigo-500"></div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Diagnostic Scorecard</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {latestResult.testTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Performance synced directly to your instructor's Class Learning Map
            </p>
          </div>

          {/* Big Circular Metric */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${
                isMastered
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : latestResult.percentage >= 50
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}
            >
              <span className="text-3xl font-black">{latestResult.percentage}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isMastered ? 'Mastered' : 'Needs Review'}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {latestResult.score} / {latestResult.totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Taken</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {mins}m {secs}s
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Evaluation</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                Verified
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleStartExam(latestResult.testId)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('hub')}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Return to Mock Test Hub</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Answer Key & Conceptual Explanations
            </h3>
          </div>

          {latestResult.resultsBreakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                item.isCorrect
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {item.isCorrect ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-bold">• Question {idx + 1}</span>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
                {item.question}
              </p>

              {/* Student vs Correct Choice */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-semibold">Your Answer:</span>
                  <span className={item.isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                    Option {item.selectedOption >= 0 ? String.fromCharCode(65 + item.selectedOption) : 'None (Unanswered)'}
                  </span>
                </div>

                {!item.isCorrect && (
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold">Correct Answer:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Option {String.fromCharCode(65 + item.correctOption)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actionable Rule / Explanation */}
              {item.explanation && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-0.5">
                    💡 Educational Explanation:
                  </span>
                  {item.explanation}
                </div>
              )}

              {item.ruleToRemember && (
                <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-bold block mb-0.5">📌 Rule to Remember:</span>
                  {item.ruleToRemember}
                </div>
              )}

              {item.misconceptionWarning && !item.isCorrect && (
                <div className="mt-2 text-xs text-rose-800 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 flex items-start space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span>{item.misconceptionWarning}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. DEFAULT: MOCK TEST HUB DIRECTORY
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Diagnostic Testing Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Curriculum Mock Tests & Timed Mastery Checks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Take adaptive multiple choice tests assigned to {user?.section || 'Grade 10 • Section A'}. Includes live timers, instant evaluation, and misconception diagnosis.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            All ({tests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <Clock className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
          Loading assigned mock tests...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-2">
          <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p>No tests found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredTests.map((test) => {
            const hasSubmitted = test.hasSubmitted;
            const sub = test.studentSubmission;

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-rose-300 dark:hover:border-rose-900/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Subject and Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                      {test.subject}
                    </span>

                    {hasSubmitted ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed: {sub?.percentage}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Clock className="w-3 h-3" />
                        <span>Ready to Take</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {test.title}
                  </h3>

                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.questions.length} MCQs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pass: {test.passPercentage || 70}%</span>
                    </div>
                  </div>

                  {/* Assigned Cohort Note */}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Assigned to: <span className="font-medium text-slate-600 dark:text-slate-300">{test.targetCohort}</span>
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {hasSubmitted ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch(`/api/mock-tests/${test.id}/submissions`);
                          if (res.ok) {
                            const data = await res.json();
                            const mySub = data.submissions?.find((s: any) => s.studentId === (user?.id || 'st-01'));
                            if (mySub) {
                              setLatestResult(mySub);
                              setViewMode('results');
                            } else {
                              handleStartExam(test.id);
                            }
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Review Scorecard
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartExam(test.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartExam(test.id)}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <span>Start Timed Exam</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
