'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  Layers, 
  BrainCircuit,
  Lightbulb
} from 'lucide-react';

export default function HeroTransformCard() {
  const { user } = useAuth();
  const [savedName, setSavedName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'traditional' | 'learngraph'>('learngraph');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('learngraph_latest_analysis');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.student_name && parsed.student_name !== 'Student') {
            setSavedName(parsed.student_name);
          }
        }
      } catch {}
    }
  }, []);

  const studentDisplayName = user?.name || savedName || 'Lingjensthaibi';

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-indigo-500/20 via-slate-200 dark:via-slate-800 to-transparent shadow-2xl">
      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Toggle Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
              Transforming Assessment: Real Student Case Study ({studentDisplayName})
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
            <button
              onClick={() => setViewMode('traditional')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'traditional'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Traditional Score
            </button>
            <button
              onClick={() => setViewMode('learngraph')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'learngraph'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>LearnGraph Diagnostic</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {viewMode === 'traditional' ? (
            /* Traditional Score View */
            <div className="grid md:grid-cols-2 gap-6 items-center animate-fadeIn">
              <div className="bg-amber-50/60 dark:bg-slate-850 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200/60 dark:border-amber-900/40 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-100 dark:bg-rose-950/40 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Test Paper</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Midterm Mathematics</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Class: 12-A • Student: {studentDisplayName}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-rose-400 flex items-center justify-center text-rose-600 dark:text-red-400 font-bold text-lg rotate-12">
                    C+
                  </div>
                </div>

                <div className="mt-8 text-center py-6 border-y border-dashed border-slate-300 dark:border-slate-700">
                  <div className="text-6xl font-black text-rose-600 dark:text-red-400 tracking-tight font-sans">
                    72<span className="text-2xl text-slate-400 font-normal">/100</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">
                    Percentile: 56th • Rank: 18 / 32
                  </p>
                </div>

                <div className="mt-6 bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 border border-amber-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    &quot;Teacher Comment: Good attempt overall. Lost marks on questions 2, 3, and 4. Needs to work harder and revise chapter 4.&quot;
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>The Problem with Raw Marks</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  A score of &quot;72&quot; conceals what the student actually knows.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {studentDisplayName} doesn&apos;t know what to study next. Is the algebra weak? Is the calculus failing? Telling a student they scored 72% creates anxiety without direction.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-red-400 flex items-center justify-center font-bold">✕</span>
                    <span>Lumps masteries and total conceptual misunderstandings together</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-red-400 flex items-center justify-center font-bold">✕</span>
                    <span>Teacher has to manually re-grade 30 papers to discover class-wide trends</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-red-400 flex items-center justify-center font-bold">✕</span>
                    <span>No clear prescription for what single skill would yield maximum growth</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setViewMode('learngraph')}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 group cursor-pointer"
                  >
                    <span>Click to see how LearnGraph unpacks this paper</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* LearnGraph Topic Breakdown View */
            <div className="grid md:grid-cols-12 gap-6 items-start animate-fadeIn">
              {/* Left Column: Topic Mastery Bars */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Extracted Understanding Profile
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Topic Breakdown for {studentDisplayName}
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                    4 Topics Diagnosed
                  </span>
                </div>

                {/* Progress bars with traffic light color semantics */}
                <div className="space-y-3.5">
                  {/* Algebra */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">Algebra & Linear Equations</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">95% (Mastered)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: '95%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-step balance and variable isolation executed with 100% precision.</p>
                  </div>

                  {/* Quadratic */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">Quadratic Equations</span>
                      </div>
                      <span className="font-extrabold text-amber-700 dark:text-amber-400">64% (Needs Drill)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: '64%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Factoring is sound, but lost points dropping a sign inside <span className="highlight-yellow">-(-b)</span>.
                    </p>
                  </div>

                  {/* Functions */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">Functions & Domain</span>
                      </div>
                      <span className="font-extrabold text-rose-700 dark:text-rose-400">42% (Critical Gap)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-700" style={{ width: '42%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Did not account for denominator <span className="highlight-yellow">x - 7 != 0</span> boundary.
                    </p>
                  </div>

                  {/* Graphs */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">Graph Transformations</span>
                      </div>
                      <span className="font-extrabold text-rose-700 dark:text-rose-400">35% (Critical Gap)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-700" style={{ width: '35%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Inverted horizontal vector: plotted <span className="highlight-yellow">(x - 3)^2</span> shifted left instead of right.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Actionable Prescription */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-blue-950/30 rounded-2xl p-5 border border-indigo-200/70 dark:border-indigo-900/60 shadow-xs">
                  <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Prescription</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    &quot;{studentDisplayName} is not a 72% student. This student is a 95% mathematical thinker with 2 specific rule misconceptions.&quot;
                  </h4>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-indigo-100 dark:border-indigo-950 shadow-2xs">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Remediate Horizontal Shift Rule</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            Fixing <span className="highlight-yellow">f(x - h)</span> immediately unlocks +15 marks on upcoming finals.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-indigo-100 dark:border-indigo-950 shadow-2xs">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Double-Gate Domain Checklist</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            Add a 2-step audit for fractions with radicals to avoid asymptote drops.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                    <Link
                      href="/student"
                      className="w-full text-center py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      View {studentDisplayName}&apos;s Notebook Guide →
                    </Link>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Teacher Section View:</span>
                  <Link href="/teacher" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View Section A Aggregate Map →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
