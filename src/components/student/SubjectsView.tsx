'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  UploadCloud, 
  Award, 
  Layers, 
  Clock, 
  Trash2,
  Atom,
  FlaskConical,
  Binary,
  Compass,
  GraduationCap,
  X
} from 'lucide-react';

export interface StudentSubject {
  id: string;
  name: string;
  code: string;
  category: 'STEM' | 'Core' | 'Elective';
  teacher: string;
  color: string;
  topicCount: number;
  scorePercentage?: number;
  status: 'active' | 'diagnostic_ready' | 'pending';
  lastDiagnosticDate?: string;
}

export const DEFAULT_STUDENT_SUBJECTS: StudentSubject[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    code: 'MATH-102',
    category: 'STEM',
    teacher: 'Dr. Sarah Jenkins',
    color: 'indigo',
    topicCount: 4,
    scorePercentage: 70,
    status: 'diagnostic_ready',
    lastDiagnosticDate: 'Sep 14, 2026',
  },
  {
    id: 'subj-phys',
    name: 'Physics',
    code: 'PHYS-101',
    category: 'STEM',
    teacher: 'Prof. Raymond Hayes',
    color: 'cyan',
    topicCount: 5,
    scorePercentage: 78,
    status: 'diagnostic_ready',
    lastDiagnosticDate: 'Sep 11, 2026',
  },
  {
    id: 'subj-chem',
    name: 'Chemistry',
    code: 'CHEM-101',
    category: 'STEM',
    teacher: 'Dr. Anita Verma',
    color: 'emerald',
    topicCount: 4,
    scorePercentage: 85,
    status: 'diagnostic_ready',
    lastDiagnosticDate: 'Sep 08, 2026',
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    code: 'CS-104',
    category: 'STEM',
    teacher: 'Mr. David Lin',
    color: 'purple',
    topicCount: 6,
    scorePercentage: 92,
    status: 'diagnostic_ready',
    lastDiagnosticDate: 'Sep 05, 2026',
  },
  {
    id: 'subj-bio',
    name: 'Biology',
    code: 'BIO-101',
    category: 'Core',
    teacher: 'Dr. Elena Rossi',
    color: 'rose',
    topicCount: 3,
    status: 'pending',
  },
  {
    id: 'subj-hist',
    name: 'History',
    code: 'HIST-101',
    category: 'Core',
    teacher: 'Mr. Arthur Campbell',
    color: 'amber',
    topicCount: 4,
    status: 'pending',
  },
];

interface SubjectsViewProps {
  currentSubject: string;
  onSelectSubject: (subjectName: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function SubjectsView({
  currentSubject,
  onSelectSubject,
  onSelectTab,
}: SubjectsViewProps) {
  // Load persisted subjects from localStorage or initialize defaults
  const [subjects, setSubjects] = useState<StudentSubject[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learngraph_student_subjects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_STUDENT_SUBJECTS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'STEM' | 'Core' | 'Elective'>('STEM');
  const [newSubjectColor, setNewSubjectColor] = useState('indigo');

  const saveSubjects = (updatedList: StudentSubject[]) => {
    setSubjects(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_student_subjects', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('learngraph_subjects_updated', { detail: updatedList }));
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubj: StudentSubject = {
      id: `subj-${Date.now()}`,
      name: newSubjectName.trim(),
      code: newSubjectCode.trim() || `SUB-${Math.floor(100 + Math.random() * 900)}`,
      teacher: newSubjectTeacher.trim() || 'Assigned Faculty',
      category: newSubjectCategory,
      color: newSubjectColor,
      topicCount: 3,
      status: 'pending',
    };

    const updated = [...subjects, newSubj];
    saveSubjects(updated);
    onSelectSubject(newSubj.name);

    // Reset form
    setNewSubjectName('');
    setNewSubjectCode('');
    setNewSubjectTeacher('');
    setShowAddModal(false);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (subjects.length <= 1) {
      alert('You must keep at least one enrolled subject.');
      return;
    }
    const updated = subjects.filter((s) => s.id !== id);
    saveSubjects(updated);
    if (currentSubject === name) {
      onSelectSubject(updated[0].name);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm ring-2 ring-indigo-500/30';
    }
    return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs';
  };

  const getSubjectBadge = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const getSubjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return Atom;
    if (lower.includes('chem')) return FlaskConical;
    if (lower.includes('comp') || lower.includes('cs') || lower.includes('code')) return Binary;
    if (lower.includes('math') || lower.includes('calc') || lower.includes('algeb')) return Compass;
    return BookOpen;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                Academic Curriculum
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {subjects.length} Enrolled Courses
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              My Subjects & Course Portals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Switch between your enrolled subjects to filter diagnostic reports, OCR answer sheet scans, practice quizzes, and teacher reteach prescriptions.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Subject</p>
            <p className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
              {currentSubject}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Enrolled</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {subjects.length} Courses
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Scanned & Diagnosed</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {subjects.filter((s) => s.status === 'diagnostic_ready').length} Subjects
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Diagnostic</p>
            <p className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {subjects.filter((s) => s.status === 'pending').length} Needs Scan
            </p>
          </div>
        </div>
      </div>

      {/* 2. Subject Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {subjects.map((subj) => {
          const isSelected = subj.name.toLowerCase() === currentSubject.toLowerCase();
          const IconComponent = getSubjectIcon(subj.name);
          const badgeClass = getSubjectBadge(subj.color);

          return (
            <div
              key={subj.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${getColorClasses(
                subj.color,
                isSelected
              )}`}
            >
              <div>
                {/* Header: Icon + Code + Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {subj.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {subj.code} • {subj.category}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                      Active
                    </span>
                  )}
                </div>

                {/* Faculty & Topics info */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Instructor:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subj.teacher}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Curriculum Units:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subj.topicCount} Topics</span>
                  </div>
                  {subj.scorePercentage !== undefined ? (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Latest Diagnostic:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {subj.scorePercentage}% Mastery
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Diagnostic Status:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400 text-[11px]">
                        Scan Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {isSelected ? (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Viewing Desk</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelectSubject(subj.name);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Select Subject
                  </button>
                )}

                <div className="flex items-center space-x-1.5">
                  <Link
                    href={`/upload?subject=${encodeURIComponent(subj.name)}`}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={`Upload answer sheet for ${subj.name}`}
                  >
                    <UploadCloud className="w-4 h-4" />
                  </Link>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => handleDeleteSubject(subj.id, subj.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add New Subject
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Linear Algebra, Organic Chemistry"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="e.g. MATH-201"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newSubjectCategory}
                    onChange={(e) => setNewSubjectCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Teacher / Instructor
                </label>
                <input
                  type="text"
                  value={newSubjectTeacher}
                  onChange={(e) => setNewSubjectTeacher(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center space-x-3">
                  {['indigo', 'cyan', 'emerald', 'purple', 'rose'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjectColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        c === 'indigo'
                          ? 'bg-indigo-600'
                          : c === 'cyan'
                          ? 'bg-cyan-600'
                          : c === 'emerald'
                          ? 'bg-emerald-600'
                          : c === 'purple'
                          ? 'bg-purple-600'
                          : 'bg-rose-600'
                      } ${newSubjectColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Enroll Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
