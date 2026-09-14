'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Sparkles, 
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';
import AnalyzedAnswerSheet from '@/components/AnalyzedAnswerSheet';

interface AnalyzedSheetViewProps {
  analysisResult: AnalyzeSheetResponse | null;
  onSelectTab: (tabId: string) => void;
  onLoadSample?: () => void;
}

export default function AnalyzedSheetView({
  analysisResult,
  onSelectTab,
  onLoadSample,
}: AnalyzedSheetViewProps) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Optical Step OCR
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analysisResult?.model_used || 'Gemini 3.6 Flash'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              Scanned Answer Sheet & Working Step Breakdown
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Inspect step-by-step OCR recognition of handwritten workings, point allocations, and specific question-by-question scoring.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Scan Another Sheet</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Sheet Component */}
      {analysisResult ? (
        <div className="space-y-6">
          <AnalyzedAnswerSheet analysisResult={analysisResult} />

          {/* Cross-Link Directive */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Ready to learn how to fix the steps you missed?</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('next_steps')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>View Targeted Action Steps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Answer Sheet Analyzed Yet
            </h3>
            <p className="text-xs text-slate-500">
              Upload a handwritten math or science exam paper to extract questions, working steps, and AI score breakdown.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Upload Test Paper
            </Link>
            {onLoadSample && (
              <button
                type="button"
                onClick={onLoadSample}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Load Sample Demo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
