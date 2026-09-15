import { NextRequest, NextResponse } from 'next/server';
import { runAnswerSheetPipeline } from '@/lib/ai/analysisPipeline';
import { diagnosticDb } from '@/lib/diagnosticDb';
import { answerSheetRepo, diagnosticReportRepo } from '@/lib/db/database';
import { QuestionEvaluation, TopicPerformance, RecommendationItem } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';

export interface AnalyzedQuestionItem {
  question_number: number | string;
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
  // Enhanced evidence properties
  error_type?: string;
  evaluation_reason?: string;
  confidence?: number;
}

export interface TopicBreakdownItem {
  topic_name: string;
  understanding_percentage: number;
  status: 'Green' | 'Yellow' | 'Red';
  question_count?: number;
}

export interface AnalyzeSheetResponse {
  analysis_id?: string;
  student_name: string;
  student_class?: string;
  student_roll_no?: string;
  subject?: string;
  exam_title?: string;
  overall_score_percentage: number;
  overall_confidence?: number;
  topic_breakdown: TopicBreakdownItem[];
  questions?: AnalyzedQuestionItem[];
  topic_performances?: TopicPerformance[];
  common_misconceptions: string[];
  what_to_learn_next: string[];
  recommendations?: RecommendationItem[];
  is_live_gemini?: boolean;
  model_used?: string;
  notice?: string;
  timestamp?: string;
  auditor_verified?: boolean;
  audit_adjustments?: string[];
  preprocessing_applied?: string[];
  tier_pipeline_status?: {
    tier1_multimodal_ocr: boolean;
    tier2_rulebooks_applied: boolean;
    tier3_granular_json: boolean;
    tier4_auditor_passed: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let fileName = 'answer_sheet.jpg';
    let fileType = '';
    let sessionStudentName: string | null = null;
    let requestedSubject: string | null = null;

    if (contentType.includes('application/json')) {
      const jsonBody = await req.json();
      sessionStudentName = jsonBody.student_name || jsonBody.studentName || jsonBody.session_student_name || null;
      requestedSubject = jsonBody.subject || jsonBody.target_subject || null;
      
      if (jsonBody.rawText || jsonBody.text || jsonBody.fileContent) {
        const textStr = jsonBody.rawText || jsonBody.text || jsonBody.fileContent;
        fileBuffer = Buffer.from(textStr, 'utf-8');
        fileName = jsonBody.fileName || `${requestedSubject || 'Exam'}_Paper.txt`;
        fileType = 'text/plain';
      } else if (jsonBody.image) {
        const imgStr: string = jsonBody.image;
        if (imgStr.startsWith('data:')) {
          const parts = imgStr.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch) fileType = mimeMatch[1];
          fileBuffer = Buffer.from(parts[1] || '', 'base64');
        } else {
          fileBuffer = Buffer.from(imgStr, 'base64');
          fileType = jsonBody.mimeType || 'image/jpeg';
        }
        fileName = jsonBody.fileName || 'uploaded_sheet.jpg';
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      sessionStudentName = (formData.get('student_name') as string | null) || (formData.get('session_student_name') as string | null);
      requestedSubject = (formData.get('subject') as string | null) || (formData.get('target_subject') as string | null);
      
      if (file) {
        const bytes = await file.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
        fileName = file.name;
        fileType = file.type || '';
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: 'No test sheet file provided. Please upload an image, PDF, or text paper.' },
        { status: 400 }
      );
    }

    // Execute the Grounded Multimodal Pipeline
    const pipelineResult = await runAnswerSheetPipeline({
      buffer: fileBuffer,
      fileName,
      declaredMimeType: fileType,
      sessionStudentName,
      targetSubject: requestedSubject,
    });

