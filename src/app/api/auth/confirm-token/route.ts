import { NextRequest, NextResponse } from 'next/server';
import { consumePendingRegistration, getPendingRegistration } from '@/lib/verificationStore';
import { userDb } from '@/lib/userDb';
import { signJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required.' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const pendingRecord = getPendingRegistration(cleanToken);

    if (!pendingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'This verification link is invalid, expired, or has already been used. Please register again.',
        },
        { status: 400 }
      );
    }

    // Mark as verified and consume token
    consumePendingRegistration(cleanToken);

    // Create / activate user in userDb
    const createdUser = userDb.createUser({
      name: pendingRecord.userData.name,
      username: pendingRecord.userData.username || pendingRecord.userData.name,
      email: pendingRecord.userData.email,
      password: pendingRecord.userData.password || 'password123',
      role: pendingRecord.userData.role === 'teacher' ? 'teacher' : 'student',
      studentId: pendingRecord.userData.studentId,
      staffId: pendingRecord.userData.staffId,
      grade: pendingRecord.userData.grade,
      section: pendingRecord.userData.section,
      department: pendingRecord.userData.department,
      school: pendingRecord.userData.school,
      title: pendingRecord.userData.title,
      learningGoals: pendingRecord.userData.learningGoals,
    });

    const userProfile = {
      id: createdUser.id,
      name: createdUser.name,
      role: createdUser.role,
      email: createdUser.email,
      phone: createdUser.phone || '',
      studentId: createdUser.studentId,
      staffId: createdUser.staffId,
      grade: createdUser.grade,
      section: createdUser.section,
      department: createdUser.department,
      school: createdUser.school,
      title: createdUser.title,
      learningGoals: createdUser.learningGoals,
    };

    // Generate cryptographically signed session JWT (valid for 7 days)
    const sessionToken = await signJWT({
      userId: createdUser.id,
      role: createdUser.role,
      name: createdUser.name,
      email: createdUser.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account verified and activated successfully!',
      user: userProfile,
      token: sessionToken,
      redirectUrl: '/overview',
    });

    // Set secure HttpOnly session cookie
    response.cookies.set('learngraph_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[Confirm Token API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify account token.' },
      { status: 500 }
    );
  }
}
