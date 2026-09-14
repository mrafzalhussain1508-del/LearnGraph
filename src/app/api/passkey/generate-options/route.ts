import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { passkeyDb } from '@/lib/passkeyDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || `user_${Date.now()}`;
    const username = searchParams.get('username') || 'user@learngraph.edu';
    const displayName = searchParams.get('displayName') || username;

    // Determine RP ID from request host
    const host = req.headers.get('host') || 'localhost:3000';
    const rpID = host.split(':')[0] || 'localhost';

    // Check existing credentials
    const existingUser = passkeyDb.getUser(userId);
    const excludeCredentials = existingUser?.passkeys.map((p) => ({
      id: p.id,
      transports: p.transports as any,
    }));

    const options = await generateRegistrationOptions({
      rpName: 'LearnGraph Diagnostics',
      rpID: rpID,
      userName: username,
      userDisplayName: displayName,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Save challenge in DB mapped to userId
    passkeyDb.saveChallenge(userId, options.challenge);

    return NextResponse.json({
      options,
      userId,
    });
  } catch (err: any) {
    console.error('Error generating passkey registration options:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate WebAuthn options' },
      { status: 500 }
    );
  }
}
