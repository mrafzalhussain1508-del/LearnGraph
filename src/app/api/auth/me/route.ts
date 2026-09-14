import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('learngraph_session')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false, user: null },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Lookup user in DB to return latest profile
    const user = userDb.findUserByIdentifier(payload.userId) || {
      id: payload.userId,
      name: payload.name,
      role: payload.role,
      email: payload.email || `${payload.userId}@learngraph.edu`,
      phone: '',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
        studentId: user.studentId,
        staffId: user.staffId,
        grade: user.grade,
        section: user.section,
        department: user.department,
        school: user.school,
        title: user.title,
        learningGoals: user.learningGoals,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message || 'Error verifying session.' },
      { status: 500 }
    );
  }
}
