'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

  const navLinks = [
    { href: '/', label: 'Overview', icon: Sparkles },
    { href: '/teacher', label: 'Teacher Dashboard', icon: School },
    { href: '/student', label: 'Student Study Guide', icon: BookOpen },
    { href: '/upload', label: 'Upload & Diagnose', icon: UploadCloud },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
                  LearnGraph
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 -mt-0.5">
                  Marks to Understanding
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 ml-2">
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

          {/* Mobile Menu & Theme Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl mb-3 flex items-center justify-between border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  user.role === 'teacher' ? 'bg-indigo-900' : 'bg-rose-600'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{user.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Diagnose Test Sheet</span>
            </Link>
          </div>
        </div>
      )}

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