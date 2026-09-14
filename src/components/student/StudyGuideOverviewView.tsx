'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  FileSpreadsheet, 
  Video, 
  CheckCircle2, 
  AlertTriangle,
  UploadCloud,
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';

interface StudyGuideOverviewViewProps {
  studentName: string;
  analysisResult: AnalyzeSheetResponse | null;
  overallScore: number;
  trueMastery: number;
  clearedTopics: Set<string>;
  onSelectTab: (tabId: string) => void;
  onReset?: () => void;
  onLoadSample?: () => void;
}

export default function StudyGuideOverviewView({
  studentName,
  analysisResult,
  overallScore,
  trueMastery,
  clearedTopics,
  onSelectTab,
  onReset,
  onLoadSample,
}: StudyGuideOverviewViewProps) {
  const topics = analysisResult?.topic_breakdown || [];
  const misconceptions = analysisResult?.common_misconceptions || [];
  const actionSteps = analysisResult?.what_to_learn_next || [];

  const masteredCount = topics.filter((t) => t?.status === 'Green').length;
  const criticalCount = topics.filter((t) => t?.status === 'Red').length;
  const developingCount = topics.filter((t) => t?.status === 'Yellow').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Dynamic Gemini Status Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Gemini AI Analysis Active</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                Live Response
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              {analysisResult?.model_used || 'Google Gemini Vision'} • Extracted {topics.length} curriculum strands for {studentName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/upload"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Sheet</span>
          </Link>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-indigo-100 transition-colors cursor-pointer"
              title="Clear analysis and return to awaiting upload state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Diagnostic Notebook Cover & High-Level Transformation */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 shadow-sm overflow-hidden p-5 sm:p-7 md:p-8 lg:p-10">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-600"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Study Guide Overview
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Student: {studentName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• {analysisResult?.model_used || 'Gemini 3.6 Flash'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {studentName}&apos;s Diagnostic Notebook
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              AI multimodal diagnostic complete. Detected {topics.length} specific curriculum areas with individual cognitive mastery ratings derived from handwritten working steps.
            </p>
          </div>

          {/* Dynamic Score Transformation Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#ded5c4] dark:divide-slate-800 bg-[#faf8f2] dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-[#e4ddce] dark:border-slate-700 gap-2 sm:gap-0 shrink-0">
            <div className="text-center py-2 sm:py-0 px-3 sm:px-4">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 block">Overall Score</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 font-mono">
                {overallScore}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">Extracted from Paper</span>
            </div>

            <div className="text-center py-2 sm:py-0 px-3 sm:px-4">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-rose-600 dark:text-rose-400 block">True Mastery</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {trueMastery}%
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold block mt-0.5">Diagnostic Avg</span>
            </div>

            <div className="text-center py-2 sm:py-0 px-3 sm:px-4">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Target Boost</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                90%+
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">Post-Remediation</span>
            </div>
          </div>
        </div>

        {/* Action Directives / Standalone Navigation Launchpads */}
        <div className="mt-8 pt-6 border-t border-[#ece6d8] dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Explore Dedicated Sections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Launchpad 1: Topic Diagnoses */}
            <button
              type="button"
              onClick={() => onSelectTab('topics')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Topic Diagnoses</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {topics.length} strands analyzed • {masteredCount} mastered
              </p>
            </button>

            {/* Launchpad 2: Scanned Answer Sheet */}
            <button
              type="button"
              onClick={() => onSelectTab('sheet')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group cursor-pointer hover:border-rose-300 dark:hover:border-rose-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Analyzed Answer Sheet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Step-by-step handwriting OCR & scoring
              </p>
            </button>

            {/* Launchpad 3: What to Learn Next */}
            <button
              type="button"
              onClick={() => onSelectTab('next_steps')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group cursor-pointer hover:border-amber-300 dark:hover:border-amber-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">What to Learn Next</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {actionSteps.length} action rules • {misconceptions.length} misconceptions
              </p>
            </button>

            {/* Launchpad 4: Study Resources */}
            <button
              type="button"
              onClick={() => onSelectTab('resources')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Study Resources & Videos</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Video tutorials, cheat-sheets & practice
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Diagnostic Snapshot Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Curriculum Breakdown Snapshot
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('topics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View all {topics.length} strands →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">Mastered</span>
              <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200">{masteredCount}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">&gt;75% understanding</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">Developing</span>
              <span className="text-2xl font-extrabold text-amber-800 dark:text-amber-200">{developingCount}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block">50-75% score</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">Critical Gaps</span>
              <span className="text-2xl font-extrabold text-rose-800 dark:text-rose-200">{criticalCount}</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block">&lt;50% priority</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Reviewed & Cleared Topics:</span>
            <span className="font-bold text-slate-900 dark:text-white">{clearedTopics.size} of {topics.length}</span>
          </div>
        </div>

        {/* Priority Action Recommendation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Priority Remediation Focus
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('next_steps')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Open Action Plan →
            </button>
          </div>

          {actionSteps.length > 0 ? (
            <div className="p-3.5 bg-blue-50/70 dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                Top Priority Rule
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                {actionSteps[0]}
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
              No critical remediation required. Excellent performance!
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Diagnosed Misconceptions:</span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {misconceptions.length} items to address
            </span>
          </div>
        </div>
      </div>

      {/* 4. Methodology: 3-Step Capability Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          How LearnGraph Analyzes Your Work
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">01. Optical OCR</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Handwriting Step Scan</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Multimodal vision reads messy scratch annotations directly from photos or PDFs.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">02. Topic Breakdown</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dynamic Understanding %</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculates true conceptual grasp per curriculum strand, replacing raw point scores.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">03. Actionable Notebook</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Misconception Prescription</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Students get highlighted rules to remember, and teachers get a 15-minute reteach roadmap.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