    // Map into AnalyzedQuestionItem format for backward compatibility
    const mappedQuestions: AnalyzedQuestionItem[] = pipelineResult.questions.map((q: QuestionEvaluation) => ({
      question_number: q.question_number,
      topic_name: q.topic,
      question_text: q.question_text,
      student_working: q.student_answer,
      correct_solution: q.correct_solution,
      max_marks: q.marks_possible,
      awarded_marks: q.marks_awarded,
      understanding_percentage: q.understanding_percentage,
      status: q.status,
      mistake_detected: q.mistake_detected,
      misconception: q.misconception,
      rule_to_remember: q.rule_to_remember,
      error_type: q.error_type,
      evaluation_reason: q.evaluation_reason,
      confidence: q.confidence,
    }));

    const responsePayload: AnalyzeSheetResponse = {
      analysis_id: pipelineResult.analysis_id,
      student_name: pipelineResult.student_name,
      student_class: pipelineResult.student_class,
      student_roll_no: pipelineResult.student_roll_no,
      subject: pipelineResult.subject,
      exam_title: pipelineResult.exam_title,
      overall_score_percentage: pipelineResult.overall_score_percentage,
      overall_confidence: pipelineResult.overall_confidence,
      topic_breakdown: pipelineResult.topic_breakdown,
      questions: mappedQuestions,
      topic_performances: pipelineResult.topic_performances,
      common_misconceptions: pipelineResult.common_misconceptions,
      what_to_learn_next: pipelineResult.what_to_learn_next,
      recommendations: pipelineResult.recommendations,
      is_live_gemini: pipelineResult.is_live_gemini,
      model_used: pipelineResult.model_used,
      notice: pipelineResult.notices.join(' | '),
      timestamp: pipelineResult.timestamp,
      auditor_verified: pipelineResult.auditor_verified,
      audit_adjustments: pipelineResult.audit_adjustments,
      preprocessing_applied: pipelineResult.preprocessing_applied,
      tier_pipeline_status: pipelineResult.tier_pipeline_status,
    };

    // Persist to relational and JSON databases
    try {
      const studentId = responsePayload.student_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const sheetRecord = answerSheetRepo.create({
        studentId,
        studentName: responsePayload.student_name,
        subject: responsePayload.subject || 'General Studies',
        fileName,
        fileSize: fileBuffer.length,
        mimeType: fileType || 'image/jpeg',
        detectedMime: fileType || 'image/jpeg',
      });

      diagnosticReportRepo.create({
        answerSheetId: sheetRecord.id,
        studentId,
        studentName: responsePayload.student_name,
        studentClass: responsePayload.student_class || 'Class 10 • Section A',
        studentRollNo: responsePayload.student_roll_no || 'Roll No: 24',
        subject: responsePayload.subject || 'General Studies',
        examTitle: responsePayload.exam_title || `${responsePayload.subject} Assessment`,
        overallScorePercentage: responsePayload.overall_score_percentage,
        totalQuestions: mappedQuestions.length,
        totalAwardedMarks: pipelineResult.total_marks_awarded,
        totalMaxMarks: pipelineResult.total_marks_possible,
        topicBreakdown: responsePayload.topic_breakdown,
        questions: mappedQuestions as any,
        commonMisconceptions: responsePayload.common_misconceptions,
        whatToLearnNext: responsePayload.what_to_learn_next,
        isLiveGemini: true,
        modelUsed: responsePayload.model_used || 'Gemini Multimodal Engine',
        notice: responsePayload.notice,
      });

      diagnosticDb.saveDiagnostic({
        student_name: responsePayload.student_name,
        student_class: responsePayload.student_class,
        student_roll_no: responsePayload.student_roll_no,
        subject: responsePayload.subject,
        exam_title: responsePayload.exam_title,
        overall_score_percentage: responsePayload.overall_score_percentage,
        topic_breakdown: responsePayload.topic_breakdown,
        questions: mappedQuestions as any,
        common_misconceptions: responsePayload.common_misconceptions,
        what_to_learn_next: responsePayload.what_to_learn_next,
        is_live_gemini: true,
        model_used: responsePayload.model_used,
        notice: responsePayload.notice,
      });
    } catch (dbErr) {
      console.error('Database persistence notice (non-fatal):', dbErr);
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('API Error in /api/analyze-sheet:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze answer sheet.' },
      { status: 500 }
    );
  }
}
