'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export interface TopicHeatmapCell {
  topic: string;
  subject: string;
  avgScore: number;
  studentCount: number;
  status: 'green' | 'amber' | 'red';
}

export interface SubjectAverage {
  subject: string;
  avgScore: number;
  studentCount: number;
  atRiskCount: number;
  strongCount: number;
}

interface SubjectMasteryHeatmapProps {
  subjectAverages: SubjectAverage[];
  topicHeatmap: TopicHeatmapCell[];
}

const STATUS_COLORS = {
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bar: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    bar: 'bg-amber-500',
  },
  red: {
    bg: 'bg-rose-100 dark:bg-rose-950/40',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    bar: 'bg-rose-500',
  },
};

function scoreToStatus(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

export default function SubjectMasteryHeatmap({
  subjectAverages,
  topicHeatmap,
}: SubjectMasteryHeatmapProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [showAllTopics, setShowAllTopics] = useState(false);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  // Group topics by subject
  const topicsBySubject = new Map<string, TopicHeatmapCell[]>();
  for (const cell of topicHeatmap) {
    if (!topicsBySubject.has(cell.subject)) topicsBySubject.set(cell.subject, []);
    topicsBySubject.get(cell.subject)!.push(cell);
  }

  // Topics to show at top (worst 6 topics across all subjects)
  const worstTopics = topicHeatmap.slice(0, showAllTopics ? undefined : 6);

  if (subjectAverages.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        No diagnostic data available yet. Upload and analyze answer sheets to see the class heatmap.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Averages Bar Chart */}
      <div className="space-y-2.5">
        {subjectAverages.map((subj) => {
          const status = scoreToStatus(subj.avgScore);
          const colors = STATUS_COLORS[status];
          const isExpanded = expandedSubjects.has(subj.subject);
          const subjectTopics = topicsBySubject.get(subj.subject) || [];

          return (
            <div key={subj.subject} className={`rounded-2xl border ${colors.border} overflow-hidden`}>
              {/* Subject header row */}
              <button
                onClick={() => toggleSubject(subj.subject)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${colors.bg} hover:opacity-90 transition-opacity cursor-pointer text-left`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`font-extrabold text-sm ${colors.text}`}>
                      {subj.subject}
                    </span>
                    <div className="flex items-center space-x-3 shrink-0 text-[11px]">
                      <span className={`font-black text-base ${colors.text}`}>
                        {subj.avgScore}%
                      </span>
                      <span className="text-slate-400">{subj.studentCount} students</span>
                      {subj.atRiskCount > 0 && (
                        <span className="flex items-center space-x-0.5 text-rose-600 dark:text-rose-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{subj.atRiskCount} at risk</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${subj.avgScore}%` }}
                    />
                  </div>
                </div>
                {subjectTopics.length > 0 && (
                  isExpanded
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded topic rows */}
              {isExpanded && subjectTopics.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {subjectTopics.map((topic) => {
                    const tStatus = scoreToStatus(topic.avgScore);
                    const tColors = STATUS_COLORS[tStatus];
                    return (
                      <div key={topic.topic} className="flex items-center gap-3 px-5 py-2.5">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${tColors.bar}`}
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 font-medium">
                          {topic.topic}
                        </span>
                        <div className="flex items-center space-x-3 shrink-0">
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${tColors.bar} rounded-full`}
                              style={{ width: `${topic.avgScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold w-9 text-right ${tColors.text}`}>
                            {topic.avgScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 w-16 text-right">
                            {topic.studentCount} student{topic.studentCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Priority Topics Panel */}
      {topicHeatmap.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Priority Topics — Needs Class-wide Reteach
            </h4>
            {topicHeatmap.length > 6 && (
              <button
                onClick={() => setShowAllTopics((v) => !v)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline"
              >
                {showAllTopics ? 'Show less' : `Show all ${topicHeatmap.length} topics`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {worstTopics.map((cell) => {
              const colors = STATUS_COLORS[cell.status];
              return (
                <div
                  key={`${cell.topic}-${cell.subject}`}
                  className={`px-3.5 py-2.5 rounded-xl border ${colors.border} ${colors.bg} space-y-1.5`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-xs font-bold ${colors.text} leading-tight`}>
                      {cell.topic}
                    </span>
                    <span className={`text-sm font-black ${colors.text} shrink-0`}>
                      {cell.avgScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {cell.subject} · {cell.studentCount} students
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${colors.border} ${colors.text}`}
                    >
                      {cell.status === 'red' ? 'CRITICAL' : cell.status === 'amber' ? 'DEVELOPING' : 'STRONG'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[cell.status].bar} rounded-full`}
                      style={{ width: `${cell.avgScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
