'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Printer, 
  BookOpen, 
  Award, 
  Check, 
  HelpCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { MockTestQuestion } from '@/app/api/generate-mock-test/route';

const MATH_TERMS_REGEX = /(transposing|transposed|transpose|signs?|slope|y-intercept|x-intercept|intercepts?|horizontal translation|vertical translation|translations?|reflections?|transformations?|quadratic formula|quadratic equations?|quadratics?|roots?|domains?|ranges?|denominators?|numerators?|parentheses|ghost parentheses|fractions?|inequalit(?:y|ies)|substitut(?:e|ion|ed)|coefficients?|negative signs?|negatives?|positives?|radicals?|square roots?|exponents?|factoring|factors?|formulas?|coordinates?|derivatives?|variables?|discriminant|f\([^\)]+\)|b\^2\s*-\s*4ac|-\s*b|b²\s*-\s*4ac|vertex|zero product property)/gi;

function renderHighlightedMath(text: string) {
  if (!text) return null;
  const parts = text.split(MATH_TERMS_REGEX);
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        const isMatch = idx % 2 === 1 || MATH_TERMS_REGEX.test(part);
        MATH_TERMS_REGEX.lastIndex = 0;
        if (isMatch) {
          return (
            <span
              key={idx}
              className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-950 dark:text-yellow-200 font-bold px-1.5 py-0.5 rounded mx-0.5 inline-block border border-yellow-300/80 dark:border-yellow-700/60 shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

interface MasteryCheckpointModalProps {
  isOpen?: boolean;
  onClose: () => void;
  topicName: string;
  studentName?: string;
  onMasteryCleared?: (topicName: string) => void;
  onMasteryAchieved?: (topicName: string) => void;
}

export default function MasteryCheckpointModal({
  isOpen = true,
  onClose,
  topicName,
  studentName = 'Lingjensthaibi',
  onMasteryCleared,
  onMasteryAchieved,
}: MasteryCheckpointModalProps) {
  const [questions, setQuestions] = useState<MockTestQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch adaptive mock test questions on modal open
  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setCurrentStep(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      return;
    }

    let isMounted = true;
    async function loadTest() {
      setIsLoading(true);
      setApiError(null);
      try {
        const res = await fetch('/api/generate-mock-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topicName, studentName }),
        });

        const data = await res.json();
        if (isMounted) {
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          } else {
            throw new Error('No questions returned');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load mock test:', err);
          setApiError('Unable to generate AI checkpoint test right now. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTest();

    return () => {
      isMounted = false;
    };
  }, [isOpen, topicName, studentName]);

  if (!isOpen) return null;

  const currentQ = questions[currentStep];
  const totalQuestions = questions.length;
  const isLastQuestion = currentStep === totalQuestions - 1;
  const hasAnsweredCurrent = selectedAnswers[currentStep] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentStep]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Calculate score
    const correctCount = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correct_index ? 1 : 0);
    }, 0);

    // If student passed (at least 2/3 or 3/3), trigger mastery cleared
    if (correctCount >= 2) {
      if (onMasteryCleared) onMasteryCleared(topicName);
      if (onMasteryAchieved) onMasteryAchieved(topicName);
    }
  };

  const handlePrintNotebook = () => {
    window.print();
  };

  // Calculate final score
  const correctAnswersCount = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correct_index ? 1 : 0);
  }, 0);
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
  const isMastered = scorePercentage >= 66;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 print:p-0 print:static print:bg-white">
      {/* Quiz Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  Adaptive Mastery Checkpoint
                </span>
                <span className="text-xs text-slate-300">• 3 Quick Checks</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {topicName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 print:p-0">
          
          {/* Loading State */}
          {/* Loading State */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Generating Adaptive Checkpoint...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Gemini is constructing 3 tailored diagnostic questions targeting common misconceptions in {topicName}.
                </p>
              </div>
            </div>
          )}

          {/* API Error State */}
          {!isLoading && apiError && (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
              <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold">{apiError}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-slate-700"
              >
                Close Checkpoint
              </button>
            </div>
          )}

          {/* STEP-BY-STEP QUIZ STATE */}
          {!isLoading && !isSubmitted && currentQ && (
            <div className="space-y-6 animate-fadeIn">
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Question {currentStep + 1} of {totalQuestions}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {Math.round(((currentStep + 1) / totalQuestions) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Statement Box */}
              <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                  <HelpCircle className="w-3 h-3" />
                  <span>Checkpoint Task</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select the best solution:
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((optionText, optIdx) => {
                    const isSelected = selectedAnswers[currentStep] === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs sm:text-sm font-medium ${
                            isSelected ? 'text-indigo-950 dark:text-indigo-200 font-bold' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {optionText}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!hasAnsweredCurrent}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Submit Test</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasAnsweredCurrent}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DIAGNOSTIC RESULTS & NOTEBOOK VIEW */}
          {!isLoading && isSubmitted && (
            <div className="space-y-8 animate-fadeIn" id="printable-notebook-area">
              
              {/* Score & Mastery Header */}
              <div className={`p-6 rounded-3xl border text-center space-y-3 ${
                isMastered
                  ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-amber-200 dark:border-amber-800/60'
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md ${
                  isMastered
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-amber-500 text-white shadow-amber-500/20'
                }`}>
                  {isMastered ? <Award className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    isMastered
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}>
                    {isMastered ? 'Concept Mastery Verified' : 'Remediation Review Required'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {correctAnswersCount} / {totalQuestions} Correct ({scorePercentage}%)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    {isMastered
                      ? `Outstanding! You have cleared your cognitive misconceptions in ${topicName}. Your diagnostic learning graph has been updated.`
                      : `You demonstrated partial grasp in ${topicName}. Review the highlighted diagnostic prescriptions below before re-taking.`}
                  </p>
                </div>

                {/* Print & Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
                  <button
                    onClick={handlePrintNotebook}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download as Notebook PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      setSelectedAnswers({});
                      setIsSubmitted(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Retake Test</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Return to Study Guide
                  </button>
                </div>
              </div>

              {/* Physical-Style Lined Notebook Paper Layout */}
              <div
                className="bg-[#fcfbf7] dark:bg-slate-900 rounded-3xl border-2 border-[#e6dfd1] dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 relative print:border-none print:p-4 print:bg-white print:shadow-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(210, 220, 235, 0.45) 28px)',
                  backgroundSize: '100% 28px'
                }}
              >
                {/* Visual Left Red Margin Line */}
                <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-[2px] bg-red-400/80 pointer-events-none print:block print:left-8"></div>

                {/* Notebook Header */}
                <div className="sm:pl-8 border-b-2 border-[#ded4c3] dark:border-slate-800 pb-4 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>STUDENT NOTEBOOK: {studentName}</span>
                    <span>DATE: {new Date().toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Diagnostic Concept Cleared: {topicName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Handwritten-style revision notes & cognitive fallacies diagnosed by LearnGraph AI
                  </p>
                </div>

                {/* Question-by-Question Review with Red Headers & Yellow Highlights */}
                <div className="sm:pl-8 space-y-6">
                  {questions.map((q, idx) => {
                    const studentChoice = selectedAnswers[idx];
                    const isCorrect = studentChoice === q.correct_index;

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border space-y-4 ${
                          isCorrect
                            ? 'bg-white dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-[#fffaf9] dark:bg-slate-800/80 border-rose-200 dark:border-rose-900/50 ring-1 ring-rose-500/10'
                        }`}
                      >
                        {/* Status Line */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Check #{idx + 1}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1 ${
                              isCorrect
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Mastered</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                <span>Cognitive Fallacy Diagnosed</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Question Text */}
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {q.question}
                        </p>

                        {/* Selected vs Correct Option */}
                        <div className="text-xs space-y-1 bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                          <p className={`flex items-center space-x-1.5 ${
                            isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-semibold'
                          }`}>
                            <span>Your Answer:</span>
                            <span>
                              {studentChoice !== undefined ? `(${String.fromCharCode(65 + studentChoice)}) ${q.options[studentChoice]}` : 'No answer selected'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center space-x-1.5">
                              <span>Correct Solution:</span>
                              <span>
                                ({String.fromCharCode(65 + q.correct_index)}) {q.options[q.correct_index]}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* RED TEXT HEADERS FOR ERROR BREAKDOWN (ON INCORRECT) */}
                        {!isCorrect && (
                          <div className="space-y-1.5 pt-1">
                            <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center space-x-1.5">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                              <span>Error Breakdown & Cognitive Divergence:</span>
                            </h5>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed pl-1 font-medium">
                              {renderHighlightedMath(q.misconception_warning)}
                            </p>
                          </div>
                        )}

                        {/* SOFTLY TINTED FORMULA SUMMARY BOX */}
                        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1.5 shadow-xs">
                          <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Correct Formula Definition & Rule to Remember</span>
                          </div>
                          <p className="leading-relaxed font-semibold">
                            {renderHighlightedMath(q.rule_to_remember)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
