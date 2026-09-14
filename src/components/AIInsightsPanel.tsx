'use client';

import React, { useState } from 'react';
import { 
  teacherAIInsights, 
  getTrafficLight 
} from '@/lib/mockData';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  ChevronRight, 
  Layers, 
  Eye, 
  Presentation,
  BookMarked
} from 'lucide-react';

export default function AIInsightsPanel() {
  const [activeInsightId, setActiveInsightId] = useState<string>(teacherAIInsights[0].id);

  const activeInsight = teacherAIInsights.find((i) => i.id === activeInsightId) || teacherAIInsights[0];
  const traffic = getTrafficLight(activeInsight?.classScore ?? 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">AI Instructional Insights & Reteach Plan</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-400/40">
                  Formative Prescriptions
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Automated error attribution based on Section A's Red (&lt;50%) and Yellow (50-79%) metrics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Recommended Reteach Time: ~35 mins total</span>
          </div>
        </div>

        {/* Insight Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-indigo-800/60">
          {teacherAIInsights.map((insight) => {
            const isSelected = insight.id === activeInsightId;
            const style = getTrafficLight(insight.classScore);
            return (
              <button
                key={insight.id}
                onClick={() => setActiveInsightId(insight.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                    : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-800/80 border border-indigo-700/50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${style.dotClass}`}></span>
                <span>{insight.topic}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isSelected ? style.badgeClass : 'bg-indigo-950 text-indigo-300'
                }`}>
                  {insight.classScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body: Deep Dive on Active Insight */}
      <div className="p-6 space-y-6">
        {/* Headline and Topic Status */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${traffic.badgeClass}`}>
                {traffic.badgeText} ({activeInsight?.classScore ?? 0}%)
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Strand: {activeInsight?.topic || 'General'}
              </span>
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeInsight?.headline || 'Class Insight'}
            </h4>
          </div>

          <div className="shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Disparity</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {activeInsight?.impactedStudents?.length ?? 0} Students At Risk
            </span>
          </div>
        </div>

        {/* Root Cause Analysis & Misconception Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-3">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Root Cause Diagnosis</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
              {activeInsight?.rootCause || 'Misconception under review'}
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-950 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-rose-800 dark:text-rose-300">Why it happens:</strong> {activeInsight?.misconceptionDetails || 'Identified through error pattern analysis'}
            </div>
          </div>

          {/* Actionable Reteach Lesson Plan */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                <Presentation className="w-4 h-4" />
                <span>Recommended 15-Minute Reteach Activity</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                {activeInsight?.actionableReteachPlan?.durationMinutes ?? 15} Minutes
              </span>
            </div>

            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              "{activeInsight?.actionableReteachPlan?.activityTitle || 'Targeted Intervention Drill'}"
            </h5>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Strategy:</strong> {activeInsight?.actionableReteachPlan?.strategy || 'Review fundamental definitions and step-by-step verification.'}
            </p>

            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center space-x-2 text-xs text-indigo-900 dark:text-indigo-200">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span><strong>Visual Tool:</strong> {activeInsight?.actionableReteachPlan?.recommendedVisual || 'Desmos Interactive Graph'}</span>
            </div>
          </div>
        </div>

        {/* Impacted Students Micro-Cohort */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Students Requiring Targeted Group Drill ({activeInsight?.impactedStudents?.length ?? 0})
              </span>
            </div>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold cursor-pointer">
              Export Printable Practice Sheet →
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(activeInsight?.impactedStudents || []).map((student) => (
              <span
                key={student}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
                {student}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
