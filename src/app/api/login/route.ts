import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/userDb';
import { signJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, username, email, password, secretCode, role = 'student' } = body;

    const authIdentifier = (identifier || username || email || '').trim();
    const authPassword = (password || secretCode || '').trim();

    if (!authIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Email Address or Username is required.' },
        { status: 400 }
      );
    }

    if (!authPassword) {
      return NextResponse.json(
        { success: false, error: 'Secret Code / Password is required.' },
        { status: 400 }
      );
    }

    const verification = userDb.verifyCredentials(
      authIdentifier,
      authPassword,
      role as 'student' | 'teacher'
    );

    if (!verification.success || !verification.user) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    const user = verification.user;

    // Create cryptographically signed session JWT (valid for 7 days)
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    });

    // Return the authenticated user's exact profile
    const userProfile = {
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
    };

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userProfile,
    });

    // Set secure HttpOnly cookie
    response.cookies.set('learngraph_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
