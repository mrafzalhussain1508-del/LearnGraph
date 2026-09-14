import { NextResponse } from 'next/server';
import { userDb } from '@/lib/userDb';
import { diagnosticDb, StoredDiagnostic } from '@/lib/diagnosticDb';
import { sectionAStudents, StudentRosterMember } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export interface EnrichedStudentProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  studentId: string;
  grade: string;
  section: string;
  school: string;
  learningGoals: string;
  createdAt: string;
  rawScore: number;
  overallUnderstanding: number;
  algebra: number;
  quadratics: number;
  functions: number;
  graphs: number;
  primaryInterventionNeeded: string;
  status: 'critical' | 'attention' | 'strong' | 'registered';
  hasDiagnosticScan: boolean;
}

function extractTopicScore(diag: StoredDiagnostic, keywords: string[], fallback: number): number {
  if (!diag.topic_breakdown || diag.topic_breakdown.length === 0) return fallback;
  for (const topic of diag.topic_breakdown) {
    const nameLower = topic.topic_name.toLowerCase();
    if (keywords.some((kw) => nameLower.includes(kw))) {
      return topic.understanding_percentage;
    }
  }
  return fallback;
}

export async function GET() {
  try {
    const registeredUsers = userDb.getStudents();
    const allDiagnostics = diagnosticDb.getAll();

    // Map of name/username/email to mock exam diagnostics
    const mockDiagnosticsMap = new Map<string, StudentRosterMember>();
    for (const mock of sectionAStudents) {
      mockDiagnosticsMap.set(mock.name.toLowerCase().trim(), mock);
      mockDiagnosticsMap.set(mock.id.toLowerCase().trim(), mock);
    }

    const mergedStudents: EnrichedStudentProfile[] = [];
    const seenIdentifiers = new Set<string>();

    // 1. First, process all real registered students from userDb
    for (const reg of registeredUsers) {
      const cleanName = (reg.name || 'Student').trim();
      const cleanUsername = (reg.username || reg.email?.split('@')[0] || cleanName.toLowerCase().replace(/\s+/g, '_')).trim();
      const cleanEmail = (reg.email || `${cleanUsername}@learngraph.edu`).toLowerCase().trim();

      // Check if student has a live scanned diagnostic
      const liveDiag = diagnosticDb.getLatestForStudent(cleanName) || 
                       diagnosticDb.getLatestForStudent(cleanUsername) ||
                       diagnosticDb.getLatestForStudent(reg.id);

      // Check if student has mock exam diagnostic data
      const mockMatch = mockDiagnosticsMap.get(cleanName.toLowerCase()) || 
                         mockDiagnosticsMap.get(cleanUsername.toLowerCase()) ||
                         mockDiagnosticsMap.get(reg.id.toLowerCase());

      let rawScore = 72;
      let overallUnderstanding = 68;
      let algebra = 85;
      let quadratics = 64;
      let functions = 50;
      let graphs = 42;
      let primaryIntervention = reg.learningGoals ? `Target: ${reg.learningGoals}` : 'Diagnostic Scan Pending';
      let status: 'critical' | 'attention' | 'strong' | 'registered' = 'registered';
      let hasDiagnosticScan = false;

      if (liveDiag) {
        hasDiagnosticScan = true;
        rawScore = liveDiag.overall_score_percentage;
        overallUnderstanding = liveDiag.overall_score_percentage;
        algebra = extractTopicScore(liveDiag, ['linear', 'algebra', 'identity'], 85);
        quadratics = extractTopicScore(liveDiag, ['quadratic', 'factor', 'root'], 64);
        functions = extractTopicScore(liveDiag, ['function', 'word problem', 'derivative'], 70);
        graphs = extractTopicScore(liveDiag, ['graph', 'tangent', 'integral'], 60);

        if (overallUnderstanding < 50) status = 'critical';
        else if (overallUnderstanding < 80) status = 'attention';
        else status = 'strong';

        primaryIntervention = 
          liveDiag.common_misconceptions?.[0] || 
          liveDiag.what_to_learn_next?.[0] || 
          'Targeted Conceptual Drill';
      } else if (mockMatch) {
        hasDiagnosticScan = true;
        rawScore = mockMatch.rawScore;
        overallUnderstanding = mockMatch.overallUnderstanding;
        algebra = mockMatch.algebra;
        quadratics = mockMatch.quadratics;
        functions = mockMatch.functions;
        graphs = mockMatch.graphs;
        primaryIntervention = mockMatch.primaryInterventionNeeded;
        status = mockMatch.status;
      }

      const enriched: EnrichedStudentProfile = {
        id: reg.id,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        studentId: reg.studentId?.trim() || (liveDiag?.student_roll_no) || `ST-${reg.id.slice(-6)}`,
        grade: reg.grade?.trim() || (liveDiag?.student_class) || '10th Grade',
        section: reg.section?.trim() || 'Section A',
        school: reg.school?.trim() || 'Lincoln High School',
        learningGoals: reg.learningGoals?.trim() || (liveDiag?.subject) || 'Foundational Algebra & Problem Solving',
        createdAt: reg.createdAt || liveDiag?.createdAt || new Date().toISOString(),
        rawScore,
        overallUnderstanding,
        algebra,
        quadratics,
        functions,
        graphs,
        primaryInterventionNeeded: primaryIntervention,
        status,
        hasDiagnosticScan,
      };

      mergedStudents.push(enriched);
      seenIdentifiers.add(cleanName.toLowerCase());
      seenIdentifiers.add(cleanUsername.toLowerCase());
      seenIdentifiers.add(cleanEmail.toLowerCase());
    }

    // 2. Add any students from live diagnostics who haven't registered directly
    for (const diag of allDiagnostics) {
      const cleanName = (diag.student_name || 'Student').trim();
      const cleanLower = cleanName.toLowerCase();
      if (!seenIdentifiers.has(cleanLower)) {
        const username = cleanLower.replace(/\s+/g, '_');
        let status: 'critical' | 'attention' | 'strong' = 'attention';
        if (diag.overall_score_percentage < 50) status = 'critical';
        else if (diag.overall_score_percentage >= 80) status = 'strong';

        mergedStudents.push({
          id: diag.id,
          name: cleanName,
          username: username,
          email: `${username}@student.learngraph.edu`,
          studentId: diag.student_roll_no || `ST-${diag.id.slice(-6)}`,
          grade: diag.student_class || '10th Grade',
          section: 'Section A',
          school: 'Lincoln High School',
          learningGoals: diag.subject || 'Algebra & Problem Solving',
          createdAt: diag.createdAt,
          rawScore: diag.overall_score_percentage,
          overallUnderstanding: diag.overall_score_percentage,
          algebra: extractTopicScore(diag, ['linear', 'algebra', 'identity'], 85),
          quadratics: extractTopicScore(diag, ['quadratic', 'factor', 'root'], 64),
          functions: extractTopicScore(diag, ['function', 'word problem', 'derivative'], 70),
          graphs: extractTopicScore(diag, ['graph', 'tangent', 'integral'], 60),
          primaryInterventionNeeded: diag.common_misconceptions?.[0] || 'Targeted Intervention',
          status,
          hasDiagnosticScan: true,
        });
        seenIdentifiers.add(cleanLower);
        seenIdentifiers.add(username);
      }
    }

    // 3. Add any Section A benchmark students from mockData that haven't appeared yet
    for (const mock of sectionAStudents) {
      const cleanName = mock.name.trim();
      if (!seenIdentifiers.has(cleanName.toLowerCase())) {
        const username = cleanName.toLowerCase().replace(/\s+/g, '_');
        mergedStudents.push({
          id: mock.id,
          name: cleanName,
          username: username,
          email: `${username}@student.learngraph.edu`,
          studentId: `ST-2026-0${mock.id.replace(/\D/g, '') || '80'}`,
          grade: '10th Grade',
          section: 'Section A',
          school: 'Lincoln High School',
          learningGoals: `Master ${mock.primaryInterventionNeeded}`,
          createdAt: '2026-09-01T00:00:00.000Z',
          rawScore: mock.rawScore,
          overallUnderstanding: mock.overallUnderstanding,
          algebra: mock.algebra,
          quadratics: mock.quadratics,
          functions: mock.functions,
          graphs: mock.graphs,
          primaryInterventionNeeded: mock.primaryInterventionNeeded,
          status: mock.status,
          hasDiagnosticScan: true,
        });
        seenIdentifiers.add(cleanName.toLowerCase());
      }
    }

    // Calculate aggregated metrics
    const totalStudents = mergedStudents.length;
    const totalRaw = mergedStudents.reduce((sum, s) => sum + s.rawScore, 0);
    const totalUnderstanding = mergedStudents.reduce((sum, s) => sum + s.overallUnderstanding, 0);
    const criticalCount = mergedStudents.filter((s) => s.status === 'critical' || s.overallUnderstanding < 50).length;
    const attentionCount = mergedStudents.filter((s) => s.status === 'attention' || (s.overallUnderstanding >= 50 && s.overallUnderstanding < 80)).length;
    const strongCount = mergedStudents.filter((s) => s.status === 'strong' || s.overallUnderstanding >= 80).length;

    // Unique sections and grades
    const sections = Array.from(new Set(mergedStudents.map((s) => s.section))).filter(Boolean);
    const grades = Array.from(new Set(mergedStudents.map((s) => s.grade))).filter(Boolean);

    return NextResponse.json({
      success: true,
      students: mergedStudents,
      totalStudents,
      sections,
      grades,
      metrics: {
        totalEnrolled: totalStudents,
        averageRawScore: totalStudents > 0 ? Math.round(totalRaw / totalStudents) : 0,
        averageUnderstanding: totalStudents > 0 ? Math.round(totalUnderstanding / totalStudents) : 0,
        criticalCount,
        attentionCount,
        strongCount,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registered students', details: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}
