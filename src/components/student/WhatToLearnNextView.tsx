'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Video
} from 'lucide-react';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';
import { 
  renderHighlightedMathText, 
  parseMisconception, 
  parseActionStep 
} from '@/components/student/studentUtils';

interface WhatToLearnNextViewProps {
  studentName: string;
  analysisResult: AnalyzeSheetResponse | null;
  onTriggerQuiz: (topic: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function WhatToLearnNextView({
  studentName,
  analysisResult,
  onTriggerQuiz,
  onSelectTab,
}: WhatToLearnNextViewProps) {
  const [subTab, setSubTab] = useState<'what_to_learn' | 'misconceptions'>('what_to_learn');

  const actionSteps = analysisResult?.what_to_learn_next || [];
  const misconceptions = analysisResult?.common_misconceptions || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Actionable Remediation
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analysisResult?.model_used || 'Gemini 3.6 Flash'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              What to Learn Next & Diagnosed Misconceptions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Targeted mathematical rules, formulas to memorize, and specific calculation mistakes to avoid based on handwriting step analysis.
            </p>
          </div>

          {/* Quick Sub-Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSubTab('what_to_learn')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'what_to_learn'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Targeted Rules ({actionSteps.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('misconceptions')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'misconceptions'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Misconceptions ({misconceptions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab 1: WHAT TO LEARN NEXT / TARGETED RULES */}
      {subTab === 'what_to_learn' && (
        <div className="space-y-4 animate-fadeIn">
          {actionSteps.length === 0 ? (
            <div className="bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-200/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Curriculum Target Met</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  No critical gaps detected! Great job.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {studentName} has satisfied all core objectives for this curriculum section. Ready for advanced enrichment or next-grade honors material.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {actionSteps.map((item, idx) => {
                const parsed = parseActionStep(item, idx);
                return (
                  <div
                    key={idx}
                    className="bg-blue-50/50 dark:bg-slate-900/80 hover:bg-blue-50/80 dark:hover:bg-slate-900 transition-all rounded-2xl border-2 border-blue-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md space-y-4 relative overflow-hidden group"
                  >
                    {/* Left blue accent indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>

                    {/* Distinct structured header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-950 dark:text-blue-300">
                          RECOMMENDED ACTION #{idx + 1}: {parsed.title}
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        <ArrowRight className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                        Targeted Rule
                      </span>
                    </div>

                    {/* Action step content */}
                    <div className="flex items-start space-x-3.5 pt-1 pl-1">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-600/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                          {renderHighlightedMathText(parsed.body)}
                        </p>

                        {/* Summary Box with dark mode support */}
                        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-blue-200/90 dark:border-gray-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-start space-x-2.5">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">Actionable Prescription:</span>
                              <span>Practice this exact rule with 3 targeted sample problems before the next assessment.</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onTriggerQuiz(parsed.title)}
                            className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
                          >
                            <span>Take Mastery Checkpoint →</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Sub-Tab 2: DIAGNOSED MISCONCEPTIONS */}
      {subTab === 'misconceptions' && (
        <div className="space-y-4 animate-fadeIn">
          {misconceptions.length === 0 ? (
            <div className="bg-gradient-to-b from-emerald-50/70 via-white to-white rounded-3xl border-2 border-emerald-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-sm shadow-emerald-200/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Perfect Score / Flawless Steps</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  No critical misconceptions detected! Great job.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {studentName} demonstrated complete conceptual mastery across all tested curriculum areas with zero identified mathematical misconceptions.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {misconceptions.map((item, idx) => {
                const parsed = parseMisconception(item, idx);
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#ecd4d4] dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    {/* Red margin stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600"></div>

                    {/* Bold Red Header / Warning Label */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-rose-100 dark:border-rose-950/60">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-600 dark:text-red-400">
                          WARNING: {parsed.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        Cognitive Error #{idx + 1}
                      </span>
                    </div>

                    {/* Card Content with highlighted math terms */}
                    <div className="space-y-3 pl-2">
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                        {renderHighlightedMathText(parsed.body)}
                      </p>

                      {/* Handwritten Study Guide Style Callout */}
                      <div className="p-3.5 bg-[#fdfbee] dark:bg-gray-800 rounded-xl border border-amber-200/80 dark:border-gray-700 text-xs sm:text-sm text-amber-950 dark:text-amber-200 flex items-start space-x-2.5 shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-300 mr-1.5">Study Guide Warning:</span>
                          <span>Review working steps where this divergence occurred on the test paper. Avoid repeating this calculation pattern.</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Handwritten Step Annotation
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Diagnostic Strand #{idx + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cross-Link Directive */}
      <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Need video walkthroughs and practice questions?</span>
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('resources')}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
        >
          <span>Open Study Resources & Videos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
