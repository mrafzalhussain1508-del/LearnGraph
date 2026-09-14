import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber, verifyOtpRecord } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, code } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'WhatsApp mobile number is required.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter all 6 digits of the verification code.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const cleanedCode = code.trim();

    // Validate against stored real-time WhatsApp OTP record
    const verification = verifyOtpRecord(normalizedPhone, cleanedCode);

    if (verification.valid) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp number successfully verified.',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: verification.reason || 'Invalid verification code. Please check your WhatsApp and try again.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Verify OTP Server Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Verification failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
