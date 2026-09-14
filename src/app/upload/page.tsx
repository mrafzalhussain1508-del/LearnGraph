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
      const studentDisplayName = customStudentName?.trim() || (user?.role === 'student' ? user?.name : '') || (typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null) || '';
      if (studentDisplayName) {
        formData.append('student_name', studentDisplayName);
      }
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
        if (data.student_name && data.student_name !== 'Student') {
          localStorage.setItem('learngraph_active_student_name', data.student_name.trim());
          const storedAuth = localStorage.getItem('learngraph_auth_user');
          if (storedAuth) {
            try {
              const authObj = JSON.parse(storedAuth);
              if (authObj.role === 'student') {
                authObj.name = data.student_name.trim();
                localStorage.setItem('learngraph_auth_user', JSON.stringify(authObj));
              }
            } catch {}
          }
        }
        if (data.subject) {
          localStorage.setItem('learngraph_selected_subject', data.subject);
        }
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
    const lower = subjectName.toLowerCase();
    const activeStoredName = typeof window !== 'undefined' ? localStorage.getItem('learngraph_active_student_name') : null;
    const studentDisplayName = user?.name || (activeStoredName && activeStoredName !== 'Aarav Gupta' ? activeStoredName : null) || (lower.includes('chem') ? 'Arola Thoudam' : 'Rishu');
    let sampleContent = '';

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
      const chemStudent = (studentDisplayName && studentDisplayName !== 'Aarav Gupta' && studentDisplayName !== 'Student')
        ? studentDisplayName
        : 'Arola Thoudam';
      sampleContent = `Student Name: ${chemStudent}
Class: Class 11 • Section A
Roll No: 14
Subject: Chemistry
Exam: Periodic Properties & Chemical Trends Diagnostic Test

Question 1: Periodic Trends: Atomic & Ionic Radii (25 Marks)
Prompt: Explain why atomic radius decreases across Period 3 from Na to Cl, but increases down Group 1. Compare the ionic radii of Na+ and F- (isoelectronic species).
Student Working:
Across Period 3, atomic number increases from Na (11) to Cl (17) while electrons are added to the same energy level (n = 3). Effective nuclear charge (Z_eff) increases, drawing valence electrons closer to the nucleus, so atomic radius decreases.
Down Group 1, each successive period adds a new electron shell (principal quantum number n increases), increasing electron shielding and atomic size.
For isoelectronic ions Na+ and F- (both have 10 electrons): Na+ has 11 protons (higher nuclear charge Z), exerting stronger coulombic pull on electrons than F- with 9 protons. Therefore, ionic radius of F- is larger than Na+ (F- > Na+).
Teacher Grading: 25/25 ✓ Full Marks. Flawless effective nuclear charge and isoelectronic radius comparison.

Question 2: Ionisation Enthalpy: Half-Filled Subshell Stability (25 Marks)
Prompt: Compare the first ionisation enthalpies of Nitrogen (Z = 7) and Oxygen (Z = 8). Why does Nitrogen have a higher first ionisation enthalpy than Oxygen?
Student Working:
Oxygen has 8 protons and Nitrogen has 7 protons. Higher nuclear charge always means higher ionisation enthalpy, so Oxygen requires more energy to remove an electron than Nitrogen. First IE of Oxygen > First IE of Nitrogen.
Teacher Grading: 8/25 ✕ Error. Fails to account for half-filled p-orbital stability. Nitrogen (2p³) is extra stable; Oxygen (2p⁴) has electron pairing repulsion making electron removal easier.

Question 3: Electronegativity Trends & Pauling Scale (25 Marks)
Prompt: Define electronegativity. Contrast it with electron gain enthalpy, and explain why Fluorine has the highest Pauling electronegativity (4.0).
Student Working:
Electronegativity is the tendency of an atom in a chemical bond to attract shared electron pairs towards itself. Unlike electron gain enthalpy which measures energy change of isolated gaseous atoms gaining an electron, electronegativity is a dimensionless bonded property.
Fluorine is the smallest halogen with high effective nuclear charge, pulling bonded electrons most strongly. Pauling value is 4.0.
Teacher Grading: 25/25 ✓ Full Marks. Precise definition and distinction from electron gain enthalpy.

Question 4: Electron Gain Enthalpy: Chlorine vs Fluorine Anomaly (25 Marks)
Prompt: Why does Chlorine have a more negative electron gain enthalpy (-349 kJ/mol) than Fluorine (-328 kJ/mol), despite Fluorine being more electronegative?
Student Working:
Fluorine has the highest electronegativity, so it must attract incoming electrons the most strongly and release the most energy. Therefore, Fluorine must have a more negative electron gain enthalpy than Chlorine (-349 kJ/mol for F vs -328 kJ/mol for Cl). The table values must have a typo.
Teacher Grading: 6/25 ✕ Error. Critical misconception: neglected compact 2p interelectronic repulsion in Fluorine. Chlorine adds electron to larger 3p orbital with less repulsion.`;
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
Subject: Mathematics
Exam: Mathematics Comprehensive Diagnostic Assessment
Date: 2026-09-14

