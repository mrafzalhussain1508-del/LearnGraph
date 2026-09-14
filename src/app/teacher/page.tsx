'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ClassLearningMap from '@/components/ClassLearningMap';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { sectionAStudents, getTrafficLight } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import SubjectMasteryHeatmap, {
  SubjectAverage,
  TopicHeatmapCell,
} from '@/components/teacher/SubjectMasteryHeatmap';
import AtRiskPanel, {
  AtRiskStudentSummary,
} from '@/components/teacher/AtRiskPanel';
import StudentProgressTrend, {
  TopicTrendPoint,
  TopicTrendSeries,
} from '@/components/teacher/StudentProgressTrend';
import ExportToolbar, {
  downloadCSV,
} from '@/components/teacher/ExportToolbar';
import {
  School,
  Users,
  TrendingUp,
  AlertOctagon,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  UploadCloud,
  RefreshCw,
  UserCheck,
  GraduationCap,
  Mail,
  ExternalLink,
  X,
  Check,
  Copy,
  Calendar,
  Building2,
  Compass,
  FileText,
  CheckCircle2,
  User,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart2,
  Activity,
  Layers,
  Globe,
  Printer,
  Info,
} from 'lucide-react';
import ResourceUploader from '@/components/ResourceUploader';
import ResourceFeed from '@/components/ResourceFeed';
import MockTestsManagement from '@/components/teacher/MockTestsManagement';
import type { StoredDiagnostic, StoredQuestionItem } from '@/lib/diagnosticDb';

export interface EnrichedStudentProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  studentId: string;
  grade: string;
  section: string;
  school: string;
  learningGoals: string;
  createdAt: string;
  rawScore: number;
  overallUnderstanding: number;
  algebra: number;
  quadratics: number;
  functions: number;
  graphs: number;
  primaryInterventionNeeded: string;
  status: 'critical' | 'attention' | 'strong' | 'registered';
  hasDiagnosticScan: boolean;
}

interface StudentDiagnosticsData {
  studentName: string;
  totalSubmissions: number;
  latestReport: StoredDiagnostic | null;
  allReports: StoredDiagnostic[];
  topicTrends: TopicTrendSeries[];
  subjectHistory: { subject: string; date: string; score: number }[];
  overallTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
}

interface ClassOverviewData {
  totalStudents: number;
  totalScans: number;
  classAvgScore: number;
  atRiskCount: number;
  subjectAverages: SubjectAverage[];
  topicHeatmap: TopicHeatmapCell[];
  atRiskStudents: AtRiskStudentSummary[];
}

