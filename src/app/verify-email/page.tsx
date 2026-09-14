'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserSession } = useAuth();

  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('No verification token was provided in the URL. Please check your activation link or register again.');
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/confirm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim() }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok || !data.success) {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed or link has expired. Please register again.');
          return;
        }

        // Successfully confirmed token! Update context session
        setStatus('success');
        if (data.user && data.token) {
          setUserSession(data.user, data.token);
        }

        // Instantly redirect to overview dashboard
        const redirectPath = data.redirectUrl || '/overview';
        setTimeout(() => {
          router.push(redirectPath);
        }, 800);
      } catch (err: any) {
        console.error('Verification error:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Network error while verifying account. Please check your connection and try again.');
        }
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, router, setUserSession]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white transition-colors">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-paper-grid bg-[size:24px_24px] pointer-events-none opacity-40 dark:opacity-10"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              LearnGraph<span className="text-rose-500">.</span>
            </span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            From Marks to Understanding
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl text-center relative overflow-hidden animate-fadeIn">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-rose-500 to-indigo-800"></div>

          {status === 'verifying' && (
            <div className="space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Verifying your account...
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Please hold on for a moment while we validate your magic activation link and prepare your learning workspace.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 py-2 px-4 rounded-xl max-w-fit mx-auto">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                <span>Activating Secure Student / Faculty Session</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto shadow-inner text-emerald-600 dark:text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Account Activated!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Your email has been verified successfully. Launching your personalized workspace...
                </p>
              </div>

              <div className="pt-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mx-auto shadow-inner text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Verification Failed
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-3 leading-relaxed">
                  {errorMessage || 'This verification link is invalid, expired, or has already been used.'}
                </p>
              </div>

              <div className="pt-3 space-y-2">
                <Link
                  href="/register"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Register Again</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-indigo-200" />
                </Link>
                <Link
                  href="/login"
                  className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  Already verified? Go to Login →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          LearnGraph Adaptive Learning Intelligence · Magic Link Authentication
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Loading verification...</span>
          </div>
        </div>
      }
    >
      <VerifyEmailHandler />
    </Suspense>
  );
}
