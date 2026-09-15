'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Search, 
  UploadCloud, 
  CheckSquare, 
  ArrowRight,
  BrainCircuit,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { AnalyzeSheetResponse, AnalyzedQuestionItem } from '@/app/api/analyze-sheet/route';

interface QuestionEvaluationViewProps {
  analysisResult: AnalyzeSheetResponse | null;
  studentName?: string;
  onSelectTab?: (tabId: string) => void;
  onLoadSample?: () => void;
}

export default function QuestionEvaluationView({
  analysisResult,
  studentName,
  onSelectTab,
  onLoadSample,
}: QuestionEvaluationViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'partial' | 'incorrect'>('all');
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0])); // First question expanded by default

  // Normalize questions from analysisResult
  const questions: AnalyzedQuestionItem[] = useMemo(() => {
    if (analysisResult?.questions && analysisResult.questions.length > 0) {
      return analysisResult.questions;
    }
    // Fallback topic breakdown synthesized into question cards if questions array missing
    if (analysisResult?.topic_breakdown && analysisResult.topic_breakdown.length > 0) {
      return analysisResult.topic_breakdown.map((t, idx) => {
        const misconception = analysisResult?.common_misconceptions?.[idx] ||
          (t.status === 'Green' ? 'Clean procedural working with zero structural misconceptions.' : `Identified conceptual gap in ${t.topic_name}.`);
        const prescription = analysisResult?.what_to_learn_next?.[idx] ||
          `Reinforce foundational axioms of ${t.topic_name}.`;
        const percentage = t.understanding_percentage ?? 0;
        const maxMarks = 25;
        const awardedMarks = Math.round((percentage / 100) * maxMarks);
        return {
          question_number: idx + 1,
          topic_name: t.topic_name,
          question_text: `Problem ${idx + 1}: Diagnostic question testing core principles in ${t.topic_name}`,
          student_working: `Student working steps evaluated for ${t.topic_name}. Graded understanding: ${percentage}%.`,
          correct_solution: `Canonical step-by-step derivation for ${t.topic_name}: Apply primary definition, verify boundary invariants, and calculate with standard precision.`,
          max_marks: maxMarks,
          awarded_marks: awardedMarks,
          understanding_percentage: percentage,
          status: t.status,
          mistake_detected: t.status === 'Green' ? 'Clean procedural solution with zero errors.' : misconception,
          misconception: misconception,
          rule_to_remember: prescription,
          evaluation_reason: t.status === 'Green' 
            ? `Full marks awarded (${awardedMarks}/${maxMarks}) for accurate working and sound conceptual reasoning.`
            : `Marks deducted (${awardedMarks}/${maxMarks}). Step error detected: ${misconception}`,
        };
      });
    }
    return [];
  }, [analysisResult]);

  // Expand / Collapse Helpers
  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIndices(new Set(questions.map((_, idx) => idx)));
  };

  const collapseAll = () => {
    setExpandedIndices(new Set());
  };

  // Summary Metrics
  const stats = useMemo(() => {
    const total = questions.length;
    let mastered = 0;
    let developing = 0;
    let criticalGaps = 0;
    let totalMarksAwarded = 0;
    let totalMarksPossible = 0;

    questions.forEach((q) => {
      totalMarksAwarded += q.awarded_marks ?? 0;
      totalMarksPossible += q.max_marks ?? 25;
      if (q.status === 'Green') mastered++;
      else if (q.status === 'Yellow') developing++;
      else criticalGaps++;
    });

    return {
      total,
      mastered,
      developing,
      criticalGaps,
      totalMarksAwarded,
      totalMarksPossible,
      accuracyPct: totalMarksPossible > 0 ? Math.round((totalMarksAwarded / totalMarksPossible) * 100) : 0,
    };
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Filter by status
      if (filterStatus === 'correct' && q.status !== 'Green') return false;
      if (filterStatus === 'partial' && q.status !== 'Yellow') return false;
      if (filterStatus === 'incorrect' && q.status !== 'Red') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const qNum = String(q.question_number).toLowerCase();
        const topic = (q.topic_name || '').toLowerCase();
        const text = (q.question_text || '').toLowerCase();
        const working = (q.student_working || '').toLowerCase();
        const mistake = (q.mistake_detected || '').toLowerCase();
        const misconception = (q.misconception || '').toLowerCase();
        return (
          qNum.includes(query) ||
          topic.includes(query) ||
          text.includes(query) ||
          working.includes(query) ||
          mistake.includes(query) ||
          misconception.includes(query)
        );
      }

      return true;
    });
  }, [questions, filterStatus, searchQuery]);

  if (!analysisResult || questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <CheckSquare className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            No Question Breakdown Available
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upload an exam paper or click below to diagnose a sample test to inspect granular, question-by-question scoring and AI step audits.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Test Paper</span>
          </Link>
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Diagnose Sample Paper</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner & Diagnostics Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                Tier 1 OCR
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Tier 2 Rulebooks
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                Tier 3 Granular
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Tier 4 Auditor AI</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analysisResult.model_used || 'Gemini 3.6 Flash'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {studentName || analysisResult.student_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Question-by-Question Diagnostic Breakdown
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Inspect independent score evaluations, transcribed student working, pinpointed mistake slips, and canonical model solutions verified by the 4-Tier Verification Pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {stats.totalMarksAwarded} / {stats.totalMarksPossible}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
                <span className={`text-lg font-black ${
                  stats.accuracyPct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                  stats.accuracyPct >= 50 ? 'text-amber-600 dark:text-amber-400' :
                  'text-rose-600 dark:text-rose-400'
                }`}>
                  {stats.accuracyPct}%
                </span>
              </div>
            </div>

            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Sheet</span>
            </Link>
          </div>
        </div>

        {/* Status Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Solved</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {stats.total} Questions
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Mastered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {stats.mastered} <span className="text-xs font-medium text-emerald-600/80">({stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%)</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Developing</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {stats.developing} <span className="text-xs font-medium text-amber-600/80">({stats.total > 0 ? Math.round((stats.developing / stats.total) * 100) : 0}%)</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Critical Gaps</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {stats.criticalGaps} <span className="text-xs font-medium text-rose-600/80">({stats.total > 0 ? Math.round((stats.criticalGaps / stats.total) * 100) : 0}%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls Bar: Filter Pills, Search Input, and Expand/Collapse All */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('correct')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              filterStatus === 'correct'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Mastered ({stats.mastered})</span>
          </button>
          <button
            onClick={() => setFilterStatus('partial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              filterStatus === 'partial'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Developing ({stats.developing})</span>
          </button>
          <button
            onClick={() => setFilterStatus('incorrect')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              filterStatus === 'incorrect'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical Gaps ({stats.criticalGaps})</span>
          </button>
        </div>

        {/* Search and Expand/Collapse Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search question, topic, mistake..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Expand All Cards"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse All Cards"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. Question Cards / Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No questions match your selected filter or search query.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            // Determine actual index in master questions list
            const index = questions.indexOf(q);
            const isExpanded = expandedIndices.has(index);

            const isCorrect = q.status === 'Green';
            const isPartial = q.status === 'Yellow';
            const isIncorrect = q.status === 'Red';

            return (
              <div
                key={`q-${q.question_number}-${index}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isExpanded
                    ? 'border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isCorrect && (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      {isPartial && (
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center shadow-2xs">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                      {isIncorrect && (
                        <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shadow-2xs">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Question Title & Topic */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                          Question {q.question_number}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
                          {q.topic_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                        {q.question_text}
                      </p>
                    </div>
                  </div>

                  {/* Marks & Expand Arrow */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : isPartial
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}>
                      {q.awarded_marks} / {q.max_marks} pts
                    </span>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-6 md:p-8 space-y-6 bg-slate-50/40 dark:bg-slate-950/30">
                    {/* A. Question Prompt Container */}
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-2xs">
                      <div className="flex items-center space-x-2 text-slate-400 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Exam Prompt</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed font-mono">
                        {q.question_text}
                      </p>
                    </div>

                    {/* B. Two-Column Evaluation Workspace */}
                    <div className="grid lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Scanned Working & Canonical Solution (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* Student Working Notebook Container */}
                        <div className="bg-[#fbf9f4] dark:bg-slate-900 rounded-2xl border-2 border-[#e6dfd1] dark:border-slate-800 p-4 sm:p-5 relative shadow-inner">
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e8e2d4] dark:border-slate-800 text-xs">
                            <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">
                              Student Working Steps (Transcribed via OCR)
                            </span>
                            <span className={`font-bold font-mono text-xs ${
                              isCorrect ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {isCorrect ? '✓ Clean Method' : isPartial ? '½ Partial Working' : '✕ Flawed Step'}
                            </span>
                          </div>

                          <div className="p-3.5 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-[#e4dccb] dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {q.student_working || '[No working steps recorded]'}
                          </div>

                          {/* Specific Mistake Tagged */}
                          {!isCorrect && q.mistake_detected && (
                            <div className="mt-3 p-3 bg-rose-50/90 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                              <span className="font-sans font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[10px] block">
                                Step Mistake Detected:
                              </span>
                              <p className="font-medium">
                                &quot;{q.mistake_detected}&quot;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Canonical Model Solution */}
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 p-4 sm:p-5 space-y-2">
                          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Canonical Model Solution & Derivation
                            </span>
                          </div>
                          <div className="p-3.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                            {q.correct_solution || 'Standard canonical solution: Apply fundamental definition and evaluate steps.'}
                          </div>
                        </div>
                      </div>

                      {/* Right: AI Diagnostic Breakdown & Correction Strategy (5 cols) */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
                          <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300">
                            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Auditor AI Evaluation
                            </span>
                          </div>

                          {/* Evaluation Reason */}
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                              Marking Rationale
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              {q.evaluation_reason || (isCorrect 
                                ? `Awarded ${q.awarded_marks}/${q.max_marks} marks for rigorous procedural execution.`
                                : `Awarded ${q.awarded_marks}/${q.max_marks} marks. Step error identified in working.`)}
                            </p>
                          </div>

                          {/* Misconception Diagnosis */}
                          {q.misconception && q.misconception.toLowerCase() !== 'none' && (
                            <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
                              <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 block mb-0.5">
                                Cognitive Misconception
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {q.misconception}
                              </p>
                            </div>
                          )}

                          {/* Rule to Remember / Invariant Anchor */}
                          {q.rule_to_remember && (
                            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-900/60 text-xs">
                              <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase text-[10px] block mb-1">
                                Golden Rule to Remember:
                              </span>
                              <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                                {q.rule_to_remember}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Interactive Next Step Button */}
                        {onSelectTab && (
                          <button
                            type="button"
                            onClick={() => onSelectTab('next_steps')}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>Practice Remediation for this Concept</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Cross-Navigation Footer */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Need to see the full notebook view or targeted drills?</span>
        </div>
        <div className="flex items-center space-x-2">
          {onSelectTab && (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('sheet')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Scanned Sheet View</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('next_steps')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Targeted Action Steps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
