'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MasteryCheckpointModal from '@/components/MasteryCheckpointModal';
import { AnalyzeSheetResponse } from '@/app/api/analyze-sheet/route';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  Compass, 
  FileSpreadsheet, 
  Sparkles, 
  Video, 
  UploadCloud, 
  ArrowRight, 
  RotateCcw, 
  CheckSquare, 
  Layers, 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { getSubjectSamplePaper } from '@/lib/samplePapers';

import StudyGuideOverviewView from '@/components/student/StudyGuideOverviewView';
import SubjectsView from '@/components/student/SubjectsView';
import TopicDiagnosesView from '@/components/student/TopicDiagnosesView';
import AnalyzedSheetView from '@/components/student/AnalyzedSheetView';
import WhatToLearnNextView from '@/components/student/WhatToLearnNextView';
import StudyResourcesView from '@/components/student/StudyResourcesView';
import MockTestsView from '@/components/student/MockTestsView';

type StudentTabId = 'overview' | 'subjects' | 'topics' | 'sheet' | 'next_steps' | 'mock_tests' | 'resources';

const tabList: { id: StudentTabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Study Guide Overview', icon: BookOpen },
  { id: 'subjects', label: 'My Subjects', icon: Layers },
  { id: 'topics', label: 'Topic Diagnoses', icon: Compass },
  { id: 'sheet', label: 'Analyzed Answer Sheet', icon: FileSpreadsheet },
  { id: 'next_steps', label: 'What to Learn Next', icon: Sparkles },
  { id: 'mock_tests', label: 'Mock Tests & Quizzes', icon: CheckSquare },
  { id: 'resources', label: 'Study Resources & Videos', icon: Video },
];

