import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailOtpRecord } from '@/lib/otpStore';
import { userDb } from '@/lib/userDb';
import { signJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp, role = 'student', name, studentId, grade, section, school } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter all 6 digits of the verification code.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Verify OTP against cache
    const verification = verifyEmailOtpRecord(cleanEmail, cleanOtp);
    if (!verification.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: verification.reason || 'Invalid verification code. Please check your email and try again.' 
        },
        { status: 400 }
      );
    }

    // Check if user exists or auto-provision them
    let user = userDb.findUserByIdentifier(cleanEmail);
    if (!user) {
      const derivedName = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      user = userDb.createUser({
        role: (role === 'teacher' ? 'teacher' : 'student'),
        name: derivedName,
        email: cleanEmail,
        phone: '',
        studentId: studentId,
        grade: grade || '10th Grade',
        section: section || 'Section A',
        school: school || 'Lincoln High School',
      });
    }

    // Generate cryptographically signed session JWT (valid for 7 days)
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
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
      message: 'Email OTP verified successfully.',
      token,
      user: userProfile,
    });

    // Set HttpOnly, Secure, SameSite=Lax session cookie
    response.cookies.set('learngraph_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('[Verify Email OTP Server Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Verification failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
