'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  School, 
  BookOpen, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  Building2, 
  User, 
  BadgeCheck, 
  Compass,
  Loader2,
  Sparkles,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<'student' | 'teacher'>(roleParam === 'teacher' ? 'teacher' : 'student');

  // Student form fields
  const [studentUsername, setStudentUsername] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentGrade, setStudentGrade] = useState('10th Grade');
  const [studentSection, setStudentSection] = useState('Section A');
  const [studentSchool, setStudentSchool] = useState('');
  const [learningFocus, setLearningFocus] = useState('Algebra & Functions');

  // Teacher form fields
  const [teacherTitle, setTeacherTitle] = useState('Dr.');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherDepartment, setTeacherDepartment] = useState('Mathematics');
  const [teacherSchool, setTeacherSchool] = useState('');
  const [teacherSections, setTeacherSections] = useState('Section A, Section B');
  const [teacherStaffId, setTeacherStaffId] = useState('');

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'teacher') {
      setRole('teacher');
    } else {
      setRole('student');
    }
  }, [roleParam]);

  const activeEmail = role === 'student' ? studentEmail : teacherEmail;

  // Handle Form Submission: Dispatches Magic Verification Link
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = activeEmail.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setAuthError('Please enter a valid email address (e.g. student@example.com).');
      return;
    }

    if (role === 'student') {
      const cleanUsername = studentUsername.trim();
      if (!cleanUsername || cleanUsername.length < 2) {
        setAuthError('Please enter a username (at least 2 characters).');
        return;
      }
      if (!studentPassword.trim() || studentPassword.trim().length < 4) {
        setAuthError('Please enter a Secret Code / Password (at least 4 characters).');
        return;
      }
    } else {
      const cleanTeacherUsername = teacherUsername.trim();
      if (!cleanTeacherUsername || cleanTeacherUsername.length < 2) {
        setAuthError('Please enter an educator username (at least 2 characters).');
        return;
      }
      if (!teacherPassword.trim() || teacherPassword.trim().length < 4) {
        setAuthError('Please enter a Secret Code / Password (at least 4 characters).');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = role === 'student' ? {
      role: 'student' as const,
      username: studentUsername.trim(),
      name: studentUsername.trim(),
      email: cleanEmail,
      password: studentPassword.trim(),
      secretCode: studentPassword.trim(),
      studentId: studentId.trim() || 'ST-2026-084',
      grade: studentGrade,
      section: studentSection.trim() || 'Section A',
      school: studentSchool.trim() || 'Lincoln High School',
      learningGoals: learningFocus,
    } : {
      role: 'teacher' as const,
      username: teacherUsername.trim(),
      name: `${teacherTitle} ${teacherUsername.trim()}`.trim(),
      email: cleanEmail,
      password: teacherPassword.trim() || 'password123',
      secretCode: teacherPassword.trim() || 'password123',
      title: teacherTitle,
      department: teacherDepartment.trim() || 'Mathematics',
      school: teacherSchool.trim() || 'Lincoln High School',
      section: teacherSections.trim() || 'Section A, Section B',
      staffId: teacherStaffId.trim() || `FAC-${Date.now().toString().slice(-6)}`,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Failed to submit registration. Please try again.');
        return;
      }

      setAuthError(null);
      setDevVerificationUrl(data.verificationUrl || null);
      setIsSuccess(true);

      // Instant local cross-tab sync to Teacher Dashboard
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('learngraph_last_registered_student', JSON.stringify({
            ...payload,
            timestamp: Date.now(),
          }));
          window.dispatchEvent(new CustomEvent('learngraph_student_registered', { detail: payload }));
        } catch (e) {
          console.error('Local sync event error:', e);
        }
      }
    } catch (err: any) {
      console.error('Registration submit error:', err);
      setAuthError('Network error connecting to registration service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-paper-grid bg-[size:24px_24px] pointer-events-none opacity-40 dark:opacity-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-4 relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-950/10 group-hover:scale-105 transition-all">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              LearnGraph<span className="text-rose-500">.</span>
            </span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Create Your Account
          </p>
        </div>

        {/* Role Toggle Switcher (Hidden when success) */}
        {!isSuccess && (
          <div className="p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-rose-800 shadow-sm border border-slate-200 dark:bg-slate-900 dark:text-rose-400 dark:border-rose-950/60'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${role === 'student' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
              <span>Student Registration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'teacher'
                  ? 'bg-indigo-900 text-white shadow-sm dark:bg-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <School className={`w-4 h-4 ${role === 'teacher' ? 'text-indigo-300 dark:text-white' : 'text-slate-400'}`} />
              <span>Teacher Registration</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start space-x-2 text-xs text-rose-800 dark:text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Registration Notice</p>
              <p className="text-[11px] mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        {isSuccess ? (
          /* ================= SUCCESS STATE UI ================= */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl text-center space-y-6 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-rose-500 to-indigo-800"></div>

            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto shadow-inner text-indigo-600 dark:text-indigo-400 animate-pulse">
              <Mail className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registration almost complete!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                We&apos;ve generated a verification link. Please check your email to activate your account.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-lg inline-block">
                Sent to: {activeEmail}
              </p>
            </div>

            {/* Local Development Fallback Link */}
            {devVerificationUrl && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-left space-y-2.5 animate-fadeIn">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span>[DEV MODE] Server Console Verification Link</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  The verification link was printed to your terminal server console. For quick local testing, you can activate your account directly with this button:
                </p>
                <div className="pt-1">
                  <Link
                    href={devVerificationUrl}
                    className="inline-flex items-center space-x-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <span>Activate Account Now →</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs">
              <Link
                href={`/login?role=${role}&email=${encodeURIComponent(activeEmail)}`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
              >
                ← Return to {role === 'student' ? 'Student Portal Login' : 'Faculty Login'}
              </Link>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setDevVerificationUrl(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Register a different email
              </button>
            </div>
          </div>
        ) : role === 'student' ? (
          /* ================= STUDENT REGISTRATION VIEW ================= */
          <div className="bg-[#fcfbf7] dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 p-4 sm:p-6 md:p-8 shadow-paper relative overflow-hidden space-y-5 sm:space-y-6 animate-fadeIn">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
            <div className="absolute left-3.5 sm:left-6 top-0 bottom-0 w-0.5 bg-rose-300/40 dark:bg-rose-500/30 pointer-events-none"></div>

            <div className="pl-3 sm:pl-4 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
                  Student Enrollment
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Create Your Student Study Profile
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your answer sheets to personal cognitive diagnostics and structured study guide notebooks.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="pl-3 sm:pl-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={studentUsername}
                      onChange={(e) => setStudentUsername(e.target.value)}
                      placeholder="e.g. alex_chen"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="alex.chen@student.learngraph.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Create Password / Secret Code Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Create Password / Secret Code *
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Masked for security</span>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Create your secret login code (e.g. password123)"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
                    title={showStudentPassword ? 'Hide password' : 'Show password'}
                    aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID (Optional)
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="ST-2026-084"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade / Level
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="9th Grade">9th Grade (Freshman)</option>
                    <option value="10th Grade">10th Grade (Sophomore)</option>
                    <option value="11th Grade">11th Grade (Junior)</option>
                    <option value="12th Grade">12th Grade (Senior)</option>
                    <option value="College Undergraduate">College Undergraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Section
                  </label>
                  <input
                    type="text"
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    placeholder="Section A"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School / Institute
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={studentSchool}
                      onChange={(e) => setStudentSchool(e.target.value)}
                      placeholder="e.g. Lincoln High School"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Learning Goal / Focus Area
                  </label>
                  <div className="relative">
                    <Compass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={learningFocus}
                      onChange={(e) => setLearningFocus(e.target.value)}
                      placeholder="Algebra & Graph Transformations"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#ded7c8] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Verification Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4 text-rose-200" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pl-3 sm:pl-4 text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Already have an active student account? </span>
              <Link href="/login?role=student" className="font-bold text-rose-700 dark:text-rose-400 hover:underline">
                Log in →
              </Link>
            </div>
          </div>
        ) : (
          /* ================= TEACHER REGISTRATION VIEW ================= */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-8 shadow-xl space-y-5 sm:space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                  Faculty Enrollment
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Create Your Educator Account
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Publish study resources, analyze batch error clusters, and deliver automated conceptual interventions.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title
                  </label>
                  <select
                    value={teacherTitle}
                    onChange={(e) => setTeacherTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={teacherUsername}
                      onChange={(e) => setTeacherUsername(e.target.value)}
                      placeholder="e.g. sarah_jenkins"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="s.jenkins@faculty.learngraph.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={teacherDepartment}
                    onChange={(e) => setTeacherDepartment(e.target.value)}
                    placeholder="Mathematics & Science"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Teacher Password / Secret Code */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Create Password / Secret Code *
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Masked for security</span>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Create your educator login code (min. 4 characters)"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
                    title={showTeacherPassword ? 'Hide password' : 'Show password'}
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School / District
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={teacherSchool}
                      onChange={(e) => setTeacherSchool(e.target.value)}
                      placeholder="e.g. Lincoln High School"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Verification ID (Optional)
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={teacherStaffId}
                      onChange={(e) => setTeacherStaffId(e.target.value)}
                      placeholder="e.g. FAC-2026-904"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 hover:from-black hover:to-indigo-950 dark:from-indigo-700 dark:to-indigo-900 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Verification Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Faculty Registration</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Already have an educator account? </span>
              <Link href="/login?role=teacher" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Log in →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-xs font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            <span>Loading registration...</span>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
