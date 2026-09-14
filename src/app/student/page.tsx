'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  CheckSquare
} from 'lucide-react';

import StudyGuideOverviewView from '@/components/student/StudyGuideOverviewView';
import TopicDiagnosesView from '@/components/student/TopicDiagnosesView';
import AnalyzedSheetView from '@/components/student/AnalyzedSheetView';
import WhatToLearnNextView from '@/components/student/WhatToLearnNextView';
import StudyResourcesView from '@/components/student/StudyResourcesView';
import MockTestsView from '@/components/student/MockTestsView';

export type StudentTabId = 'overview' | 'topics' | 'sheet' | 'next_steps' | 'mock_tests' | 'resources';

const sampleGeminiResponse: AnalyzeSheetResponse = {
  student_name: 'Lingjensthaibi',
  overall_score_percentage: 67,
  topic_breakdown: [
    {
      topic_name: 'Differential Calculus & Chain Rule',
      understanding_percentage: 100,
      status: 'Green',
    },
    {
      topic_name: 'Product & Quotient Rules',
      understanding_percentage: 72,
      status: 'Yellow',
    },
    {
      topic_name: 'Integral Calculus & U-Substitution',
      understanding_percentage: 60,
      status: 'Yellow',
    },
    {
      topic_name: 'Applications of Derivatives (Tangents)',
      understanding_percentage: 36,
      status: 'Red',
    },
  ],
  questions: [
    {
      question_number: 1,
      topic_name: 'Differential Calculus & Chain Rule',
      question_text: 'Find the derivative dy/dx for y = (3x^2 - 5)^4 using the Chain Rule.',
      student_working: 'Let u = 3x^2 - 5 => dy/du = 4u^3, du/dx = 6x. dy/dx = (dy/du)(du/dx) = 4(3x^2 - 5)^3 * (6x) = 24x(3x^2 - 5)^3',
      max_marks: 25,
      awarded_marks: 25,
      understanding_percentage: 100,
      status: 'Green',
      mistake_detected: 'Clean procedural execution with zero sign errors.',
      misconception: 'No structural misconceptions detected. Composite function differentiation is sound and rigorous.',
      rule_to_remember: 'Chain Rule: d/dx[f(g(x))] = f\'(g(x)) * g\'(x) — always multiply by the inner derivative.',
    },
    {
      question_number: 2,
      topic_name: 'Product & Quotient Rules',
      question_text: 'Differentiate f(x) = x^3 * sin(2x) with respect to x.',
      student_working: 'f\'(x) = (3x^2) * sin(2x) + x^3 * cos(2x) => Answer: 3x^2 sin(2x) + x^3 cos(2x)',
      max_marks: 25,
      awarded_marks: 18,
      understanding_percentage: 72,
      status: 'Yellow',
      mistake_detected: 'Omitted inner chain factor of 2: wrote d/dx[sin(2x)] = cos(2x) instead of 2cos(2x).',
      misconception: 'Argument Neglect: Treated composite trigonometric argument 2x as a plain variable without multiplying by the internal derivative.',
      rule_to_remember: 'Trig Chain Rule: d/dx[sin(kx)] = k * cos(kx) — don\'t drop the coefficient.',
    },
    {
      question_number: 3,
      topic_name: 'Integral Calculus & U-Substitution',
      question_text: 'Evaluate the indefinite integral: \\int 2x * sqrt(x^2 + 9) dx.',
      student_working: 'Let u = x^2 + 9, du = 2x dx => \\int u^(1/2) du = (2/3)u^(3/2) = (2/3)(x^2 + 9)^(3/2)',
      max_marks: 25,
      awarded_marks: 15,
      understanding_percentage: 60,
      status: 'Yellow',
      mistake_detected: 'Omission of integration constant (+ C) on indefinite antiderivative evaluation.',
      misconception: 'Family of Antiderivatives: Evaluated indefinite integral as a single deterministic curve rather than a continuous infinite family.',
      rule_to_remember: 'Indefinite Integral Constant: Every indefinite integral must terminate with + C.',
    },
    {
      question_number: 4,
      topic_name: 'Applications of Derivatives (Tangents)',
      question_text: 'Find the equation of the tangent line to the curve y = x^3 - 4x + 1 at the point (2, 1).',
      student_working: 'dy/dx = 3x^2 - 4. At x = 2: m = 3(4) - 4 = 8. Tangent: y - 2 = 8(x - 1) => y = 8x - 6',
      max_marks: 25,
      awarded_marks: 9,
      understanding_percentage: 36,
      status: 'Red',
      mistake_detected: 'Inverted coordinates (x_1, y_1): substituted point (2, 1) as x_1 = 1 and y_1 = 2.',
      misconception: 'Point-Slope Inversion: Mechanically applied point-slope formula without verifying coordinate axes assignment.',
      rule_to_remember: 'Point-Slope Anchor: Write y - (y_1) = m(x - (x_1)) with explicit brackets and confirm coordinates.',
    },
  ],
  common_misconceptions: [
    'Trigonometric Chain Rule Slip: Differentiated sin(2x) as cos(2x), forgetting to multiply by the derivative of the inner argument (2).',
    'Indefinite Integral Constant Omission: Dropped the integration constant (+ C) on indefinite antiderivative evaluation.',
    'Point-Slope Coordinate Inversion: Inverted x_1 and y_1 coordinates when establishing tangent line equation.',
  ],
  what_to_learn_next: [
    'Chain Rule Template: Always formulate d/dx[f(g(x))] = f\'(g(x)) * g\'(x) before substituting.',
    'Indefinite Integral Anchor: Indefinite integrals represent a family of functions; always terminate with + C.',
    'Tangent Line Protocol: Write y - (y_1) = m(x - (x_1)) and double check coordinates before expanding.',
  ],
  is_live_gemini: true,
  model_used: 'Gemini 3.6 Flash',
  notice: 'Loaded multimodal calculus assessment for Lingjensthaibi.',
};

