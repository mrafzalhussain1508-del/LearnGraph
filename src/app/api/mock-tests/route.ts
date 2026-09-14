import { NextRequest, NextResponse } from 'next/server';
import { mockTestDb, CreateMockTestInput } from '@/lib/mockTestDb';
import { verifyJWT } from '@/lib/jwt';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortParam = searchParams.get('cohort');
    const studentIdParam = searchParams.get('studentId');

    // Attempt to inspect active user session
    let currentUser: any = null;
    const token = req.cookies.get('learngraph_session')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.userId) {
        currentUser = userDb.findUserByIdentifier(payload.userId);
      }
    }

    const cohort = cohortParam || (currentUser?.role === 'student' ? `${currentUser.grade || 'Grade 10'} • ${currentUser.section || 'Section A'}` : undefined);
    const studentId = studentIdParam || (currentUser?.role === 'student' ? currentUser.id : undefined);

    const tests = mockTestDb.getTestsForStudent(cohort);
    
    // Enrich with submission stats & individual student results if available
    const enriched = tests.map((test) => {
      const stats = mockTestDb.getTestStats(test.id);
      let studentSubmission: any = null;
      if (studentId) {
        const studentSubs = mockTestDb.getSubmissionsForStudent(studentId);
        studentSubmission = studentSubs.find((s) => s.testId === test.id) || null;
      }

      return {
        ...test,
        stats,
        hasSubmitted: Boolean(studentSubmission),
        studentSubmission: studentSubmission
          ? {
              id: studentSubmission.id,
              score: studentSubmission.score,
              totalQuestions: studentSubmission.totalQuestions,
              percentage: studentSubmission.percentage,
              timeSpentSeconds: studentSubmission.timeSpentSeconds,
              submittedAt: studentSubmission.submittedAt,
            }
          : null,
      };
    });

    const allSubmissions = mockTestDb.getAllSubmissions();
    const overallStats = {
      totalTests: tests.length,
      totalSubmissions: allSubmissions.length,
      overallAverageScore:
        allSubmissions.length > 0
          ? Math.round(allSubmissions.reduce((acc, s) => acc + s.percentage, 0) / allSubmissions.length)
          : 0,
    };

    return NextResponse.json({
      success: true,
      tests: enriched,
      stats: overallStats,
    });
  } catch (error: any) {
    console.error('Failed to get mock tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mock tests: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify creator credentials if available
    let creator = {
      id: 'fac-01',
      name: 'Dr. Sarah Jenkins',
      role: 'teacher',
    };

    const token = req.cookies.get('learngraph_session')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.userId) {
        const user = userDb.findUserByIdentifier(payload.userId);
        if (user) {
          creator = {
            id: user.id,
            name: user.name,
            role: user.role,
          };
        }
      }
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Test title is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one question is required.' },
        { status: 400 }
      );
    }

    // Validate each question
    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      if (!q.question || !q.question.trim()) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} is missing question text.` },
          { status: 400 }
        );
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} must have at least 2 options.` },
          { status: 400 }
        );
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} has an invalid correct answer index.` },
          { status: 400 }
        );
      }
    }

    const input: CreateMockTestInput = {
      title: body.title.trim(),
      subject: body.subject?.trim() || 'Mathematics',
      topic: body.topic?.trim() || 'Curriculum Diagnostic',
      durationMinutes: Number(body.durationMinutes) || 15,
      targetCohort: body.targetCohort?.trim() || 'Grade 10 • Section A',
      questions: body.questions,
      createdBy: creator,
    };

    const newTest = mockTestDb.createTest(input);

    return NextResponse.json({
      success: true,
      test: newTest,
      message: 'Mock test created and assigned successfully.',
    });
  } catch (error: any) {
    console.error('Failed to create mock test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mock test: ' + error.message },
      { status: 500 }
    );
  }
}