function StudentDashboardContent() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Strict RBAC: If an authenticated teacher attempts to view student study guide, redirect to teacher dashboard
  useEffect(() => {
    if (isReady && user && user.role === 'teacher') {
      router.replace('/teacher');
    }
  }, [user, isReady, router]);

  if (isReady && user && user.role === 'teacher') {
    return null;
  }

  // 1. Tab Navigation State
  const urlTab = searchParams.get('tab') as StudentTabId | null;
  const [activeTab, setActiveTab] = useState<StudentTabId>(() => {
    if (urlTab && ['overview', 'subjects', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(urlTab)) {
      return urlTab;
    }
    return 'overview';
  });

  // 2. Active Subject State
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('learngraph_selected_subject') || 'Mathematics';
    }
    return 'Mathematics';
  });

  // 3. State Management: Stores exact JSON response from /api/analyze-sheet
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [clearedTopics, setClearedTopics] = useState<Set<string>>(new Set());

  // Dedicated diagnosing states for in-page evaluation (Diagnose Sample Sheet)
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosingStage, setDiagnosingStage] = useState(0);
  const [diagnosingProgress, setDiagnosingProgress] = useState(0);
  const [diagnosingMessage, setDiagnosingMessage] = useState('Initializing AI Diagnostic engine...');
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  const diagnosingSteps = [
    { title: 'Optical Character Recognition (OCR)', desc: `Scanning handwritten test sheet & annotations for ${selectedSubject}...` },
    { title: 'Canonical Model Cross-Verification', desc: 'Auditing step-by-step calculations against subject ground truth...' },
    { title: 'Cognitive Misconception Diagnosis', desc: 'Isolating root conceptual traps and procedural errors...' },
    { title: 'Study Guide & Reteach Compilation', desc: 'Synthesizing topic cards and personalized action plan...' },
  ];

  // Function to fetch latest analysis from server without destructive wipe
  const fetchAnalysisForSubject = useCallback(async (studentQuery?: string, subjectQuery?: string) => {
    try {
      const params = new URLSearchParams();
      if (studentQuery) params.set('student', studentQuery);
      if (subjectQuery) params.set('subject', subjectQuery);
      const res = await fetch(`/api/student/latest-analysis?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          if (data.analysis.student_name === 'Aarav Gupta' && data.analysis.subject?.toLowerCase().includes('chem')) {
            data.analysis.student_name = 'Arola Thoudam';
          }
          setAnalysisResult(data.analysis);
          if (typeof window !== 'undefined') {
            localStorage.setItem('learngraph_latest_analysis', JSON.stringify(data.analysis));
            if (data.analysis.student_name && data.analysis.student_name !== 'Aarav Gupta') {
              localStorage.setItem('learngraph_active_student_name', data.analysis.student_name);
            }
          }
        }
        // NOTE: If server reports no new record, PRESERVE local analysis. Never set null or remove from localStorage!
      }
    } catch (err) {
      console.error('Failed to sync diagnostic from server:', err);
    }
  }, []);

  // Synchronize activeTab with URL changes & backward-compatible hash anchors
  useEffect(() => {
    if (urlTab && ['overview', 'subjects', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(urlTab)) {
      setActiveTab(urlTab);
    } else if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash === '#subjects') setActiveTab('subjects');
      else if (hash === '#topic-breakdown') setActiveTab('topics');
      else if (hash === '#analyzed-sheet') setActiveTab('sheet');
      else if (hash === '#action-plan' || hash === '#diagnostic-tabs') setActiveTab('next_steps');
      else if (hash === '#mock-tests') setActiveTab('mock_tests');
      else if (hash === '#resource-hub') setActiveTab('resources');
    }
  }, [urlTab]);

  // Load saved analysis & cleared topics from localStorage and sync from server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learngraph_latest_analysis');
      if (saved) {
        try {
          const parsed: AnalyzeSheetResponse = JSON.parse(saved);
          if (parsed.student_name === 'Aarav Gupta' && (parsed.subject?.toLowerCase().includes('chem') || selectedSubject.toLowerCase().includes('chem'))) {
            parsed.student_name = 'Arola Thoudam';
          }
          setAnalysisResult(parsed);
        } catch (e) {
          console.error('Failed to parse saved Gemini analysis', e);
        }
      }

      const savedCleared = localStorage.getItem('learngraph_cleared_topics');
      if (savedCleared) {
        try {
          const parsedCleared: string[] = JSON.parse(savedCleared);
          setClearedTopics(new Set(parsedCleared));
        } catch (e) {
          console.error('Failed to parse saved cleared topics', e);
        }
      }

      // Sync latest server diagnostic
      const storedActive = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
      const activeName = (storedActive && storedActive !== 'Aarav Gupta' ? storedActive : null)
        || (user?.name && user.name !== 'Aarav Gupta' ? user.name : null)
        || (selectedSubject.toLowerCase().includes('chem') ? 'Arola Thoudam' : '');
      fetchAnalysisForSubject(activeName || undefined, selectedSubject);
    }
    setIsLoading(false);
  }, [user, selectedSubject, fetchAnalysisForSubject]);

  // Real-time synchronization when analysis completes via upload or background job
  useEffect(() => {
    const handleAnalysisCompleted = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setAnalysisResult(detail);
        if (detail.subject) {
          setSelectedSubject(detail.subject);
          if (typeof window !== 'undefined') {
            localStorage.setItem('learngraph_selected_subject', detail.subject);
          }
        }
        if (detail.student_name && detail.student_name !== 'Student') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('learngraph_active_student_name', detail.student_name);
          }
        }
        // Automatically transition to Overview tab
        setActiveTab('overview');
        router.push('/student?tab=overview', { scroll: false });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('learngraph_analysis_completed', handleAnalysisCompleted);
      return () => window.removeEventListener('learngraph_analysis_completed', handleAnalysisCompleted);
    }
  }, [router]);

  // Sync selectedSubject whenever loaded analysisResult has a differing subject
  useEffect(() => {
    if (analysisResult?.subject && analysisResult.subject !== selectedSubject) {
      setSelectedSubject(analysisResult.subject);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_selected_subject', analysisResult.subject);
      }
    }
  }, [analysisResult?.subject, selectedSubject]);

  const handleSelectTab = useCallback((tabId: string) => {
    const validTab = (['overview', 'subjects', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(tabId) ? tabId : 'overview') as StudentTabId;
    setActiveTab(validTab);
    router.push(`/student?tab=${validTab}`, { scroll: false });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [router]);

  const handleSelectSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_selected_subject', subjectName);
    }
    const storedActive = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
    const activeName = (storedActive && storedActive !== 'Aarav Gupta' ? storedActive : null)
      || (user?.name && user.name !== 'Aarav Gupta' ? user.name : null)
      || (subjectName.toLowerCase().includes('chem') ? 'Arola Thoudam' : '');
    fetchAnalysisForSubject(activeName || undefined, subjectName);
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('learngraph_latest_analysis');
    }
    setAnalysisResult(null);
  };

  const handleLoadSample = async () => {
    setIsDiagnosing(true);
    setDiagnosticError(null);
    setDiagnosingStage(0);
    setDiagnosingProgress(15);
    setDiagnosingMessage(`Scanning ${selectedSubject} handwriting & evaluating steps...`);

    const interval = setInterval(() => {
      setDiagnosingProgress((prev) => {
        if (prev >= 85) return prev;
        const next = prev + 8;
        if (next > 65) setDiagnosingStage(2);
        else if (next > 35) setDiagnosingStage(1);
        return next;
      });
    }, 180);

    try {
      const storedActive = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
      const activeName = (storedActive && storedActive !== 'Aarav Gupta' && storedActive !== 'Student' ? storedActive : null)
        || (user?.name && user.name !== 'Aarav Gupta' ? user.name : null)
        || (selectedSubject.toLowerCase().includes('chem') ? 'Arola Thoudam' : 'Rishu');

      const sampleContent = getSubjectSamplePaper(selectedSubject, activeName);
      const sampleFile = new File(
        [sampleContent],
        `${activeName.replace(/\s+/g, '_')}_${selectedSubject.replace(/\s+/g, '_')}_Paper.txt`,
        { type: 'text/plain' }
      );
      const fd = new FormData();
      fd.append('file', sampleFile);
      fd.append('student_name', activeName);
      fd.append('subject', selectedSubject);

      const res = await fetch('/api/analyze-sheet', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze answer sheet');
      }

      clearInterval(interval);
      setDiagnosingStage(3);
      setDiagnosingProgress(100);
      setDiagnosingMessage('Analysis complete! Synthesizing student study guide...');

      setAnalysisResult(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_latest_analysis', JSON.stringify(data));
        if (data.student_name && data.student_name !== 'Aarav Gupta' && data.student_name !== 'Student') {
          localStorage.setItem('learngraph_active_student_name', data.student_name);
        }
        if (data.subject) {
          localStorage.setItem('learngraph_selected_subject', data.subject);
          setSelectedSubject(data.subject);
        }
      }

      // Automatically transition to Study Guide Overview
      setTimeout(() => {
        setIsDiagnosing(false);
        handleSelectTab('overview');
      }, 700);

    } catch (err: any) {
      clearInterval(interval);
      setIsDiagnosing(false);
      setDiagnosticError(err?.message || 'Error communicating with diagnostic service.');
    }
  };

  const handleMarkTopicCleared = (topicName: string) => {
    setClearedTopics((prev) => {
      const updated = new Set(prev);
      updated.add(topicName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_cleared_topics', JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
  };

  const handleToggleCleared = (topicName: string) => {
    setClearedTopics((prev) => {
      const updated = new Set(prev);
      if (updated.has(topicName)) {
        updated.delete(topicName);
      } else {
        updated.add(topicName);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_cleared_topics', JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
  };

  const rawAnalysisName = analysisResult?.student_name;
  const validAnalysisName = (rawAnalysisName && rawAnalysisName !== 'Student' && rawAnalysisName !== 'Alex Chen' && rawAnalysisName !== 'Aarav Gupta')
    ? rawAnalysisName
    : null;

  const storedStudentName = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
  const validStoredName = (storedStudentName && storedStudentName !== 'Student' && storedStudentName !== 'Alex Chen' && storedStudentName !== 'Aarav Gupta')
    ? storedStudentName
    : null;

  const studentName = validAnalysisName
    || validStoredName
    || (user?.name && user.name !== 'Aarav Gupta' ? user.name : null)
    || (selectedSubject.toLowerCase().includes('chem') ? 'Arola Thoudam' : 'Rishu');

  const overallScore = analysisResult?.overall_score_percentage ?? 0;
  const trueMastery = (analysisResult?.topic_breakdown && analysisResult.topic_breakdown.length > 0)
    ? Math.round(
        analysisResult.topic_breakdown.reduce(
          (acc, t) => acc + (t?.understanding_percentage ?? 0),
          0
        ) / analysisResult.topic_breakdown.length
      )
    : overallScore;

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row bg-[#fcfaf5] dark:bg-slate-950 min-h-[calc(100vh-4rem)] w-full">
        <Sidebar type="student" activeTab={activeTab} onTabChange={handleSelectTab} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-medium text-sm">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Student Study Desk...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentTabObj = tabList.find((t) => t.id === activeTab) || tabList[0];

  return (
    <div className="flex flex-col md:flex-row bg-[#fcfaf5] dark:bg-slate-950 min-h-[calc(100vh-4rem)] w-full">
      {/* Persistent Left Sidebar with Dedicated Tab Highlights */}
      <Sidebar 
        type="student" 
        studentName={studentName} 
        activeTab={activeTab} 
        onTabChange={handleSelectTab} 
      />

      {/* Main Content Area: Renders ONLY the active dedicated tab view */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 md:pb-12 w-full">
        
        {/* Mobile Horizontal View Switcher */}
        <div className="md:hidden flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Header Breadcrumb & Subject Switcher Bar */}
        <div className="space-y-3">
          <div className="hidden sm:flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Student Study Desk</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentTabObj.label}
              </span>
              <span>/</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {selectedSubject}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Diagnostic Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

          {/* Interactive Subject Switcher Header Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Subject
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Active Desk
                  </span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedSubject}
                </p>
              </div>
            </div>

            {/* Quick Switch Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full">
              {['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology', 'History'].map((subj) => {
                const isSel = subj.toLowerCase() === selectedSubject.toLowerCase();
                return (
                  <button
                    key={subj}
                    onClick={() => handleSelectSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSel
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
              <button
                onClick={() => handleSelectTab('subjects')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1"
              >
                <span>Manage</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Error Notification Banner */}
        {diagnosticError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <span className="font-bold block text-sm">Diagnostic Service Notice</span>
                <span className="text-slate-600 dark:text-slate-300">{diagnosticError}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                Retry
              </button>
              <button
                onClick={() => setDiagnosticError(null)}
                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Diagnosing Progress Overlay */}
        {isDiagnosing ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 p-8 sm:p-12 shadow-md text-center space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950 animate-ping opacity-25"></div>
              <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {diagnosingMessage}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Universal AI Diagnostic Engine • Rigorous Fact-Checking Matrix
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${diagnosingProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Progress</span>
                <span>{diagnosingProgress}%</span>
              </div>
            </div>

            {/* Processing Stages */}
            <div className="text-left space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {diagnosingSteps.map((step, idx) => {
                const isDone = diagnosingStage > idx;
                const isCurrent = diagnosingStage === idx;
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
        ) : !analysisResult && activeTab !== 'subjects' ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-[#e2dac8] dark:border-slate-800 p-6 sm:p-10 md:p-12 shadow-sm text-center space-y-6 animate-fadeIn">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Awaiting Answer Sheet Upload</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                No Diagnostic Data for {selectedSubject}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload a handwritten test paper for {selectedSubject} to have the AI evaluate true topic mastery percentages, diagnose cognitive misconceptions, and generate an actionable study guide.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={`/upload?subject=${encodeURIComponent(selectedSubject)}`}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload {selectedSubject} Answer Sheet</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <button
                onClick={handleLoadSample}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Diagnose Sample {selectedSubject} Sheet</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dedicated Standalone Tab Views */
          <>
            {activeTab === 'overview' && (
              <StudyGuideOverviewView
                studentName={studentName}
                analysisResult={analysisResult}
                overallScore={overallScore}
                trueMastery={trueMastery}
                clearedTopics={clearedTopics}
                onSelectTab={handleSelectTab}
                onReset={handleReset}
                onLoadSample={handleLoadSample}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsView
                currentSubject={selectedSubject}
                onSelectSubject={handleSelectSubject}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'topics' && (
              <TopicDiagnosesView
                studentName={studentName}
                analysisResult={analysisResult}
                clearedTopics={clearedTopics}
                onToggleCleared={handleToggleCleared}
                onTriggerQuiz={(topic) => setActiveQuizTopic(topic)}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'sheet' && (
              <AnalyzedSheetView
                studentName={studentName}
                analysisResult={analysisResult}
                onSelectTab={handleSelectTab}
                onLoadSample={handleLoadSample}
              />
            )}

            {activeTab === 'next_steps' && (
              <WhatToLearnNextView
                studentName={studentName}
                analysisResult={analysisResult}
                onTriggerQuiz={(topic) => setActiveQuizTopic(topic)}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'mock_tests' && (
              <MockTestsView onNavigateTab={handleSelectTab} />
            )}

            {activeTab === 'resources' && (
              <StudyResourcesView
                analysisResult={analysisResult}
                clearedTopics={clearedTopics}
                onToggleCleared={handleToggleCleared}
                onTriggerQuiz={(topic) => setActiveQuizTopic(topic)}
                onSelectTab={handleSelectTab}
              />
            )}
          </>
        )}

        {/* Universal Mastery Checkpoint Modal */}
        {activeQuizTopic && (
          <MasteryCheckpointModal
            topicName={activeQuizTopic}
            onClose={() => setActiveQuizTopic(null)}
            onMasteryAchieved={handleMarkTopicCleared}
          />
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col md:flex-row bg-[#fcfaf5] dark:bg-slate-950 min-h-[calc(100vh-4rem)] w-full">
        <Sidebar type="student" activeTab="overview" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-medium text-sm">
            <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Student Study Desk...</span>
          </div>
        </div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}