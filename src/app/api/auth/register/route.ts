import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { savePendingRegistration } from '@/lib/verificationStore';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      username,
      email,
      password,
      secretCode,
      role = 'student',
      studentId,
      staffId,
      grade,
      section,
      department,
      school,
      title,
      learningGoals,
    } = body;

    const chosenName = (username || name || '').trim();
    if (!chosenName) {
      return NextResponse.json(
        { success: false, error: 'Username is required to register.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address (e.g. student@example.com).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole: 'student' | 'teacher' = role === 'teacher' ? 'teacher' : 'student';
    const cleanPassword = (password || secretCode || 'password123').trim();

    // 1. Immediately persist registered profile in user database (persisted to data/registered_users.json)
    const savedUser = userDb.createUser({
      name: chosenName,
      username: (username || chosenName).trim(),
      email: cleanEmail,
      password: cleanPassword,
      role: cleanRole,
      studentId: studentId?.trim() || (cleanRole === 'student' ? `ST-${Date.now().toString().slice(-6)}` : undefined),
      staffId: staffId?.trim() || (cleanRole === 'teacher' ? `FAC-${Date.now().toString().slice(-6)}` : undefined),
      grade: grade?.trim() || (cleanRole === 'student' ? '10th Grade' : undefined),
      section: section?.trim() || 'Section A',
      department: department?.trim(),
      school: school?.trim() || 'Lincoln High School',
      title: title?.trim(),
      learningGoals: learningGoals?.trim() || 'Algebra & Functions',
    });

    // 2. Generate secure unique verification token
    const generatedToken = crypto.randomUUID();

    // 3. Store user registration details and token with "pending_verification" status for email activation
    savePendingRegistration(
      generatedToken,
      cleanEmail,
      cleanRole,
      chosenName,
      {
        name: chosenName,
        username: (username || chosenName).trim(),
        email: cleanEmail,
        password: cleanPassword,
        role: cleanRole,
        studentId: savedUser.studentId,
        staffId: savedUser.staffId,
        grade: savedUser.grade,
        section: savedUser.section,
        department: savedUser.department,
        school: savedUser.school,
        title: savedUser.title,
        learningGoals: savedUser.learningGoals,
      },
      24 * 60 * 60 * 1000 // 24 hours validity
    );

    // Construct verification URL
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/verify-email?token=${generatedToken}`;

    // Critical Dev Bypass: If RESEND_API_KEY is missing or in local dev mode
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const isConfiguredKey = apiKey && apiKey !== 'your_resend_api_key_here' && apiKey.length > 5;

    if (!isConfiguredKey) {
      console.log('\n====================\n[DEV MODE] Verification Link:\n' + verificationUrl + '\n====================\n');
      return NextResponse.json(
        {
          success: true,
          message: "Registration almost complete! We've generated a verification link. Please check your email to activate your account.",
          verificationUrl,
          devMode: true,
        },
        { status: 200 }
      );
    }

    // Production email dispatch via Resend
    try {
      const resend = new Resend(apiKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'LearnGraph <onboarding@resend.dev>';

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your LearnGraph Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); padding: 32px 32px 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                LearnGraph<span style="color: #f43f5e;">.</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                From Marks to Understanding
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Activate Your Account
              </h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 22px;">
                Hello ${name.trim()}, welcome to LearnGraph! Click the button below to verify your email address and activate your account.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);">
                  Verify & Activate Account →
                </a>
              </div>
              <p style="margin: 24px 0 8px 0; color: #64748b; font-size: 12px; line-height: 18px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; color: #4f46e5; font-size: 11px; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                This link expires in 24 hours. If you did not create this account, please disregard this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © 2026 LearnGraph AI Platform · Adaptive Learning & Mastery Hub
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      const { error } = await resend.emails.send({
        from: fromAddress,
        to: cleanEmail,
        subject: 'Activate Your LearnGraph Account',
        html: emailHtml,
      });

      if (error) {
        console.error('[Resend Error]:', error);
        // Even if Resend fails, log to console so local dev isn't blocked
        console.log('\n====================\n[DEV MODE] Verification Link:\n' + verificationUrl + '\n====================\n');
      }

      return NextResponse.json(
        {
          success: true,
          message: "Registration almost complete! We've generated a verification link. Please check your email to activate your account.",
          verificationUrl,
          devMode: !isConfiguredKey,
        },
        { status: 200 }
      );
    } catch (resendErr: any) {
      console.error('[Resend Exception]:', resendErr);
      console.log('\n====================\n[DEV MODE] Verification Link:\n' + verificationUrl + '\n====================\n');
      return NextResponse.json(
        {
          success: true,
          message: "Registration almost complete! We've generated a verification link. Please check your email to activate your account.",
          verificationUrl,
          devMode: true,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('[Registration API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to initiate registration.' },
      { status: 500 }
    );
  }
}
