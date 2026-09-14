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
    topic: 'Linear Equations in Two Variables',
    categoryHeader: 'TOPIC 1: LINEAR EQUATIONS IN TWO VARIABLES',
    maxMarks: 25,
    awardedMarks: 25,
    questionText: 'Solve the system of linear equations by substitution: 2x + 3y = 12 and x - y = 1.',
    studentAnswerText: 'From equation 2: x = y + 1. Substitute into eq 1: 2(y + 1) + 3y = 12 => 5y = 10 => y = 2. Then x = 3. Solution: (3, 2).',
    highlightedMistake: 'Clean procedural substitution with zero calculation errors.',
    misconceptionAnalysis: 'No misconceptions detected. Applied substitution theorem accurately.',
    aiCorrectionTip: 'Solid execution. Maintain parentheses discipline.',
    ruleToRemember: 'Substitution Method: Isolate the single-coefficient variable first and protect terms with parentheses.',
    status: 'correct',
  },
  {
    questionNumber: 2,
    topic: 'Quadratic Equation Factorization & Roots',
    categoryHeader: 'TOPIC 2: QUADRATIC EQUATION FACTORIZATION & ROOTS',
    maxMarks: 25,
    awardedMarks: 15,
    questionText: 'Solve the quadratic equation by factoring: x^2 - 4x - 12 = 0.',
    studentAnswerText: 'Factors of -12 that add to -4 are -6 and +2. Factored form: (x - 6)(x + 2) = 0. Therefore roots are: x = -6 or x = 2.',
    highlightedMistake: 'Sign Inversion on Root Extraction: Factorization (x - 6)(x + 2) was correct, but student inverted root signs stating x = -6 or x = 2 instead of x = 6 or x = -2.',
    misconceptionAnalysis: 'Zero-Product Sign Confusion: Confused linear factor constants with roots, failing to write out x - 6 = 0 => x = +6 and x + 2 = 0 => x = -2.',
    aiCorrectionTip: 'Zero Product Property: Always write the explicit intermediate step: (x - a) = 0 => x = +a.',
    ruleToRemember: 'Zero Product Property: Always write out (x - a) = 0 => x = +a explicitly.',
    status: 'partial',
  },
  {
    questionNumber: 3,
    topic: 'Algebraic Identities & Bracket Expansion',
    categoryHeader: 'TOPIC 3: ALGEBRAIC IDENTITIES & EXPANSION',
    maxMarks: 25,
    awardedMarks: 10,
    questionText: 'Expand and simplify: (2x + 3)^2 - (2x - 3)^2.',
    studentAnswerText: '(4x^2 + 12x + 9) - (4x^2 - 12x + 9) = 4x^2 - 4x^2 + 12x - 12x + 9 - 9 = 0.',
    highlightedMistake: 'Negative Distribution Error: Failed to distribute the negative sign across the second bracket: wrote -(-12x) as -12x instead of +12x. Expected answer: 24x.',
    misconceptionAnalysis: 'Bracket Neglect under Subtraction: Dropped parentheses prematurely without multiplying every internal term by -1.',
    aiCorrectionTip: 'Distribution Anchor: Invert every internal sign when expanding subtracted brackets.',
    ruleToRemember: 'Distribution Anchor: -(A - B + C) = -A + B - C.',
    status: 'incorrect',
  },
  {
    questionNumber: 4,
    topic: 'Linear Equations Word Problems',
    categoryHeader: 'TOPIC 4: LINEAR EQUATIONS WORD PROBLEMS',
    maxMarks: 25,
    awardedMarks: 25,
    questionText: 'The perimeter of a rectangular garden is 48 meters. The length is 6 meters greater than the width. Find the length and width.',
    studentAnswerText: 'Let width = w, length = w + 6. Perimeter = 2(l + w) = 2(2w + 6) = 4w + 12 = 48 => 4w = 36 => w = 9m, length = 15m. Verification: 2(15 + 9) = 48m.',
    highlightedMistake: 'Clean mathematical modeling with explicit verification check.',
    misconceptionAnalysis: 'No misconceptions detected. Geometric translation to algebraic equation is robust.',
    aiCorrectionTip: 'Excellent modeling. Always confirm physical units.',
    ruleToRemember: 'Perimeter Modeling: 2(length + width) = P.',
    status: 'correct',
  },
];

export default function AnalyzedAnswerSheet({
  analysisResult,
  studentName,
}: {
  analysisResult?: AnalyzeSheetResponse | null;
  studentName?: string;
}) {
  const [selectedQIndex, setSelectedQIndex] = useState(0);

  // Safely map dynamic questions from analysisResult using optional chaining
  // Prioritize directly parsed question objects from live Gemini OCR
  const questions: AnalyzedQuestion[] = (analysisResult?.questions && analysisResult.questions.length > 0)
    ? analysisResult.questions.map((q, idx) => ({
        questionNumber: q.question_number || idx + 1,
        topic: q.topic_name || `Topic ${idx + 1}`,
        categoryHeader: `TOPIC ${idx + 1}: ${(q.topic_name || '').toUpperCase()}`,
        maxMarks: q.max_marks || 25,
        awardedMarks: q.awarded_marks ?? Math.round(((q.understanding_percentage ?? 0) / 100) * (q.max_marks || 25)),
        questionText: q.question_text || `Question ${idx + 1}`,
        studentAnswerText: q.student_working || 'Student working transcribed.',
        highlightedMistake: q.mistake_detected || (q.status === 'Green' ? 'Clean procedural and conceptual solution.' : 'Step error detected.'),
        misconceptionAnalysis: q.misconception || (q.status === 'Green' ? 'Clean working steps with zero errors.' : 'Conceptual error in working steps.'),
        aiCorrectionTip: q.rule_to_remember || 'Follow standard mathematical procedure.',
        ruleToRemember: q.rule_to_remember || 'Practice core concept.',
        status: q.status === 'Green' ? 'correct' as const : q.status === 'Yellow' ? 'partial' as const : 'incorrect' as const,
      }))
    : (analysisResult?.topic_breakdown && analysisResult.topic_breakdown.length > 0)
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
          questionText: `Problem ${idx + 1}: Evaluating conceptual mastery in ${t?.topic_name || 'Mathematics Strand'}`,
          studentAnswerText: `Handwritten step analysis for ${t?.topic_name || 'problem'} — Evaluated understanding: ${percentage}%`,
          highlightedMistake: t?.status === 'Green' ? 'Clean procedural and conceptual solution.' : misconception,
          misconceptionAnalysis: misconception,
          aiCorrectionTip: prescription,
          ruleToRemember: prescription,
          status: t?.status === 'Green' ? 'correct' as const : t?.status === 'Yellow' ? 'partial' as const : 'incorrect' as const,
        };
      })
    : fallbackQuestions;

  const currentQ = questions?.[selectedQIndex] || questions?.[0] || fallbackQuestions[0];
  const studentDisplayName = (analysisResult?.student_name && analysisResult.student_name !== 'Student')
    ? analysisResult.student_name
    : (studentName || analysisResult?.student_name || 'Lingjensthaibi');

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
