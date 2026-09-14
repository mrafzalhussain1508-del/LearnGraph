'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  Layers, 
  Search, 
  FileCheck, 
  RefreshCw,
  Clock,
  ShieldCheck,
  School,
  BookOpen,
  Key,
  AlertCircle
} from 'lucide-react';

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Economics'
];

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const querySubject = searchParams.get('subject');
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (querySubject) return querySubject;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('learngraph_selected_subject') || 'Mathematics';
    }
    return 'Mathematics';
  });

  useEffect(() => {
    if (querySubject) {
      setSelectedSubject(querySubject);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_selected_subject', querySubject);
      }
    }
  }, [querySubject]);

  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing AI Diagnostic engine...');
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingSteps = [
    { title: 'Optical Character Recognition (OCR)', desc: 'Scanning handwritten equations, diagrams, and scratch annotations...' },
    { title: 'Curriculum Semantic Alignment', desc: `Mapping student working against ${selectedSubject} standards...` },
    { title: 'Cognitive Misconception Diagnosis', desc: 'Evaluating step-by-step against canonical model solutions...' },
    { title: 'Study Guide & Reteach Compilation', desc: 'Synthesizing personalized diagnostic cards & mastery metrics...' },
  ];

  const uploadAndAnalyze = async (fileToUpload: File, customStudentName?: string, customSubject?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStage(0);
    setProgressPercent(15);
    setStatusMessage(`Scanning ${customSubject || selectedSubject} handwriting & evaluating steps...`);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) return prev;
        const next = prev + 7;
        if (next > 65) setProcessingStage(2);
        else if (next > 35) setProcessingStage(1);
        return next;
      });
    }, 180);

    try {
      const activeSubject = customSubject || selectedSubject || 'Mathematics';
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const studentDisplayName = customStudentName || user?.name || 'Aarav Gupta';
      formData.append('student_name', studentDisplayName);
      formData.append('subject', activeSubject);

      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_selected_subject', activeSubject);
      }

      const res = await fetch('/api/analyze-sheet', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze answer sheet');
      }

      clearInterval(interval);
      setProcessingStage(3);
      setProgressPercent(100);
      setStatusMessage('Analysis complete! Synthesizing student study guide...');

      if (data.notice) {
        setApiNotice(data.notice);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_latest_analysis', JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('learngraph_analysis_completed', { detail: data }));
      }

      setTimeout(() => {
        router.push('/student');
      }, 1200);

    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Error communicating with analysis service.');
    }
  };

  const handleStartSubjectAnalysis = (subjectName: string) => {
    const studentDisplayName = user?.name || 'Aarav Gupta';
    let sampleContent = '';

    const lower = subjectName.toLowerCase();
    if (lower.includes('phys')) {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Class 11 • Section B
Roll No: 18
Subject: Physics
Exam: Mechanics, Projectile Motion & Energy Diagnostic

Question 1: Kinematics & Projectile Trajectory (25 Marks)
Prompt: A projectile is launched from ground level at 25 m/s at 30° above horizontal. Find maximum height (g = 9.8 m/s²).
Student Working:
Vertical velocity v_0y = 25 * sin(30°) = 12.5 m/s.
At peak, v_y = 0.
v_y^2 = v_0y^2 - 2gh => 0 = 156.25 - 19.6h => h = 7.97 meters.
Teacher Grading: 25/25 ✓ Full Marks. Clean vector resolution.

Question 2: Newton's Second Law & Friction (25 Marks)
Prompt: A 5 kg block is pulled with force F = 30 N horizontally across rough surface (μ_k = 0.3). Find acceleration.
Student Working:
N = mg = 49 N.
f_k = 0.3 * 49 = 14.7 N.
F_net = F + f_k = 30 + 14.7 = 44.7 N.
a = 44.7 / 5 = 8.94 m/s².
Teacher Grading: 15/25 ½ Partial. Added friction to driving force instead of subtracting opposing resistance.

Question 3: Conservation of Mechanical Energy (25 Marks)
Prompt: Roller coaster of mass 200 kg descends from H = 20 m to h = 5 m. Find velocity at 5 m from rest.
Student Working:
0.5 * m * v^2 = mg * 5 => v = 9.9 m/s.
Teacher Grading: 10/25 ✕ Error. Equated kinetic energy to remaining height (5m) instead of height lost (15m).

Question 4: Rotational Dynamics & Torque (25 Marks)
Prompt: Solid cylinder (I = 0.5 kg·m²) has 12 N·m torque applied for 4 seconds from rest. Calculate final angular velocity.
Student Working:
α = τ / I = 12 / 0.5 = 24 rad/s².
ω = 0 + (24)(4) = 96 rad/s.
Teacher Grading: 25/25 ✓ Full Marks.`;
    } else if (lower.includes('chem')) {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Class 11 • Section A
Roll No: 14
Subject: Chemistry
Exam: Stoichiometry & Analytical Thermodynamics

Question 1: Stoichiometry & Yield (25 Marks)
Prompt: Calculate theoretical yield of NH3 from 28.0 g N2: N2 + 3H2 -> 2NH3.
Student Working: Moles N2 = 1.0 mol. Mole ratio 1:2 gives 2.0 mol NH3 = 34.0 g.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: Buffer pH & Henderson-Hasselbalch (25 Marks)
Prompt: Buffer of 0.20 M CH3COOH (Ka = 1.8e-5) and 0.10 M CH3COONa. Calculate pH.
Student Working: pH = 4.74 + log(0.20 / 0.10) = 5.04.
Teacher Grading: 15/25 ½ Partial. Inverted buffer ratio (put acid over conjugate base).

Question 3: Gibbs Free Energy Spontaneity (25 Marks)
Prompt: At 298 K, ΔH = -92.2 kJ, ΔS = -198.7 J/K. Determine ΔG and state if spontaneous.
Student Working: ΔG = -92.2 - 298*(-198.7) = +59120 kJ (Non-spontaneous).
Teacher Grading: 10/25 ✕ Error. Unit conversion error: added J directly to kJ without dividing ΔS by 1000.

Question 4: Organic SN2 Reaction Mechanism (25 Marks)
Prompt: (S)-2-bromobutane with NaCN in acetone. Predict mechanism and stereochemistry.
Student Working: Polar aprotic solvent -> SN2 backside attack -> Walden inversion to (R)-2-cyanobutane.
Teacher Grading: 25/25 ✓ Full Marks.`;
    } else if (lower.includes('bio')) {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Class 12 • Section B
Roll No: 09
Subject: Biology
Exam: Cellular Respiration & Molecular Genetics Diagnostic

Question 1: Cellular Respiration & Chemiosmosis (25 Marks)
Prompt: Trace electron transfer and proton pumping across inner mitochondrial membrane.
Student Working: NADH/FADH2 transfer e- through ETC to O2. Proton gradient drives ATP Synthase rotational catalysis.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: Dihybrid Inheritance (25 Marks)
Prompt: Cross YyRr x YyRr. Calculate expected fraction of Green, Round offspring.
Student Working: P(Green) = 1/4, P(Round) = 3/4. P = (1/4)*(3/4) = 3/16 (18.75%).
Teacher Grading: 25/25 ✓ Full Marks.

Question 3: DNA Replication Directionality (25 Marks)
Prompt: Distinguish leading and lagging strand synthesis at replication fork.
Student Working: Polymerase synthesizes 3' to 5'. Lagging strand fragments sealed by RNA polymerase.
Teacher Grading: 10/25 ✕ Error. Synthesis is 5' to 3', and fragments are ligated by DNA Ligase.

Question 4: Lac Operon Dual Regulation (25 Marks)
Prompt: State of lac operon under high glucose and high lactose.
Student Working: Repressor removed by allolactose, but low cAMP means inactive CAP -> basal transcription only.
Teacher Grading: 25/25 ✓ Full Marks.`;
    } else if (lower.includes('comp') || lower.includes('cs')) {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Grade 11
Roll No: 31
Subject: Computer Science
Exam: Data Structures & Asymptotic Complexity Diagnostic

Question 1: Master Theorem Recurrence (25 Marks)
Prompt: Solve T(n) = 2T(n/2) + O(n).
Student Working: a = 2, b = 2, f(n) = O(n). n^(log2 2) = n. Case 2 applies -> T(n) = Θ(n log n).
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: BST Recursive Insertion (25 Marks)
Prompt: Write the recursive case for BST key insertion.
Student Working: if (key < root.val) insert(root.left, key); else insert(root.right, key); return root;
Teacher Grading: 15/25 ½ Partial. Missing pointer re-assignment: must write root.left = insert(root.left, key).

Question 3: 1D Knapsack Space Optimization (25 Marks)
Prompt: Loop iteration direction for capacity w in 1D array 0/1 Knapsack.
Student Working: Loop capacity w forwards from 0 to W: dp[w] = max(dp[w], dp[w-wt] + val).
Teacher Grading: 10/25 ✕ Error. Forward loop allows multiple item reuse (Unbounded); must loop backwards (W down to wt).

Question 4: Dijkstra Algorithm Negative Weights (25 Marks)
Prompt: Why does Dijkstra fail on negative edge weights?
Student Working: Greedy invariant assumes finalized distances cannot be reduced by future edges. Negative edges violate this.
Teacher Grading: 25/25 ✓ Full Marks.`;
    } else if (lower.includes('hist')) {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Class 10
Roll No: 12
Subject: History
Exam: Modern World History & Interwar Treaties

Question 1: Primary vs Secondary Sources (25 Marks)
Prompt: Explain distinction and evaluation of source bias.
Student Working: Primary sources are contemporaneous artifacts/eyewitnesses. Secondary sources interpret them. Corroboration identifies bias.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: British Enclosure Acts (25 Marks)
Prompt: Role of Enclosure Acts in British industrialization.
Student Working: Privatized common fields, displaced tenant farmers migrated to cities supplying factory wage-labor.
Teacher Grading: 25/25 ✓ Full Marks.

Question 3: Treaty of Versailles Article 231 (25 Marks)
Prompt: Significance of Article 231 and reparations.
Student Working: Assigned exclusive war guilt to Austria-Hungary, causing Berlin hyperinflation.
Teacher Grading: 10/25 ✕ Error. Article 231 forced Germany (not Austria) to accept sole war guilt.

Question 4: Non-Aligned Movement Principles (25 Marks)
Prompt: Strategic aims of NAM at Bandung 1955.
Student Working: Nehru, Nasser, Tito rejected superpower blocs, championing self-determination and mutual non-aggression.
Teacher Grading: 25/25 ✓ Full Marks.`;
    } else {
      sampleContent = `Student Name: ${studentDisplayName}
Class: Class 10 • Section A
Roll No: 24
Subject: Mathematics (Algebra & Quadratic Equations Midterm)
Date: 2026-09-14

Question 1: Linear Equations in Two Variables (25 Marks)
Prompt: Solve the system of linear equations by substitution: 2x + 3y = 12 and x - y = 1.
Student Working:
From equation 2: x = y + 1.
Substitute into equation 1: 2(y + 1) + 3y = 12 => 2y + 2 + 3y = 12 => 5y = 10 => y = 2.
Then x = 2 + 1 = 3.
Final Solution: x = 3, y = 2.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: Quadratic Equation Factorization & Roots (25 Marks)
Prompt: Solve the quadratic equation by factoring: x^2 - 4x - 12 = 0.
Student Working:
Factors of -12 that add to -4 are -6 and +2.
Factored form: (x - 6)(x + 2) = 0.
Therefore roots are: x = -6 or x = 2.
Teacher Grading: 15/25 ½ Partial. Factored correctly but sign inversion on roots: x - 6 = 0 gives x = +6, and x + 2 = 0 gives x = -2.

Question 3: Algebraic Identities & Bracket Expansion (25 Marks)
Prompt: Expand and simplify: (2x + 3)^2 - (2x - 3)^2.
Student Working:
(4x^2 + 12x + 9) - (4x^2 - 12x + 9) = 4x^2 - 4x^2 + 12x - 12x + 9 - 9 = 0.
Teacher Grading: 10/25 ✕ Error. Dropped negative sign distribution over -(-12x). Correct answer is 24x.

Question 4: Linear Equations Word Problems (25 Marks)
Prompt: The perimeter of a rectangular garden is 48 meters. The length is 6 meters greater than the width. Find the length and width.
Student Working:
Let width = w, length = w + 6.
Perimeter = 2(w + w + 6) = 4w + 12 = 48.
4w = 36 => w = 9 meters.
Length = 9 + 6 = 15 meters. Verification: 2(15 + 9) = 48m.
Teacher Grading: 25/25 ✓ Full Marks. Excellent modeling.`;
    }

    const file = new File(
      [sampleContent], 
      `${studentDisplayName.replace(/\s+/g, '_')}_${subjectName.replace(/\s+/g, '_')}_Paper.txt`, 
      { type: 'text/plain' }
    );
    setUploadedFile(file);
    uploadAndAnalyze(file, studentDisplayName, subjectName);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 pb-24 md:pb-12 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal AI Diagnostic Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Diagnose Student Answer Sheet
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Upload any student test paper or handwritten homework across STEM & Humanities. The AI evaluates question-by-question, compares with model solutions, and pinpoints cognitive misconceptions.
          </p>
        </div>

        {/* Dynamic Subject Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Examination Target Subject</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {selectedSubject}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="subject-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Change Subject:
            </label>
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSelectedSubject(nextSub);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('learngraph_selected_subject', nextSub);
                }
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {AVAILABLE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Upload Box / Processing Screen */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#e8e2d4] dark:border-slate-800 shadow-md p-6 sm:p-8 md:p-10">
          {!isProcessing ? (
            <div className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const dropped = e.dataTransfer.files[0];
                    setUploadedFile(dropped);
                    uploadAndAnalyze(dropped);
                  }
                }}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                } shadow-sm`}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const picked = e.target.files[0];
                      setUploadedFile(picked);
                      uploadAndAnalyze(picked);
                    }
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-slate-900 dark:text-white block">
                      Drag and drop your {selectedSubject} answer sheet here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      Supports PDF, PNG, JPG, WEBP • Evaluates step-by-step with canonical model answers
                    </span>
                  </div>
                </label>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                    Strict FERPA & Student Privacy Compliant
                  </span>
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                    Extracts Question Work & Annotations
                  </span>
                </div>
              </div>

              {/* Dynamic 1-Click Subject Sample Action */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Instant Test: Diagnose Sample {selectedSubject} Paper
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Run step-by-step question evaluation for {selectedSubject} in 1 click
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartSubjectAnalysis(selectedSubject)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap inline-flex items-center justify-center space-x-1.5"
                >
                  <span>Test {selectedSubject} Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Processing Error</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Progress Screen */
            <div className="py-8 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950/60 animate-ping opacity-25"></div>
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {statusMessage}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Analyzing {selectedSubject} submission • Comparing working steps against canonical models
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Processing Stages */}
              <div className="text-left space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                {processingSteps.map((step, idx) => {
                  const isDone = processingStage > idx;
                  const isCurrent = processingStage === idx;
                  return (
                    <div 
                      key={step.title}
                      className={`flex items-start space-x-3 text-xs transition-opacity ${
                        isCurrent ? 'opacity-100 font-bold' : isDone ? 'opacity-70 text-slate-500' : 'opacity-30'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white">{step.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Upload Desk...</span>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
