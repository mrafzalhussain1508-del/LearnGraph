'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Eye, 
  X, 
  ChevronRight, 
  Award, 
  FileText, 
  Check, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { MockTest, MockTestSubmission } from '@/lib/mockTestDb';

interface MockTestsManagementProps {
  onTestCountChange?: (count: number) => void;
}

export default function MockTestsManagement({ onTestCountChange }: MockTestsManagementProps) {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalTests: 0, totalSubmissions: 0, overallAverageScore: 0 });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTestForSubmissions, setSelectedTestForSubmissions] = useState<MockTest | null>(null);
  const [submissions, setSubmissions] = useState<MockTestSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Create Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTopic, setFormTopic] = useState('');
  const [formDuration, setFormDuration] = useState(15);
  const [formCohort, setFormCohort] = useState('Grade 10 • Section A');
  const [formQuestions, setFormQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    ruleToRemember?: string;
  }>>([
    {
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      ruleToRemember: '',
    }
  ]);

  // AI Generation State
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Fetch tests
  const fetchTests = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/mock-tests');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTests(data.tests || []);
          if (data.stats) setStats(data.stats);
          if (onTestCountChange) onTestCountChange(data.tests?.length || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onTestCountChange]);

  useEffect(() => {
    fetchTests(false);

    // Listen for custom event or storage event for real-time submission sync
    const handleSubEvent = () => fetchTests(true);
    window.addEventListener('learngraph_mock_test_submitted', handleSubEvent);
    return () => window.removeEventListener('learngraph_mock_test_submitted', handleSubEvent);
  }, [fetchTests]);

  // Fetch submissions when inspecting a test
  const handleOpenSubmissions = async (test: MockTest) => {
    setSelectedTestForSubmissions(test);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/mock-tests/${test.id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.submissions || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch test submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Delete test
  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this mock test? This will remove all associated submissions.')) return;
    try {
      const res = await fetch(`/api/mock-tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTests(true);
      }
    } catch (err) {
      console.error('Failed to delete mock test:', err);
    }
  };

  // AI Auto-generator
  const handleGenerateQuestionsWithAI = async () => {
    const topic = aiTopicInput.trim() || formTopic.trim() || 'Graph Transformations';
    setIsGeneratingAi(true);
    setFormError('');
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped = data.questions.map((q: any) => ({
            question: q.question,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof q.correct_index === 'number' ? q.correct_index : 0,
            explanation: q.rule_to_remember || 'Core concept rule.',
            ruleToRemember: q.rule_to_remember || '',
          }));

          setFormQuestions(mapped);
          if (!formTitle) {
            setFormTitle(`${topic} - Mastery Checkpoint`);
          }
          if (!formTopic) {
            setFormTopic(topic);
          }
          setAiSuccessMsg(`✨ AI generated ${mapped.length} curriculum-aligned questions for "${topic}"!`);
        }
      }
    } catch (err) {
      setFormError('Failed to generate questions. Please enter manually.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Question Form Helpers
  const addQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      {
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        ruleToRemember: '',
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (formQuestions.length <= 1) return;
    setFormQuestions(formQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    const next = [...formQuestions];
    next[idx].question = text;
    setFormQuestions(next);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const next = [...formQuestions];
    next[qIdx].options[optIdx] = text;
    setFormQuestions(next);
  };

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    const next = [...formQuestions];
    next[qIdx].correctIndex = optIdx;
    setFormQuestions(next);
  };

  const updateExplanation = (qIdx: number, text: string) => {
    const next = [...formQuestions];
    next[qIdx].explanation = text;
    setFormQuestions(next);
  };

  // Submit new test
  const handleCreateTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Please enter a test title.');
      return;
    }

    // Validate questions
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.question.trim()) {
        setFormError(`Question #${i + 1} is missing a question prompt.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setFormError(`Question #${i + 1} is missing Option ${String.fromCharCode(65 + j)}.`);
          return;
        }
      }
    }

    setIsSubmittingForm(true);
    try {
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          subject: formSubject,
          topic: formTopic,
          durationMinutes: formDuration,
          targetCohort: formCohort,
          questions: formQuestions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsCreateModalOpen(false);
          // Reset form
          setFormTitle('');
          setFormTopic('');
          setAiTopicInput('');
          setFormQuestions([
            {
              question: '',
              options: ['', '', '', ''],
              correctIndex: 0,
              explanation: '',
              ruleToRemember: '',
            }
          ]);
          fetchTests(true);
        } else {
          setFormError(data.error || 'Failed to create mock test.');
        }
      } else {
        setFormError('Server error creating mock test.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <section id="mock-tests" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 md:p-7 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
              Assessment Engine & Mastery Checkpoints
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Mock Tests & Cohort Quizzes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Author and assign timed diagnostic mock tests to student cohorts, view real-time scorecards, and track misconception retention.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchTests(false)}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Mock Test</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Mock Tests</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{tests.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Published</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Student Submissions</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalSubmissions}</span>
            <span className="text-xs text-slate-400">Total Records</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Cohort Average Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.overallAverageScore}%</span>
            <span className="text-xs text-slate-400 font-normal">across all tests</span>
          </div>
        </div>
      </div>

      {/* Mock Tests Cards Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            Loading mock tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-3">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>No mock tests created yet. Click "Create Mock Test" to publish your first diagnostic quiz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test: any) => {
              const testStats = test.stats || { count: 0, avgScore: 0 };
              return (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        {test.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        Target: {test.targetCohort}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {test.title}
                    </h3>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.questions.length} Questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {testStats.count} Submissions
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span>Cohort Avg: {testStats.avgScore}%</span>
                        <span className="font-medium">
                          {testStats.avgScore >= 75 ? 'Strong' : testStats.avgScore >= 50 ? 'Needs Practice' : 'Critical'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            testStats.avgScore >= 75
                              ? 'bg-emerald-500'
                              : testStats.avgScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${testStats.avgScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSubmissions(test)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Submissions ({testStats.count})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTest(test.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Mock Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE MOCK TEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  New Assessment
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Create & Assign Mock Test
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generation Quick Bar */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Gemini AI Fast Assessment Generator</span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Optional
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Type a topic to automatically draft 3 multiple choice questions with misconceptions and distractor explanations.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Function Domain & Radical Equations"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={handleGenerateQuestionsWithAI}
                  disabled={isGeneratingAi}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Generating...' : 'Auto-Generate'}</span>
                </button>
              </div>
              {aiSuccessMsg && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{aiSuccessMsg}</span>
                </p>
              )}
            </div>

            {/* Main Form */}
            <form onSubmit={handleCreateTestSubmit} className="space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graph Transformations & Quadratics Mastery Checkpoint"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject / Discipline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assign to Cohort *
                  </label>
                  <select
                    value={formCohort}
                    onChange={(e) => setFormCohort(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                  >
                    <option value="Grade 10 • Section A">Grade 10 • Section A (Current Active Cohort)</option>
                    <option value="Grade 10 • Section B">Grade 10 • Section B</option>
                    <option value="Grade 11 • Advanced Mathematics">Grade 11 • Advanced Mathematics</option>
                    <option value="All Cohorts">All Enrolled Students (Public Benchmark)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={180}
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Questions ({formQuestions.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {formQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        Question {qIdx + 1}
                      </span>
                      {formQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter math problem or concept question..."
                        value={q.question}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Options A - D */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                            q.correctIndex === optIdx
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => setCorrectOption(qIdx, optIdx)}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            id={`q-${qIdx}-opt-${optIdx}`}
                          />
                          <label
                            htmlFor={`q-${qIdx}-opt-${optIdx}`}
                            className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                          >
                            {String.fromCharCode(65 + optIdx)}:
                          </label>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            className="flex-1 text-xs bg-transparent border-none text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div>
                      <input
                        type="text"
                        placeholder="Explanation / Rule to remember (shown to student after submitting)..."
                        value={q.explanation || ''}
                        onChange={(e) => updateExplanation(qIdx, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingForm && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish & Assign Mock Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSIONS VIEWER MODAL */}
      {selectedTestForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Assessment Analytics
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedTestForSubmissions.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cohort: {selectedTestForSubmissions.targetCohort} • {selectedTestForSubmissions.questions.length} Questions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestForSubmissions(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                Loading submissions...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No student has submitted this mock test yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
                  <span>Student ({submissions.length})</span>
                  <span>Score & Progress</span>
                </div>

                {submissions.map((sub) => {
                  const isExpanded = expandedSubmissionId === sub.id;
                  const mins = Math.floor(sub.timeSpentSeconds / 60);
                  const secs = sub.timeSpentSeconds % 60;
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 text-white flex items-center justify-center font-black text-sm">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.studentName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              @{sub.studentUsername || 'student'} • {new Date(sub.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              sub.percentage >= 75
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : sub.percentage >= 50
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                            }`}>
                              {sub.score}/{sub.totalQuestions} ({sub.percentage}%)
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {mins}m {secs}s
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
                            title="Toggle breakdown"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Question Breakdown */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                            Detailed Question Responses:
                          </p>
                          {sub.resultsBreakdown.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                                item.isCorrect
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                                  : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {item.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5 flex-1">
                                <p className="font-medium">
                                  <span className="font-bold">Q{idx + 1}:</span> {item.question}
                                </p>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  <span>Student picked: </span>
                                  <span className={item.isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-rose-700 dark:text-rose-300 font-bold'}>
                                    Option {String.fromCharCode(65 + item.selectedOption)}
                                  </span>
                                  {!item.isCorrect && (
                                    <span> • Correct was: Option {String.fromCharCode(65 + item.correctOption)}</span>
                                  )}
                                </div>
                                {item.ruleToRemember && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                                    Rule: {item.ruleToRemember}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
