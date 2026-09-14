import { NextRequest, NextResponse } from 'next/server';
import { mockTestDb } from '@/lib/mockTestDb';
import { verifyJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const test = mockTestDb.getTestById(testId);
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Mock test not found.' },
        { status: 404 }
      );
    }

    // Check caller role
    let role = 'student';
    const token = req.cookies.get('learngraph_session')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.role) role = payload.role;
    }

    // For students taking test, hide correct answers to prevent inspection before submission
    const sanitizedQuestions = test.questions.map((q) => {
      if (role === 'teacher') {
        return q;
      }
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        // correctIndex, explanation, rule hidden until evaluation
      };
    });

    const stats = mockTestDb.getTestStats(test.id);

    return NextResponse.json({
      success: true,
      test: {
        ...test,
        questions: sanitizedQuestions,
      },
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mock test: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const deleted = mockTestDb.deleteTest(testId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Mock test not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mock test deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete mock test: ' + error.message },
      { status: 500 }
    );
  }
}
