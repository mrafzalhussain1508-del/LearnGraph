/**
 * LearnGraph B.Tech Curriculum & Syllabus Mapping Engine
 * Resolves B.Tech syllabus courses, matches question prompts to modules,
 * and formats academic derivation benchmarks for prompt injection.
 */

import fs from 'fs';
import path from 'path';

export interface BTechModule {
  module_number: number;
  module_title: string;
  standard_topics: string[];
  key_formulas: string[];
  canonical_problem_types: string[];
  expected_derivation_steps: string[];
  common_misconceptions: string[];
}

export interface BTechCourse {
  course_code: string;
  course_name: string;
  semester: number;
  credits: number;
  modules: BTechModule[];
}

export interface BTechDepartment {
  department_id: string;
  department_name: string;
  courses: BTechCourse[];
}

export interface BTechSyllabusDatabase {
  version: string;
  institution_standard: string;
  departments: BTechDepartment[];
}

let cachedSyllabusDb: BTechSyllabusDatabase | null = null;

export function getBTechSyllabusDatabase(): BTechSyllabusDatabase {
  if (cachedSyllabusDb) return cachedSyllabusDb;

  try {
    const filePath = path.join(process.cwd(), 'data', 'btech_syllabus.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      cachedSyllabusDb = JSON.parse(raw);
      return cachedSyllabusDb!;
    }
  } catch (err) {
    console.warn('Failed to load btech_syllabus.json from disk, using embedded fallback:', err);
  }

  // Fallback minimal structure if disk read fails
  return {
    version: '1.0-embedded',
    institution_standard: 'Model B.Tech Engineering Curriculum',
    departments: [],
  };
}

/**
 * Intelligently matches a subject or test title to the corresponding B.Tech course
 */
export function lookupBTechCourse(
  subjectName?: string | null,
  contentHint?: string | null
): BTechCourse | null {
  const db = getBTechSyllabusDatabase();
  const searchString = `${subjectName || ''} ${contentHint || ''}`.toLowerCase();

  // 1. Direct Course Code match
  for (const dept of db.departments) {
    for (const course of dept.courses) {
      if (searchString.includes(course.course_code.toLowerCase())) {
        return course;
      }
    }
  }

  // 2. Keyword matching across courses
  if (searchString.includes('math') || searchString.includes('algebra') || searchString.includes('calculus') || searchString.includes('eigen') || searchString.includes('matrix')) {
    return findCourseByCode(db, 'BT-MATH-101');
  }

  if (searchString.includes('phys') || searchString.includes('optics') || searchString.includes('laser') || searchString.includes('schrodinger') || searchString.includes('quantum')) {
    return findCourseByCode(db, 'BT-PHYS-101');
  }

  if (searchString.includes('chem') || searchString.includes('nernst') || searchString.includes('edta') || searchString.includes('corrosion') || searchString.includes('periodic')) {
    return findCourseByCode(db, 'BT-CHEM-101');
  }

  if (searchString.includes('data structure') || searchString.includes('algorithm') || searchString.includes('tree') || searchString.includes('stack') || searchString.includes('knapsack')) {
    return findCourseByCode(db, 'BT-CSE-201');
  }

  if (searchString.includes('programming') || searchString.includes('c prog') || searchString.includes('pointer') || searchString.includes('recursion')) {
    return findCourseByCode(db, 'BT-CSE-101');
  }

  if (searchString.includes('operating system') || searchString.includes('deadlock') || searchString.includes('scheduling') || searchString.includes('banker')) {
    return findCourseByCode(db, 'BT-CSE-301');
  }

  if (searchString.includes('thermodynamics') || searchString.includes('carnot') || searchString.includes('rankine') || searchString.includes('entropy')) {
    return findCourseByCode(db, 'BT-ME-201');
  }

  if (searchString.includes('signal') || searchString.includes('fourier') || searchString.includes('z-transform') || searchString.includes('lti')) {
    return findCourseByCode(db, 'BT-ECE-201');
  }

  if (searchString.includes('circuit') || searchString.includes('thevenin') || searchString.includes('kcl') || searchString.includes('kvl')) {
    return findCourseByCode(db, 'BT-EE-101');
  }

  if (searchString.includes('control system') || searchString.includes('bode') || searchString.includes('routh') || searchString.includes('transfer function')) {
    return findCourseByCode(db, 'BT-EE-301');
  }

  // Default fallback to First Year Mathematics if general STEM
  return findCourseByCode(db, 'BT-MATH-101');
}

