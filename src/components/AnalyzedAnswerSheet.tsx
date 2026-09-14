'use client';

import React, { useState } from 'react';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';
import { 
  FileText, 
  Sparkles, 
} from 'lucide-react';

export interface AnalyzedQuestion {
  questionNumber: number;
  topic: string;
  categoryHeader: string;
  maxMarks: number;
  awardedMarks: number;
  questionText: string;
  studentAnswerText: string;
  highlightedMistake: string;
  misconceptionAnalysis: string;
  aiCorrectionTip: string;
  ruleToRemember: string;
  status: 'correct' | 'partial' | 'incorrect';
}

const fallbackQuestions: AnalyzedQuestion[] = [
  {
    questionNumber: 1,
    topic: 'Algebra & Linear Equations',
    categoryHeader: 'TOPIC 1: ALGEBRA & LINEAR EQUATIONS',
    maxMarks: 25,
    awardedMarks: 25,
    questionText: 'Solve for x: 4(2x - 3) = 3(x + 6) - 5',
    studentAnswerText: '8x - 12 = 3x + 18 - 5 => 8x - 12 = 3x + 13 => 5x = 25 => x = 5',
    highlightedMistake: 'Clean procedural execution with zero sign errors.',
    misconceptionAnalysis: 'No misconceptions detected. Algebraic manipulation is sound and structured.',
    aiCorrectionTip: 'Excellent work. Maintain step-by-step balance operations.',
    ruleToRemember: 'Balance Rule: Operations applied to one side must be identically applied to the other.',
    status: 'correct',
  },
  {
    questionNumber: 2,
    topic: 'Quadratic Equations & Roots',
    categoryHeader: 'TOPIC 2: QUADRATIC EQUATIONS & ROOTS',
    maxMarks: 25,
    awardedMarks: 16,
    questionText: 'Find roots of 2x^2 - 4x - 6 = 0 using the quadratic formula.',
    studentAnswerText: 'a=2, b=-4, c=-6. x = (-4 +- sqrt(16 - 4(2)(-6))) / 4 = (-4 +- 8) / 4 => x = 1 or -3',
    highlightedMistake: 'Sign drop on -b substitution: wrote -4 instead of -(-4) = +4.',
    misconceptionAnalysis: 'Student dropped the negative sign outside the formula when substituting a negative b value.',
    aiCorrectionTip: 'Ghost Parentheses Rule: Always substitute variables into formulas with parentheses: - (b) +- sqrt(...).',
    ruleToRemember: 'Negation Rule: -(-b) is positive.',
    status: 'partial',
  },
];

