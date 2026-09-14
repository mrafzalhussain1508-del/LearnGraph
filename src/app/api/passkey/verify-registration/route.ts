import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { passkeyDb, RegisteredPasskey } from '@/lib/passkeyDb';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, response, userProfile } = body;

    if (!userId || !response) {
      return NextResponse.json(
        { error: 'Missing userId or WebAuthn registration response' },
        { status: 400 }
      );
    }

    // Retrieve the active cryptographic challenge for this user
    const expectedChallenge = passkeyDb.getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Biometric verification challenge expired or not found. Please try again.' },
        { status: 400 }
      );
    }

    // Resolve host, RP ID, and allowed origins
    const host = req.headers.get('host') || 'localhost:3000';
    const rpID = host.split(':')[0] || 'localhost';
    const requestOrigin = req.headers.get('origin') || `http://${host}`;

    // Allow the current origin plus standard local development origins
    const expectedOrigin = [
      requestOrigin,
      `http://${host}`,
      `https://${host}`,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: false, // Allows biometric (uv) while avoiding device rejection on platform PIN fallbacks
      });
    } catch (verifyError: any) {
      console.error('WebAuthn registration verification error:', verifyError);
      return NextResponse.json(
        { error: verifyError.message || 'Cryptographic verification of passkey signature failed.' },
        { status: 400 }
      );
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return NextResponse.json(
        { error: 'Passkey registration could not be verified by the security engine.' },
        { status: 400 }
      );
    }

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

    // Build the registered passkey object to persist in mock DB
    const newPasskey: RegisteredPasskey = {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      createdAt: new Date().toISOString(),
    };

    // Save user and credential in passkeyDb
    passkeyDb.saveUserCredential(userId, newPasskey, {
      username: userProfile?.email || userProfile?.phone || `user_${userId}`,
      displayName: userProfile?.name || 'LearnGraph User',
      role: userProfile?.role || 'student',
      profile: userProfile || {},
    });

    // Also persist user in unified userDb
    userDb.createUser({
      id: userId,
      role: userProfile?.role || 'student',
      name: userProfile?.name || 'LearnGraph User',
      phone: userProfile?.phone || '',
      email: userProfile?.email || '',
      password: userProfile?.password || 'password123',
      studentId: userProfile?.studentId || userProfile?.staffOrStudentId,
      staffId: userProfile?.staffId || userProfile?.staffOrStudentId,
      grade: userProfile?.grade,
      section: userProfile?.section,
      department: userProfile?.department,
      school: userProfile?.school,
      title: userProfile?.title,
      learningGoals: userProfile?.learningGoals,
    });

    // Remove the one-time challenge now that registration succeeded
    passkeyDb.deleteChallenge(userId);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Biometric passkey registered successfully',
      credentialId: credential.id,
      userId,
      user: {
        ...userProfile,
        userId,
      },
    });
  } catch (err: any) {
    console.error('Internal server error during passkey verification:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete passkey registration' },
      { status: 500 }
    );
  }
}
