'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';

export interface AtRiskStudentSummary {
  studentName: string;
  studentId: string;
  overallScore: number;
  subject: string;
  primaryGap: string;
  lastScanDate: string;
}

interface AtRiskPanelProps {
  students: AtRiskStudentSummary[];
  onInspect: (studentName: string) => void;
}

export default function AtRiskPanel({ students, onInspect }: AtRiskPanelProps) {
  if (students.length === 0) {
    return (
      <div className="flex items-center space-x-3 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
          No at-risk students detected — all scanned students are above 50% mastery. 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
        <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
          {students.length} student{students.length !== 1 ? 's' : ''} flagged as at-risk (below 50% mastery) — immediate intervention recommended.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((student) => (
          <div
            key={student.studentName}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-800/60 shadow-xs hover:shadow-md hover:border-rose-400 dark:hover:border-rose-600 transition-all space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-black text-sm shrink-0">
                  {student.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {student.studentName}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {student.studentId}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {student.overallScore}%
                </span>
                <TrendingDown className="w-4 h-4 text-rose-500 ml-auto mt-0.5" />
              </div>
            </div>

            {/* Subject & Gap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800/50">
                  {student.subject}
                </span>
                <span className="text-slate-400 font-mono">
                  {new Date(student.lastScanDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                <strong className="text-slate-700 dark:text-slate-300">Gap:</strong>{' '}
                {student.primaryGap}
              </p>
            </div>

            {/* Mastery bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Mastery Level</span>
                <span className="text-rose-600 dark:text-rose-400">CRITICAL</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                  style={{ width: `${Math.max(student.overallScore, 2)}%` }}
                />
              </div>
            </div>

            {/* Inspect button */}
            <button
              onClick={() => onInspect(student.studentName)}
              className="w-full py-2 flex items-center justify-center space-x-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>Inspect &amp; Remediate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
