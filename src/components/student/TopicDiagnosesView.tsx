'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  RotateCcw,
  Compass,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { getTrafficLight } from '@/lib/mockData';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';

interface TopicDiagnosesViewProps {
  studentName: string;
  analysisResult: AnalyzeSheetResponse | null;
  clearedTopics: Set<string>;
  onToggleCleared: (topic: string) => void;
  onTriggerQuiz: (topic: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function TopicDiagnosesView({
  studentName,
  analysisResult,
  clearedTopics,
  onToggleCleared,
  onTriggerQuiz,
  onSelectTab,
}: TopicDiagnosesViewProps) {
  const [filter, setFilter] = useState<'all' | 'Green' | 'Yellow' | 'Red' | 'cleared'>('all');

  const topics = analysisResult?.topic_breakdown || [];
  const masteredCount = topics.filter((t) => t?.status === 'Green').length;
  const developingCount = topics.filter((t) => t?.status === 'Yellow').length;
  const criticalCount = topics.filter((t) => t?.status === 'Red').length;
  const clearedCount = clearedTopics.size;

  const filteredTopics = topics.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'cleared') return clearedTopics.has(t.topic_name);
    return t.status === filter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. View Header & Diagnostic Scope */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                Diagnostic Analysis
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {analysisResult?.model_used || 'Gemini 3.6 Flash'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              Topic-by-Topic Understanding Breakdown
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Extracted directly from {studentName}&apos;s handwriting working steps. Individual conceptual mastery scores calculated for each tested curriculum strand.
            </p>
          </div>

          {/* KPI Badge Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              {topics.length} Strands Total
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
              {masteredCount} Mastered
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-bold">
              {criticalCount} Critical
            </span>
          </div>
        </div>

        {/* 2. Interactive Filters */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter:
          </span>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Strands ({topics.length})
          </button>

          <button
            onClick={() => setFilter('Green')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'Green'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Mastered ({masteredCount})
          </button>

          <button
            onClick={() => setFilter('Yellow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'Yellow'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Developing ({developingCount})
          </button>

          <button
            onClick={() => setFilter('Red')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'Red'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Critical Gaps ({criticalCount})
          </button>

          <button
            onClick={() => setFilter('cleared')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'cleared'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            Reviewed ({clearedCount})
          </button>
        </div>
      </div>

      {/* 3. Topic Cards Grid */}
      {filteredTopics.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No strands found for this filter</h3>
          <p className="text-xs text-slate-500">Try selecting another filter or view all curriculum topics.</p>
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {filteredTopics.map((topic, idx) => {
            const understanding = topic?.understanding_percentage ?? 0;
            const traffic = getTrafficLight(understanding);
            const levelText = topic?.status === 'Green' ? 'Mastered' : topic?.status === 'Yellow' ? 'Developing' : 'Critical Gap';
            const topicTitle = topic?.topic_name || `Strand ${idx + 1}`;
            const isCleared = clearedTopics.has(topicTitle);

            return (
              <div
                key={topicTitle}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#e6dfd1] dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Category Status Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        {levelText}
                      </span>
                      {isCleared && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${traffic.dotClass}`}></span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {topicTitle}
                  </h4>

                  {/* Exact understanding_percentage value */}
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className={`text-3xl font-black ${traffic.textAccent}`}>
                      {understanding}%
                    </span>
                    <span className="text-xs text-slate-400">understanding</span>
                  </div>

                  {/* DYNAMIC PROGRESS BAR */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${understanding}%`,
                        backgroundColor: traffic.barColor,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => onToggleCleared(topicTitle)}
                      className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        isCleared
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title="Toggle reviewed / cleared status"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isCleared ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{isCleared ? 'Cleared' : 'Mark Reviewed'}</span>
                    </button>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${traffic.badgeClass}`}>
                      {topic?.status || 'Active'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTriggerQuiz(topicTitle)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test My Knowledge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cross-Link Directive */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Want actionable rules to resolve your critical gaps?</span>
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('next_steps')}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center space-x-1"
        >
          <span>Open What to Learn Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
