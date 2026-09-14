'use client';

import React from 'react';

interface NotebookCardProps {
  children: React.ReactNode;
  className?: string;
  ruled?: boolean;
  headerTitle?: string;
  tag?: string;
}

export default function NotebookCard({ 
  children, 
  className = '', 
  ruled = false,
  headerTitle,
  tag 
}: NotebookCardProps) {
  return (
    <div className={`relative bg-[#fdfcf9] dark:bg-slate-900 rounded-2xl border border-[#e5e0d4] dark:border-slate-800 shadow-paper overflow-hidden ${className}`}>
      {/* Top spiral/binder wire simulation or red margin border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500/80 via-rose-400 to-rose-600"></div>

      {/* Red ruled left margin line */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-rose-400/40 dark:bg-rose-500/50 pointer-events-none z-10"></div>

      {headerTitle && (
        <div className="px-8 sm:px-12 pt-6 pb-3 flex items-center justify-between border-b border-[#ece6d9] dark:border-slate-800 bg-[#faf7f0]/60 dark:bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-rose-800 dark:text-red-400">
              {headerTitle}
            </h3>
          </div>
          {tag && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-yellow-900/50 text-amber-900 dark:text-yellow-200 border border-amber-300 dark:border-yellow-700/60">
              {tag}
            </span>
          )}
        </div>
      )}

      <div className={`pl-10 sm:pl-14 pr-6 sm:pr-8 py-6 text-slate-800 dark:text-slate-200 ${ruled ? 'notebook-lined' : ''}`}>
        {children}
      </div>
    </div>
  );
}
