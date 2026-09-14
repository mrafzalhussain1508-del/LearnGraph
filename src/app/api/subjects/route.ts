import { NextResponse } from 'next/server';
import { subjectRepo } from '@/lib/db/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subjects = subjectRepo.getAll();
    return NextResponse.json({
      success: true,
      subjects,
    });
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve subjects' },
      { status: 500 }
    );
  }
}