const tabList: { id: StudentTabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Study Guide Overview', icon: BookOpen },
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

  // 1. Tab Navigation State: Initialize from ?tab= query parameter or default to 'overview'
  const urlTab = searchParams.get('tab') as StudentTabId | null;
  const [activeTab, setActiveTab] = useState<StudentTabId>(() => {
    if (urlTab && ['overview', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(urlTab)) {
      return urlTab;
    }
    return 'overview';
  });

  // 2. State Management: Stores exact JSON response from /api/analyze-sheet
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [clearedTopics, setClearedTopics] = useState<Set<string>>(new Set());

  // Synchronize activeTab with URL changes & backward-compatible hash anchors
  useEffect(() => {
    if (urlTab && ['overview', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(urlTab)) {
      setActiveTab(urlTab);
    } else if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash === '#topic-breakdown') setActiveTab('topics');
      else if (hash === '#analyzed-sheet') setActiveTab('sheet');
      else if (hash === '#action-plan' || hash === '#diagnostic-tabs') setActiveTab('next_steps');
      else if (hash === '#mock-tests') setActiveTab('mock_tests');
      else if (hash === '#resource-hub') setActiveTab('resources');
    }
  }, [urlTab]);

  // Load saved analysis & cleared topics from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learngraph_latest_analysis');
      if (saved) {
        try {
          const parsed: AnalyzeSheetResponse = JSON.parse(saved);
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
    }
    setIsLoading(false);
  }, []);

  const handleSelectTab = (tabId: string) => {
    const validTab = (['overview', 'topics', 'sheet', 'next_steps', 'mock_tests', 'resources'].includes(tabId) ? tabId : 'overview') as StudentTabId;
    setActiveTab(validTab);
    router.push(`/student?tab=${validTab}`, { scroll: false });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('learngraph_latest_analysis');
    }
    setAnalysisResult(null);
  };

  const handleLoadSample = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_latest_analysis', JSON.stringify(sampleGeminiResponse));
    }
    setAnalysisResult(sampleGeminiResponse);
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

  const studentName = (analysisResult?.student_name && analysisResult.student_name !== 'Student')
    ? analysisResult.student_name
    : (user?.name || analysisResult?.student_name || 'Lingjensthaibi');

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

  // Active view label mapping for breadcrumb
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

        {/* Desktop Header Breadcrumb Bar */}
        <div className="hidden sm:flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Student Study Desk</span>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentTabObj.label}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Standalone View Active</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
        </div>

        {/* Awaiting Upload Clean State (When no sheet is parsed yet and user is on overview) */}
        {!analysisResult && activeTab === 'overview' ? (
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
                No Diagnostic Data Available Yet
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload a handwritten math test paper to have Google Gemini evaluate true topic mastery percentages, diagnose cognitive misconceptions, and generate an actionable study guide.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/upload"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Student Test Paper</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <button
                onClick={handleLoadSample}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Try Demo with Sample Gemini Response</span>
              </button>
            </div>

            {/* 3 Step Capability Overview */}
            <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-[#f0eae0] dark:border-slate-800 text-left">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">01. Optical OCR</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Handwriting Step Scan</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Multimodal vision reads messy scratch annotations directly from photos or PDFs.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">02. Topic Breakdown</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dynamic Understanding %</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculates true conceptual grasp per curriculum strand, replacing raw point scores.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">03. Actionable Notebook</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Misconception Prescription</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Students get highlighted rules to remember, and teachers get a 15-minute reteach roadmap.</p>
              </div>
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