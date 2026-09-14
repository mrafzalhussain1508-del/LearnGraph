import { NextRequest, NextResponse } from 'next/server';
import { mockTestDb } from '@/lib/mockTestDb';
import { verifyJWT } from '@/lib/jwt';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const body = await req.json();

    const test = mockTestDb.getTestById(testId);
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Mock test not found.' },
        { status: 404 }
      );
    }

    // Identify student from session or fallback payload
    let studentId = body.studentId || 'st-01';
    let studentName = body.studentName || 'Alex Chen';
    let studentUsername = body.studentUsername || 'alex_chen';
    let studentEmail = body.studentEmail || 'alex.chen@student.learngraph.edu';
    let studentCohort = body.cohort || 'Grade 10 • Section A';

    const token = req.cookies.get('learngraph_session')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.userId) {
        const user = userDb.findUserByIdentifier(payload.userId);
        if (user) {
          studentId = user.id;
          studentName = user.name;
          studentUsername = user.username || user.name.toLowerCase().replace(/\s+/g, '_');
          studentEmail = user.email;
          if (user.grade && user.section) {
            studentCohort = `${user.grade} • ${user.section}`;
          }
        }
      }
    }

    const answers = body.answers || {};
    const timeSpentSeconds = Number(body.timeSpentSeconds) || 0;

    const submission = mockTestDb.submitTest({
      testId,
      studentId,
      studentName,
      studentUsername,
      studentEmail,
      cohort: studentCohort,
      answers,
      timeSpentSeconds,
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Failed to record test submission.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Test evaluated successfully!',
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit mock test: ' + error.message },
      { status: 500 }
    );
  }
}
