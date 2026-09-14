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

  const uploadAndAnalyze = async (fileToUpload: File, customStudentName?: string, customSubject?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStage(0);
    setProgressPercent(15);
    setStatusMessage('Scanning handwriting & evaluating steps with AI Diagnostic Engine...');

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
      const studentDisplayName = customStudentName || user?.name || 'Aarav Gupta';
      formData.append('student_name', studentDisplayName);

      const activeSubject = customSubject || (typeof window !== 'undefined' ? localStorage.getItem('learngraph_selected_subject') : 'Mathematics') || 'Mathematics';
      formData.append('subject', activeSubject);

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
        window.dispatchEvent(new CustomEvent('learngraph_analysis_completed', { detail: data }));
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

  const handleStartAlgebraAnalysis = () => {
    const studentDisplayName = user?.name || 'Aarav Gupta';
    const sampleContent = `Student Name: ${studentDisplayName}
Class: Class 10 • Section A
Roll No: 24
Subject: Mathematics (Algebra & Quadratic Equations Midterm)
Date: 2026-09-14

Question 1: Linear Equations in Two Variables (25 Marks)
Prompt: Solve the system of linear equations by substitution: 2x + 3y = 12 and x - y = 1.
Student Working:
From equation 2: x = y + 1.
Substitute into eq 1: 2(y + 1) + 3y = 12
=> 2y + 2 + 3y = 12 => 5y = 10 => y = 2.
Then x = 2 + 1 = 3.
Final Solution: x = 3, y = 2.
Teacher Grading: 25/25 ✓ Full Marks. Clean substitution and calculation.

Question 2: Quadratic Equation Factorization & Roots (25 Marks)
Prompt: Solve the quadratic equation by factoring: x^2 - 4x - 12 = 0.
Student Working:
Factors of -12 that add to -4 are -6 and +2.
Factored form: (x - 6)(x + 2) = 0.
Therefore roots are: x = -6 or x = 2.
Teacher Grading: 15/25 ½ Partial. Factored correctly but sign inversion on roots: x - 6 = 0 gives x = +6, and x + 2 = 0 gives x = -2.

Question 3: Algebraic Identities & Bracket Expansion (25 Marks)
Prompt: Expand and simplify: (2x + 3)^2 - (2x - 3)^2.
Student Working:
(4x^2 + 12x + 9) - (4x^2 - 12x + 9) = 4x^2 - 4x^2 + 12x - 12x + 9 - 9 = 0.
Teacher Grading: 10/25 ✕ Error. Dropped negative sign distribution over -(-12x). Correct answer is 24x.

Question 4: Linear Equations Word Problems (25 Marks)
Prompt: The perimeter of a rectangular garden is 48 meters. The length is 6 meters greater than the width. Find the length and width.
Student Working:
Let width = w, length = w + 6.
Perimeter = 2(w + w + 6) = 4w + 12 = 48.
4w = 36 => w = 9 meters.
Length = 9 + 6 = 15 meters. Verification: 2(15 + 9) = 48m.
Teacher Grading: 25/25 ✓ Full Marks. Excellent modeling.

Final Total Score: 75/100 (75%)`;

    const file = new File([sampleContent], `${studentDisplayName.replace(/\s+/g, '_')}_Algebra_Midterm.txt`, { type: 'text/plain' });
    setUploadedFile(file);
    uploadAndAnalyze(file, studentDisplayName, 'Mathematics');
  };

  const handleStartCalculusAnalysis = () => {
    const studentDisplayName = user?.name || 'Lingjensthaibi';
    const sampleContent = `Student Name: ${studentDisplayName}
Subject: Advanced Calculus & Analysis Midterm
Grade & Section: Grade 12 • Section A
Date of Examination: 2026-09-14

Question 1: Differential Calculus & Chain Rule (25 Marks)
Prompt: Find the derivative dy/dx for y = (3x^2 - 5)^4 using the Chain Rule.
Student Working:
Let u = 3x^2 - 5
dy/du = 4u^3, du/dx = 6x
dy/dx = (dy/du) * (du/dx) = 4(3x^2 - 5)^3 * (6x) = 24x(3x^2 - 5)^3
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: Product & Quotient Differentiation (25 Marks)
Prompt: Differentiate f(x) = x^3 * sin(2x) with respect to x.
Student Working:
f'(x) = 3x^2 * sin(2x) + x^3 * cos(2x)
Teacher Grading: 18/25 ½ Partial. Omitted inner chain factor of 2 on sin(2x).

Question 3: Integral Calculus & U-Substitution (25 Marks)
Prompt: Evaluate the indefinite integral: \int 2x * sqrt(x^2 + 9) dx.
Student Working:
Let u = x^2 + 9, du = 2x dx => (2/3)u^(3/2) = (2/3)(x^2 + 9)^(3/2)
Teacher Grading: 15/25 ½ Partial. Omission of integration constant (+ C).

Question 4: Applications of Derivatives & Tangents (25 Marks)
Prompt: Find the equation of the tangent line to y = x^3 - 4x + 1 at (2, 1).
Student Working:
dy/dx = 3x^2 - 4. At x = 2, m = 8. Tangent: y - 2 = 8(x - 1) => y = 8x - 6
Teacher Grading: 9/25 ✕ Error. Inverted coordinates: substituted (x1, y1) as (1, 2) instead of (2, 1).

Final Total Score: 67/100 (67%)`;

    const file = new File([sampleContent], `${studentDisplayName.replace(/\s+/g, '_')}_Calculus_Midterm.txt`, { type: 'text/plain' });
    setUploadedFile(file);
    uploadAndAnalyze(file, studentDisplayName, 'Mathematics');
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

            {/* Quick Demo Presets: 1-Click Test Sheets */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              {/* Preset 1: Algebra & Quadratics (Aarav Gupta) */}
              <div className="p-4 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/10 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Sample 1: Aarav Gupta
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        Class 10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Linear Equations, Quadratic Factorization & Word Problems
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartAlgebraAnalysis}
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Test Algebra Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset 2: Calculus Midterm (Lingjensthaibi) */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-blue-950/10 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Sample 2: Lingjensthaibi
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                        Grade 12
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Derivatives, Chain Rule, U-Substitution & Tangents
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartCalculusAnalysis}
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Test Calculus Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
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