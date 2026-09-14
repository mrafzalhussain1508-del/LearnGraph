'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Layout Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Something went wrong</h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              An unexpected system error occurred. Return to Dashboard to resume your session.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="/overview"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 block"
            >
              <LayoutDashboard className="w-4 h-4 inline-block mr-1.5" />
              <span>Return to Dashboard</span>
            </a>

            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 mr-1.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
