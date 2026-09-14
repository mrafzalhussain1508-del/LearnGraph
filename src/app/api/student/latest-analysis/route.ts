import { NextRequest, NextResponse } from 'next/server';
import { diagnosticReportRepo } from '@/lib/db/database';
import { diagnosticDb } from '@/lib/diagnosticDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentQuery = searchParams.get('student') || searchParams.get('id');
    const subjectQuery = searchParams.get('subject');

    let diagnostic = null;

    if (studentQuery) {
      if (subjectQuery) {
        diagnostic = diagnosticReportRepo.getLatestForStudentAndSubject(studentQuery, subjectQuery) ||
                     diagnosticDb.getLatestForStudentAndSubject(studentQuery, subjectQuery);
      } else {
        diagnostic = diagnosticReportRepo.getLatestForStudent(studentQuery) ||
                     diagnosticDb.getLatestForStudent(studentQuery);
      }
    }
    
    // If still not found by student query
    if (!diagnostic) {
      if (subjectQuery) {
        // Look for any report for this subject without leaking unrelated subjects
        const allReports = diagnosticReportRepo.getAll();
        diagnostic = allReports.find((r) => r.subject.toLowerCase().includes(subjectQuery.toLowerCase())) ||
                     diagnosticDb.getAll().find((d) => d.subject?.toLowerCase().includes(subjectQuery.toLowerCase())) || null;
      } else {
        const allReports = diagnosticReportRepo.getAll();
        diagnostic = allReports[0] || diagnosticDb.getLatest();
      }
    }

    if (!diagnostic) {
      return NextResponse.json({
        success: false,
        found: false,
        subjectMatch: false,
        subject: subjectQuery || null,
        message: subjectQuery ? `No diagnostic scan found yet for ${subjectQuery}.` : 'No diagnostic scan found yet.',
      });
    }

    // Format uniformly matching AnalyzeSheetResponse
    const responseData = {
      student_name: (diagnostic as any).studentName || (diagnostic as any).student_name,
      student_class: (diagnostic as any).studentClass || (diagnostic as any).student_class,
      student_roll_no: (diagnostic as any).studentRollNo || (diagnostic as any).student_roll_no,
      subject: (diagnostic as any).subject,
      exam_title: (diagnostic as any).examTitle || (diagnostic as any).exam_title,
      overall_score_percentage: (diagnostic as any).overallScorePercentage ?? (diagnostic as any).overall_score_percentage ?? 75,
      topic_breakdown: (diagnostic as any).topicBreakdown || (diagnostic as any).topic_breakdown || [],
      questions: ((diagnostic as any).questions || []).map((q: any) => ({
        ...q,
        correct_solution: q.correct_solution || q.correctSolution,
      })),
      common_misconceptions: (diagnostic as any).commonMisconceptions || (diagnostic as any).common_misconceptions || [],
      what_to_learn_next: (diagnostic as any).whatToLearnNext || (diagnostic as any).what_to_learn_next || [],
      is_live_gemini: Boolean((diagnostic as any).isLiveGemini ?? (diagnostic as any).is_live_gemini),
      model_used: (diagnostic as any).modelUsed || (diagnostic as any).model_used || 'Gemini 3.6 Flash',
      notice: (diagnostic as any).notice,
    };

    return NextResponse.json({
      success: true,
      found: true,
      subjectMatch: true,
      analysis: responseData,
    });
  } catch (error: any) {
    console.error('Error in student latest-analysis API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve latest analysis' },
      { status: 500 }
    );
  }
}
