import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { saveEmailOtp } from '@/lib/otpStore';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, role } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address (e.g. student@example.com).' 
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate secure 6-digit verification code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in OTP store for 10 minutes so verify-email-otp succeeds
    saveEmailOtp(cleanEmail, generatedOtp, 10 * 60 * 1000);

    // Check if RESEND_API_KEY is configured
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const isConfiguredKey = apiKey && apiKey !== 'your_resend_api_key_here' && apiKey.length > 5;

    // DEV MODE FALLBACK: If RESEND_API_KEY is missing or unconfigured
    if (!isConfiguredKey) {
      console.log(`[DEV MODE] Mock OTP for ${cleanEmail}: ${generatedOtp}`);
      return NextResponse.json(
        {
          success: true,
          message: `[DEV MODE] Verification OTP for ${cleanEmail}: ${generatedOtp}`,
          email: cleanEmail,
          devMode: true,
          otp: generatedOtp,
        },
        { status: 200 }
      );
    }

    // PRODUCTION / REAL DISPATCH: Initialize Resend with configured key
    const resend = new Resend(apiKey);


    // Clean, professional responsive HTML email body
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LearnGraph Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
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

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Verification Code
              </h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 22px;">
                Please use the following 6-digit verification code to complete your login or registration for LearnGraph.
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b; display: inline-block;">
                  ${generatedOtp}
                </span>
              </div>

              <p style="margin: 20px 0 8px 0; color: #64748b; font-size: 13px; line-height: 20px;">
                ⏱ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © 2026 LearnGraph AI Platform · Adaptive Mastery Checkpoint System
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

    // From Address: standard testing address or verified domain
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'LearnGraph <onboarding@resend.dev>';

    // Send email using Resend with robust error handling
    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: cleanEmail,
        subject: 'Your LearnGraph Verification Code',
        html: emailHtml,
      });

      if (error) {
        console.error('[Resend Error]:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Failed to send email. Please try again.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
        email: cleanEmail,
        emailId: data?.id,
      });
    } catch (sendError: any) {
      console.error('[Resend Exception]:', sendError);
      return NextResponse.json(
        {
          success: false,
          error: sendError?.message || 'Failed to send email. Please try again.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Send Email OTP Server Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to send email. Please try again.',
      },
      { status: 500 }
    );
  }
}