export default function TeacherDashboard() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  // Strict RBAC: If an authenticated student attempts to view teacher dashboard, redirect to student desk
  useEffect(() => {
    if (isReady && user && user.role === 'student') {
      router.replace('/student');
    }
  }, [user, isReady, router]);

  if (isReady && user && user.role === 'student') {
    return null;
  }

  const [students, setStudents] = useState<EnrichedStudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Tab view: 'overview' | 'profiles' | 'diagnostics'
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'diagnostics'>('overview');

  // Filtering states
  const [filterQuery, setFilterQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'attention' | 'strong' | 'registered'>('all');

  // Modal state for student profile deep-dive
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudentProfile | null>(null);
  const [studentDiagnostics, setStudentDiagnostics] = useState<StudentDiagnosticsData | null>(null);
  const [isDiagnosticsLoading, setIsDiagnosticsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Class overview data
  const [classOverview, setClassOverview] = useState<ClassOverviewData | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  // At-risk banner dismissal
  const [atRiskBannerDismissed, setAtRiskBannerDismissed] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Resource feed refresh trigger
  const [feedKey, setFeedKey] = useState(0);

  // Dynamic Data Syncing function
  const loadStudents = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch('/api/teacher/students');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
          setLastSynced(new Date());
        }
      }
    } catch (err) {
      console.error('Failed to sync students data:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Load class overview
  const loadClassOverview = useCallback(async () => {
    setIsOverviewLoading(true);
    try {
      const res = await fetch('/api/teacher/class-overview');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setClassOverview(data);
        }
      }
    } catch (err) {
      console.error('Failed to load class overview:', err);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  // Initial fetch and automatic real-time polling (every 8 seconds)
  useEffect(() => {
    loadStudents(false);
    loadClassOverview();

    const intervalId = setInterval(() => {
      loadStudents(true);
    }, 8000);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'learngraph_last_registered_student') {
        loadStudents(true);
        loadClassOverview();
      }
    };

    const handleCustomSync = () => {
      loadStudents(true);
      loadClassOverview();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('learngraph_student_registered', handleCustomSync);
    window.addEventListener('learngraph_analysis_completed', handleCustomSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('learngraph_student_registered', handleCustomSync);
      window.removeEventListener('learngraph_analysis_completed', handleCustomSync);
    };
  }, [loadStudents, loadClassOverview]);

  // Load student diagnostics when a student is selected for deep-dive
  useEffect(() => {
    if (!selectedStudent) {
      setStudentDiagnostics(null);
      setExpandedQuestion(null);
      return;
    }
    const fetchDiagnostics = async () => {
      setIsDiagnosticsLoading(true);
      try {
        const encodedId = encodeURIComponent(selectedStudent.name);
        const res = await fetch(`/api/teacher/students/${encodedId}/diagnostics`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStudentDiagnostics(data);
          }
        }
      } catch (err) {
        console.error('Failed to load student diagnostics:', err);
      } finally {
        setIsDiagnosticsLoading(false);
      }
    };
    fetchDiagnostics();
  }, [selectedStudent]);

  // Copy email helper
  const handleCopyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Close modal on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStudent(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open student deep-dive from at-risk panel
  const handleInspectAtRisk = (studentName: string) => {
    const match = displayStudents.find(
      (s) => s.name.toLowerCase() === studentName.toLowerCase()
    );
    if (match) {
      setSelectedStudent(match);
    } else {
      // Create minimal profile from at-risk data
      setSelectedStudent({
        id: studentName,
        name: studentName,
        username: studentName.toLowerCase().replace(/\s+/g, '_'),
        email: `${studentName.toLowerCase().replace(/\s+/g, '_')}@student.learngraph.edu`,
        studentId: `ST-${Date.now().toString().slice(-6)}`,
        grade: '10th Grade',
        section: 'Section A',
        school: 'Lincoln High School',
        learningGoals: 'Targeted Intervention',
        createdAt: new Date().toISOString(),
        rawScore: 0,
        overallUnderstanding: 0,
        algebra: 0,
        quadratics: 0,
        functions: 0,
        graphs: 0,
        primaryInterventionNeeded: 'Full diagnostic review',
        status: 'critical',
        hasDiagnosticScan: true,
      });
    }
  };

  // Export handlers
  const handleExportClass = async () => {
    setIsExporting(true);
    try {
      const url = '/api/teacher/export?format=csv&scope=class';
      downloadCSV(url, `learngraph_class_${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleExportStudent = async () => {
    if (!selectedStudent) return;
    setIsExporting(true);
    try {
      const encodedName = encodeURIComponent(selectedStudent.name);
      const url = `/api/teacher/export?format=csv&scope=student&id=${encodedName}`;
      downloadCSV(
        url,
        `learngraph_${selectedStudent.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
      );
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Default mock profiles fallback
  const defaultMockProfiles: EnrichedStudentProfile[] = sectionAStudents.map((mock) => ({
    id: mock.id,
    name: mock.name,
    username: mock.name.toLowerCase().replace(/\s+/g, '_'),
    email: `${mock.name.toLowerCase().replace(/\s+/g, '_')}@student.learngraph.edu`,
    studentId: `ST-2026-0${mock.id.replace(/\D/g, '') || '80'}`,
    grade: '10th Grade',
    section: 'Section A',
    school: 'Lincoln High School',
    learningGoals: `Master ${mock.primaryInterventionNeeded}`,
    createdAt: '2026-09-01T00:00:00.000Z',
    rawScore: mock.rawScore,
    overallUnderstanding: mock.overallUnderstanding,
    algebra: mock.algebra,
    quadratics: mock.quadratics,
    functions: mock.functions,
    graphs: mock.graphs,
    primaryInterventionNeeded: mock.primaryInterventionNeeded,
    status: mock.status,
    hasDiagnosticScan: true,
  }));

  // Computed metrics
  const displayStudents: EnrichedStudentProfile[] = students.length > 0 ? students : defaultMockProfiles;
  const totalCount = displayStudents.length;
  const avgRaw = totalCount > 0
    ? Math.round(displayStudents.reduce((acc: number, s: EnrichedStudentProfile) => acc + (s.rawScore || 0), 0) / totalCount)
    : 72;
  const avgUnderstanding = totalCount > 0
    ? Math.round(displayStudents.reduce((acc: number, s: EnrichedStudentProfile) => acc + (s.overallUnderstanding || 0), 0) / totalCount)
    : 57;
  const atRiskCount = displayStudents.filter((s: EnrichedStudentProfile) => (s.overallUnderstanding || 0) < 50 || s.status === 'critical').length;

  // Unique sections for filter
  const availableSections: string[] = Array.from(new Set(displayStudents.map((s: EnrichedStudentProfile) => String(s.section || 'Section A'))));

  // Filtered student list
  const filteredStudents = displayStudents.filter((student: EnrichedStudentProfile) => {
    const query = filterQuery.toLowerCase().trim();
    const matchesQuery = !query ||
      student.name?.toLowerCase().includes(query) ||
      student.username?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.studentId?.toLowerCase().includes(query) ||
      student.school?.toLowerCase().includes(query) ||
      student.learningGoals?.toLowerCase().includes(query);

    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchesQuery && matchesSection && matchesStatus;
  });

  // Trend indicator for modal header
  const trendLabel: Record<string, { label: string; color: string }> = {
    improving: { label: '📈 Improving', color: 'text-emerald-600 dark:text-emerald-400' },
    declining: { label: '📉 Declining', color: 'text-rose-600 dark:text-rose-400' },
    stable: { label: '➡️ Stable', color: 'text-amber-600 dark:text-amber-400' },
    insufficient_data: { label: '🔍 First Scan', color: 'text-slate-500 dark:text-slate-400' },
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] w-full">
      {/* Persistent Left Sidebar */}
      <Sidebar type="teacher" />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-24 md:pb-12 w-full">

        {/* At-Risk Alert Banner */}
        {!atRiskBannerDismissed && atRiskCount > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-600 dark:bg-rose-700 text-white shadow-md">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="text-sm font-bold">
                🚨 {atRiskCount} student{atRiskCount !== 1 ? 's' : ''} are critically at-risk (below 50% mastery) — immediate intervention recommended.
              </span>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-white font-bold text-xs underline underline-offset-2 cursor-pointer hover:no-underline"
              >
                View At-Risk Students →
              </button>
            </div>
            <button
              onClick={() => setAtRiskBannerDismissed(true)}
              className="p-1 rounded-lg hover:bg-rose-500 transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
                {user?.section || 'Grade 10 • Section A'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Instructor: {user?.name || 'Dr. Sarah Jenkins'}{user?.department ? ` • ${user.department}` : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Class Learning Map &amp; Diagnostic Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live roster synchronization, concept mastery analytics, and automated reteach interventions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <ExportToolbar
              selectedStudentName={selectedStudent?.name}
              onExportClass={handleExportClass}
              onExportStudent={handleExportStudent}
              onPrintReport={handlePrintReport}
              isExporting={isExporting}
            />
            <a
              href="#mock-tests"
              className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Mock Tests</span>
            </a>
            <a
              href="#resource-hub"
              className="inline-flex items-center space-x-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Share Materials</span>
            </a>
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan New Batch</span>
            </Link>
          </div>
        </div>

        {/* 1. KEY PERFORMANCE METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Metric 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Class Raw Score
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard Mark</span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{avgRaw}%</span>
              <span className="text-xs text-slate-400 font-normal">avg</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Looks &quot;acceptable&quot; on traditional report cards.
            </p>
          </div>

          {/* Metric 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs ring-2 ring-indigo-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Topic Understanding
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-indigo-950 dark:text-indigo-200">{avgUnderstanding}%</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {avgRaw - avgUnderstanding > 0 ? `-${avgRaw - avgUnderstanding}% gap` : 'optimal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
              Actual conceptual mastery from error analysis.
            </p>
          </div>

          {/* Metric 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                At-Risk Students
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {classOverview?.atRiskCount ?? atRiskCount}
              </span>
              <span className="text-xs text-slate-400 font-normal">students (&lt;50%)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Flagged for immediate conceptual intervention.
            </p>
          </div>

          {/* Metric 4: Total Enrolled */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Enrolled Cohort
              </span>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Synced"></span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
              <span className="text-xs text-slate-400 font-normal">students registered</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
              {classOverview?.totalScans ?? 0} total diagnostic scans on record.
            </p>
          </div>
        </div>

        {/* 2. RECHARTS HORIZONTAL CLASS LEARNING MAP */}
        <section id="learning-map">
          <ClassLearningMap />
        </section>

        {/* 3. AI INSTRUCTIONAL INSIGHTS & RETEACH PANEL */}
        <section id="ai-insights">
          <AIInsightsPanel />
        </section>

        {/* 4. DYNAMIC REGISTERED STUDENT ROSTER & STUDY PROFILES */}
        <section id="student-roster" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 md:p-7 space-y-6">
          {/* Section Header & Live Sync Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Live Student Directory &amp; Diagnostic Intelligence
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Registered Student Study Profiles &amp; Cohort Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically synced with student enrollment profiles, personalized learning goals, and AI diagnostic scans.
              </p>
            </div>

            {/* Sync Status Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Live Sync Active</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  ({totalCount} students)
                </span>
              </div>

              <button
                onClick={() => { loadStudents(false); loadClassOverview(); }}
                disabled={isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                title="Sync student data from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher & Search/Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* View Tabs */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Class Overview</span>
                {atRiskCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black">
                    {atRiskCount} at-risk
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profiles')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'profiles'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Student Directory</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {filteredStudents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'diagnostics'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Diagnostic Scores</span>
              </button>
            </div>

            {/* Search and Filters — shown for profiles and diagnostics tabs */}
            {activeTab !== 'overview' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, username, email, id..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Cohorts ({filteredStudents.length})</option>
                  <option value="critical">Critical (&lt;50%)</option>
                  <option value="attention">Needs Attention</option>
                  <option value="strong">Strong Mastery</option>
                  <option value="registered">New Registrations</option>
                </select>
              </div>
            )}
          </div>

          {/* ==================== TAB: CLASS OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-7">
              {isOverviewLoading ? (
                <div className="flex items-center justify-center py-12 space-x-3">
                  <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Loading class overview...</span>
                </div>
              ) : classOverview && classOverview.totalStudents > 0 ? (
                <>
                  {/* Class stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-center">
                      <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{classOverview.classAvgScore}%</span>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Class Avg Mastery</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{classOverview.totalStudents}</span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Students Scanned</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center">
                      <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{classOverview.totalScans}</span>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">Total Submissions</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-center">
                      <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{classOverview.atRiskCount}</span>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">At-Risk Students</p>
                    </div>
                  </div>

                  {/* Subject Mastery Heatmap */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Subject Mastery Heatmap
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Click any subject to expand topic breakdown ↓
                      </span>
                    </div>
                    <SubjectMasteryHeatmap
                      subjectAverages={classOverview.subjectAverages}
                      topicHeatmap={classOverview.topicHeatmap}
                    />
                  </div>

                  {/* At-Risk Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        At-Risk Cohort — Critical Intervention Required
                      </h3>
                    </div>
                    <AtRiskPanel
                      students={classOverview.atRiskStudents}
                      onInspect={handleInspectAtRisk}
                    />
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No diagnostic data yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upload and analyze student answer sheets to populate the class overview heatmap.
                    </p>
                  </div>
                  <Link
                    href="/upload"
                    className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Scan First Answer Sheet</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: STUDENT DIRECTORY ==================== */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              {/* Mobile Card List (< 768px) */}
              <div className="md:hidden space-y-3">
                {filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    No students found matching current filters.
                  </div>
                ) : (
                  filteredStudents.map((student: EnrichedStudentProfile) => {
                    const isCaseStudy = student.name === 'Lingjensthaibi';
                    return (
                      <div
                        key={`mobile-card-${student.id}`}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isCaseStudy
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                        }`}
                      >
                        {/* Header row: Avatar + Name + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCaseStudy
                                ? 'bg-gradient-to-tr from-indigo-600 to-rose-600 text-white shadow-xs'
                                : 'bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-black'
                            }`}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {student.name}
                                </span>
                                {isCaseStudy && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                                    Case Study
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                                  @{student.username || student.name.toLowerCase().replace(/\s+/g, '_')}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-slate-400 text-[11px]">
                                  {student.studentId || 'ST-2026'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            student.status === 'critical'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                              : student.status === 'attention'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                              : student.status === 'strong'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              student.status === 'critical' ? 'bg-rose-500' :
                              student.status === 'attention' ? 'bg-amber-500' :
                              student.status === 'strong' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></span>
                            <span className="capitalize">{student.status || 'Active'}</span>
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Academic Cohort</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {student.grade || '10th Grade'} • {student.section || 'Section A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Overall Mastery</span>
                            <span className={`font-black text-sm ${
                              student.overallUnderstanding >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                              : student.overallUnderstanding >= 50 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {student.overallUnderstanding}%
                            </span>
                          </div>
                        </div>

                        {/* Stated Learning Goal */}
                        <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-xl">
                          <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate font-medium text-[11px]">
                            Goal: {student.learningGoals || 'Algebra & Functions'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-1 gap-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
                          >
                            <span>View Full Profile &amp; Diagnostics</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-3.5">Student</th>
                    <th className="py-3 px-3.5">Contact / Email</th>
                    <th className="py-3 px-3.5">Academic Cohort</th>
                    <th className="py-3 px-3.5">Stated Learning Goal / Focus</th>
                    <th className="py-3 px-3.5">Enrolled</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Study Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student: EnrichedStudentProfile) => {
                      const isCaseStudy = student.name === 'Lingjensthaibi';
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isCaseStudy ? 'bg-indigo-50/30 dark:bg-indigo-950/15' : ''
                          }`}
                        >
                          {/* Student Name & Username & ID */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCaseStudy
                                  ? 'bg-gradient-to-tr from-indigo-600 to-rose-600 text-white shadow-xs'
                                  : 'bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-black'
                              }`}>
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-slate-900 dark:text-white">
                                    {student.name}
                                  </span>
                                  {isCaseStudy && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                                      Case Study
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                                    @{student.username || student.name.toLowerCase().replace(/\s+/g, '_')}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400">
                                    {student.studentId || 'ST-2026'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email Address */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center space-x-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                                {student.email}
                              </span>
                              <button
                                onClick={() => handleCopyEmail(student.email)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
                                title="Copy Email"
                              >
                                {copiedEmail === student.email ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Academic Cohort */}
                          <td className="py-3.5 px-3.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {student.grade || '10th Grade'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                  {student.section || 'Section A'}
                                </span>
                              </div>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">
                                {student.school || 'Lincoln High School'}
                              </span>
                            </div>
                          </td>

                          {/* Learning Goal */}
                          <td className="py-3.5 px-3.5">
                            <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 max-w-[200px]">
                              <Compass className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="text-[11px] font-medium truncate">
                                {student.learningGoals || 'Algebra & Functions'}
                              </span>
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="py-3.5 px-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 2026'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3.5">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              student.status === 'critical'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                                : student.status === 'attention'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                                : student.status === 'strong'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                student.status === 'critical' ? 'bg-rose-500' :
                                student.status === 'attention' ? 'bg-amber-500' :
                                student.status === 'strong' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}></span>
                              <span className="capitalize">{student.status || 'Active'}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer"
                              >
                                View Full Diagnostics
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB: DIAGNOSTIC SCORES ==================== */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredStudents.map((student: EnrichedStudentProfile) => {
                  const isCaseStudy = student.name === 'Lingjensthaibi';
                  return (
                    <div
                      key={`mobile-diag-${student.id}`}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isCaseStudy
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCaseStudy ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</span>
                            {isCaseStudy && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                                Case Study
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase block font-bold">Understanding</span>
                          <span className={`font-black text-sm ${
                            student.overallUnderstanding >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : student.overallUnderstanding >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {student.overallUnderstanding}%
                          </span>
                        </div>
                      </div>

                      {/* Mastery progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Mastery</span>
                          <span>{student.overallUnderstanding >= 80 ? '🟢 Strong' : student.overallUnderstanding >= 50 ? '🟡 Developing' : '🔴 Critical'}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.overallUnderstanding >= 80 ? 'bg-emerald-500'
                              : student.overallUnderstanding >= 50 ? 'bg-amber-500'
                              : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(student.overallUnderstanding, 2)}%` }}
                          />
                        </div>
                      </div>

                      {/* Primary Gap & Link */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">
                          Gap: <strong className="text-slate-800 dark:text-slate-200">{student.primaryInterventionNeeded}</strong>
                        </span>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs cursor-pointer"
                        >
                          <span>Inspect Gap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Raw Mark</th>
                    <th className="py-3 px-3">True Understanding</th>
                    <th className="py-3 px-3">Mastery Bar</th>
                    <th className="py-3 px-3">Primary Gap Identified</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.map((student: EnrichedStudentProfile) => {
                    const isCaseStudy = student.name === 'Lingjensthaibi';
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isCaseStudy ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isCaseStudy ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                              {isCaseStudy && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                                  Case Study
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{student.rawScore}%</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`font-black ${
                            student.overallUnderstanding >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : student.overallUnderstanding >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {student.overallUnderstanding}%
                          </span>
                        </td>

                        {/* Mastery bar */}
                        <td className="py-3.5 px-3 w-32">
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-28">
                            <div
                              className={`h-full rounded-full transition-all ${
                                student.overallUnderstanding >= 80 ? 'bg-emerald-500'
                                : student.overallUnderstanding >= 50 ? 'bg-amber-500'
                                : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(student.overallUnderstanding, 2)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">
                            {student.primaryInterventionNeeded}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold text-xs cursor-pointer"
                          >
                            <span>Inspect Gap</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 5. MOCK TESTS & QUIZZES MANAGEMENT */}
        <section id="mock-tests" className="space-y-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <MockTestsManagement />
        </section>

        {/* 6. RESOURCE & VIDEO HUB */}
        <section id="resource-hub" className="space-y-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                  Instructional Content Distribution
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Resource &amp; Video Hub (Classroom Vault)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Publish targeted YouTube video lessons, PDF cheat sheets, and Desmos tools directly to Section A student study desks.
              </p>
            </div>
          </div>

          {/* Teacher Resource Uploader Form */}
          <ResourceUploader onResourceCreated={() => setFeedKey((k) => k + 1)} />

          {/* Active Class Materials Feed */}
          <div className="pt-2">
            <ResourceFeed
              key={feedKey}
              isTeacherView={true}
              title="Active Classroom Materials"
              subtitle="Live resources currently accessible to Section A students on their study desks"
            />
          </div>
        </section>
      </div>

      {/* ==================== STUDENT DEEP-DIVE MODAL ==================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-rose-500 to-indigo-600 rounded-t-3xl" />

            {/* Print-only header */}
            <div className="hidden print:block p-6 border-b border-slate-200">
              <h1 className="text-xl font-black">LearnGraph — Student Diagnostic Report</h1>
              <p className="text-sm text-slate-500">Generated: {new Date().toLocaleString()}</p>
            </div>

            {/* Scrollable body */}
            <div className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-indigo-500/20 shrink-0">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        @{selectedStudent.username || selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}
                      </span>
                      <span>•</span>
                      <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                        {selectedStudent.studentId}
                      </span>
                      {studentDiagnostics && (
                        <>
                          <span>•</span>
                          <span className={`font-bold text-xs ${
                            trendLabel[studentDiagnostics.overallTrend]?.color || 'text-slate-500'
                          }`}>
                            {trendLabel[studentDiagnostics.overallTrend]?.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Export this student */}
                  <button
                    onClick={handleExportStudent}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Export student CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {/* Print */}
                  <button
                    onClick={handlePrintReport}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Print / Save as PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Profile Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Email Address</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 break-all">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Academic Level & Section</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedStudent.grade || '10th Grade'} • {selectedStudent.section || 'Section A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">School / Institution</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStudent.school || 'Lincoln High School'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Registration Date</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>

              {/* Loading spinner */}
              {isDiagnosticsLoading && (
                <div className="flex items-center justify-center py-8 space-x-3">
                  <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Loading full diagnostic history...</span>
                </div>
              )}

              {/* Diagnostic Data (loaded) */}
              {!isDiagnosticsLoading && studentDiagnostics && (
                <>
                  {/* Submission count badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Diagnostic History
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                      {studentDiagnostics.totalSubmissions} submission{studentDiagnostics.totalSubmissions !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Overall Progress Trend (subject history) */}
                  {studentDiagnostics.subjectHistory.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Overall Score Progression
                      </p>
                      <StudentProgressTrend
                        history={studentDiagnostics.subjectHistory.map((s) => ({
                          date: s.date,
                          score: s.score,
                          subject: s.subject,
                        }))}
                        label={`Across ${new Set(studentDiagnostics.subjectHistory.map((s) => s.subject)).size} subject(s)`}
                      />
                    </div>
                  )}

                  {/* Latest Report: Topic Breakdown */}
                  {studentDiagnostics.latestReport && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Topic Mastery — {studentDiagnostics.latestReport.subject || 'Latest Scan'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(studentDiagnostics.latestReport.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(studentDiagnostics.latestReport.topic_breakdown || []).map((tb, i) => {
                          const trend = studentDiagnostics.topicTrends.find(
                            (t) => t.topic === tb.topic_name
                          );
                          const trendHistory: TopicTrendPoint[] = trend?.history || [];
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-xl border ${
                                tb.status === 'Green'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                                  : tb.status === 'Yellow'
                                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    tb.status === 'Green' ? 'bg-emerald-500'
                                    : tb.status === 'Yellow' ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                  }`} />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {tb.topic_name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  {trendHistory.length > 1 && (
                                    <StudentProgressTrend history={trendHistory} compact />
                                  )}
                                  <span className={`text-sm font-black ${
                                    tb.status === 'Green' ? 'text-emerald-700 dark:text-emerald-300'
                                    : tb.status === 'Yellow' ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-rose-700 dark:text-rose-300'
                                  }`}>
                                    {tb.understanding_percentage}%
                                  </span>
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    tb.status === 'Green' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                    : tb.status === 'Yellow' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                                  }`}>
                                    {tb.status === 'Green' ? 'MASTERED' : tb.status === 'Yellow' ? 'DEVELOPING' : 'CRITICAL GAP'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(studentDiagnostics.latestReport.topic_breakdown || []).length === 0 && (
                          <p className="text-sm text-slate-400 py-2 text-center">No topic breakdown available.</p>
                        )}
                      </div>

                      {/* Misconceptions */}
                      {(studentDiagnostics.latestReport.common_misconceptions || []).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Detected Misconceptions
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {studentDiagnostics.latestReport.common_misconceptions.map((m, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 px-3 py-2 rounded-xl">
                                <span className="text-rose-500 font-black shrink-0 mt-0.5">✗</span>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* What to Learn Next */}
                      {(studentDiagnostics.latestReport.what_to_learn_next || []).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Remediation Plan — What to Learn Next
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {studentDiagnostics.latestReport.what_to_learn_next.map((step, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 px-3 py-2 rounded-xl">
                                <span className="text-indigo-600 dark:text-indigo-400 font-black shrink-0 mt-0.5">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Per-Question Accordion */}
                      {(studentDiagnostics.latestReport.questions || []).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Per-Question Breakdown ({studentDiagnostics.latestReport.questions?.length ?? 0} questions)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {(studentDiagnostics.latestReport.questions ?? []).map((q, i) => {
                              const isOpen = expandedQuestion === i;
                              return (
                                <div
                                  key={i}
                                  className={`rounded-xl border overflow-hidden transition-all ${
                                    q.status === 'Green'
                                      ? 'border-emerald-200 dark:border-emerald-800/50'
                                      : q.status === 'Yellow'
                                      ? 'border-amber-200 dark:border-amber-800/50'
                                      : 'border-rose-200 dark:border-rose-800/50'
                                  }`}
                                >
                                  {/* Question header (always visible) */}
                                  <button
                                    onClick={() => setExpandedQuestion(isOpen ? null : i)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer transition-colors ${
                                      q.status === 'Green'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                                        : q.status === 'Yellow'
                                        ? 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                                        : 'bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        q.status === 'Green' ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                        : q.status === 'Yellow' ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                        : 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                                      }`}>
                                        Q{q.question_number}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                          {q.topic_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                          {q.question_text}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0">
                                      <span className={`text-xs font-black ${
                                        q.status === 'Green' ? 'text-emerald-700 dark:text-emerald-300'
                                        : q.status === 'Yellow' ? 'text-amber-700 dark:text-amber-300'
                                        : 'text-rose-700 dark:text-rose-300'
                                      }`}>
                                        {q.awarded_marks}/{q.max_marks} ({q.understanding_percentage}%)
                                      </span>
                                      {isOpen
                                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                        : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                      }
                                    </div>
                                  </button>

                                  {/* Expanded detail */}
                                  {isOpen && (
                                    <div className="px-4 py-3 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                      {/* Student working */}
                                      <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Student&apos;s Working</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                          {q.student_working || '—'}
                                        </p>
                                      </div>
                                      {/* Correct solution */}
                                      {q.correct_solution && (
                                        <div>
                                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Correct Solution</p>
                                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg">
                                            {q.correct_solution}
                                          </p>
                                        </div>
                                      )}
                                      {/* Mistake detected */}
                                      {q.mistake_detected && q.mistake_detected !== '—' && (
                                        <div className="flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg">
                                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                          <div>
                                            <p className="font-bold text-[10px] uppercase mb-0.5">Mistake Detected</p>
                                            <p>{q.mistake_detected}</p>
                                          </div>
                                        </div>
                                      )}
                                      {/* Misconception */}
                                      {q.misconception && q.misconception !== '—' && (
                                        <div className="flex items-start space-x-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
                                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                          <div>
                                            <p className="font-bold text-[10px] uppercase mb-0.5">Misconception</p>
                                            <p>{q.misconception}</p>
                                          </div>
                                        </div>
                                      )}
                                      {/* Rule to remember */}
                                      {q.rule_to_remember && q.rule_to_remember !== '—' && (
                                        <div className="flex items-start space-x-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-2 rounded-lg">
                                          <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                          <div>
                                            <p className="font-bold text-[10px] uppercase mb-0.5">Rule to Remember</p>
                                            <p>{q.rule_to_remember}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* No diagnostics yet */}
                  {!studentDiagnostics.latestReport && (
                    <div className="py-8 text-center space-y-3">
                      <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No diagnostic scan yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                          This student has not submitted an answer sheet for AI analysis yet.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback: no diagnostics loaded yet (no API data) */}
              {!isDiagnosticsLoading && !studentDiagnostics && (
                <div className="py-6 text-center space-y-2">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Diagnostic Mastery Score</p>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedStudent.overallUnderstanding}% Understanding</span>
                      <span className="text-slate-400">{selectedStudent.rawScore}% Raw Score</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedStudent.overallUnderstanding >= 80 ? 'bg-emerald-500'
                          : selectedStudent.overallUnderstanding >= 50 ? 'bg-amber-500'
                          : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(selectedStudent.overallUnderstanding, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 sm:space-x-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  onClick={handleExportStudent}
                  disabled={isExporting}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done Reviewing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