function findCourseByCode(db: BTechSyllabusDatabase, code: string): BTechCourse | null {
  for (const dept of db.departments) {
    for (const course of dept.courses) {
      if (course.course_code === code) return course;
    }
  }
  return null;
}

/**
 * Matches a specific question prompt & topic to the most relevant B.Tech syllabus module
 */
export function matchQuestionToBTechModule(
  course: BTechCourse | null,
  questionText: string,
  topicText?: string
): {
  module_number: number;
  module_title: string;
  syllabus_code: string;
  benchmark_formula: string;
  expected_derivation_steps: string[];
} {
  if (!course || !course.modules || course.modules.length === 0) {
    return {
      module_number: 1,
      module_title: 'Core Curriculum Module',
      syllabus_code: 'BT-CORE-100',
      benchmark_formula: 'Standard academic derivation invariant.',
      expected_derivation_steps: ['Step 1: State primary definition', 'Step 2: Solve with canonical precision'],
    };
  }

  const query = `${questionText} ${topicText || ''}`.toLowerCase();

  let bestModule = course.modules[0];
  let maxScore = -1;

  for (const mod of course.modules) {
    let score = 0;
    const titleMatch = mod.module_title.toLowerCase().split(/\s+/);
    for (const word of titleMatch) {
      if (word.length > 3 && query.includes(word)) score += 3;
    }

    for (const topic of mod.standard_topics) {
      const tWords = topic.toLowerCase().split(/\s+/);
      for (const w of tWords) {
        if (w.length > 3 && query.includes(w)) score += 2;
      }
    }

    for (const pType of mod.canonical_problem_types) {
      const pWords = pType.toLowerCase().split(/\s+/);
      for (const w of pWords) {
        if (w.length > 3 && query.includes(w)) score += 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestModule = mod;
    }
  }

  const formula = bestModule.key_formulas?.[0] || 'State foundational theorem.';
  const steps = bestModule.expected_derivation_steps?.length > 0
    ? bestModule.expected_derivation_steps
    : ['Step 1: State canonical formula', 'Step 2: Calculate with dimensional units'];

  return {
    module_number: bestModule.module_number,
    module_title: `Module ${bestModule.module_number}: ${bestModule.module_title}`,
    syllabus_code: course.course_code,
    benchmark_formula: formula,
    expected_derivation_steps: steps,
  };
}

/**
 * Formats B.Tech syllabus course standards for Gemini prompt injection
 */
export function formatBTechSyllabusForPrompt(course: BTechCourse | null): string {
  if (!course) return '';

  const lines: string[] = [];
  lines.push(`=== B.TECH ACADEMIC SYLLABUS BENCHMARK: ${course.course_code} - ${course.course_name} (Sem ${course.semester}) ===`);
  lines.push('Mandatory Requirement: Map EVERY evaluated question to one of the following official B.Tech modules:');

  for (const mod of course.modules) {
    lines.push(`\n[MODULE ${mod.module_number}: ${mod.module_title.toUpperCase()}]`);
    lines.push(`  Standard Topics: ${mod.standard_topics.join(', ')}`);
    lines.push(`  Key Benchmark Formulas: ${mod.key_formulas.join(' | ')}`);
    lines.push(`  Canonical Derivation Milestones:`);
    mod.expected_derivation_steps.forEach((step) => lines.push(`    - ${step}`));
    lines.push(`  Known Student Traps: ${mod.common_misconceptions.join(' | ')}`);
  }

  lines.push('\nEVALUATION DIRECTIVE:');
  lines.push('For each question, return "syllabus_module" (e.g. "Module 1: Matrices & Linear Algebra") and "syllabus_code" (e.g. "' + course.course_code + '").');
  lines.push('Deduct marks if a student skipped mandatory derivation milestones or violated any key benchmark formula.');
  lines.push('=== END B.TECH SYLLABUS BENCHMARK ===');

  return lines.join('\n');
}
