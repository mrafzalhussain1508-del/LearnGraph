'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  GraduationCap, 
  School, 
  BookOpen, 
  ArrowRight, 
  AlertCircle,
  User, 
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn
} from 'lucide-react';

function getSafeRedirectUrl(redirectParam: string | null, userRole?: string | null): string {
  if (!redirectParam || !redirectParam.startsWith('/') || redirectParam.startsWith('/login')) {
    return userRole === 'student' ? '/student-study-guide' : '/overview';
  }

  const roleLower = (userRole || '').toLowerCase();
  const paramLower = redirectParam.toLowerCase();

  if (roleLower === 'student' && paramLower.includes('/teacher')) {
    return '/student-study-guide';
  }

  if (roleLower === 'teacher' && (paramLower.includes('/student') || paramLower.includes('/study-guide') || paramLower.includes('/student-guide'))) {
    return '/teacher';
  }

  return redirectParam;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, setUserSession } = useAuth();

  const roleParam = searchParams.get('role');
  const emailParam = searchParams.get('email') || '';
  
  const [role, setRole] = useState<UserRole>(roleParam === 'teacher' ? 'teacher' : 'student');
  const [identifier, setIdentifier] = useState(emailParam);
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const targetRoute = getSafeRedirectUrl(searchParams.get('redirect'), user.role);
      router.push(targetRoute);

      const fallbackTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
          window.location.href = targetRoute;
        }
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [isAuthenticated, user, router, searchParams]);

  useEffect(() => {
    if (roleParam === 'teacher') {
      setRole('teacher');
    } else if (roleParam === 'student') {
      setRole('student');
    } else {
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('learngraph_last_registered_role') : null;
      if (storedRole === 'teacher') {
        setRole('teacher');
      } else {
        setRole('student');
      }
    }
    if (emailParam) {
      setIdentifier(emailParam);
    }
  }, [roleParam, emailParam]);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setAuthError(null);
  };

  const handleAutofillDemo = () => {
    setAuthError(null);
    if (role === 'student') {
      setIdentifier('alex.chen@student.learngraph.edu');
      setSecretCode('password123');
    } else {
      setIdentifier('s.jenkins@faculty.learngraph.edu');
      setSecretCode('password123');
    }
  };

  // Standard secure credentials login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanIdentifier = identifier.trim();
    const cleanSecret = secretCode.trim();

    if (!cleanIdentifier) {
      setAuthError('Please enter your Email Address or Username.');
      return;
    }

    if (!cleanSecret) {
      setAuthError('Please enter your Secret Code / Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: cleanSecret,
          secretCode: cleanSecret,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Authentication failed. Please verify your Email/Username and Secret Code.');
        return;
      }

      setUserSession(data.user, data.token);

      const redirectUrl = getSafeRedirectUrl(searchParams.get('redirect'), data.user?.role || role);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError('Network error communicating with authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center px-4 animate-fadeIn">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Preparing your workspace...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Redirecting to your diagnostic dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Brand / Logo Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
            LearnGraph
          </span>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          From Marks to Understanding
        </p>
      </div>

      {/* Role Toggle Switcher */}
      <div className="p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => switchRole('student')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            role === 'student'
              ? 'bg-white text-rose-800 shadow-sm border border-slate-200 dark:bg-slate-900 dark:text-rose-400 dark:border-rose-950/60'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${role === 'student' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
          <span>Student Portal</span>
        </button>

        <button
          type="button"
          onClick={() => switchRole('teacher')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            role === 'teacher'
              ? 'bg-indigo-900 text-white shadow-sm dark:bg-indigo-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <School className={`w-4 h-4 ${role === 'teacher' ? 'text-indigo-300 dark:text-white' : 'text-slate-400'}`} />
          <span>Teacher / Faculty</span>
        </button>
      </div>

      {/* Form Container */}
      <div className={`rounded-3xl border-2 p-4 sm:p-6 md:p-8 shadow-paper relative overflow-hidden space-y-5 sm:space-y-6 animate-fadeIn ${
        role === 'student' ? 'bg-[#fcfbf7] border-[#e8e2d4] dark:bg-slate-900 dark:border-slate-800' : 'bg-white border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800'
      }`}>
        {role === 'student' ? (
          <>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
            <div className="absolute left-3.5 sm:left-6 top-0 bottom-0 w-0.5 bg-rose-300/40 dark:bg-rose-500/30 pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800"></div>
        )}

        <div className={`${role === 'student' ? 'pl-3 sm:pl-4' : ''} space-y-1`}>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${role === 'student' ? 'bg-rose-500' : 'bg-indigo-600'}`}></span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${role === 'student' ? 'text-rose-700 dark:text-rose-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
              {role === 'student' ? 'Student Study Desk' : 'Faculty Intelligence Desk'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to LearnGraph
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Enter your email address or username and secret code to access your workspace.
          </p>
        </div>

        {/* Authentication Error Banner */}
        {authError && (
          <div className={`${role === 'student' ? 'ml-3 sm:ml-4' : ''} p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-start space-x-2 text-xs text-rose-800 dark:text-rose-300 animate-fadeIn`}>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Authentication Failed</p>
              <p className="text-[11px] mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        {/* Standard Secure Login Form */}
        <form onSubmit={handleLogin} className={`${role === 'student' ? 'pl-3 sm:pl-4' : ''} space-y-4`}>
          {/* Email Address or Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setAuthError(null);
                }}
                placeholder={role === 'student' ? 'student@example.com or alex.chen' : 'teacher@example.com or s.jenkins'}
                className={`w-full pl-9 pr-3 py-2.5 text-sm sm:text-xs rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white font-medium ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 focus:ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
                autoFocus
              />
            </div>
          </div>

          {/* Secret Code / Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Secret Code / Password
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Masked for security</span>
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showSecretCode ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  setAuthError(null);
                }}
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-10 py-2.5 text-sm sm:text-xs rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white font-medium ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 focus:ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSecretCode(!showSecretCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
                title={showSecretCode ? 'Hide secret code' : 'Show secret code'}
                aria-label={showSecretCode ? 'Hide secret code' : 'Show secret code'}
              >
                {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button: "Sign In" */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
              role === 'student'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-600/20'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 shadow-indigo-600/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Demo Quick-Fill Pill Helper */}
          <div className="pt-1">
            <div className="p-2.5 bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="text-[11px]">
                <span className="font-bold text-slate-800 dark:text-slate-200">Demo User: </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">
                  {role === 'student' ? 'alex.chen' : 's.jenkins'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  (Code: <code className="font-mono font-bold">password123</code>)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="w-full sm:w-auto px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-800 dark:text-slate-200 text-[10px] transition-colors shadow-2xs shrink-0 cursor-pointer text-center"
              >
                Autofill Demo
              </button>
            </div>
          </div>
        </form>

        <div className={`${role === 'student' ? 'pl-3 sm:pl-4' : ''} text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-[#ede7d8] dark:border-slate-800`}>
          <span>Don&apos;t have an account yet? </span>
          <Link 
            href={role === 'student' ? '/register?role=student' : '/register?role=teacher'} 
            className={`font-bold hover:underline ${role === 'student' ? 'text-rose-700 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}
          >
            {role === 'student' ? 'Register as Student →' : 'Register Faculty Account →'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Suspense fallback={<div className="max-w-md mx-auto text-center text-xs text-slate-500 dark:text-slate-400">Loading portal...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