Question 1: Fractions: Arithmetic & Simplification (25 Marks)
Prompt: Evaluate and simplify the fraction expression: 3/4 + 2/5 - 1/2.
Student Working:
LCM of 4, 5, 2 is 20.
3/4 = 15/20, 2/5 = 8/20, 1/2 = 10/20.
(15 + 8 - 10)/20 = 13/20.
Teacher Grading: 25/25 ✓ Full Marks. Clean common denominator calculation.

Question 2: Linear Equations: Distributive Expansion (25 Marks)
Prompt: Solve the linear equation with parentheses: 2(x - 3) = 14.
Student Working:
2(x - 3) = 14 => 2x - 3 = 14 => 2x = 17 => x = 8.5.
Teacher Grading: 8/25 ✕ Incomplete Bracket Distribution. Multiplied 2 by x but failed to distribute to -3 (wrote 2x - 3 = 14 instead of 2x - 6 = 14). Result should be x = 10.

Question 3: Number Theory: Highest Common Factor (HCF) (25 Marks)
Prompt: Find the Highest Common Factor (HCF) of 36 and 48 using prime factorization.
Student Working:
36 = 2^2 * 3^2, 48 = 2^4 * 3.
Common prime factors with lowest exponents: 2^2 * 3 = 4 * 3 = 12. HCF = 12.
Teacher Grading: 25/25 ✓ Full Marks. Flawless prime factorization.

Question 4: Linear Equations Word Problems: Perimeter Modeling (25 Marks)
Prompt: The perimeter of a rectangular garden is 48 meters. The length is 6 meters greater than the width. Find the length and width.
Student Working:
Let width = w, length = w + 6.
Perimeter = 2(w + w + 6) = 4w + 12 = 48.
4w = 36 => w = 9 meters.
Length = 9 + 6 = 15 meters. Verification: 2(15 + 9) = 48m.
Teacher Grading: 25/25 ✓ Full Marks. Excellent algebraic modeling.

Question 5: Quadratic Equations: Factorization & Roots (25 Marks)
Prompt: Solve the quadratic equation by factoring: x^2 - 4x - 12 = 0.
Student Working:
Factors of -12 that add to -4 are -6 and +2.
Factored form: (x - 6)(x + 2) = 0.
Therefore roots are: x = -6 or x = 2.
Teacher Grading: 15/25 ½ Partial. Factored correctly but sign inversion on roots: x - 6 = 0 gives x = +6, and x + 2 = 0 gives x = -2.

Question 6: Exponents & Powers: Product Law of Indices (25 Marks)
Prompt: Simplify and evaluate using exponential rules: 2^3 × 2^4.
Student Working:
When multiplying powers with same base, multiply the indices: 2^(3 × 4) = 2^12 = 4096.
Teacher Grading: 5/25 ✕ Exponent Multiplication Fallacy. Conflated product of powers (add exponents: 2^(3+4) = 2^7 = 128) with power of a power.

Question 7: Mensuration: Rectangle Area Calculation (25 Marks)
Prompt: A rectangle has a length of 12 cm and a breadth of 7 cm. Calculate the Area of the rectangle.
Student Working:
Area of rectangle = Length + Breadth = 12 + 7 = 19 cm.
Teacher Grading: 5/25 ✕ Critical Formula Error. Area of rectangle is Length × Breadth (12 × 7 = 84 cm²), NOT addition (12 + 7 = 19). Conflated area with linear perimeter calculation.`;
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
