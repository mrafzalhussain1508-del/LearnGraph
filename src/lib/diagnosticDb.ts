import fs from 'fs';
import path from 'path';
import { userDb } from './userDb';

export interface StoredQuestionItem {
  question_number: number;
  topic_name: string;
  question_text: string;
  student_working: string;
  correct_solution?: string;
  max_marks: number;
  awarded_marks: number;
  understanding_percentage: number;
  status: 'Green' | 'Yellow' | 'Red';
  mistake_detected: string;
  misconception: string;
  rule_to_remember: string;
}

export interface StoredTopicBreakdownItem {
  topic_name: string;
  understanding_percentage: number;
  status: 'Green' | 'Yellow' | 'Red';
}

export interface StoredDiagnostic {
  id: string;
  student_name: string;
  student_class?: string;
  student_roll_no?: string;
  subject?: string;
  exam_title?: string;
  overall_score_percentage: number;
  topic_breakdown: StoredTopicBreakdownItem[];
  questions?: StoredQuestionItem[];
  common_misconceptions: string[];
  what_to_learn_next: string[];
  is_live_gemini?: boolean;
  model_used?: string;
  notice?: string;
  createdAt: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'sheet_diagnostics.json');

declare global {
  // eslint-disable-next-line no-var
  var __learngraph_diagnostic_db: StoredDiagnostic[] | undefined;
}

function loadPersistedDiagnostics(): StoredDiagnostic[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading sheet diagnostics from disk:', err);
  }
  return [];
}

function persistDiagnostics(diagnostics: StoredDiagnostic[]): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(diagnostics, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sheet diagnostics to disk:', err);
  }
}

// Global cached store
let diagnosticsList: StoredDiagnostic[] =
  globalThis.__learngraph_diagnostic_db ?? loadPersistedDiagnostics();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__learngraph_diagnostic_db = diagnosticsList;
}

function syncFromDisk(): void {
  try {
    const persisted = loadPersistedDiagnostics();
    diagnosticsList = persisted;
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__learngraph_diagnostic_db = diagnosticsList;
    }
  } catch (err) {
    console.error('Failed to sync diagnostics from disk:', err);
  }
}

export const diagnosticDb = {
  getAll(): StoredDiagnostic[] {
    syncFromDisk();
    return [...diagnosticsList]
      .filter((d) => Boolean(d && (d.student_name || (d as any).studentName)))
      .map((d) => ({
        ...d,
        student_name: (d.student_name || (d as any).studentName || 'Student').trim(),
        student_class: d.student_class || (d as any).studentClass,
        student_roll_no: d.student_roll_no || (d as any).studentRollNo,
        subject: d.subject || (d as any).subject,
        exam_title: d.exam_title || (d as any).examTitle,
        overall_score_percentage: d.overall_score_percentage ?? (d as any).overallScorePercentage ?? 70,
        topic_breakdown: d.topic_breakdown || (d as any).topicBreakdown || [],
        questions: d.questions || (d as any).questions || [],
        common_misconceptions: d.common_misconceptions || (d as any).commonMisconceptions || [],
        what_to_learn_next: d.what_to_learn_next || (d as any).whatToLearnNext || [],
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getLatest(): StoredDiagnostic | null {
    const all = this.getAll();
    return all.length > 0 ? all[0] : null;
  },

  getLatestForStudent(identifier: string): StoredDiagnostic | null {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanStripped = cleanId.replace(/[\s\-_.]/g, '');
    const all = this.getAll();

    for (const diag of all) {
      const rawName = diag.student_name || (diag as any).studentName || '';
      const diagName = rawName.trim().toLowerCase();
      const diagStripped = diagName.replace(/[\s\-_.]/g, '');
      const diagRoll = (diag.student_roll_no || (diag as any).studentRollNo || '').trim().toLowerCase();

      if (
        diagName === cleanId ||
        diagStripped === cleanStripped ||
        (cleanId.length >= 3 && diagStripped.includes(cleanStripped)) ||
        (diagRoll && diagRoll.includes(cleanId))
      ) {
        return diag;
      }
    }
    return null;
  },

  getLatestForStudentAndSubject(identifier: string, subjectName: string): StoredDiagnostic | null {
    if (!identifier || !subjectName) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanStripped = cleanId.replace(/[\s\-_.]/g, '');
    const cleanSubj = subjectName.trim().toLowerCase();
    const all = this.getAll();

    for (const diag of all) {
      const rawName = diag.student_name || (diag as any).studentName || '';
      const diagName = rawName.trim().toLowerCase();
      const diagStripped = diagName.replace(/[\s\-_.]/g, '');
      const diagRoll = (diag.student_roll_no || (diag as any).studentRollNo || '').trim().toLowerCase();
      const diagSubject = (diag.subject || (diag as any).subject || '').trim().toLowerCase();

      const nameMatches =
        diagName === cleanId ||
        diagStripped === cleanStripped ||
        (cleanId.length >= 3 && diagStripped.includes(cleanStripped)) ||
        (diagRoll && diagRoll.includes(cleanId));

      if (nameMatches) {
        if (diagSubject.includes(cleanSubj) || cleanSubj.includes(diagSubject)) {
          return diag;
        }
      }
    }
    return null;
  },

  saveDiagnostic(
    data: Omit<StoredDiagnostic, 'id' | 'createdAt'> & { createdAt?: string }
  ): StoredDiagnostic {
    syncFromDisk();

    const cleanName = (data.student_name || 'Student').trim();
    const id = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: StoredDiagnostic = {
      ...data,
      id,
      student_name: cleanName,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    // Prepend latest diagnostic
    diagnosticsList.unshift(newRecord);
    persistDiagnostics(diagnosticsList);

    // Synchronize or create student profile in userDb for seamless Teacher Dashboard display
    try {
      const existingUser = userDb.findUserByIdentifier(cleanName, 'student');
      const cleanUsername = cleanName.toLowerCase().replace(/\s+/g, '_');
      const targetRollNo = data.student_roll_no || (existingUser?.studentId) || `ST-${Date.now().toString().slice(-6)}`;
      const targetGrade = data.student_class || existingUser?.grade || '10th Grade';
      const targetGoals = data.what_to_learn_next?.[0] || 'Algebra & Problem Solving';

      if (!existingUser) {
        userDb.createUser({
          role: 'student',
          name: cleanName,
          username: cleanUsername,
          studentId: targetRollNo,
          grade: targetGrade,
          section: 'Section A',
          school: 'Lincoln High School',
          learningGoals: targetGoals,
        });
      }
    } catch (userErr) {
      console.error('Failed to sync student to userDb on diagnostic save:', userErr);
    }

    return newRecord;
  },
};
