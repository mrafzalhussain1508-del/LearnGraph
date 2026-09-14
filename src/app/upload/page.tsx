'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  Layers, 
  Search, 
  FileCheck, 
  RefreshCw,
  Clock,
  ShieldCheck,
  School,
  BookOpen,
  Key,
  AlertCircle
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing AI Diagnostic engine...');
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingSteps = [
    { title: 'Optical Character Recognition (OCR)', desc: 'Scanning handwritten equations, diagrams, and scratch annotations...' },
    { title: 'Curriculum Semantic Alignment', desc: 'Mapping test problems against Grade 10 Math Topic Standards...' },
    { title: 'Cognitive Misconception Diagnosis', desc: 'Separating procedural calculation slips from deep structural misunderstandings...' },
    { title: 'Study Guide & Reteach Compilation', desc: 'Synthesizing personalized notebook cards & Section A heatmap metrics...' },
  ];

  const uploadAndAnalyze = async (fileToUpload: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStage(0);
    setProgressPercent(15);
    setStatusMessage('Scanning handwriting & analyzing cognitive gaps with Gemini...');

    // Progress animation ticker
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) return prev; // Hold at 85% until network response arrives
        const next = prev + 7;
        if (next > 65) setProcessingStage(2);
        else if (next > 35) setProcessingStage(1);
        return next;
      });
    }, 180);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/analyze-sheet', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze answer sheet');
      }

      // Finish progress animation
      clearInterval(interval);
      setProcessingStage(3);
      setProgressPercent(100);
      setStatusMessage('Analysis complete! Synthesizing student study guide...');

      if (data.notice) {
        setApiNotice(data.notice);
      }

      // Store in localStorage for dynamic rendering on the Student Dashboard
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_latest_analysis', JSON.stringify(data));
      }

      // Smooth transition to /student
      setTimeout(() => {
        router.push('/student');
      }, 1200);

    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Error communicating with analysis service.');
    }
  };

  const handleStartAnalysis = (filename?: string) => {
    const studentDisplayName = user?.name || 'Alex Chen';
    const targetFilename = filename || `${studentDisplayName.replace(/\s+/g, '_')}_Math_Midterm_10A.pdf`;
    // If a file was selected, use it; otherwise create a sample test file
    let file = uploadedFile;
    if (!file) {
      const sampleContent = `${studentDisplayName} Math Midterm Exam Section 10A: Algebra, Quadratic Equations, Functions & Graphs`;
      file = new File([sampleContent], targetFilename, { type: 'application/pdf' });
      setUploadedFile(file);
    }
    uploadAndAnalyze(file);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 pb-24 md:pb-12 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Google Gemini Multimodal Vision Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Upload Student Answer Sheet
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Drop in any handwritten exam or quiz. Gemini will analyze the student's reasoning steps, classify misconceptions, and dynamically update the Student Dashboard.
          </p>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-3 text-xs text-rose-800 dark:text-rose-300 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Analysis Error:</span> {errorMessage}
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Zone Card */}
        {!isProcessing ? (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const dropped = e.dataTransfer.files[0];
                  setUploadedFile(dropped);
                  uploadAndAnalyze(dropped);
                }
              }}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
              } shadow-sm`}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const picked = e.target.files[0];
                    setUploadedFile(picked);
                    uploadAndAnalyze(picked);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">
                    Drag and drop your answer sheet here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    Supports PDF, PNG, JPG, WEBP • Analyzed with Google Gemini Vision
                  </span>
                </div>
              </label>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                  FERPA & Privacy Compliant
                </span>
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                  Extracts Equations & Rough Work
                </span>
              </div>
            </div>

            {/* Quick Demo Preset: 1-Click Test Sheet */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-blue-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Try Sample Test: {user?.name || 'Alex Chen'}
                    </h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                      Ready to Test
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    "Midterm Math 10A (Algebra, Quadratics, Functions, Graphs)"
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartAnalysis()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <span>Run 1-Click Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* API Key Configuration Tip */}
            <div className="p-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-3">
              <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Using your Gemini API Key:
                </p>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  Add <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">GEMINI_API_KEY=your_key</code> in <code className="font-mono">.env.local</code> to activate live vision inference. The backend gracefully handles demonstration mode even if your key is not yet configured.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Stage Animated Processing View */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-lg space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 animate-pulse">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AI Analyzing Understanding...
              </h3>
              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {statusMessage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Diagnostic Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Stages Checklist */}
            <div className="space-y-3 pt-2">
              {processingSteps.map((step, idx) => {
                const isDone = processingStage > idx || progressPercent === 100;
                const isCurrent = processingStage === idx && progressPercent < 100;
                return (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-300 ring-1 ring-indigo-400 dark:ring-indigo-500'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${
                        isDone ? 'text-emerald-900 dark:text-emerald-300' : isCurrent ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-[11px] ${
                        isDone ? 'text-emerald-700 dark:text-emerald-400' : isCurrent ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {progressPercent === 100 && (
              <div className="pt-2 text-center animate-fadeIn">
                <Link
                  href="/student"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <span>Analysis Complete • Open Student Study Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Bottom Route Assistance */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-6">
          <Link href="/teacher" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center">
            <School className="w-3.5 h-3.5 mr-1" />
            Jump to Teacher View
          </Link>
          <span>•</span>
          <Link href="/student" className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Jump to Student View
          </Link>
        </div>
      </div>
    </div>
  );
}