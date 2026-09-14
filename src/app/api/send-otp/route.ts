import { NextRequest, NextResponse } from 'next/server';
import { extractTenDigitPhone, normalizePhoneNumber, saveOtp } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid mobile phone number is required.' },
        { status: 400 }
      );
    }

    const tenDigitPhone = extractTenDigitPhone(phoneNumber);
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!tenDigitPhone || tenDigitPhone.length !== 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).' 
        },
        { status: 400 }
      );
    }

    // Generate secure 6-digit random verification code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache the OTP for verification (10-minute validity)
    saveOtp(normalizedPhone, generatedOtp, 10 * 60 * 1000);

    let apiKey = (process.env.FAST2SMS_API_KEY || '').trim();
    apiKey = apiKey.replace(/^["']|["']$/g, '');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'FAST2SMS_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    // Prepare x-www-form-urlencoded body for Fast2SMS Quick Route (route=q)
    const params = new URLSearchParams();
    params.append('route', 'q');
    params.append('message', `Your LearnGraph verification code is ${generatedOtp}`);
    params.append('language', 'english');
    params.append('flash', '0');
    params.append('numbers', tenDigitPhone);

    const fast2smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const fast2smsData = await fast2smsResponse.json().catch(() => ({}));

    if (fast2smsData.return === true) {
      console.log(`[Fast2SMS Quick Route] OTP successfully dispatched to ${tenDigitPhone}, request_id: ${fast2smsData.request_id}`);
      return NextResponse.json({
        success: true,
        message: `Real-time verification code sent to ${tenDigitPhone} via SMS.`,
        requestId: fast2smsData.request_id,
      });
    } else {
      console.error('[Fast2SMS Error Response]:', fast2smsData);
      const errorMsg = Array.isArray(fast2smsData.message)
        ? fast2smsData.message[0]
        : fast2smsData.message || 'Failed to dispatch SMS via Fast2SMS.';

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          code: fast2smsData.status_code,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('[Send OTP Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error communicating with SMS gateway.',
      },
      { status: 500 }
    );
  }
}
