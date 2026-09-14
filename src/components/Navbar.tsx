'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  UploadCloud, 
  Sparkles, 
  ArrowRight,
  School,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isReady } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isTeacher = user?.role === 'teacher' || (!user && pathname?.startsWith('/teacher'));
  const isStudent = user?.role === 'student' || (!user && (pathname?.startsWith('/student') || pathname?.startsWith('/study-guide')));

  const navLinks = [
    { href: '/', label: 'Overview', icon: Sparkles },
    ...(isStudent && !isTeacher
      ? [{ href: '/student', label: 'Study Guide', icon: BookOpen }]
      : isTeacher && !isStudent
      ? [{ href: '/teacher', label: 'Teacher Dashboard', icon: School }]
      : [
          { href: '/teacher', label: 'Teacher Dashboard', icon: School },
          { href: '/student', label: 'Student Study Guide', icon: BookOpen },
        ]
    ),
    { href: '/upload', label: 'Upload & Diagnose', icon: UploadCloud },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent truncate">
                    LearnGraph
                  </span>
                  {/* Compact version tag visible on small screens */}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 sm:hidden shrink-0">
                    v2.4
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 -mt-0.5 hidden sm:block truncate">
                  Marks to Understanding
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 ml-2 shrink-0">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-500 dark:text-indigo-400" /> AI Diagnostic v2.4
            </span>
          </div>

          {/* Desktop Nav Links */}
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isReady && user ? (
              /* Authenticated User Profile Badge */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    user.role === 'teacher' ? 'bg-indigo-900' : 'bg-rose-600'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                      user.role === 'teacher'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {user.role === 'teacher' ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-fadeIn"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {user.role === 'teacher' ? user.department : `${user.grade} • ${user.section}`}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={user.role === 'teacher' ? '/teacher' : '/student'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium"
                      >
                        {user.role === 'teacher' ? (
                          <>
                            <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Teacher Learning Map</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>My Study Guide</span>
                          </>
                        )}
                      </Link>

                      <Link
                        href="/upload"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium"
                      >
                        <UploadCloud className="w-4 h-4 text-slate-500" />
                        <span>Upload Answer Sheet</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Buttons: Login & Register */
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            )}

            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link
                href="/upload"
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Diagnose Paper</span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu & Controls */}
          <div className="flex md:hidden items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Direct Mobile Theme Toggle */}
            <ThemeToggle />

            {/* Quick Auth State in Mobile Top Bar */}
            {isReady && (
              user ? (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  aria-label="View account profile and menu"
                  title={`${user.name} (${user.role === 'teacher' ? 'Faculty' : 'Student'})`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                    user.role === 'teacher' ? 'bg-indigo-900' : 'bg-rose-600'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hidden sm:inline max-w-[70px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                >
                  Log In
                </Link>
              )
            )}

            {/* Hamburger / Close Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Menu with Backdrop */}
      {/* Dimmed Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Slide-Down Menu Panel */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 md:hidden bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-5 space-y-4 transition-all duration-200 ease-out ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 -translate-y-2 pointer-events-none invisible'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Drawer Top Header: Version Tag & Theme Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
              AI Diagnostic v2.4
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              Online
            </span>
          </div>

          {/* Theme Toggle in Mobile Drawer */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* 1. Account / Profile State */}
        {user || isTeacher || isStudent ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
                  (user?.role === 'teacher' || (!user && isTeacher)) ? 'bg-indigo-900' : 'bg-rose-600'
                }`}>
                  {user?.name ? user.name.charAt(0) : isTeacher ? 'D' : 'L'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || (isTeacher ? 'Dr. Sarah Jenkins' : 'Lingjensthaibi')}
                    </p>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase shrink-0 ${
                      (user?.role === 'teacher' || (!user && isTeacher))
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {(user?.role === 'teacher' || (!user && isTeacher)) ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || (isTeacher ? 's.jenkins@faculty.learngraph.edu' : 'lingjensthaibi@student.learngraph.edu')}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {(user?.role === 'teacher' || (!user && isTeacher))
                      ? (user?.department || 'Mathematics & Computer Science')
                      : `${user?.grade || '12th Grade'} • ${user?.section || 'Section A'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Workspace link inside account card */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <Link
                href={(user?.role === 'teacher' || (!user && isTeacher)) ? '/teacher' : '/student'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 px-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center space-x-1.5 transition-colors truncate"
              >
                {(user?.role === 'teacher' || (!user && isTeacher)) ? (
                  <>
                    <School className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Teacher Learning Map</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">My Study Guide</span>
                  </>
                )}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-900/60 flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-800/70 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Account & Portal Access</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sign in to sync your diagnostic analyses and test history.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Register</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Navigation Links (Parity with Desktop) */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-1">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/50 dark:border-indigo-800/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 opacity-40 ${isActive ? 'text-indigo-600 dark:text-indigo-400 opacity-100' : ''}`} />
              </Link>
            );
          })}
        </div>

        {/* 3. Primary Desktop Action Button Parity: "Diagnose Paper" */}
        <div className="pt-2">
          <Link
            href="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Diagnose Paper (AI Assessment)</span>
          </Link>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg flex items-center justify-around select-none transition-colors"
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">
                {link.label === 'Overview' ? 'Home' : link.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}