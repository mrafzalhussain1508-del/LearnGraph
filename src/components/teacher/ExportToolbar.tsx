'use client';

import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';

interface ExportToolbarProps {
  selectedStudentName?: string;
  onExportClass: () => void;
  onExportStudent: () => void;
  onPrintReport: () => void;
  isExporting?: boolean;
}

export default function ExportToolbar({
  selectedStudentName,
  onExportClass,
  onExportStudent,
  onPrintReport,
  isExporting = false,
}: ExportToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Export Class CSV */}
      <button
        onClick={onExportClass}
        disabled={isExporting}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download class-wide diagnostic CSV"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isExporting ? 'Exporting...' : 'Export Class CSV'}</span>
      </button>

      {/* Export Student CSV — only shown when a student is selected */}
      {selectedStudentName && (
        <button
          onClick={onExportStudent}
          disabled={isExporting}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Download ${selectedStudentName}'s full diagnostic CSV`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export {selectedStudentName.split(' ')[0]} CSV</span>
        </button>
      )}

      {/* Print / PDF */}
      <button
        onClick={onPrintReport}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        title="Print or save as PDF"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print PDF</span>
      </button>
    </div>
  );
}

// ---- Utility: trigger CSV download in browser ----
export function downloadCSV(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
