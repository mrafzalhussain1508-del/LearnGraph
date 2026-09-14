import { NextRequest, NextResponse } from 'next/server';
import { mockTestDb } from '@/lib/mockTestDb';

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

    const submissions = mockTestDb.getSubmissionsForTest(testId);
    const stats = mockTestDb.getTestStats(testId);

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        title: test.title,
        subject: test.subject,
        targetCohort: test.targetCohort,
        totalMarks: test.totalMarks,
      },
      stats,
      submissions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test submissions: ' + error.message },
      { status: 500 }
    );
  }
}
