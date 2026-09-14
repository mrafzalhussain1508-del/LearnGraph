'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Video, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Compass
} from 'lucide-react';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';
import ResourceFeed from '@/components/ResourceFeed';

interface StudyResourcesViewProps {
  analysisResult: AnalyzeSheetResponse | null;
  clearedTopics: Set<string>;
  onToggleCleared: (topic: string) => void;
  onTriggerQuiz: (topic: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function StudyResourcesView({
  analysisResult,
  clearedTopics,
  onToggleCleared,
  onTriggerQuiz,
  onSelectTab,
}: StudyResourcesViewProps) {
  const struggleTopics = analysisResult?.topic_breakdown
    ? analysisResult.topic_breakdown
        .filter((t) => (t?.understanding_percentage ?? 100) < 80)
        .map((t) => t?.topic_name)
        .filter(Boolean)
    : ['Graph Transformations', 'Quadratic Equations & Roots'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900">
                Learning Materials
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Matched to Your Needs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              Class Study Materials & Video Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Curated video walkthroughs, formula cheat-sheets, and practice sets recommended by your teachers based on your diagnostic results.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              {struggleTopics.length} Focus Strands
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Resource Feed Component */}
      <div className="space-y-6">
        <ResourceFeed
          recommendedTopics={struggleTopics}
          title="Class Study Materials & Video Lessons"
          subtitle="Curated video lessons, formula guides, and practice sets recommended by your teachers based on your assessment"
          onTriggerQuiz={(topic) => onTriggerQuiz(topic)}
          clearedTopics={clearedTopics}
          onToggleCleared={onToggleCleared}
        />

        {/* Cross-Link Directive */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Want to review your detailed topic scores and progress bars?</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('topics')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
          >
            <span>Return to Topic Diagnoses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
