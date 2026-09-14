'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface TopicTrendPoint {
  date: string;
  score: number;
  subject: string;
}

export interface TopicTrendSeries {
  topic: string;
  subject: string;
  history: TopicTrendPoint[];
  latestScore: number;
  trend: 'up' | 'down' | 'stable' | 'new';
}


export interface StudentProgressTrendProps {
  /** Array of score history sorted oldest → newest */
  history: TopicTrendPoint[];
  /** Optional: label for the series (e.g., subject name) */
  label?: string;
  /** If true, render a compact single-line sparkline (for use in tables) */
  compact?: boolean;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
  return <Minus className="w-3.5 h-3.5 text-amber-500" />;
}

export default function StudentProgressTrend({
  history,
  label,
  compact = false,
}: StudentProgressTrendProps) {
  if (!history || history.length === 0) {
    return (
      <span className="text-[11px] text-slate-400 italic">No history</span>
    );
  }

  if (history.length === 1) {
    const score = history[0].score;
    const color =
      score >= 80 ? 'text-emerald-600 dark:text-emerald-400'
        : score >= 50 ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400';
    return (
      <div className="flex items-center space-x-1.5">
        <span className={`font-black text-sm ${color}`}>{score}%</span>
        <span className="text-[10px] text-slate-400 font-medium">First scan</span>
      </div>
    );
  }

  const latest = history[history.length - 1].score;
  const previous = history[history.length - 2].score;
  const diff = latest - previous;
  const overallTrend: 'up' | 'down' | 'stable' =
    diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable';

  const max = Math.max(...history.map((h) => h.score), 100);
  const min = Math.min(...history.map((h) => h.score), 0);
  const range = max - min || 1;

  // Sparkline: normalize scores to 0–100% height within a small 32px tall box
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((h.score - min) / range) * 100;
    return `${x},${y}`;
  });
  const polyline = points.join(' ');

  const lineColor =
    overallTrend === 'up' ? '#10b981'
      : overallTrend === 'down' ? '#f43f5e'
      : '#f59e0b';

  const scoreColor =
    latest >= 80 ? 'text-emerald-600 dark:text-emerald-400'
      : latest >= 50 ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {/* Mini sparkline */}
        <svg
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          className="w-16 h-5 shrink-0"
        >
          <polyline
            points={polyline}
            fill="none"
            stroke={lineColor}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span className={`font-black text-xs ${scoreColor}`}>{latest}%</span>
        <TrendIcon trend={overallTrend} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      )}

      {/* Sparkline chart */}
      <div className="relative">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="w-full h-10"
        >
          {/* Fill area under line */}
          <polygon
            points={`0,40 ${polyline} 100,40`}
            fill={lineColor}
            fillOpacity="0.08"
          />
          <polyline
            points={polyline}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Dots at each data point */}
          {history.map((h, i) => {
            const x = (i / (history.length - 1)) * 100;
            const y = 40 - ((h.score - min) / range) * 40;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={lineColor}
                stroke="white"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Score labels on x-axis */}
        <div className="flex justify-between mt-1">
          {history.map((h, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / history.length}%` }}>
              <span className="text-[9px] text-slate-400 font-mono block">
                {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {h.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <TrendIcon trend={overallTrend} />
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {overallTrend === 'up'
              ? `+${diff}% from last scan`
              : overallTrend === 'down'
              ? `${diff}% from last scan`
              : 'Stable performance'}
          </span>
        </div>
        <span className={`font-black text-sm ${scoreColor}`}>{latest}%</span>
      </div>
    </div>
  );
}
