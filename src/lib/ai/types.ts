/**
 * LearnGraph AI Pipeline Domain Types
 * Production-grade, strongly-typed domain model for answer-sheet analysis,
 * question-level evaluation, misconception taxonomy, and evidence-grounded mastery tracking.
 */

export type EvaluationStatus = 
  | 'correct'
  | 'partially_correct'
  | 'incorrect'
  | 'unanswered'
  | 'insufficient_evidence';

export type ErrorType =
  | 'conceptual_misconception'
  | 'calculation_mistake'
  | 'careless_mistake'
  | 'incomplete_answer'
  | 'misread_question'
  | 'wrong_method'
  | 'missing_concept'
  | 'none'
  | 'insufficient_evidence';

export type MasteryStatus = 'Green' | 'Yellow' | 'Red';

export interface QuestionEvaluation {
  question_id: string;
  question_number: string | number;
  question_text: string;
  student_answer: string;
  correct_solution: string;
  page_numbers: number[];
  topic: string;
  subtopics: string[];
  marks_possible: number;
  marks_awarded: number;
  understanding_percentage: number;
  evaluation_status: EvaluationStatus;
  error_type: ErrorType;
  evaluation_reason: string;
  concepts_tested: string[];
  mistakes: string[];
  mistake_detected: string;
  misconception: string;
  rule_to_remember: string;
  status: MasteryStatus;
  confidence: number; // 0.0 - 1.0
  extraction_confidence: number; // 0.0 - 1.0
}

export interface TopicPerformance {
  topic: string;
  subtopics: string[];
  subject: string;
  marks_possible: number;
  marks_awarded: number;
  accuracy_percentage: number;
  mastery_status: MasteryStatus;
  understanding_percentage: number;
  confidence: number; // 0.0 - 1.0
  question_count: number;
  supporting_question_numbers: (string | number)[];
  detected_misconceptions: string[];
  recommended_action: string;
  evidence: string;
}

export interface DetectedMisconceptionItem {
  misconception: string;
  error_type: ErrorType;
  topic: string;
  supporting_questions: (string | number)[];
  frequency: number;
  explanation: string;
  rule_to_remember: string;
}

export interface RecommendationItem {
  topic: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  action: string;
  practice_drills: string[];
}

export interface AnalysisResult {
  analysis_id: string;
  analysis_version: string;
  timestamp: string;
  student_name: string;
  student_class: string;
  student_roll_no: string;
  subject: string;
  exam_title: string;
  overall_score_percentage: number;
  overall_mastery_percentage: number;
  overall_confidence: number; // 0.0 - 1.0
  total_marks_possible: number;
  total_marks_awarded: number;
  total_questions: number;
  questions: QuestionEvaluation[];
  topic_breakdown: {
    topic_name: string;
    understanding_percentage: number;
    status: MasteryStatus;
  }[];
  topic_performances: TopicPerformance[];
  weak_topics: TopicPerformance[];
  strong_topics: TopicPerformance[];
  common_misconceptions: string[];
  structured_misconceptions: DetectedMisconceptionItem[];
  what_to_learn_next: string[];
  recommendations: RecommendationItem[];
  is_live_gemini: boolean;
  model_used: string;
  notices: string[];
  validation_warnings: string[];
}
