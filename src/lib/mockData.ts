export interface TopicMastery {
  topic: string;
  score: number;
  benchmark: number;
  status: 'mastered' | 'reinforce' | 'struggle';
  studentCountStruggling?: number;
  totalStudents?: number;
  description: string;
}

export interface TeacherInsight {
  id: string;
  topic: string;
  severity: 'red' | 'yellow' | 'green';
  classScore: number;
  headline: string;
  rootCause: string;
  misconceptionDetails: string;
  actionableReteachPlan: {
    durationMinutes: number;
    activityTitle: string;
    strategy: string;
    recommendedVisual: string;
  };
  impactedStudents: string[];
}

export interface StudentRosterMember {
  id: string;
  name: string;
  rawScore: number;
  overallUnderstanding: number;
  algebra: number;
  quadratics: number;
  functions: number;
  graphs: number;
  primaryInterventionNeeded: string;
  status: 'critical' | 'attention' | 'strong';
}

// 1. SECTION A CLASS METRICS (Teacher Dashboard)
export const sectionAClassMetrics: TopicMastery[] = [
  {
    topic: 'Algebra & Linear Equations',
    score: 88,
    benchmark: 75,
    status: 'mastered',
    studentCountStruggling: 3,
    totalStudents: 28,
    description: 'Class exhibits strong fundamentals in isolating variables, distribution, and systems of equations.',
  },
  {
    topic: 'Quadratic Equations',
    score: 64,
    benchmark: 70,
    status: 'reinforce',
    studentCountStruggling: 10,
    totalStudents: 28,
    description: 'Factoring is steady, but students frequently fumble signs in the quadratic formula and discriminant.',
  },
  {
    topic: 'Functions & Domain',
    score: 42,
    benchmark: 70,
    status: 'struggle',
    studentCountStruggling: 18,
    totalStudents: 28,
    description: 'Confusion around composite notation f(g(x)) and forgetting to exclude denominator zeroes from domain.',
  },
  {
    topic: 'Graph Transformations',
    score: 35,
    benchmark: 70,
    status: 'struggle',
    studentCountStruggling: 22,
    totalStudents: 28,
    description: '78% of students consistently invert horizontal shifts f(x - c), moving left instead of right.',
  },
];

// Helper to get traffic light color config
export function getTrafficLight(score: number) {
  if (score >= 80) {
    return {
      type: 'green' as const,
      badgeText: 'Mastery (>80%)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      barColor: '#10b981', // emerald-500
      bgSoft: 'bg-emerald-50',
      borderSoft: 'border-emerald-200',
      textAccent: 'text-emerald-700',
    };
  }
  if (score >= 50) {
    return {
      type: 'yellow' as const,
      badgeText: 'Needs Reinforce (50-79%)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      dotClass: 'bg-amber-500',
      barColor: '#f59e0b', // amber-500
      bgSoft: 'bg-amber-50',
      borderSoft: 'border-amber-200',
      textAccent: 'text-amber-700',
    };
  }
  return {
    type: 'red' as const,
    badgeText: 'Critical Struggle (<50%)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
    barColor: '#ef4444', // rose-500
    bgSoft: 'bg-rose-50',
    borderSoft: 'border-rose-200',
    textAccent: 'text-rose-700',
  };
}

