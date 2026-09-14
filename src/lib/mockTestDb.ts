import fs from 'fs';
import path from 'path';

export interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  ruleToRemember?: string;
  misconceptionWarning?: string;
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  durationMinutes: number;
  targetCohort: string; // e.g. "Grade 10 • Section A", "All Cohorts"
  questions: MockTestQuestion[];
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  totalMarks: number;
  passPercentage?: number;
}

export interface MockTestSubmission {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  studentUsername?: string;
  studentEmail?: string;
  cohort?: string;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  submittedAt: string;
  resultsBreakdown: {
    questionId: number;
    question: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    explanation?: string;
    ruleToRemember?: string;
    misconceptionWarning?: string;
  }[];
}

export interface CreateMockTestInput {
  title: string;
  subject: string;
  topic?: string;
  durationMinutes: number;
  targetCohort: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    ruleToRemember?: string;
    misconceptionWarning?: string;
  }[];
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
}

// Initial realistic seed tests aligned with the LearnGraph mathematics curriculum
const SEED_MOCK_TESTS: MockTest[] = [
  {
    id: 'mock-01',
    title: 'Midterm Mastery Checkpoint: Graph Transformations & Quadratics',
    subject: 'Mathematics',
    topic: 'Graph Transformations & Quadratic Equations',
    durationMinutes: 15,
    targetCohort: 'Grade 10 • Section A',
    totalMarks: 5,
    passPercentage: 70,
    createdBy: {
      id: 'fac-01',
      name: 'Dr. Sarah Jenkins',
      role: 'teacher',
    },
    createdAt: '2026-09-12T10:00:00.000Z',
    questions: [
      {
        id: 1,
        question: 'Given the parent quadratic function f(x) = x², which transformation results in g(x) = (x - 4)² + 3?',
        options: [
          'Shift left 4 units, shift up 3 units',
          'Shift right 4 units, shift up 3 units',
          'Shift right 4 units, shift down 3 units',
          'Shift left 4 units, shift down 3 units'
        ],
        correctIndex: 1,
        explanation: 'The term (x - h) inside the function shifts the graph horizontally to the RIGHT by h units when h > 0. The constant +3 outside shifts it UP.',
        ruleToRemember: 'Horizontal Shift Rule: (x - c) moves RIGHT by c units, while (x + c) moves LEFT.',
        misconceptionWarning: 'Inverting signs: confusing the negative sign inside parentheses with negative movement on the x-axis.'
      },
      {
        id: 2,
        question: 'When solving 2x² - 6x + 1 = 0 with the quadratic formula x = (-b ± √(b² - 4ac)) / (2a), what is the exact value substituted for the leading term -b?',
        options: [
          '-6',
          '+6',
          '±6',
          '-36'
        ],
        correctIndex: 1,
        explanation: 'Since b = -6, substituting into -b yields -(-6) = +6.',
        ruleToRemember: 'Ghost Parentheses Rule: Always write - (b). Here - (-6) simplifies to +6.',
        misconceptionWarning: 'Dropping the formula negative sign because b is already negative.'
      },
      {
        id: 3,
        question: 'What is the domain of the function f(x) = √(2x - 8) / (x - 6)?',
        options: [
          '[4, ∞)',
          '[4, 6) ∪ (6, ∞)',
          '(4, 6) ∪ (6, ∞)',
          '(-∞, 6) ∪ (6, ∞)'
        ],
        correctIndex: 1,
        explanation: 'The radicand must be non-negative: 2x - 8 ≥ 0 ⟹ x ≥ 4. The denominator cannot be zero: x ≠ 6. Combining these gives [4, 6) ∪ (6, ∞).',
        ruleToRemember: 'Double-Gate Domain Checklist: Radicand must be ≥ 0 AND denominator must ≠ 0.',
        misconceptionWarning: 'Omitting the denominator asymptote hole at x = 6.'
      },
      {
        id: 4,
        question: 'What transformation maps the square root function y = √x onto y = -√(x + 5)?',
        options: [
          'Shift right 5 units, reflect across y-axis',
          'Shift left 5 units, reflect across x-axis',
          'Shift left 5 units, reflect across y-axis',
          'Shift right 5 units, reflect across x-axis'
        ],
        correctIndex: 1,
        explanation: 'A negative sign outside reflects across the x-axis (inverts y values). Adding 5 inside shifts left by 5 units.',
        ruleToRemember: 'Reflection Rule: Negative sign OUTSIDE inverts y (x-axis reflection); negative sign INSIDE inverts x (y-axis reflection).',
        misconceptionWarning: 'Thinking the outside negative sign reflects across the vertical y-axis.'
      },
      {
        id: 5,
        question: 'For the parabola y = 3(x + 1)² - 7, what are the coordinates of the vertex?',
        options: [
          '(1, -7)',
          '(-1, -7)',
          '(-1, 7)',
          '(3, -7)'
        ],
        correctIndex: 1,
        explanation: 'In vertex form y = a(x - h)² + k, the vertex is (h, k). For (x + 1) = (x - (-1)), h = -1 and k = -7. Vertex is (-1, -7).',
        ruleToRemember: 'Vertex Form: y = a(x - h)² + k has vertex (h, k). Take the opposite sign of h inside parentheses.',
        misconceptionWarning: 'Keeping the positive sign from (x + 1) to make the vertex (+1, -7).'
      }
    ]
  },
  {
    id: 'mock-02',
    title: 'Algebra & Linear Systems Speed Benchmark',
    subject: 'Mathematics',
    topic: 'Linear Systems & Inequalities',
    durationMinutes: 10,
    targetCohort: 'All Cohorts',
    totalMarks: 4,
    passPercentage: 75,
    createdBy: {
      id: 'fac-01',
      name: 'Dr. Sarah Jenkins',
      role: 'teacher',
    },
    createdAt: '2026-09-11T09:30:00.000Z',
    questions: [
      {
        id: 1,
        question: 'Solve the system of linear equations: { 3x + 2y = 12,  x - y = 4 }.',
        options: [
          'x = 4, y = 0',
          'x = 3, y = -1',
          'x = 2, y = 3',
          'x = 5, y = 1'
        ],
        correctIndex: 0,
        explanation: 'From equation 2: x = y + 4. Substitute into eq 1: 3(y + 4) + 2y = 12 ⟹ 3y + 12 + 2y = 12 ⟹ 5y = 0 ⟹ y = 0. Then x = 4.',
        ruleToRemember: 'Substitution or Elimination: Verify the resulting ordered pair (4, 0) satisfies BOTH equations: 3(4)+0=12 and 4-0=4.',
        misconceptionWarning: 'Sign errors when distributing multiplication across subtraction.'
      },
      {
        id: 2,
        question: 'What is the slope of a line perpendicular to 4x - 5y = 20?',
        options: [
          '4/5',
          '-4/5',
          '-5/4',
          '5/4'
        ],
        correctIndex: 2,
        explanation: 'Convert to slope-intercept form: -5y = -4x + 20 ⟹ y = (4/5)x - 4. Slope is 4/5. The perpendicular slope is the negative reciprocal: -5/4.',
        ruleToRemember: 'Perpendicular Slopes: m_perp = -1 / m_orig. Invert the fraction AND negate the sign.',
        misconceptionWarning: 'Taking the reciprocal without flipping the sign (or vice versa).'
      },
      {
        id: 3,
        question: 'Which graph region represents the inequality y < -(1/2)x + 3?',
        options: [
          'Dashed boundary line with shading below',
          'Solid boundary line with shading below',
          'Dashed boundary line with shading above',
          'Solid boundary line with shading above'
        ],
        correctIndex: 0,
        explanation: 'A strict inequality (<) uses a dashed line because points on the line are not included. "Less than" shades below the line.',
        ruleToRemember: 'Inequality Boundary Rule: < or > = dashed line; ≤ or ≥ = solid line.',
        misconceptionWarning: 'Drawing a solid line for strict inequalities.'
      },
      {
        id: 4,
        question: 'If 2(3x - 5) + 4 = 18, what is the value of 3x - 5?',
        options: [
          '7',
          '14',
          '4',
          '12'
        ],
        correctIndex: 0,
        explanation: 'Notice that 2(3x - 5) = 18 - 4 = 14. Dividing both sides by 2 immediately gives 3x - 5 = 7 without expanding x!',
        ruleToRemember: 'Chunking Strategy: When asked for an entire subexpression, isolate that chunk directly.',
        misconceptionWarning: 'Spending extra time solving for x and risking arithmetic mistakes.'
      }
    ]
  }
];

