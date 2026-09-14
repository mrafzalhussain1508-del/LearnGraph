'use client';

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  sectionAClassMetrics, 
  getTrafficLight 
} from '@/lib/mockData';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Info,
  Sliders,
  Filter
} from 'lucide-react';

export default function ClassLearningMap() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Format data for Recharts horizontal bar chart (layout="vertical")
  const chartData = sectionAClassMetrics.map((item) => ({
    name: item.topic,
    score: item.score,
    benchmark: item.benchmark,
    struggling: item.studentCountStruggling,
    total: item.totalStudents,
    description: item.description,
  }));

  const activeDetails = sectionAClassMetrics.find((t) => t.topic === selectedTopic) || sectionAClassMetrics[3]; // default Graphs

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
              Section A • Mathematics
            </span>
            <span className="text-xs text-slate-400">28 Students Evaluated</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Topic Understanding Map (Diagnostic Benchmark)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Class mastery distribution evaluated across 4 core conceptual strands
          </p>
        </div>

        {/* Traffic Light Cognitive Recognition Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Mastery (&gt; 80%)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Developing (50 - 79%)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Critical Struggle (&lt; 50%)</span>
          </div>
        </div>
      </div>

      {/* Chart & Quick Detail Split */}
      <div className="grid lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Horizontal Bar Chart */}
        <div className="lg:col-span-8 h-72 sm:h-80 md:h-88 lg:h-96 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  setSelectedTopic(e.activeLabel as string);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                unit="%" 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={125} 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                axisLine={{ stroke: '#475569' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const style = getTrafficLight(data.score);
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1 z-50">
                        <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
                        <div className="flex items-center space-x-2 pt-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${style.dotClass}`}></span>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{data.score}%</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${style.badgeClass}`}>
                            {style.badgeText}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 pt-1">
                          Benchmark Goal: <strong>70%</strong>
                        </p>
                        <p className="text-rose-600 dark:text-rose-400 font-semibold pt-0.5">
                          {data.struggling} of {data.total} students struggling
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Benchmark target line at 70% */}
              <ReferenceLine x={70} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target 70%', position: 'top', fill: '#64748b', fontSize: 10 }} />
              
              <Bar 
                dataKey="score" 
                radius={[0, 8, 8, 0]} 
                barSize={28}
                cursor="pointer"
              >
                {(chartData || []).map((entry, index) => {
                  const style = getTrafficLight(entry.score);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={style.barColor} 
                      className="hover:opacity-85 transition-opacity"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Topic Quick Diagnostic Card */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Topic Diagnostic
            </span>
            {(() => {
              const style = getTrafficLight(activeDetails.score);
              return (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${style.badgeClass}`}>
                  {style.badgeText}
                </span>
              );
            })()}
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {activeDetails.topic}
          </h4>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeDetails.score}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">class average</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <p className="text-slate-700 dark:text-slate-300 font-medium">{activeDetails.description}</p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Struggling cohort:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {activeDetails.studentCountStruggling} / {activeDetails.totalStudents} students
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            Tip: Click any bar on the chart to inspect topic diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
}