// 2. TEACHER AI INSIGHTS
export const teacherAIInsights: TeacherInsight[] = [
  {
    id: 'insight-graphs',
    topic: 'Graph Transformations',
    severity: 'red',
    classScore: 35,
    headline: 'High Priority: Counter-intuitive Horizontal Translation Bias',
    rootCause: '78% of students in Section A mapped f(x - 3) as a leftward shift of 3 units rather than rightward.',
    misconceptionDetails: 'Students intuitively assume negative signs inside parentheses correlate with the negative x-axis direction. They do not yet realize input substitution requires x to be 3 larger to evaluate the same output.',
    actionableReteachPlan: {
      durationMinutes: 15,
      activityTitle: 'Desmos "Input Delay" Slider Demonstration',
      strategy: 'Have students track the vertex (0,0) of y = x^2 and evaluate what x makes the bracket equal zero: (x - 3) = 0 => x = +3.',
      recommendedVisual: 'Side-by-side parabola slider with dynamic coordinate tables.',
    },
    impactedStudents: ['Lingjensthaibi', 'Alex Chen', 'Mia Torres', 'Liam Baker', 'Devon Vance', 'Sophia Patel', 'Marcus Zhang', 'Emma Watson'],
  },
  {
    id: 'insight-functions',
    topic: 'Functions & Domain Restrictions',
    severity: 'red',
    classScore: 42,
    headline: 'Critical Gap: Zero Denominator & Radical Domain Boundary Collision',
    rootCause: '64% of students evaluated radical domains sqrt(x - 3) correctly but failed to exclude denominator roots (x - 7 = 0).',
    misconceptionDetails: 'Students treat domain checks as single-variable step equations rather than compound intersection of restrictions [3, inf) \\ {7}.',
    actionableReteachPlan: {
      durationMinutes: 12,
      activityTitle: 'Two-Filter Domain Number-Line Sieve',
      strategy: 'Draw two separate number lines: Line 1 for Radical (green shading), Line 2 for Denominator (open red circle). The final answer is the overlap.',
      recommendedVisual: 'Overlapping transparency film / layered number line.',
    },
    impactedStudents: ['Lingjensthaibi', 'Alex Chen', 'Jordan Bell', 'Devon Vance', 'Noah Ramirez', 'Chloe Bennett', 'Liam Baker'],
  },
  {
    id: 'insight-quadratics',
    topic: 'Quadratic Equations',
    severity: 'yellow',
    classScore: 64,
    headline: 'Moderate Issue: Negative Signs Lost in Discriminant (-b) Evaluation',
    rootCause: 'When b is negative (e.g., b = -4), 36% of students write -b as -4 instead of -(-4) = +4.',
    misconceptionDetails: 'A mechanical notation blind spot under timed pressure rather than conceptual breakdown of quadratic behavior.',
    actionableReteachPlan: {
      durationMinutes: 8,
      activityTitle: 'The "Empty Parentheses" Substitution Drill',
      strategy: 'Mandate writing -() +- sqrt(()^2 - 4()()) before inserting numerical values into parentheses.',
      recommendedVisual: 'Color-coded algebraic formula stencil card.',
    },
    impactedStudents: ['Lingjensthaibi', 'Alex Chen', 'Zoe Martinez', 'Lucas Gray', 'Mia Torres'],
  },
];

// 3. STUDENT ROSTER FOR SECTION A
export const sectionAStudents: StudentRosterMember[] = [
  { id: 'st-00', name: 'Lingjensthaibi', rawScore: 67, overallUnderstanding: 67, algebra: 95, quadratics: 72, functions: 60, graphs: 36, primaryInterventionNeeded: 'Chain Rule & Point-Slope Coordinates', status: 'critical' },
  { id: 'st-01', name: 'Alex Chen', rawScore: 72, overallUnderstanding: 59, algebra: 95, quadratics: 64, functions: 42, graphs: 35, primaryInterventionNeeded: 'Horizontal Shift & Domain Restriction', status: 'critical' },
  { id: 'st-02', name: 'Sophia Patel', rawScore: 89, overallUnderstanding: 86, algebra: 96, quadratics: 88, functions: 82, graphs: 76, primaryInterventionNeeded: 'Complex Graphs', status: 'strong' },
  { id: 'st-03', name: 'Devon Vance', rawScore: 54, overallUnderstanding: 48, algebra: 78, quadratics: 52, functions: 36, graphs: 28, primaryInterventionNeeded: 'Functions & Coordinate Translations', status: 'critical' },
  { id: 'st-04', name: 'Mia Torres', rawScore: 68, overallUnderstanding: 62, algebra: 90, quadratics: 58, functions: 54, graphs: 44, primaryInterventionNeeded: 'Discriminant Signs & Vertex Form', status: 'attention' },
  { id: 'st-05', name: 'Liam Baker', rawScore: 61, overallUnderstanding: 53, algebra: 85, quadratics: 60, functions: 38, graphs: 30, primaryInterventionNeeded: 'Graph Inversion & Function Domain', status: 'critical' },
  { id: 'st-06', name: 'Emma Watson', rawScore: 94, overallUnderstanding: 93, algebra: 98, quadratics: 95, functions: 92, graphs: 88, primaryInterventionNeeded: 'None (Extension Challenges)', status: 'strong' },
  { id: 'st-07', name: 'Lucas Gray', rawScore: 76, overallUnderstanding: 71, algebra: 91, quadratics: 66, functions: 68, graphs: 58, primaryInterventionNeeded: 'Quadratic Sign Drilling', status: 'attention' },
  { id: 'st-08', name: 'Chloe Bennett', rawScore: 65, overallUnderstanding: 57, algebra: 84, quadratics: 62, functions: 45, graphs: 38, primaryInterventionNeeded: 'Domain Restrictions & Curve Shifts', status: 'critical' },
];
