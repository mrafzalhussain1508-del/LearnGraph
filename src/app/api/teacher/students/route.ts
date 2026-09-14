import { NextResponse } from 'next/server';
import { userDb } from '@/lib/userDb';
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

export async function GET() {
  try {
    const registeredUsers = userDb.getStudents();

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

      // Check if this registered student has mock exam diagnostic data
      const mockMatch = mockDiagnosticsMap.get(cleanName.toLowerCase()) || 
                         mockDiagnosticsMap.get(cleanUsername.toLowerCase()) ||
                         mockDiagnosticsMap.get(reg.id.toLowerCase());

      const enriched: EnrichedStudentProfile = {
        id: reg.id,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        studentId: reg.studentId?.trim() || `ST-${reg.id.slice(-6)}`,
        grade: reg.grade?.trim() || '10th Grade',
        section: reg.section?.trim() || 'Section A',
        school: reg.school?.trim() || 'Lincoln High School',
        learningGoals: reg.learningGoals?.trim() || 'Foundational Algebra & Problem Solving',
        createdAt: reg.createdAt || new Date().toISOString(),
        rawScore: mockMatch ? mockMatch.rawScore : 72,
        overallUnderstanding: mockMatch ? mockMatch.overallUnderstanding : 68,
        algebra: mockMatch ? mockMatch.algebra : 85,
        quadratics: mockMatch ? mockMatch.quadratics : 64,
        functions: mockMatch ? mockMatch.functions : 50,
        graphs: mockMatch ? mockMatch.graphs : 42,
        primaryInterventionNeeded: mockMatch 
          ? mockMatch.primaryInterventionNeeded 
          : (reg.learningGoals ? `Target: ${reg.learningGoals}` : 'Diagnostic Scan Pending'),
        status: mockMatch ? mockMatch.status : 'registered',
        hasDiagnosticScan: Boolean(mockMatch),
      };

      mergedStudents.push(enriched);
      seenIdentifiers.add(cleanName.toLowerCase());
      seenIdentifiers.add(cleanEmail.toLowerCase());
    }

    // 2. Add any Section A benchmark students from mockData that haven't registered directly
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
      { success: false, error: 'Failed to retrieve registered students' },
      { status: 500 }
    );
  }
}