// Seed initial student submission for Alex Chen
const SEED_SUBMISSIONS: MockTestSubmission[] = [
  {
    id: 'sub-01',
    testId: 'mock-01',
    testTitle: 'Midterm Mastery Checkpoint: Graph Transformations & Quadratics',
    studentId: 'st-01',
    studentName: 'Alex Chen',
    studentUsername: 'alex_chen',
    studentEmail: 'alex.chen@student.learngraph.edu',
    cohort: 'Grade 10 • Section A',
    answers: {
      1: 0, // Inverted: chose shift left instead of right
      2: 1, // Correct
      3: 1, // Correct
      4: 1, // Correct
      5: 1  // Correct
    },
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    timeSpentSeconds: 420,
    submittedAt: '2026-09-13T11:45:00.000Z',
    resultsBreakdown: [
      {
        questionId: 1,
        question: 'Given the parent quadratic function f(x) = x², which transformation results in g(x) = (x - 4)² + 3?',
        selectedOption: 0,
        correctOption: 1,
        isCorrect: false,
        explanation: 'The term (x - h) inside the function shifts the graph horizontally to the RIGHT by h units when h > 0. The constant +3 outside shifts it UP.',
        ruleToRemember: 'Horizontal Shift Rule: (x - c) moves RIGHT by c units, while (x + c) moves LEFT.',
        misconceptionWarning: 'Inverting signs: confusing the negative sign inside parentheses with negative movement on the x-axis.'
      },
      {
        questionId: 2,
        question: 'When solving 2x² - 6x + 1 = 0 with the quadratic formula x = (-b ± √(b² - 4ac)) / (2a), what is the exact value substituted for the leading term -b?',
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        explanation: 'Since b = -6, substituting into -b yields -(-6) = +6.',
        ruleToRemember: 'Ghost Parentheses Rule: Always write - (b). Here - (-6) simplifies to +6.'
      },
      {
        questionId: 3,
        question: 'What is the domain of the function f(x) = √(2x - 8) / (x - 6)?',
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        explanation: 'The radicand must be non-negative: 2x - 8 ≥ 0 ⟹ x ≥ 4. The denominator cannot be zero: x ≠ 6. Combining these gives [4, 6) ∪ (6, ∞).',
        ruleToRemember: 'Double-Gate Domain Checklist: Radicand must be ≥ 0 AND denominator must ≠ 0.'
      },
      {
        questionId: 4,
        question: 'What transformation maps the square root function y = √x onto y = -√(x + 5)?',
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        explanation: 'A negative sign outside reflects across the x-axis (inverts y values). Adding 5 inside shifts left by 5 units.',
        ruleToRemember: 'Reflection Rule: Negative sign OUTSIDE inverts y (x-axis reflection); negative sign INSIDE inverts x (y-axis reflection).'
      },
      {
        questionId: 5,
        question: 'For the parabola y = 3(x + 1)² - 7, what are the coordinates of the vertex?',
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        explanation: 'In vertex form y = a(x - h)² + k, the vertex is (h, k). For (x + 1) = (x - (-1)), h = -1 and k = -7. Vertex is (-1, -7).',
        ruleToRemember: 'Vertex Form: y = a(x - h)² + k has vertex (h, k). Take the opposite sign of h inside parentheses.'
      }
    ]
  }
];