export default function AnalyzedAnswerSheet({
  analysisResult,
}: {
  analysisResult?: AnalyzeSheetResponse | null;
}) {
  const [selectedQIndex, setSelectedQIndex] = useState(0);

  // Safely map dynamic questions from analysisResult using optional chaining
  const questions: AnalyzedQuestion[] = (analysisResult?.topic_breakdown && analysisResult.topic_breakdown.length > 0)
    ? analysisResult.topic_breakdown.map((t, idx) => {
        const misconception = analysisResult?.common_misconceptions?.[idx] ||
          (t?.status === 'Green' ? 'No structural misconceptions detected. Working steps are sound.' : `Conceptual gap detected in ${t?.topic_name || 'curriculum topic'}.`);
        const prescription = analysisResult?.what_to_learn_next?.[idx] ||
          `Reinforce ${t?.topic_name || 'curriculum'} foundational definitions.`;
        const percentage = t?.understanding_percentage ?? 0;
        return {
          questionNumber: idx + 1,
          topic: t?.topic_name || `Topic ${idx + 1}`,
          categoryHeader: `TOPIC ${idx + 1}: ${(t?.topic_name || '').toUpperCase()}`,
          maxMarks: 25,
          awardedMarks: Math.round((percentage / 100) * 25),
          questionText: `Assessment Problem ${idx + 1} evaluating student grasp of ${t?.topic_name || 'curriculum topic'}`,
          studentAnswerText: `Student submitted working for ${t?.topic_name || 'problem'} — Diagnostic mastery computed at ${percentage}%`,
          highlightedMistake: t?.status === 'Green' ? 'Clean procedural and conceptual solution.' : misconception,
          misconceptionAnalysis: misconception,
          aiCorrectionTip: prescription,
          ruleToRemember: prescription,
          status: t?.status === 'Green' ? 'correct' as const : t?.status === 'Yellow' ? 'partial' as const : 'incorrect' as const,
        };
      })
    : fallbackQuestions;

  const currentQ = questions?.[selectedQIndex] || questions?.[0] || fallbackQuestions[0];
  const studentDisplayName = analysisResult?.student_name || 'Student';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Exam Paper OCR & Semantic Parser
            </span>
            <span className="text-xs text-slate-400">
              {analysisResult ? `${studentDisplayName} • ${analysisResult?.model_used || 'Gemini 3.6 Flash'}` : 'Diagnostic Preview'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            Analyzed Answer Sheet (Annotated Working Steps)
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Click questions below to inspect student handwritten scratch work and pinpointed misconception tags
          </p>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 overflow-x-auto max-w-full scrollbar-none">
          {questions?.map((q, idx) => {
            const isSelected = idx === selectedQIndex;
            return (
              <button
                key={q.questionNumber || idx}
                onClick={() => setSelectedQIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>Q{q.questionNumber}</span>
                {q.status === 'correct' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
                {q.status === 'partial' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
                {q.status === 'incorrect' && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header for Topic Category */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-600 p-3.5 sm:p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400 block">
              {currentQ.categoryHeader}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Question {currentQ.questionNumber}: {currentQ.topic}
            </h4>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Marks:</span>
            <span className={`text-sm font-extrabold px-3 py-1 rounded-lg border ${
              currentQ.status === 'correct'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : currentQ.status === 'partial'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
            }`}>
              {currentQ.awardedMarks} / {currentQ.maxMarks} pts
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Exam Prompt
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white font-mono">
            {currentQ.questionText}
          </p>
        </div>

        {/* Notebook-Style Student Working View */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Scanned Answer Sheet Replica (Notebook Lined Paper) */}
          <div className="lg:col-span-7 bg-[#fbf9f4] dark:bg-slate-900 rounded-2xl border-2 border-[#e6dfd1] dark:border-slate-800 shadow-inner p-4 sm:p-6 relative overflow-hidden">
            {/* Lined paper texture background */}
            <div className="absolute inset-0 opacity-40 pointer-events-none notebook-lined"></div>

            {/* Red Margin Line */}
            <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-rose-400/40 dark:bg-rose-500/30 pointer-events-none"></div>

            {/* Paper Header */}
            <div className="relative pl-4 sm:pl-6 pb-4 border-b border-[#e8e2d4] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-slate-600 dark:text-slate-400 text-xs">
                Student Working • {studentDisplayName}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-bold handwriting-note text-sm sm:text-base">
                {currentQ.status === 'correct' ? '✓ Full Marks' : currentQ.status === 'partial' ? '½ Partial' : '✕ See note'}
              </span>
            </div>

            {/* Handwritten Working Content with Annotations */}
            <div className="relative pl-4 sm:pl-6 pt-5 space-y-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <div className="p-3.5 bg-white/90 dark:bg-slate-800 rounded-xl border border-[#e4dccb] dark:border-slate-700 shadow-2xs">
                <p className="text-xs text-slate-400 uppercase font-sans font-bold mb-1">Student Answer Step:</p>
                <div className="font-mono font-medium text-slate-900 dark:text-white">
                  {currentQ.studentAnswerText}
                </div>
              </div>

              {/* Red Pen Correction Overlay */}
              {currentQ.status !== 'correct' && (
                <div className="p-3.5 bg-rose-50/90 dark:bg-rose-950/50 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 relative">
                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase text-rose-700 dark:text-rose-400 mb-1 font-sans">
                    <span>Teacher / AI Annotation</span>
                  </div>
                  <p className="handwriting-note text-base sm:text-lg text-rose-700 dark:text-rose-400 leading-snug">
                    &quot;{currentQ.highlightedMistake}&quot;
                  </p>
                </div>
              )}

              {/* Highlighted Yellow Note */}
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                <span className="font-sans font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                  Specific Slip Tagged:
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  <span className="highlight-yellow">{currentQ.highlightedMistake}</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Breakdown Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Reasoning Deconstruction
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Misconception Diagnosis</h5>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                  {currentQ.misconceptionAnalysis}
                </p>
              </div>

              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase">Correction Strategy</h5>
                <p className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-300 font-medium mt-1 leading-relaxed">
                  {currentQ.aiCorrectionTip}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/70 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] block mb-0.5">Golden Rule:</span>
                <span className="highlight-yellow font-bold text-slate-900 dark:text-white">
                  {currentQ.ruleToRemember}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
