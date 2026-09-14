import fs from 'fs';
import path from 'path';
import { 
  AppUser, 
  StudentUser, 
  FacultyUser, 
  SubjectModel, 
  AnswerSheetModel, 
  DiagnosticReportModel 
} from './schema';
import { userDb } from '../userDb';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// ==========================================
// 1. Subjects Repository
// ==========================================
const DEFAULT_SUBJECTS: SubjectModel[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    code: 'MATH-102',
    category: 'STEM',
    instructor: 'Dr. Sarah Jenkins',
    description: 'Linear & Quadratic Equations, Polynomials, and Calculus Analysis',
    color: 'indigo',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'subj-phys',
    name: 'Physics',
    code: 'PHYS-101',
    category: 'STEM',
    instructor: 'Prof. Raymond Hayes',
    description: 'Kinematics, Newton Laws, Vector Mechanics, and Energy Conservations',
    color: 'cyan',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'subj-chem',
    name: 'Chemistry',
    code: 'CHEM-101',
    category: 'STEM',
    instructor: 'Dr. Anita Verma',
    description: 'Atomic Structure, Chemical Bonding, Stoichiometry, and Periodic Trends',
    color: 'emerald',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    code: 'CS-104',
    category: 'STEM',
    instructor: 'Mr. David Lin',
    description: 'Algorithms, Data Structures, Computational Problem Solving',
    color: 'purple',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'subj-bio',
    name: 'Biology',
    code: 'BIO-101',
    category: 'Core',
    instructor: 'Dr. Elena Rossi',
    description: 'Cellular Biology, Molecular Genetics, and Ecology',
    color: 'rose',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const subjectRepo = {
  getAll(): SubjectModel[] {
    const list = readJsonFile<SubjectModel[]>('subjects.json', []);
    if (list.length === 0) {
      writeJsonFile('subjects.json', DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    return list;
  },

  getById(id: string): SubjectModel | null {
    const all = this.getAll();
    return all.find((s) => s.id === id) || null;
  },

  getByName(name: string): SubjectModel | null {
    const all = this.getAll();
    const clean = name.trim().toLowerCase();
    return all.find((s) => s.name.toLowerCase() === clean) || null;
  },

  create(data: Omit<SubjectModel, 'id' | 'createdAt'>): SubjectModel {
    const all = this.getAll();
    const id = `subj-${Date.now()}`;
    const newSubject: SubjectModel = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    all.push(newSubject);
    writeJsonFile('subjects.json', all);
    return newSubject;
  },
};

// ==========================================
// 2. Answer Sheets Repository (Uploaded Papers)
// ==========================================
export const answerSheetRepo = {
  getAll(): AnswerSheetModel[] {
    return readJsonFile<AnswerSheetModel[]>('answer_sheets.json', []);
  },

  getById(id: string): AnswerSheetModel | null {
    const all = this.getAll();
    return all.find((s) => s.id === id) || null;
  },

  getByStudent(studentIdentifier: string): AnswerSheetModel[] {
    const all = this.getAll();
    const clean = studentIdentifier.trim().toLowerCase();
    return all.filter(
      (s) =>
        s.studentId.toLowerCase() === clean ||
        s.studentName.toLowerCase() === clean ||
        s.studentName.toLowerCase().replace(/\s+/g, '_') === clean
    );
  },

  create(data: Omit<AnswerSheetModel, 'id' | 'uploadedAt'>): AnswerSheetModel {
    const all = this.getAll();
    const id = `sheet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSheet: AnswerSheetModel = {
      ...data,
      id,
      uploadedAt: new Date().toISOString(),
    };
    all.unshift(newSheet);
    writeJsonFile('answer_sheets.json', all);
    return newSheet;
  },
};

// ==========================================
// 3. Diagnostic Reports Repository
// ==========================================
export const diagnosticReportRepo = {
  getAll(): DiagnosticReportModel[] {
    const reports = readJsonFile<DiagnosticReportModel[]>('diagnostic_reports.json', []);
    return reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): DiagnosticReportModel | null {
    const all = this.getAll();
    return all.find((r) => r.id === id) || null;
  },

  getLatestForStudent(studentIdentifier: string): DiagnosticReportModel | null {
    if (!studentIdentifier) return null;
    const clean = studentIdentifier.trim().toLowerCase();
    const cleanStripped = clean.replace(/[\s\-_.]/g, '');
    const all = this.getAll();

    for (const report of all) {
      const repName = report.studentName.trim().toLowerCase();
      const repStripped = repName.replace(/[\s\-_.]/g, '');
      const repRoll = (report.studentRollNo || '').trim().toLowerCase();
      const repId = report.studentId.trim().toLowerCase();

      if (
        repName === clean ||
        repStripped === cleanStripped ||
        repId === clean ||
        (clean.length >= 3 && repStripped.includes(cleanStripped)) ||
        (repRoll && repRoll.includes(clean))
      ) {
        return report;
      }
    }
    return null;
  },

  getLatestForStudentAndSubject(studentIdentifier: string, subjectName?: string): DiagnosticReportModel | null {
    if (!studentIdentifier) return null;
    const clean = studentIdentifier.trim().toLowerCase();
    const cleanSubject = (subjectName || '').trim().toLowerCase();
    const all = this.getAll();

    for (const report of all) {
      const repName = report.studentName.trim().toLowerCase();
      const repSubject = report.subject.trim().toLowerCase();

      const nameMatches =
        repName === clean ||
        repName.replace(/\s+/g, '_') === clean ||
        report.studentId.toLowerCase() === clean ||
        (clean.length >= 3 && repName.includes(clean)) ||
        (repName.length >= 3 && clean.includes(repName));

      if (nameMatches) {
        if (!cleanSubject || repSubject.includes(cleanSubject) || cleanSubject.includes(repSubject)) {
          return report;
        }
      }
    }

    // If cleanSubject was explicitly specified but no match found, do NOT cross-contaminate with other subjects
    if (cleanSubject) {
      return null;
    }

    // If no subject filter was specified, return latest for this student
    return this.getLatestForStudent(studentIdentifier);
  },

  getAllForStudent(studentIdentifier: string): DiagnosticReportModel[] {
    if (!studentIdentifier) return [];
    const clean = studentIdentifier.trim().toLowerCase();
    const all = this.getAll();

    return all.filter((r) => {
      const repName = r.studentName.trim().toLowerCase();
      return (
        repName === clean ||
        repName.replace(/\s+/g, '_') === clean ||
        r.studentId.toLowerCase() === clean
      );
    });
  },

  create(data: Omit<DiagnosticReportModel, 'id' | 'createdAt'>): DiagnosticReportModel {
    const all = this.getAll();
    const id = `diag_rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReport: DiagnosticReportModel = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    all.unshift(newReport);
    writeJsonFile('diagnostic_reports.json', all);

    // Synchronize student profile in userDb
    try {
      const cleanName = newReport.studentName.trim();
      const existingUser = userDb.findUserByIdentifier(cleanName, 'student');
      const cleanUsername = cleanName.toLowerCase().replace(/\s+/g, '_');

      if (!existingUser) {
        userDb.createUser({
          role: 'student',
          name: cleanName,
          username: cleanUsername,
          studentId: newReport.studentRollNo || `ST-${Date.now().toString().slice(-6)}`,
          grade: newReport.studentClass || '10th Grade',
          section: 'Section A',
          school: 'Lincoln High School',
          learningGoals: newReport.whatToLearnNext[0] || `${newReport.subject} Mastery`,
        });
      }
    } catch (err) {
      console.error('Error synchronizing user on diagnostic creation:', err);
    }

    return newReport;
  },
};
