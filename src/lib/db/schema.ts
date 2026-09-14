/**
 * LearnGraph Database Schema & Domain Models
 * Strongly-typed entities for Users, Subjects, AnswerSheets, and DiagnosticReports.
 */

export type UserRole = 'student' | 'teacher';
export type MasteryStatus = 'Green' | 'Yellow' | 'Red';
export type DiagnosticStatus = 'critical' | 'attention' | 'strong';

// ==========================================
// 1. User Models (Student vs Faculty)
// ==========================================
export interface BaseUser {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  school: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  studentId: string;
  grade: string;
  section: string;
  learningGoals?: string;
  enrolledSubjectIds: string[];
}

export interface FacultyUser extends BaseUser {
  role: 'teacher';
  staffId: string;
  title: string;
  department: string;
  sections: string[];
}

export type AppUser = StudentUser | FacultyUser;

// ==========================================
// 2. Subject Model
// ==========================================
export interface SubjectModel {
  id: string;
  name: string;
  code: string;
  category: 'STEM' | 'Core' | 'Elective';
  instructor: string;
  description?: string;
  color: string;
  createdAt: string;
}

// ==========================================
// 3. Answer Sheet Model (Uploaded Paper)
// ==========================================
export interface AnswerSheetModel {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  detectedMime: string;
  rawExtractedText?: string;
  uploadedAt: string;
}

// ==========================================
// 4. Diagnostic Question Item
// ==========================================
export interface DiagnosticQuestionItem {
  question_number: number;
  topic_name: string;
  question_text: string;
  student_working: string;
  correct_solution?: string;
  max_marks: number;
  awarded_marks: number;
  understanding_percentage: number;
  status: MasteryStatus;
  mistake_detected: string;
  misconception: string;
  rule_to_remember: string;
}

// ==========================================
// 5. Topic Breakdown Item
// ==========================================
export interface TopicBreakdownItem {
  topic_name: string;
  understanding_percentage: number;
  status: MasteryStatus;
  question_count?: number;
}

// ==========================================
// 6. Diagnostic Report Model
// ==========================================
export interface DiagnosticReportModel {
  id: string;
  answerSheetId?: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentRollNo: string;
  subject: string;
  examTitle: string;
  overallScorePercentage: number;
  totalQuestions: number;
  totalAwardedMarks: number;
  totalMaxMarks: number;
  topicBreakdown: TopicBreakdownItem[];
  questions: DiagnosticQuestionItem[];
  commonMisconceptions: string[];
  whatToLearnNext: string[];
  isLiveGemini: boolean;
  modelUsed: string;
  notice?: string;
  createdAt: string;
}