declare global {
  // eslint-disable-next-line no-var
  var __learngraph_mock_tests: Map<string, MockTest> | undefined;
  // eslint-disable-next-line no-var
  var __learngraph_mock_submissions: Map<string, MockTestSubmission> | undefined;
}

const TESTS_FILE_PATH = path.join(process.cwd(), 'data', 'mock_tests.json');
const SUBMISSIONS_FILE_PATH = path.join(process.cwd(), 'data', 'mock_test_submissions.json');

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPersistedTests(): MockTest[] {
  try {
    if (fs.existsSync(TESTS_FILE_PATH)) {
      const data = fs.readFileSync(TESTS_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading persisted mock tests:', err);
  }
  return [];
}

function persistTests(tests: MockTest[]): void {
  try {
    ensureDir(TESTS_FILE_PATH);
    fs.writeFileSync(TESTS_FILE_PATH, JSON.stringify(tests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving mock tests to disk:', err);
  }
}

function loadPersistedSubmissions(): MockTestSubmission[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE_PATH)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading persisted mock submissions:', err);
  }
  return [];
}

function persistSubmissions(subs: MockTestSubmission[]): void {
  try {
    ensureDir(SUBMISSIONS_FILE_PATH);
    fs.writeFileSync(SUBMISSIONS_FILE_PATH, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving mock submissions to disk:', err);
  }
}

function initTestsMap(): Map<string, MockTest> {
  const map = new Map<string, MockTest>();
  for (const t of SEED_MOCK_TESTS) {
    map.set(t.id, t);
  }
  const persisted = loadPersistedTests();
  for (const t of persisted) {
    map.set(t.id, t);
  }
  return map;
}

function initSubmissionsMap(): Map<string, MockTestSubmission> {
  const map = new Map<string, MockTestSubmission>();
  for (const s of SEED_SUBMISSIONS) {
    map.set(s.id, s);
  }
  const persisted = loadPersistedSubmissions();
  for (const s of persisted) {
    map.set(s.id, s);
  }
  return map;
}

function getTestsMap(): Map<string, MockTest> {
  if (!global.__learngraph_mock_tests) {
    global.__learngraph_mock_tests = initTestsMap();
  }
  return global.__learngraph_mock_tests;
}

function getSubmissionsMap(): Map<string, MockTestSubmission> {
  if (!global.__learngraph_mock_submissions) {
    global.__learngraph_mock_submissions = initSubmissionsMap();
  }
  return global.__learngraph_mock_submissions;
}

export const mockTestDb = {
  getAllTests(): MockTest[] {
    const map = getTestsMap();
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getTestsForStudent(cohort?: string): MockTest[] {
    const all = this.getAllTests();
    if (!cohort || cohort === 'all') return all;
    return all.filter((t) => {
      if (!t.targetCohort || t.targetCohort === 'All Cohorts') return true;
      const normTarget = t.targetCohort.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normStudent = cohort.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normTarget.includes(normStudent) || normStudent.includes(normTarget);
    });
  },

  getTestById(id: string): MockTest | null {
    const map = getTestsMap();
    return map.get(id) || null;
  },

  createTest(input: CreateMockTestInput): MockTest {
    const map = getTestsMap();
    const id = 'mock-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    
    const formattedQuestions: MockTestQuestion[] = input.questions.map((q, idx) => ({
      id: idx + 1,
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation?.trim() || 'Correct answer verified by educator.',
      ruleToRemember: q.ruleToRemember?.trim() || 'Review core formulas and step verification.',
      misconceptionWarning: q.misconceptionWarning?.trim() || 'Double-check signs and arithmetic.',
    }));

    const newTest: MockTest = {
      id,
      title: input.title.trim(),
      subject: input.subject.trim() || 'Mathematics',
      topic: input.topic?.trim() || 'Curriculum Checkpoint',
      durationMinutes: Number(input.durationMinutes) || 15,
      targetCohort: input.targetCohort.trim() || 'Grade 10 • Section A',
      questions: formattedQuestions,
      totalMarks: formattedQuestions.length,
      passPercentage: 70,
      createdBy: input.createdBy || {
        id: 'fac-01',
        name: 'Dr. Sarah Jenkins',
        role: 'teacher',
      },
      createdAt: new Date().toISOString(),
    };

    map.set(id, newTest);
    persistTests(Array.from(map.values()));
    return newTest;
  },

  deleteTest(id: string): boolean {
    const map = getTestsMap();
    if (map.has(id)) {
      map.delete(id);
      persistTests(Array.from(map.values()));
      return true;
    }
    return false;
  },

  submitTest(params: {
    testId: string;
    studentId: string;
    studentName: string;
    studentUsername?: string;
    studentEmail?: string;
    cohort?: string;
    answers: Record<number, number>;
    timeSpentSeconds: number;
  }): MockTestSubmission | null {
    const test = this.getTestById(params.testId);
    if (!test) return null;

    let score = 0;
    const breakdown = test.questions.map((q) => {
      const selected = params.answers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) score++;

      return {
        questionId: q.id,
        question: q.question,
        selectedOption: typeof selected === 'number' ? selected : -1,
        correctOption: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        ruleToRemember: q.ruleToRemember,
        misconceptionWarning: q.misconceptionWarning,
      };
    });

    const totalQuestions = test.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const subId = 'sub-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

    const submission: MockTestSubmission = {
      id: subId,
      testId: test.id,
      testTitle: test.title,
      studentId: params.studentId,
      studentName: params.studentName,
      studentUsername: params.studentUsername,
      studentEmail: params.studentEmail,
      cohort: params.cohort || test.targetCohort,
      answers: params.answers,
      score,
      totalQuestions,
      percentage,
      timeSpentSeconds: params.timeSpentSeconds,
      submittedAt: new Date().toISOString(),
      resultsBreakdown: breakdown,
    };

    const subsMap = getSubmissionsMap();
    subsMap.set(subId, submission);
    persistSubmissions(Array.from(subsMap.values()));
    return submission;
  },

  getAllSubmissions(): MockTestSubmission[] {
    const subsMap = getSubmissionsMap();
    return Array.from(subsMap.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  getSubmissionsForTest(testId: string): MockTestSubmission[] {
    return this.getAllSubmissions().filter((s) => s.testId === testId);
  },

  getSubmissionsForStudent(studentId: string): MockTestSubmission[] {
    return this.getAllSubmissions().filter((s) => s.studentId === studentId);
  },

  getTestStats(testId: string) {
    const subs = this.getSubmissionsForTest(testId);
    const count = subs.length;
    const avgScore = count > 0 ? Math.round(subs.reduce((acc, s) => acc + s.percentage, 0) / count) : 0;
    const highestScore = count > 0 ? Math.max(...subs.map((s) => s.percentage)) : 0;
    return { count, avgScore, highestScore };
  }
};
