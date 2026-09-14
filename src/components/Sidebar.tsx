'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  School, 
  BarChart3, 
  Sparkles, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Compass,
  Video,
  Menu,
  X,
  ChevronRight,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  type: 'teacher' | 'student';
  studentName?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  mobileOpen?: boolean;
  onMobileToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ 
  type, 
  studentName, 
  activeTab, 
  onTabChange,
  mobileOpen: externalMobileOpen,
  onMobileToggle
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setMobileOpen = (open: boolean) => {
    if (onMobileToggle) onMobileToggle(open);
    setInternalMobileOpen(open);
  };

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Support external custom event 'open-sidebar-drawer'
  useEffect(() => {
    const handleCustomOpen = () => setMobileOpen(true);
    window.addEventListener('open-sidebar-drawer', handleCustomOpen);
    return () => window.removeEventListener('open-sidebar-drawer', handleCustomOpen);
  }, []);

  const teacherItems = [
    { id: 'overview', label: 'Class Overview', href: '/teacher', icon: BarChart3, badge: 'Section A' },
    { id: 'learning-map', label: 'Topic Mastery Map', href: '/teacher#learning-map', icon: TrendingUp },
    { id: 'ai-insights', label: 'AI Reteach Insights', href: '/teacher#ai-insights', icon: BrainCircuit, highlight: true },
    { id: 'student-roster', label: 'Student Interventions', href: '/teacher#student-roster', icon: Users, alertCount: 4 },
    { id: 'mock-tests', label: 'Mock Tests & Quizzes', href: '/teacher#mock-tests', icon: CheckSquare, badge: 'Active' },
    { id: 'resource-hub', label: 'Resource & Video Hub', href: '/teacher#resource-hub', icon: Video, highlight: true },
  ];

  const studentItems = [
    { id: 'overview', label: 'Study Guide Overview', href: '/student?tab=overview', icon: BookOpen, badge: 'Midterm' },
    { id: 'topics', label: 'Topic Diagnoses', href: '/student?tab=topics', icon: Compass },
    { id: 'sheet', label: 'Analyzed Answer Sheet', href: '/student?tab=sheet', icon: FileSpreadsheet, highlight: true },
    { id: 'next_steps', label: 'What to Learn Next', href: '/student?tab=next_steps', icon: Sparkles, alertCount: 3 },
    { id: 'mock_tests', label: 'Mock Tests & Quizzes', href: '/student?tab=mock_tests', icon: CheckSquare, badge: 'Timed' },
    { id: 'resources', label: 'Study Resources & Videos', href: '/student?tab=resources', icon: Video, highlight: true },
  ];

  const items = type === 'teacher' ? teacherItems : studentItems;

  const activeItem = items.find((item) => {
    if (activeTab) return item.id === activeTab;
    return pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
  }) || items[0];

  return (
    <>
      {/* Mobile Sub-Header Trigger Bar (< 768px) */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-xs transition-colors">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer min-h-[38px]"
          aria-label="Open portal navigation menu"
        >
          <Menu className={`w-4 h-4 ${type === 'teacher' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`} />
          <span>{type === 'teacher' ? 'Faculty Menu' : 'Study Desk Menu'}</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${type === 'teacher' ? 'bg-indigo-500' : 'bg-rose-500'} animate-pulse`}></span>
          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-xs text-xs">
            {activeItem?.label || 'Overview'}
          </span>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer with Backdrop Blur */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl p-4 flex flex-col justify-between overflow-y-auto z-50"
            >
              <div className="space-y-5">
                {/* Header with Role Badge & Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      type === 'teacher' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}>
                      {type === 'teacher' ? <School className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {type === 'teacher' ? 'Faculty Portal' : 'Student Study Desk'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {type === 'teacher' ? 'Section A Math' : (studentName ? `${studentName} #Diagnostic` : 'Student Workspace')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close menu drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <p className="px-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                    Navigation
                  </p>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isMatch = activeTab
                      ? (item.id === activeTab || (!activeTab && item.id === 'overview'))
                      : (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'));

                    return (
                      <Link
                        key={`mobile-${item.label}`}
                        href={item.href}
                        onClick={(e) => {
                          setMobileOpen(false);
                          if (onTabChange && item.id) {
                            e.preventDefault();
                            onTabChange(item.id);
                          }
                        }}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isMatch
                            ? (type === 'student'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold border-l-4 border-rose-600 dark:border-rose-500 pl-2 shadow-xs'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-bold border-l-4 border-indigo-600 dark:border-indigo-500 pl-2 shadow-xs')
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 transition-colors ${
                            isMatch
                              ? (type === 'student' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400')
                              : item.highlight
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                          }`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.alertCount && (
                          <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                            {item.alertCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Role-Enforced Workspace Indicator */}
                {type === 'teacher' ? (
                  <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60">
                    <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-1">
                      <School className="w-3.5 h-3.5" />
                      <span>Faculty Instruction Workspace</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Active: {user?.section || 'Section A Math'} • {user?.name || 'Faculty Member'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gradient-to-br from-rose-50/70 to-slate-50 dark:from-rose-950/40 dark:to-slate-900 rounded-xl border border-rose-200/70 dark:border-rose-800/60">
                    <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs font-bold mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Student Study Desk</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enrolled: {user?.grade || '10th Grade'} • {user?.section || 'Section A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Info */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Engine Status</span>
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                    Online
                  </span>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar (>= 768px) */}
      <aside className="hidden md:flex md:w-56 lg:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-3 lg:p-4 flex-col justify-between transition-all">
      <div className="space-y-5 lg:space-y-6">
        {/* Role Badge */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'teacher' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
            }`}>
              {type === 'teacher' ? <School className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {type === 'teacher' ? 'Faculty Portal' : 'Student Study Desk'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {type === 'teacher' ? 'Section A Math' : (studentName ? `${studentName} #Diagnostic` : 'Student Workspace')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            Navigation
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isMatch = activeTab
              ? (item.id === activeTab || (!activeTab && item.id === 'overview'))
              : (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (onTabChange && item.id) {
                    e.preventDefault();
                    onTabChange(item.id);
                  }
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isMatch
                    ? (type === 'student'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold border-l-4 border-rose-600 dark:border-rose-500 pl-2 shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-bold border-l-4 border-indigo-600 dark:border-indigo-500 pl-2 shadow-xs')
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isMatch
                      ? (type === 'student' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400')
                      : item.highlight
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.alertCount && (
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                    {item.alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Role-Enforced Workspace Indicator */}
        {type === 'teacher' ? (
          <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-1">
              <School className="w-3.5 h-3.5" />
              <span>Faculty Instruction Workspace</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active: {user?.section || 'Section A Math'} • {user?.name || 'Faculty Member'}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gradient-to-br from-rose-50/70 to-slate-50 dark:from-rose-950/40 dark:to-slate-900 rounded-xl border border-rose-200/70 dark:border-rose-800/60">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student Study Desk</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enrolled: {user?.grade || '10th Grade'} • {user?.section || 'Section A'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>Engine Status</span>
          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  </>
  );
}
