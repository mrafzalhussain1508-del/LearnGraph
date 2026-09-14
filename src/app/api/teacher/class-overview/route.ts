import { NextResponse } from 'next/server';
import { diagnosticDb, StoredDiagnostic } from '@/lib/diagnosticDb';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export interface SubjectAverage {
  subject: string;
  avgScore: number;
  studentCount: number;
  atRiskCount: number; // < 50%
  strongCount: number; // >= 80%
}

export interface TopicHeatmapCell {
  topic: string;
  subject: string;
  avgScore: number;
  studentCount: number;
  status: 'green' | 'amber' | 'red';
}

export interface AtRiskStudentSummary {
  studentName: string;
  studentId: string;
  overallScore: number;
  subject: string;
  primaryGap: string;
  lastScanDate: string;
}

export interface ClassOverviewResponse {
  success: boolean;
  totalStudents: number;
  totalScans: number;
  classAvgScore: number;
  atRiskCount: number;
  subjectAverages: SubjectAverage[];
  topicHeatmap: TopicHeatmapCell[];
  atRiskStudents: AtRiskStudentSummary[];
  lastUpdated: string;
}

function statusColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

export async function GET() {
  try {
    const allDiagnostics = diagnosticDb.getAll();

    // Group latest diagnostic per student (by student_name)
    const latestPerStudent = new Map<string, StoredDiagnostic>();
    for (const diag of allDiagnostics) {
      const key = diag.student_name.trim().toLowerCase();
      if (!latestPerStudent.has(key)) {
        latestPerStudent.set(key, diag);
      }
    }

    const studentDiags = Array.from(latestPerStudent.values());
    const totalStudents = studentDiags.length;
    const totalScans = allDiagnostics.length;
    const classAvgScore =
      totalStudents > 0
        ? Math.round(
            studentDiags.reduce((s, d) => s + d.overall_score_percentage, 0) /
              totalStudents
          )
        : 0;
    const atRiskCount = studentDiags.filter(
      (d) => d.overall_score_percentage < 50
    ).length;

    // --- Subject Averages ---
    const subjectMap = new Map<
      string,
      { scores: number[]; atRisk: number; strong: number }
    >();
    for (const diag of studentDiags) {
      const subj = diag.subject || 'General';
      if (!subjectMap.has(subj)) {
        subjectMap.set(subj, { scores: [], atRisk: 0, strong: 0 });
      }
      const entry = subjectMap.get(subj)!;
      entry.scores.push(diag.overall_score_percentage);
      if (diag.overall_score_percentage < 50) entry.atRisk++;
      if (diag.overall_score_percentage >= 80) entry.strong++;
    }

    const subjectAverages: SubjectAverage[] = [];
    Array.from(subjectMap.entries()).forEach(([subject, data]) => {
      subjectAverages.push({
        subject,
        avgScore: Math.round(
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        ),
        studentCount: data.scores.length,
        atRiskCount: data.atRisk,
        strongCount: data.strong,
      });
    });
    subjectAverages.sort((a, b) => a.avgScore - b.avgScore);

    // --- Topic Heatmap ---
    const topicMap = new Map<
      string,
      { subject: string; scores: number[] }
    >();
    for (const diag of studentDiags) {
      const subj = diag.subject || 'General';
      for (const tb of diag.topic_breakdown || []) {
        const key = `${tb.topic_name}||${subj}`;
        if (!topicMap.has(key)) {
          topicMap.set(key, { subject: subj, scores: [] });
        }
        topicMap.get(key)!.scores.push(tb.understanding_percentage);
      }
    }

    const topicHeatmap: TopicHeatmapCell[] = [];
    Array.from(topicMap.entries()).forEach(([key, data]) => {
      const [topic] = key.split('||');
      const avgScore = Math.round(
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      );
      topicHeatmap.push({
        topic,
        subject: data.subject,
        avgScore,
        studentCount: data.scores.length,
        status: statusColor(avgScore),
      });
    });
    // Sort red topics first (worst topics = most urgent)
    topicHeatmap.sort((a, b) => a.avgScore - b.avgScore);

    // --- At-Risk Students ---
    const atRiskStudents: AtRiskStudentSummary[] = studentDiags
      .filter((d) => d.overall_score_percentage < 50)
      .map((d) => ({
        studentName: d.student_name,
        studentId: d.student_roll_no || `ST-${d.id.slice(-6)}`,
        overallScore: d.overall_score_percentage,
        subject: d.subject || 'General',
        primaryGap:
          d.common_misconceptions?.[0] ||
          d.what_to_learn_next?.[0] ||
          'Targeted Intervention Needed',
        lastScanDate: d.createdAt,
      }))
      .sort((a, b) => a.overallScore - b.overallScore); // worst first

    const response: ClassOverviewResponse = {
      success: true,
      totalStudents,
      totalScans,
      classAvgScore,
      atRiskCount,
      subjectAverages,
      topicHeatmap,
      atRiskStudents,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error computing class overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compute class overview',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
