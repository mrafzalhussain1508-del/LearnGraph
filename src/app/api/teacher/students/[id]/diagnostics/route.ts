import { NextRequest, NextResponse } from 'next/server';
import { diagnosticDb, StoredDiagnostic, StoredTopicBreakdownItem } from '@/lib/diagnosticDb';

export const dynamic = 'force-dynamic';

export interface TopicTrendPoint {
  date: string;
  score: number;
  subject: string;
}

export interface TopicTrendSeries {
  topic: string;
  subject: string;
  history: TopicTrendPoint[];
  latestScore: number;
  trend: 'up' | 'down' | 'stable' | 'new';
}

export interface StudentDiagnosticsResponse {
  success: boolean;
  studentName: string;
  totalSubmissions: number;
  latestReport: StoredDiagnostic | null;
  allReports: StoredDiagnostic[];
  topicTrends: TopicTrendSeries[];
  subjectHistory: { subject: string; date: string; score: number }[];
  overallTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  error?: string;
}

function resolveStudentReports(id: string): StoredDiagnostic[] {
  if (!id) return [];
  const cleanId = decodeURIComponent(id).trim().toLowerCase();
  const cleanStripped = cleanId.replace(/[\s\-_.]/g, '');

  const all = diagnosticDb.getAll();

  return all.filter((diag) => {
    const rawName = diag.student_name || '';
    const diagName = rawName.trim().toLowerCase();
    const diagStripped = diagName.replace(/[\s\-_.]/g, '');
    const diagRoll = (diag.student_roll_no || '').trim().toLowerCase();

    return (
      diagName === cleanId ||
      diagStripped === cleanStripped ||
      (cleanId.length >= 3 && diagStripped.includes(cleanStripped)) ||
      (diagRoll && diagRoll.includes(cleanId))
    );
  });
}

function computeTopicTrends(reports: StoredDiagnostic[]): TopicTrendSeries[] {
  // Group topics across all reports, build time-series per topic
  const topicMap = new Map<string, TopicTrendPoint[]>();

  // Sort oldest-first for trend computation
  const sorted = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const report of sorted) {
    const subject = report.subject || 'General';
    for (const tb of report.topic_breakdown || []) {
      const key = `${tb.topic_name}__${subject}`;
      if (!topicMap.has(key)) {
        topicMap.set(key, []);
      }
      topicMap.get(key)!.push({
        date: report.createdAt,
        score: tb.understanding_percentage,
        subject,
      });
    }
  }

  const trends: TopicTrendSeries[] = [];

  Array.from(topicMap.entries()).forEach(([key, history]) => {
    const [topicName, subject] = key.split('__');
    const latestScore = history[history.length - 1].score;

    let trend: TopicTrendSeries['trend'] = 'new';
    if (history.length >= 2) {
      const diff = latestScore - history[history.length - 2].score;
      if (diff > 5) trend = 'up';
      else if (diff < -5) trend = 'down';
      else trend = 'stable';
    }

    trends.push({
      topic: topicName,
      subject,
      history,
      latestScore,
      trend,
    });
  });

  // Sort by latest score ascending (worst topics first) for teacher focus
  return trends.sort((a, b) => a.latestScore - b.latestScore);
}

function computeOverallTrend(
  reports: StoredDiagnostic[]
): StudentDiagnosticsResponse['overallTrend'] {
  if (reports.length < 2) return 'insufficient_data';
  const sorted = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const first = sorted[0].overall_score_percentage;
  const last = sorted[sorted.length - 1].overall_score_percentage;
  const diff = last - first;
  if (diff > 8) return 'improving';
  if (diff < -8) return 'declining';
  return 'stable';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const reports = resolveStudentReports(id);

    const latestReport = reports.length > 0 ? reports[0] : null;
    const studentName = latestReport?.student_name || decodeURIComponent(id);

    const topicTrends = computeTopicTrends(reports);
    const overallTrend = computeOverallTrend(reports);

    const subjectHistory = reports.map((r) => ({
      subject: r.subject || 'General',
      date: r.createdAt,
      score: r.overall_score_percentage,
    }));

    const response: StudentDiagnosticsResponse = {
      success: true,
      studentName,
      totalSubmissions: reports.length,
      latestReport,
      allReports: reports,
      topicTrends,
      subjectHistory,
      overallTrend,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching student diagnostics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve student diagnostics',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
