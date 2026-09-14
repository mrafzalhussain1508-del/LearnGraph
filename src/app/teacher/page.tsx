'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ClassLearningMap from '@/components/ClassLearningMap';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { sectionAStudents, getTrafficLight } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
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
  CheckSquare
} from 'lucide-react';
import ResourceUploader from '@/components/ResourceUploader';
import ResourceFeed from '@/components/ResourceFeed';
import MockTestsManagement from '@/components/teacher/MockTestsManagement';

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
  
  // Tab view: 'profiles' (Study Profiles & Directory) vs 'diagnostics' (Topic Mastery Table)
  const [activeTab, setActiveTab] = useState<'profiles' | 'diagnostics'>('profiles');
  
  // Filtering states
  const [filterQuery, setFilterQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'attention' | 'strong' | 'registered'>('all');
  
  // Modal state for student profile inspection
  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudentProfile | null>(null);
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

  // Initial fetch and automatic real-time polling (every 8 seconds)
  useEffect(() => {
    loadStudents(false);

    const intervalId = setInterval(() => {
      loadStudents(true);
    }, 8000);

    // Cross-tab real-time sync listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'learngraph_last_registered_student') {
        loadStudents(true);
      }
    };

    const handleCustomSync = () => {
      loadStudents(true);
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('learngraph_student_registered', handleCustomSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('learngraph_student_registered', handleCustomSync);
    };
  }, [loadStudents]);

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

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] w-full">
      {/* Persistent Left Sidebar */}
      <Sidebar type="teacher" />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-24 md:pb-12 w-full">
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
              Class Learning Map & Diagnostic Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live roster synchronization, concept mastery analytics, and automated reteach interventions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
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
            <a
              href="#learning-map"
              className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Classroom Learning Map</span>
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
              Looks "acceptable" on traditional report cards.
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
                Critical Strands (&lt;50%)
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">2</span>
              <span className="text-xs text-slate-400 font-normal">of 4 topics</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Graphs (35%) and Functions (42%) require reteach.
            </p>
          </div>

          {/* Metric 4: Total Enrolled & At-Risk */}
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
              {atRiskCount} student{atRiskCount === 1 ? '' : 's'} flagged for conceptual intervention.
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
                  Live Student Directory & Diagnostic Intelligence
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Registered Student Study Profiles & Cohort Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically synced with student enrollment profiles, personalized learning goals, and midterm diagnostics.
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
                onClick={() => loadStudents(false)}
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
                onClick={() => setActiveTab('profiles')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'profiles'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Student Directory & Study Profiles</span>
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
                <span>Diagnostic Exam Breakdown</span>
              </button>
            </div>

            {/* Search and Filters */}
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

              {/* Section Filter */}
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

              {/* Status Filter */}
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
          </div>

          {/* TAB 1: STUDENT DIRECTORY & STUDY PROFILES */}
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
                    const isAlex = student.name === 'Lingjensthaibi' || student.name === 'Alex Chen';
                    return (
                      <div
                        key={`mobile-card-${student.id}`}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isAlex
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                        }`}
                      >
                        {/* Header row: Avatar + Name + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAlex
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
                                {isAlex && (
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
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Email</span>
                            <div className="flex items-center space-x-1">
                              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                                {student.email}
                              </span>
                              <button
                                onClick={() => handleCopyEmail(student.email)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                title="Copy Email"
                              >
                                {copiedEmail === student.email ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
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
                            <span>View Full Profile & Diagnostics</span>
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
                      const isAlex = student.name === 'Lingjensthaibi' || student.name === 'Alex Chen';
                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isAlex ? 'bg-indigo-50/30 dark:bg-indigo-950/15' : ''
                          }`}
                        >
                          {/* Student Name & Username & ID */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isAlex 
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
                                  {isAlex && (
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
                                View Profile & Diagnostics
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

          {/* TAB 2: DIAGNOSTIC PERFORMANCE & TOPIC MASTERY */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              {/* Mobile Card List for Diagnostics (< 768px) */}
              <div className="md:hidden space-y-3">
                {filteredStudents.map((student: EnrichedStudentProfile) => {
                  const isAlex = student.name === 'Lingjensthaibi' || student.name === 'Alex Chen';
                  return (
                    <div
                      key={`mobile-diag-${student.id}`}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isAlex
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAlex ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</span>
                            {isAlex && (
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

                      {/* 4 Topic scores grid */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block">Alg</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{student.algebra}%</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block">Quad</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{student.quadratics}%</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block">Func</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{student.functions}%</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block">Graph</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{student.graphs}%</span>
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

              {/* Desktop Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Raw Mark</th>
                    <th className="py-3 px-3">True Understanding</th>
                    <th className="py-3 px-3">Algebra (88%)</th>
                    <th className="py-3 px-3">Quadratics (64%)</th>
                    <th className="py-3 px-3">Functions (42%)</th>
                    <th className="py-3 px-3">Graphs (35%)</th>
                    <th className="py-3 px-3">Primary Gap Identified</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.map((student: EnrichedStudentProfile) => {
                    const isAlex = student.name === 'Lingjensthaibi' || student.name === 'Alex Chen';
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isAlex ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isAlex ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                              {isAlex && (
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

                        {/* Algebra */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{student.algebra}%</span>
                        </td>

                        {/* Quadratics */}
                        <td className="py-3.5 px-3">
                          <span className={`font-bold ${student.quadratics >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {student.quadratics}%
                          </span>
                        </td>

                        {/* Functions */}
                        <td className="py-3.5 px-3">
                          <span className={`font-bold ${student.functions >= 80 ? 'text-emerald-600 dark:text-emerald-400' : student.functions >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {student.functions}%
                          </span>
                        </td>

                        {/* Graphs */}
                        <td className="py-3.5 px-3">
                          <span className={`font-bold ${student.graphs >= 80 ? 'text-emerald-600 dark:text-emerald-400' : student.graphs >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {student.graphs}%
                          </span>
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
                Resource & Video Hub (Classroom Vault)
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

      {/* STUDENT STUDY PROFILE DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-7 shadow-2xl space-y-5 sm:space-y-6 relative">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-rose-500 to-indigo-600"></div>

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
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      @{selectedStudent.username || selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}
                    </span>
                    <span>•</span>
                    <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                      {selectedStudent.studentId}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Email Address
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 break-all">
                  {selectedStudent.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Academic Level & Section
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedStudent.grade || '10th Grade'} • {selectedStudent.section || 'Section A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  School / Institution
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedStudent.school || 'Lincoln High School'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Registration Date
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            {/* Stated Learning Goal & Focus */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Stated Learning Goal / Focus Area</span>
              </div>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                &quot;{selectedStudent.learningGoals || 'Foundational Algebra & Problem Solving'}&quot;
              </div>
            </div>

            {/* Diagnostic Competency Overview */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Diagnostic Mastery Score
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedStudent.overallUnderstanding}% Understanding
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Algebra</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudent.algebra}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Quadratics</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{selectedStudent.quadratics}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Functions</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{selectedStudent.functions}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Graphs</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{selectedStudent.graphs}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 sm:space-x-3">
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
      )}
    </div>
  );
}
