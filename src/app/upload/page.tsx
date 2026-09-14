'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { getSubjectSamplePaper } from '@/lib/samplePapers';

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Economics'
];

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const querySubject = searchParams.get('subject');
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (querySubject) return querySubject;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('learngraph_selected_subject') || 'Mathematics';
    }
    return 'Mathematics';
  });

  useEffect(() => {
    if (querySubject) {
      setSelectedSubject(querySubject);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_selected_subject', querySubject);
      }
    }
  }, [querySubject]);

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
    { title: 'Curriculum Semantic Alignment', desc: `Mapping student working against ${selectedSubject} standards...` },
    { title: 'Cognitive Misconception Diagnosis', desc: 'Evaluating step-by-step against canonical model solutions...' },
    { title: 'Study Guide & Reteach Compilation', desc: 'Synthesizing personalized diagnostic cards & mastery metrics...' },
  ];

  const uploadAndAnalyze = async (fileToUpload: File, customStudentName?: string, customSubject?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStage(0);
    setProgressPercent(15);
    setStatusMessage(`Scanning ${customSubject || selectedSubject} handwriting & evaluating steps...`);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) return prev;
        const next = prev + 7;
        if (next > 65) setProcessingStage(2);
        else if (next > 35) setProcessingStage(1);
        return next;
      });
    }, 180);

    try {
      const activeSubject = customSubject || selectedSubject || 'Mathematics';
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const studentDisplayName = customStudentName?.trim() || (user?.role === 'student' ? user?.name : '') || (typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null) || '';
      if (studentDisplayName) {
        formData.append('student_name', studentDisplayName);
      }
      formData.append('subject', activeSubject);

      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_selected_subject', activeSubject);
      }

      const res = await fetch('/api/analyze-sheet', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze answer sheet');
      }

      clearInterval(interval);
      setProcessingStage(3);
      setProgressPercent(100);
      setStatusMessage('Analysis complete! Synthesizing student study guide...');

      if (data.notice) {
        setApiNotice(data.notice);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_latest_analysis', JSON.stringify(data));
        if (data.student_name && data.student_name !== 'Student') {
          localStorage.setItem('learngraph_active_student_name', data.student_name.trim());
          const storedAuth = localStorage.getItem('learngraph_auth_user');
          if (storedAuth) {
            try {
              const authObj = JSON.parse(storedAuth);
              if (authObj.role === 'student') {
                authObj.name = data.student_name.trim();
                localStorage.setItem('learngraph_auth_user', JSON.stringify(authObj));
              }
            } catch {}
          }
        }
        if (data.subject) {
          localStorage.setItem('learngraph_selected_subject', data.subject);
        }
        window.dispatchEvent(new CustomEvent('learngraph_analysis_completed', { detail: data }));
      }

      setTimeout(() => {
        router.push('/student?tab=overview&uploaded=true');
      }, 1000);

    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Error communicating with analysis service.');
    }
  };

  const handleStartSubjectAnalysis = (subjectName: string) => {
    const activeStoredName = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
    const studentDisplayName = user?.name || (activeStoredName && activeStoredName !== 'Aarav Gupta' && activeStoredName !== 'Student' ? activeStoredName : null) || (subjectName.toLowerCase().includes('chem') ? 'Arola Thoudam' : 'Rishu');
    const sampleContent = getSubjectSamplePaper(subjectName, studentDisplayName);

    const file = new File(
      [sampleContent], 
      `${studentDisplayName.replace(/\s+/g, '_')}_${subjectName.replace(/\s+/g, '_')}_Paper.txt`, 
      { type: 'text/plain' }
    );
    setUploadedFile(file);
    uploadAndAnalyze(file, studentDisplayName, subjectName);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 pb-24 md:pb-12 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal AI Diagnostic Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Diagnose Student Answer Sheet
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Upload any student test paper or handwritten homework across STEM & Humanities. The AI evaluates question-by-question, compares with model solutions, and pinpoints cognitive misconceptions.
          </p>
        </div>

        {/* Dynamic Subject Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Examination Target Subject</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {selectedSubject}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="subject-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Change Subject:
            </label>
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSelectedSubject(nextSub);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('learngraph_selected_subject', nextSub);
                }
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {AVAILABLE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Upload Box / Processing Screen */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 shadow-md p-6 sm:p-8 md:p-10">
          {!isProcessing ? (
            <div className="space-y-6">
              {/* Drag & Drop Area */}
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
                      Drag and drop your {selectedSubject} answer sheet here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      Supports PDF, PNG, JPG, WEBP • Evaluates step-by-step with canonical model answers
                    </span>
                  </div>
                </label>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                    Strict FERPA & Student Privacy Compliant
                  </span>
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                    Extracts Question Work & Annotations
                  </span>
                </div>
              </div>

              {/* Dynamic 1-Click Subject Sample Action */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Instant Test: Diagnose Sample {selectedSubject} Paper
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Run step-by-step question evaluation for {selectedSubject} in 1 click
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartSubjectAnalysis(selectedSubject)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap inline-flex items-center justify-center space-x-1.5"
                >
                  <span>Test {selectedSubject} Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Processing Error</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Progress Screen */
            <div className="py-8 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950/60 animate-ping opacity-25"></div>
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {statusMessage}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Analyzing {selectedSubject} submission • Comparing working steps against canonical models
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Processing Stages */}
              <div className="text-left space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                {processingSteps.map((step, idx) => {
                  const isDone = processingStage > idx;
                  const isCurrent = processingStage === idx;
                  return (
                    <div 
                      key={step.title}
                      className={`flex items-start space-x-3 text-xs transition-opacity ${
                        isCurrent ? 'opacity-100 font-bold' : isDone ? 'opacity-70 text-slate-500' : 'opacity-30'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white">{step.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Upload Desk...</span>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
