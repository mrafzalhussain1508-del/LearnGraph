import { NextRequest, NextResponse } from 'next/server';
import { diagnosticDb, StoredDiagnostic } from '@/lib/diagnosticDb';

export const dynamic = 'force-dynamic';

function escapeCSV(val: unknown): string {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(fields: unknown[]): string {
  return fields.map(escapeCSV).join(',');
}

function buildClassCSV(diagnostics: StoredDiagnostic[]): string {
  // Collect all unique topic names across all reports for dynamic columns
  const allTopics = new Set<string>();
  for (const d of diagnostics) {
    for (const tb of d.topic_breakdown || []) {
      allTopics.add(tb.topic_name);
    }
  }
  const topicList = Array.from(allTopics).sort();

  // Header
  const headerFields = [
    'Student Name',
    'Roll No',
    'Class',
    'Subject',
    'Exam Title',
    'Date',
    'Overall Score (%)',
    ...topicList.map((t) => `${t} (%)`),
    'Misconceptions',
    'Remediation Steps',
    'Scan Type',
  ];

  const rows: string[] = [toRow(headerFields)];

  for (const d of diagnostics) {
    const topicScores = topicList.map((topic) => {
      const match = (d.topic_breakdown || []).find(
        (tb) => tb.topic_name === topic
      );
      return match ? match.understanding_percentage : '';
    });

    rows.push(
      toRow([
        d.student_name,
        d.student_roll_no || '',
        d.student_class || '',
        d.subject || '',
        d.exam_title || '',
        new Date(d.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        d.overall_score_percentage,
        ...topicScores,
        (d.common_misconceptions || []).join('; '),
        (d.what_to_learn_next || []).join('; '),
        d.is_live_gemini ? 'Live Gemini AI' : 'AI Diagnostic',
      ])
    );
  }

  return rows.join('\r\n');
}

function buildStudentCSV(diagnostics: StoredDiagnostic[]): string {
  if (diagnostics.length === 0) {
    return 'No diagnostic data found for this student.\r\n';
  }

  const allTopics = new Set<string>();
  for (const d of diagnostics) {
    for (const tb of d.topic_breakdown || []) {
      allTopics.add(tb.topic_name);
    }
  }
  const topicList = Array.from(allTopics).sort();

  // Header
  const headerFields = [
    'Date',
    'Subject',
    'Exam Title',
    'Overall Score (%)',
    ...topicList.map((t) => `${t} (%)`),
    'Misconceptions',
    'Remediation Steps',
  ];

  const rows: string[] = [
    `Student: ${escapeCSV(diagnostics[0].student_name)}`,
    `Roll No: ${escapeCSV(diagnostics[0].student_roll_no || '')}`,
    `Class: ${escapeCSV(diagnostics[0].student_class || '')}`,
    `Total Submissions: ${diagnostics.length}`,
    '',
    toRow(headerFields),
  ];

  for (const d of diagnostics) {
    const topicScores = topicList.map((topic) => {
      const match = (d.topic_breakdown || []).find(
        (tb) => tb.topic_name === topic
      );
      return match ? match.understanding_percentage : '';
    });

    rows.push(
      toRow([
        new Date(d.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        d.subject || '',
        d.exam_title || '',
        d.overall_score_percentage,
        ...topicScores,
        (d.common_misconceptions || []).join('; '),
        (d.what_to_learn_next || []).join('; '),
      ])
    );
  }

  // Question-level detail for latest report
  const latest = diagnostics[0];
  if (latest.questions && latest.questions.length > 0) {
    rows.push('');
    rows.push(`=== Per-Question Breakdown (Latest: ${latest.subject} — ${new Date(latest.createdAt).toLocaleDateString()}) ===`);
    rows.push(
      toRow([
        'Q#',
        'Topic',
        'Question',
        'Student Answer',
        'Correct Solution',
        'Marks Awarded',
        'Max Marks',
        'Score (%)',
        'Mistake',
        'Misconception',
        'Rule to Remember',
      ])
    );
    for (const q of latest.questions) {
      rows.push(
        toRow([
          q.question_number,
          q.topic_name,
          q.question_text,
          q.student_working,
          q.correct_solution || '',
          q.awarded_marks,
          q.max_marks,
          q.understanding_percentage,
          q.mistake_detected,
          q.misconception,
          q.rule_to_remember,
        ])
      );
    }
  }

  return rows.join('\r\n');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'class'; // 'class' | 'student'
    const studentId = searchParams.get('id') || '';
    const format = searchParams.get('format') || 'csv';

    if (format !== 'csv') {
      return NextResponse.json(
        { success: false, error: 'Only CSV format is supported. Use format=csv' },
        { status: 400 }
      );
    }

    let csvContent: string;
    let filename: string;

    if (scope === 'student' && studentId) {
      const cleanId = decodeURIComponent(studentId).trim().toLowerCase();
      const cleanStripped = cleanId.replace(/[\s\-_.]/g, '');
      const all = diagnosticDb.getAll();

      const studentReports = all.filter((diag) => {
        const diagName = diag.student_name.trim().toLowerCase();
        const diagStripped = diagName.replace(/[\s\-_.]/g, '');
        const diagRoll = (diag.student_roll_no || '').trim().toLowerCase();
        return (
          diagName === cleanId ||
          diagStripped === cleanStripped ||
          (cleanId.length >= 3 && diagStripped.includes(cleanStripped)) ||
          (diagRoll && diagRoll.includes(cleanId))
        );
      });

      csvContent = buildStudentCSV(studentReports);
      const safeName = (studentReports[0]?.student_name || studentId)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      filename = `learngraph_diagnostic_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      // Class-wide: latest report per student
      const all = diagnosticDb.getAll();
      const latestPerStudent = new Map<string, StoredDiagnostic>();
      for (const diag of all) {
        const key = diag.student_name.trim().toLowerCase();
        if (!latestPerStudent.has(key)) {
          latestPerStudent.set(key, diag);
        }
      }
      csvContent = buildClassCSV(Array.from(latestPerStudent.values()));
      filename = `learngraph_class_diagnostic_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate export', details: error?.message },
      { status: 500 }
    );
  }
}
